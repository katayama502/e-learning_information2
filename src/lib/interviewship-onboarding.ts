/**
 * 企業エントリーフォーム送信時の自動オンボーディング処理
 *
 * フォーム送信 → 重複検知 → 組織+企業作成 → アカウント発行 → ウェルカムメール送信
 * 全自動で実行する。
 *
 * フォームのフィールドの `name` はマッピング対象の予約語を使う：
 *   company_name      : 企業名 (必須)
 *   contact_name      : 担当者名 (必須)
 *   contact_email     : 担当者メール (必須・ログインIDになる)
 *   contact_phone     : 担当者電話番号
 *   address / location: 住所
 *   industry          : 業種
 *   hp_url            : HP URL
 *   business_content  : 事業内容
 *   max_students      : 受入人数
 *   その他            : interviewship_company_profiles.* に同名でマッピング可能
 */

import { createAdminClient } from '@/utils/supabase/admin';
import {
    sendInterviewshipEmail,
    buildWelcomeEmailHtml,
} from '@/lib/interviewship-email';

export interface OnboardingResult {
    status: 'created' | 'duplicate_existing' | 'failed';
    submissionId?: string;
    organizationId?: string;
    interviewshipCompanyId?: string;
    userId?: string;
    temporaryPassword?: string;
    duplicateMatch?: { reason: string; existingOrgName?: string };
    error?: string;
}

/** 企業名を正規化（株式会社等を除去、全半角統一） */
function normalizeCompanyName(name: string): string {
    if (!name) return '';
    const halfWidth = name.replace(/[Ａ-Ｚａ-ｚ０-９＆]/g, ch =>
        String.fromCharCode(ch.charCodeAt(0) - 0xfee0)
    );
    return halfWidth
        .toUpperCase()
        .replace(/株式会社|（株）|\(株\)|有限会社|合同会社|一般社団法人|認定こども園|NPO法人|特定非営利活動法人|（特非）/g, '')
        .replace(/\s+/g, '')
        .trim();
}

function generatePassword(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let pw = '';
    for (let i = 0; i < 16; i += 1) {
        pw += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pw;
}

interface OnboardingInput {
    formId: string;
    programId: string | null;
    submissionData: Record<string, unknown>;
}

export async function processCompanyEntrySubmission(input: OnboardingInput): Promise<OnboardingResult> {
    const supabase = createAdminClient();
    const data = input.submissionData;

    const companyName = String(data.company_name ?? '').trim();
    const contactName = String(data.contact_name ?? '').trim();
    const contactEmail = String(data.contact_email ?? '').trim().toLowerCase();
    const contactPhone = String(data.contact_phone ?? '').trim();
    const location = String(data.address ?? data.location ?? '').trim();
    const industry = String(data.industry ?? '').trim();
    const hpUrl = String(data.hp_url ?? data.website_url ?? '').trim();
    const businessContent = String(data.business_content ?? '').trim();
    const maxStudents = Number(data.max_students ?? 3) || 3;

    if (!companyName || !contactEmail) {
        return {
            status: 'failed',
            error: '企業名と担当者メールは必須です',
        };
    }

    // === 1. 重複チェック ===
    // 1a) 企業名（正規化）で既存組織を検索
    const normalizedTarget = normalizeCompanyName(companyName);
    const { data: existingOrgs } = await supabase
        .from('organizations')
        .select('id, name');
    const dupOrg = (existingOrgs ?? []).find(
        (o: { id: string; name: string }) => normalizeCompanyName(o.name) === normalizedTarget
    );

    // 1b) メールアドレスで既存ユーザーを検索
    const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, email, company_name')
        .eq('email', contactEmail)
        .maybeSingle();

    if (dupOrg || existingProfile) {
        const reasonParts: string[] = [];
        if (dupOrg) reasonParts.push(`企業名「${dupOrg.name}」は既に登録されています`);
        if (existingProfile) reasonParts.push(`メールアドレス「${contactEmail}」は既に登録されています`);

        // submission自体は記録（status='duplicate'）
        const { data: submission } = await supabase
            .from('interviewship_form_submissions')
            .insert({
                form_id: input.formId,
                program_id: input.programId,
                submitted_by_name: contactName,
                submitted_by_email: contactEmail,
                data,
                status: 'duplicate',
            })
            .select('id')
            .single();

        return {
            status: 'duplicate_existing',
            submissionId: submission?.id,
            duplicateMatch: {
                reason: reasonParts.join(' / '),
                existingOrgName: dupOrg?.name,
            },
        };
    }

    // === 2. organizations 作成 ===
    const { data: newOrg, error: orgError } = await supabase
        .from('organizations')
        .insert({
            name: companyName,
            location: location || null,
            phone: contactPhone || null,
            industry: industry || null,
            website_url: hpUrl || null,
            business_content: businessContent || null,
            type: 'company',
            access_tier: 'interviewship_only',
        })
        .select('id')
        .single();

    if (orgError || !newOrg) {
        return { status: 'failed', error: `組織作成失敗: ${orgError?.message}` };
    }

    // === 3. interviewship_companies 作成 ===
    const { data: newIc, error: icError } = await supabase
        .from('interviewship_companies')
        .insert({
            organization_id: newOrg.id,
            contact_name: contactName,
            contact_email: contactEmail,
            contact_phone: contactPhone || null,
            max_students: maxStudents,
            is_active: true,
        })
        .select('id')
        .single();

    if (icError || !newIc) {
        return { status: 'failed', error: `受入企業作成失敗: ${icError?.message}` };
    }

    // === 4. プログラムにリンク ===
    if (input.programId) {
        await supabase.from('interviewship_program_companies').insert({
            program_id: input.programId,
            company_id: newIc.id,
            slots: maxStudents,
            slots_used: 0,
            status: 'active',
        });
    }

    // === 5. interviewship_company_profiles 初期データ ===
    // 予約以外のフィールドは profile に同名でマップ可能
    const profilePayload: Record<string, unknown> = {
        company_name: companyName,
        organization_id: newOrg.id,
        industry: industry || null,
        location: location || null,
        hp_url: hpUrl || null,
        business_content: businessContent || null,
        is_hidden: false,
        is_priority: false,
        has_video: false,
    };

    // フォームから profile 用の追加フィールドを引き継ぐ
    const profileFieldKeys = [
        'listing_headline',
        'tag',
        'recommend_point',
        'main_clients',
        'job_types',
        'message',
        'about_company',
        'management_philosophy',
        'work_significance',
        'job_appeal',
        'future_vision',
        'future_20year',
        'future_anxiety',
        'employee_count',
        'sns_youtube',
        'top_image_url',
        'image1_url',
        'image2_url',
        'image3_url',
        'short_video_url',
        'horizontal_video_url',
    ];
    for (const key of profileFieldKeys) {
        if (data[key] !== undefined && data[key] !== '') {
            profilePayload[key] = data[key];
        }
    }

    await supabase.from('interviewship_company_profiles').insert(profilePayload);

    // === 6. auth.user 作成 ===
    const tempPassword = generatePassword();
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: contactEmail,
        password: tempPassword,
        email_confirm: true,
        user_metadata: {
            full_name: contactName,
            role: 'company',
        },
    });

    if (authError || !authData?.user) {
        return { status: 'failed', error: `アカウント作成失敗: ${authError?.message}` };
    }

    const userId = authData.user.id;

    // === 7. profile 更新 ===
    await supabase
        .from('profiles')
        .update({
            full_name: contactName,
            user_type: 'company',
            company_name: companyName,
        })
        .eq('id', userId);

    // === 8. organization_members に admin 追加 ===
    await supabase.from('organization_members').insert({
        user_id: userId,
        organization_id: newOrg.id,
        role: 'admin',
    });

    // === 9. submission 記録（approved） ===
    const { data: submission } = await supabase
        .from('interviewship_form_submissions')
        .insert({
            form_id: input.formId,
            program_id: input.programId,
            company_id: newIc.id,
            submitted_by: userId,
            submitted_by_name: contactName,
            submitted_by_email: contactEmail,
            data,
            status: 'approved',
        })
        .select('id')
        .single();

    // === 10. プログラム名取得 → ウェルカムメール送信 ===
    let programName = 'インタビューシップ';
    if (input.programId) {
        const { data: prog } = await supabase
            .from('interviewship_programs')
            .select('name')
            .eq('id', input.programId)
            .maybeSingle();
        if (prog?.name) programName = prog.name;
    }

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ehime-base-app.vercel.app';
    const { subject, html } = buildWelcomeEmailHtml({
        companyName,
        contactName,
        loginEmail: contactEmail,
        temporaryPassword: tempPassword,
        loginUrl: `${baseUrl}/login/company`,
        programName,
    });

    // 送信失敗してもオンボーディング自体は成功扱い（メールは後で再送可能）
    await sendInterviewshipEmail(contactEmail, subject, html, 'nishimura', {
        sentBy: null,
        programId: input.programId,
        organizationId: newOrg.id,
    });

    return {
        status: 'created',
        submissionId: submission?.id,
        organizationId: newOrg.id,
        interviewshipCompanyId: newIc.id,
        userId,
        temporaryPassword: tempPassword,
    };
}

/**
 * イベント参加申込フォーム送信時の処理。
 *
 * 仕様:
 * - 入力された企業名を正規化し、既存 organizations とのファジーマッチを試みる
 *   1. 正規化完全一致
 *   2. 部分一致（長さ3文字以上で、片方が片方を含む）
 * - マッチあり: 既存 organization を流用し、以下を実施
 *    - 担当者情報（名前・メアド・電話）を最新の入力で上書き（interviewship_companies）
 *    - program_companies に紐付け（無ければ追加）
 * - マッチなし: 完全新規として organization + interviewship_companies を作成
 * - どちらも submission は status='approved' で記録し、重複エラーにはしない
 * - アカウント発行（auth.user）は行わない。必要になったら別途運営から招待する運用。
 */
export async function processEventApplicationSubmission(input: OnboardingInput): Promise<OnboardingResult> {
    const supabase = createAdminClient();
    const data = input.submissionData;

    const companyName = String(data.company_name ?? '').trim();
    const contactName = String(data.contact_name ?? '').trim();
    const contactEmail = String(data.contact_email ?? '').trim().toLowerCase();
    const contactPhone = String(data.contact_phone ?? '').trim();

    if (!companyName || !contactEmail) {
        return { status: 'failed', error: '企業名と担当者メールは必須です' };
    }

    const normalizedTarget = normalizeCompanyName(companyName);

    const { data: allOrgs } = await supabase.from('organizations').select('id, name');
    const orgs = (allOrgs ?? []) as Array<{ id: string; name: string }>;

    let matchedOrg: { id: string; name: string } | null = null;
    let matchType: 'exact' | 'partial' | null = null;

    // 1. 正規化完全一致
    for (const o of orgs) {
        if (normalizeCompanyName(o.name) === normalizedTarget) {
            matchedOrg = o;
            matchType = 'exact';
            break;
        }
    }
    // 2. 部分一致（3文字以上で含む関係）
    if (!matchedOrg && normalizedTarget.length >= 3) {
        for (const o of orgs) {
            const n = normalizeCompanyName(o.name);
            if (n.length < 3) continue;
            if (n.includes(normalizedTarget) || normalizedTarget.includes(n)) {
                matchedOrg = o;
                matchType = 'partial';
                break;
            }
        }
    }
    // 3. メアド一致からの org 特定（別名登録の場合にも拾う）
    if (!matchedOrg) {
        const { data: icByEmail } = await supabase
            .from('interviewship_companies')
            .select('organization_id, organizations(id, name)')
            .eq('contact_email', contactEmail)
            .maybeSingle();
        const byEmailOrg = icByEmail?.organizations as { id: string; name: string } | { id: string; name: string }[] | null;
        const normalized = Array.isArray(byEmailOrg) ? byEmailOrg[0] : byEmailOrg;
        if (normalized?.id) {
            matchedOrg = { id: normalized.id, name: normalized.name };
            matchType = 'partial';
        }
    }

    let targetOrgId: string;
    let targetIcId: string;
    let matchNote = '';

    if (matchedOrg) {
        targetOrgId = matchedOrg.id;
        matchNote = matchType === 'exact'
            ? `既存企業「${matchedOrg.name}」として参加追加`
            : `既存企業「${matchedOrg.name}」（名前近似）として参加追加`;

        // 既存 interviewship_companies はそのまま維持（既存担当者を上書きしない）。
        // 新担当者の情報は submission.data に残るため、管理画面で確認できる。
        const { data: existingIc } = await supabase
            .from('interviewship_companies')
            .select('id, contact_email, contact_name')
            .eq('organization_id', matchedOrg.id)
            .maybeSingle();

        if (existingIc?.id) {
            targetIcId = existingIc.id;
            // 担当者の入れ替わりが起きている場合は matchNote に残す
            if (existingIc.contact_email && existingIc.contact_email.toLowerCase() !== contactEmail) {
                matchNote += `（新担当者候補: ${contactName} <${contactEmail}> ／ 既存担当: ${existingIc.contact_name ?? '?'} <${existingIc.contact_email}> — 既存担当者情報は維持、新担当は submission に記録）`;
            }
        } else {
            // organization はあるが interviewship_companies 未作成 → このケースのみ新規作成
            const { data: newIc, error: icErr } = await supabase
                .from('interviewship_companies')
                .insert({
                    organization_id: matchedOrg.id,
                    contact_name: contactName,
                    contact_email: contactEmail,
                    contact_phone: contactPhone || null,
                    is_active: true,
                })
                .select('id')
                .single();
            if (icErr || !newIc) {
                return { status: 'failed', error: `受入企業作成失敗: ${icErr?.message}` };
            }
            targetIcId = newIc.id;
        }
    } else {
        // 新規 organization + interviewship_companies
        const { data: newOrg, error: orgError } = await supabase
            .from('organizations')
            .insert({
                name: companyName,
                phone: contactPhone || null,
                type: 'company',
                access_tier: 'interviewship_only',
                status: 'approved',
                is_public: false,
            })
            .select('id')
            .single();
        if (orgError || !newOrg) {
            return { status: 'failed', error: `組織作成失敗: ${orgError?.message}` };
        }
        targetOrgId = newOrg.id;

        const { data: newIc, error: icErr } = await supabase
            .from('interviewship_companies')
            .insert({
                organization_id: newOrg.id,
                contact_name: contactName,
                contact_email: contactEmail,
                contact_phone: contactPhone || null,
                is_active: true,
            })
            .select('id')
            .single();
        if (icErr || !newIc) {
            return { status: 'failed', error: `受入企業作成失敗: ${icErr?.message}` };
        }
        targetIcId = newIc.id;
        matchNote = '新規企業として登録・参加追加';
    }

    // program_companies 紐付け（冪等）
    if (input.programId) {
        const { data: existingPc } = await supabase
            .from('interviewship_program_companies')
            .select('id')
            .eq('program_id', input.programId)
            .eq('company_id', targetIcId)
            .maybeSingle();
        if (!existingPc) {
            await supabase.from('interviewship_program_companies').insert({
                program_id: input.programId,
                company_id: targetIcId,
                slots: 1,
                slots_used: 0,
                status: 'active',
            });
        }
    }

    // submission 記録
    const { data: submission } = await supabase
        .from('interviewship_form_submissions')
        .insert({
            form_id: input.formId,
            program_id: input.programId,
            company_id: targetIcId,
            submitted_by_name: contactName,
            submitted_by_email: contactEmail,
            data: { ...data, _match_note: matchNote },
            status: 'approved',
        })
        .select('id')
        .single();

    return {
        status: 'created',
        submissionId: submission?.id,
        organizationId: targetOrgId,
        interviewshipCompanyId: targetIcId,
    };
}
