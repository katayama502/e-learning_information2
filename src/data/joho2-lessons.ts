// ============================================================
//  情報2 教材データ（情報II教員研修用テキスト準拠）
//  全36項目 / 5章構成
//  ※ このファイルは Firestore への「初期シードデータ」です。
//     アプリ実行時のカリキュラムは Firestore から読み込まれ、
//     管理者ボードで追加・編集・削除できます。
//  slide_ref: Google SlidesのURL または PDFのURL を設定してください。
//  ※ starter_code はすべて Pyodide（ブラウザ）で動く純Pythonで記述。
// ============================================================

import type { CodeTest, Question, Material, Unit } from '@/lib/curriculum/types';

export type { CodeTest, Question, Material, Unit };

// ============================================================
//  ▼ 教材データ本体（slide_ref にGoogle SlidesのURLを貼るだけで表示）
// ============================================================
export const JOHO2_UNITS: Unit[] = [

  // ══════════════════════════════════════════════════════════
  // 第1章 情報社会の進展と情報技術
  // ══════════════════════════════════════════════════════════
  {
    id: 'unit-1',
    title: '第1章｜情報社会の進展と情報技術',
    materials: [

      // ── 1-1 情報IIの全体像と情報の価値 ──
      {
        id: 'lesson-1-1',
        title: '情報IIの全体像と情報の価値',
        slide_ref: null,
        starter_code: `# 情報IIで学ぶ4つの分野と「情報の価値」を考えよう
# 情報は「集める→整理する→分析する→活用する」ことで価値になる

fields = [
    "第1章 情報社会と情報技術",
    "第2章 コミュニケーションとコンテンツ",
    "第3章 情報とデータサイエンス",
    "第4章 情報システムとプログラミング",
    "第5章 探究活動",
]

print("=== 情報IIで学ぶこと ===")
for i, f in enumerate(fields, 1):
    print(f"  {i}. {f}")

# DIKWモデル：データが価値（知恵）に変わる流れ
dikw = ["Data（データ）", "Information（情報）", "Knowledge（知識）", "Wisdom（知恵）"]
print("\\n=== 情報の価値が高まる流れ（DIKW）===")
print(" → ".join(dikw))

# 例：気温の「生データ」から「知恵」へ
temps = [28, 31, 33, 35, 34, 30, 29]
avg = sum(temps) / len(temps)
print(f"\\n1週間の気温データ: {temps}")
print(f"平均気温(情報): {avg:.1f}℃")
print(f"知恵: 35℃の日は熱中症に注意すべき" if max(temps) >= 35 else "知恵: 比較的すごしやすい一週間")
`,
        questions: [
          {
            id: 'q-1-1-1',
            type: 'choice',
            prompt: 'データが整理・分析されて意思決定に役立つようになった状態を表すモデルはどれですか？',
            choices: ['OSIモデル', 'DIKWモデル', 'クライアントサーバモデル', 'ウォーターフォールモデル'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-1-2',
            type: 'choice',
            prompt: '「情報の価値」を高める活動として最も適切なものはどれですか？',
            choices: [
              'データをそのまま大量に保存しておく',
              'データを収集・整理・分析し、意思決定や問題解決に活用する',
              'データを誰にも見せずに秘密にする',
              'データを毎回削除する',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-1-3',
            type: 'code',
            prompt: 'リスト [28, 31, 33, 35, 34, 30, 29] の最高気温を求めて表示してください。（答え: 35）',
            points: 20,
            code_tests: [{ input: '', expected_output: '35' }],
          },
        ],
      },

      // ── 1-2 コンピュータの進化とムーアの法則 ──
      {
        id: 'lesson-1-2',
        title: 'コンピュータの進化とムーアの法則',
        slide_ref: null,
        starter_code: `# ムーアの法則シミュレーション
# トランジスタ数が2年ごとに2倍になると仮定して計算しよう

initial = 2300   # 1971年 Intel 4004（約2300個）
years = 52       # 2023年まで（52年後）

doublings = years / 2          # 2年ごとに倍増 → 倍増回数
transistors = initial * (2 ** doublings)

print(f"1971年のトランジスタ数: {initial:,} 個")
print(f"{years}年後の予測: {transistors:,.0f} 個")
print(f"現代のCPU（参考）: 約 50,000,000,000 個")

# 通信速度の単位変換
bps = 1_000_000_000  # 1Gbps = 10億bps
print(f"\\n1Gbps = {bps:,} bps")
print(f"1Gbps = {bps // 1_000_000} Mbps")
`,
        questions: [
          {
            id: 'q-1-2-1',
            type: 'choice',
            prompt: 'ムーアの法則とは何ですか？',
            choices: [
              'インターネットの通信速度が毎年2倍になる',
              '集積回路上のトランジスタ数が約2年ごとに2倍になる',
              'コンピュータの価格が毎年半分になる',
              'ストレージ容量が毎年10倍になる',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-2-2',
            type: 'choice',
            prompt: 'CPUの性能を表す指標として正しいものはどれですか？',
            choices: ['解像度（dpi）', 'クロック周波数（GHz）', 'ビットレート（kbps）', 'コントラスト比'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-2-3',
            type: 'code',
            prompt: '4年後（4年 = 2回の倍増）にトランジスタ数が1000個から何個になるか計算して表示してください。（答え: 4000）',
            points: 20,
            code_tests: [{ input: '', expected_output: '4000' }],
          },
        ],
      },

      // ── 1-3 記憶装置とデータ表現 ──
      {
        id: 'lesson-1-3',
        title: '記憶装置とデータ表現',
        slide_ref: null,
        starter_code: `# 記憶装置の階層とデジタルデータの表現
# コンピュータは全てを0と1で表現する

# 10進数 → 2進数・16進数
number = 65  # 'A' のASCIIコード
print(f"10進数: {number}")
print(f"2進数:  {bin(number)}")
print(f"16進数: {hex(number)}")
print(f"ASCII {number} の文字: {chr(number)}")
print(f"'B' のASCIIコード: {ord('B')}")

# 色のRGB表現（0〜255の3つの数値）
print(f"\\n赤: RGB{(255, 0, 0)}")
print(f"白: RGB{(255, 255, 255)}")

# データサイズの計算（2進接頭辞）
kb = 1024
mb = kb * 1024
gb = mb * 1024
print(f"\\n1KB = {kb:,} バイト")
print(f"1GB = {gb:,} バイト")

# 記憶装置の階層（速い・小容量 → 遅い・大容量）
hierarchy = ["レジスタ", "キャッシュ", "主記憶(RAM)", "SSD/HDD（補助記憶）"]
print("\\n=== 記憶装置の階層 ===")
print(" → ".join(hierarchy))
`,
        questions: [
          {
            id: 'q-1-3-1',
            type: 'choice',
            prompt: '10進数の「10」を2進数で表すと何になりますか？',
            choices: ['0b1000', '0b1010', '0b1100', '0b1110'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-3-2',
            type: 'choice',
            prompt: '記憶装置を「アクセスが速い順」に並べたものとして正しいものはどれですか？',
            choices: [
              'HDD → 主記憶 → キャッシュ → レジスタ',
              'レジスタ → キャッシュ → 主記憶 → 補助記憶',
              '主記憶 → レジスタ → HDD → キャッシュ',
              'キャッシュ → HDD → 主記憶 → レジスタ',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-3-3',
            type: 'code',
            prompt: "Pythonのchr()関数を使って、ASCIIコード72の文字を表示してください（大文字のアルファベット1文字）。（答え: H）",
            points: 20,
            code_tests: [{ input: '', expected_output: 'H' }],
          },
        ],
      },

      // ── 1-4 ネットワーク技術とIoT ──
      {
        id: 'lesson-1-4',
        title: 'ネットワーク技術とIoT',
        slide_ref: null,
        starter_code: `# ネットワークの仕組みとIoT
# IPアドレスとパケット通信を体験しよう

# IPアドレスの構造（IPv4は32ビット = 4つの0〜255）
ip = "192.168.1.10"
parts = ip.split(".")
print(f"IPアドレス: {ip}")
print(f"各オクテット: {parts}")
print(f"全て0〜255の範囲か: {all(0 <= int(p) <= 255 for p in parts)}")

# データをパケットに分割して送る
message = "HELLO-IoT-WORLD"
packet_size = 4
packets = [message[i:i+packet_size] for i in range(0, len(message), packet_size)]
print(f"\\n送信データ: {message}")
print(f"パケット分割（{packet_size}文字ずつ）:")
for i, p in enumerate(packets):
    print(f"  パケット{i}: {p}")

# 受信側で再構成
received = "".join(packets)
print(f"\\n受信側で再構成: {received}")
print(f"正しく届いたか: {received == message}")

# IoTデバイスの例
devices = ["スマート温度計", "見守りカメラ", "スマートロック", "自動水やり機"]
print(f"\\n=== 身のまわりのIoT機器（{len(devices)}種）===")
for d in devices:
    print(f"  ・{d}")
`,
        questions: [
          {
            id: 'q-1-4-1',
            type: 'choice',
            prompt: 'IoT（Internet of Things）の説明として正しいものはどれですか？',
            choices: [
              'インターネット上で物を売買するサービス',
              'コンピュータだけがインターネットに接続される仕組み',
              '家電・車・センサーなどあらゆるモノがインターネットに接続される仕組み',
              'データを暗号化して送る技術',
            ],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-1-4-2',
            type: 'choice',
            prompt: 'データを小さなまとまりに分割してネットワークで送る方式を何といいますか？',
            choices: ['回線交換方式', 'パケット交換方式', 'ブロードキャスト方式', 'バッチ方式'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-4-3',
            type: 'code',
            prompt: '文字列 "192.168.1.10" を "." で分割し、要素数（オクテット数）を表示してください。（答え: 4）',
            points: 20,
            code_tests: [{ input: '', expected_output: '4' }],
          },
        ],
      },

      // ── 1-5 情報セキュリティの3要素（CIA） ──
      {
        id: 'lesson-1-5',
        title: '情報セキュリティの3要素（CIA）',
        slide_ref: null,
        starter_code: `# 情報セキュリティの3要素（CIA）
# 機密性・完全性・可用性を確認しよう

cia = {
    "機密性 (Confidentiality)": "許可された人だけが情報にアクセスできる",
    "完全性 (Integrity)":       "情報が改ざんされず正確に保たれる",
    "可用性 (Availability)":    "必要なときにいつでも情報を利用できる",
}
print("=== 情報セキュリティの3要素（CIA）===")
for k, v in cia.items():
    print(f"  ■ {k}\\n      {v}")

# 完全性チェック：簡易チェックサム（合計の下1桁）
def checksum(data):
    return sum(ord(c) for c in data) % 10

original = "PASSWORD"
print(f"\\n元データ: {original}  チェックサム: {checksum(original)}")

tampered = "PASSWORE"  # 改ざんされたデータ
print(f"改ざん後: {tampered}  チェックサム: {checksum(tampered)}")
print("→ 完全性が損なわれた！" if checksum(original) != checksum(tampered) else "→ 一致")
`,
        questions: [
          {
            id: 'q-1-5-1',
            type: 'choice',
            prompt: '情報セキュリティの3要素（CIA）に含まれないものはどれですか？',
            choices: ['機密性（Confidentiality）', '完全性（Integrity）', '可用性（Availability）', '互換性（Compatibility）'],
            correct: 3,
            points: 10,
          },
          {
            id: 'q-1-5-2',
            type: 'choice',
            prompt: 'サーバがダウンしてサービスが使えなくなった。これはCIAのどの要素が損なわれた状態ですか？',
            choices: ['機密性', '完全性', '可用性', '認証性'],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-1-5-3',
            type: 'code',
            prompt: 'ランサムウェアの説明を print() で表示してください。出力は「ランサムウェア: データを暗号化して身代金を要求するマルウェア」',
            points: 20,
            code_tests: [{ input: '', expected_output: 'ランサムウェア: データを暗号化して身代金を要求するマルウェア' }],
          },
        ],
      },

      // ── 1-6 暗号化技術（共通鍵・公開鍵） ──
      {
        id: 'lesson-1-6',
        title: '暗号化技術（共通鍵・公開鍵）',
        slide_ref: null,
        starter_code: `# 暗号化の基礎：共通鍵暗号（シーザー暗号）を実装しよう

def caesar_encrypt(text, shift):
    result = ""
    for char in text:
        if char.isalpha():
            base = ord('A') if char.isupper() else ord('a')
            result += chr((ord(char) - base + shift) % 26 + base)
        else:
            result += char
    return result

def caesar_decrypt(text, shift):
    return caesar_encrypt(text, -shift)

message = "Hello Python"
key = 3
encrypted = caesar_encrypt(message, key)
decrypted = caesar_decrypt(encrypted, key)

print("=== 共通鍵暗号（同じ鍵で暗号化・復号）===")
print(f"元の文: {message}")
print(f"鍵(シフト数): {key}")
print(f"暗号文: {encrypted}")
print(f"復号文: {decrypted}")

print("\\n=== 共通鍵 と 公開鍵 の違い ===")
print("共通鍵: 暗号化と復号に【同じ鍵】→ 速いが鍵配送が課題")
print("公開鍵: 公開鍵で暗号化し【秘密鍵】で復号 → 鍵配送問題を解決")
`,
        questions: [
          {
            id: 'q-1-6-1',
            type: 'choice',
            prompt: '公開鍵暗号方式の特徴として正しいものはどれですか？',
            choices: [
              '暗号化と復号に同じ鍵を使う',
              '公開鍵で暗号化し、秘密鍵で復号する',
              '処理速度が共通鍵暗号より必ず速い',
              '鍵配送問題が解決できない',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-6-2',
            type: 'choice',
            prompt: '共通鍵暗号方式の課題として最も適切なものはどれですか？',
            choices: [
              '暗号化に時間がかかりすぎる',
              '相手に安全に鍵を渡す「鍵配送」が難しい',
              '同じ平文が必ず同じ暗号文にならない',
              '鍵が長すぎて使えない',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-6-3',
            type: 'code',
            prompt: 'シーザー暗号でshift=3のとき "XYZ" を暗号化した結果を表示してください。（答え: ABC）',
            points: 20,
            code_tests: [{ input: '', expected_output: 'ABC' }],
          },
        ],
      },

      // ── 1-7 認証技術とアクセス制御 ──
      {
        id: 'lesson-1-7',
        title: '認証技術とアクセス制御',
        slide_ref: null,
        starter_code: `# 認証技術とアクセス制御
# 「本人確認(認証)」と「権限管理(認可)」を体験しよう

# 多要素認証の3要素
auth_factors = {
    "知識情報（知っていること）": ["パスワード", "PIN"],
    "所持情報（持っているもの）": ["SMS認証", "ICカード"],
    "生体情報（生体的特徴）":     ["指紋認証", "顔認証"],
}
print("=== 多要素認証(MFA)の3要素 ===")
for category, examples in auth_factors.items():
    print(f"【{category}】 {', '.join(examples)}")

# アクセス制御（ロールごとの権限）
permissions = {
    "管理者":  {"read": True,  "write": True,  "delete": True},
    "編集者":  {"read": True,  "write": True,  "delete": False},
    "閲覧者":  {"read": True,  "write": False, "delete": False},
}
print("\\n=== ロールベースアクセス制御(RBAC) ===")
for role, perm in permissions.items():
    allowed = [k for k, v in perm.items() if v]
    print(f"  {role}: {', '.join(allowed)} が可能")

# パスワード強度の簡易チェック
def password_strength(pw):
    score = sum([
        len(pw) >= 8,
        any(c.isupper() for c in pw),
        any(c.isdigit() for c in pw),
        any(c in "!@#$%^&*" for c in pw),
    ])
    return ["弱い", "弱い", "普通", "やや強い", "強い"][score]

print(f"\\n'pass' の強度: {password_strength('pass')}")
print(f"'MyPass123!' の強度: {password_strength('MyPass123!')}")
`,
        questions: [
          {
            id: 'q-1-7-1',
            type: 'choice',
            prompt: '多要素認証（MFA）に使われる「所持情報」の例として正しいものはどれですか？',
            choices: ['パスワード', 'PIN番号', 'SMS認証（スマートフォン）', '顔認証'],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-1-7-2',
            type: 'choice',
            prompt: '「認証(authentication)」と「認可(authorization)」の違いの説明として正しいものはどれですか？',
            choices: [
              '認証は権限を与えること、認可は本人確認のこと',
              '認証は本人確認、認可はその人に何を許可するかを決めること',
              '認証と認可は全く同じ意味である',
              '認証はパスワードのみ、認可は指紋のみで行う',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-7-3',
            type: 'code',
            prompt: 'パスワード "MyPass123!" の文字数を len() で求めて表示してください。（答え: 10）',
            points: 20,
            code_tests: [{ input: '', expected_output: '10' }],
          },
        ],
      },

      // ── 1-8 情報モラル・著作権・個人情報保護 ──
      {
        id: 'lesson-1-8',
        title: '情報モラル・著作権・個人情報保護',
        slide_ref: null,
        starter_code: `# 情報モラル・著作権・個人情報保護
# 個人情報を「マスキング」して保護しよう

# 個人情報（守るべきデータ）
records = [
    {"name": "山田太郎", "phone": "090-1234-5678", "email": "taro@example.com"},
    {"name": "鈴木花子", "phone": "080-9876-5432", "email": "hanako@example.com"},
]

def mask(value, keep=3):
    if len(value) <= keep:
        return "*" * len(value)
    return value[:keep] + "*" * (len(value) - keep)

print("=== 個人情報のマスキング処理 ===")
for r in records:
    print(f"  氏名: {r['name'][0]}**  電話: {mask(r['phone'])}  メール: {mask(r['email'])}")

# 著作権の保護期間（日本：著作者の死後70年）
print("\\n=== 著作権の基礎 ===")
death_year = 1980
protect_until = death_year + 70
print(f"著作者の没年: {death_year}年")
print(f"保護期間の満了: {protect_until}年まで")
print("※ 創作した時点で自動的に発生し、申請は不要")
`,
        questions: [
          {
            id: 'q-1-8-1',
            type: 'choice',
            prompt: '著作権について正しい説明はどれですか？',
            choices: [
              '著作権は申請しないと発生しない',
              '創作物は作った時点で自動的に著作権で保護される',
              '教育目的なら無断コピーは全て許可される',
              '著作権の保護期間は10年間である',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-8-2',
            type: 'choice',
            prompt: '個人情報の取り扱いとして適切なものはどれですか？',
            choices: [
              '集めた個人情報は自由に他社へ販売してよい',
              '利用目的を明示し、必要な範囲で安全に管理する',
              '一度集めたら永久に保存し続ける',
              '本人の同意なくSNSに公開してよい',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-8-3',
            type: 'code',
            prompt: '電話番号 "090-1234-5678" の先頭3文字だけを残し、残りを "*" に置き換えて表示してください。（答え: 090*********）',
            points: 20,
            code_tests: [{ input: '', expected_output: '090*********' }],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 第2章 コミュニケーションとコンテンツ
  // ══════════════════════════════════════════════════════════
  {
    id: 'unit-2',
    title: '第2章｜コミュニケーションとコンテンツ',
    materials: [

      // ── 2-1 メディア戦略とクロスメディア ──
      {
        id: 'lesson-2-1',
        title: 'メディア戦略とクロスメディア',
        slide_ref: null,
        starter_code: `# メディア戦略とクロスメディア
# どのメディアにどれだけ届いたかを分析しよう

reach = {
    "テレビCM":   120000,
    "YouTube":    85000,
    "Instagram":  64000,
    "Webサイト":  41000,
    "新聞":       18000,
}

total = sum(reach.values())
print("=== メディア別リーチ（到達人数）===")
for media, n in sorted(reach.items(), key=lambda x: -x[1]):
    rate = n / total * 100
    bar = "█" * int(rate // 2)
    print(f"  {media:9s} {bar} {n:,}人 ({rate:.1f}%)")

print(f"\\n合計リーチ: {total:,}人")

# クロスメディア：複数メディアを連携させる
print("\\n=== クロスメディアの例 ===")
print("テレビCM → QRコード → Webサイト → SNSでシェア")
print("各メディアの強みを活かし、利用者を次の行動へ誘導する")
`,
        questions: [
          {
            id: 'q-2-1-1',
            type: 'choice',
            prompt: 'クロスメディアの説明として正しいものはどれですか？',
            choices: [
              '複数のメディアで全く無関係な内容を発信する手法',
              '同じテーマを複数メディアで連携・展開し、利用者を行き来させる手法',
              '1つのメディアだけで情報を発信する手法',
              '海外向けのメディア戦略',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-2-1-2',
            type: 'choice',
            prompt: '「メディアリテラシー」の意味として最も適切なものはどれですか？',
            choices: [
              'メディア機器を製造する技術',
              'メディアの情報を批判的に読み解き、適切に活用・発信する能力',
              'テレビ番組を作る能力',
              'メディアを暗号化する技術',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-2-1-3',
            type: 'code',
            prompt: 'リスト [120000, 85000, 64000, 41000, 18000] の合計を求めて表示してください。（答え: 328000）',
            points: 20,
            code_tests: [{ input: '', expected_output: '328000' }],
          },
        ],
      },

      // ── 2-2 ユーザー中心設計とプロトタイプ ──
      {
        id: 'lesson-2-2',
        title: 'ユーザー中心設計とプロトタイプ',
        slide_ref: null,
        starter_code: `# ユーザー中心設計（UCD）とプロトタイプ
# ペルソナを設定し、設計の流れを確認しよう

persona = {
    "名前": "高校2年・あおいさん",
    "目的": "部活と勉強を両立したい",
    "悩み": "スケジュール管理が苦手",
    "利用環境": "通学中にスマホで使う",
}
print("=== ペルソナ（典型的ユーザー像）===")
for k, v in persona.items():
    print(f"  {k}: {v}")

# ユーザー中心設計の反復プロセス
process = ["調査", "仮説立案", "要件定義", "プロトタイプ", "検証・改善"]
print("\\n=== UCDの反復プロセス ===")
print(" → ".join(process) + " →（戻る）")

# プロトタイプの忠実度
print("\\n=== プロトタイプの種類 ===")
print("ローファイ: 紙・手書き（速く・安く・直しやすい）")
print("ハイファイ: 実画面に近い（操作感を確かめられる）")
`,
        questions: [
          {
            id: 'q-2-2-1',
            type: 'choice',
            prompt: 'ペルソナとは何ですか？',
            choices: [
              'Webサイトのデザインテンプレート',
              'ターゲットユーザーを具体的な人物像として設定したもの',
              'アクセス解析の指標の一つ',
              'コンテンツのカテゴリ分類',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-2-2-2',
            type: 'choice',
            prompt: 'プロトタイプを早い段階で作る最大の目的はどれですか？',
            choices: [
              '完成品をそのまま販売するため',
              '本格的に作り込む前に、設計の問題点を早く発見し改善するため',
              'デザインを豪華に見せるため',
              'プログラムを高速化するため',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-2-2-3',
            type: 'code',
            prompt: 'リスト ["調査", "仮説立案", "要件定義", "プロトタイプ", "検証・改善"] を " → " でつなげて表示してください。',
            points: 20,
            code_tests: [{ input: '', expected_output: '調査 → 仮説立案 → 要件定義 → プロトタイプ → 検証・改善' }],
          },
        ],
      },

      // ── 2-3 静止画・動画コンテンツ制作 ──
      {
        id: 'lesson-2-3',
        title: '静止画・動画コンテンツ制作',
        slide_ref: null,
        starter_code: `# 静止画・動画コンテンツ制作の基礎
# 解像度・ファイルサイズ・動画の容量を計算しよう

# 静止画：画素数とデータ量（RGB各1バイト = 3バイト/画素）
width, height = 1920, 1080
pixels = width * height
size_bytes = pixels * 3
print("=== 静止画(フルHD)のデータ量 ===")
print(f"解像度: {width}x{height} = {pixels:,} 画素")
print(f"無圧縮サイズ: {size_bytes:,} バイト ({size_bytes/1024/1024:.1f} MB)")

# 動画：1秒あたりのフレーム数(fps)×秒数
fps = 30
seconds = 10
frames = fps * seconds
video_bytes = frames * size_bytes
print(f"\\n=== 動画(30fps・10秒・無圧縮)のデータ量 ===")
print(f"総フレーム数: {fps} × {seconds}秒 = {frames} フレーム")
print(f"無圧縮サイズ: {video_bytes/1024/1024/1024:.1f} GB")
print("→ だから動画は『圧縮(コーデック)』が必須！")

# 圧縮の効果（例：1/100に圧縮）
print(f"\\n100分の1に圧縮すると: {video_bytes/100/1024/1024:.1f} MB")
`,
        questions: [
          {
            id: 'q-2-3-1',
            type: 'choice',
            prompt: 'デジタル画像の最小単位（色情報を持つ点）を何といいますか？',
            choices: ['フレーム', '画素（ピクセル）', 'ビットレート', 'コーデック'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-2-3-2',
            type: 'choice',
            prompt: '動画ファイルでデータを圧縮・伸張する方式（H.264など）を何といいますか？',
            choices: ['コーデック', 'ピクセル', 'ペルソナ', 'プロトコル'],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-2-3-3',
            type: 'code',
            prompt: '幅1920×高さ1080の総画素数を計算して表示してください。（答え: 2073600）',
            points: 20,
            code_tests: [{ input: '', expected_output: '2073600' }],
          },
        ],
      },

      // ── 2-4 コンテンツ発信・評価と改善 ──
      {
        id: 'lesson-2-4',
        title: 'コンテンツ発信・評価と改善',
        slide_ref: null,
        starter_code: `# コンテンツの発信・評価と改善
# アクセス解析の指標を計算し、A/Bテストで改善しよう

data = {"pv": 10000, "uu": 3500, "bounce": 2100, "cv": 175}

bounce_rate = data["bounce"] / data["uu"] * 100
cvr         = data["cv"] / data["uu"] * 100
pv_per_user = data["pv"] / data["uu"]

print("=== Webアナリティクスレポート ===")
print(f"ページビュー(PV): {data['pv']:,} 回")
print(f"ユニークユーザー(UU): {data['uu']:,} 人")
print(f"1人あたりPV: {pv_per_user:.1f} ページ")
print(f"直帰率: {bounce_rate:.1f}%")
print(f"コンバージョン率(CVR): {cvr:.1f}%")

print("\\n=== A/Bテスト結果 ===")
a_cvr, b_cvr = 2.5, 3.8
improvement = (b_cvr - a_cvr) / a_cvr * 100
print(f"案A のCVR: {a_cvr}%   案B のCVR: {b_cvr}%")
print(f"改善率: +{improvement:.1f}%  → 案Bを採用！")
print("\\nPDCA: 発信 → 計測 → 評価 → 改善 をくり返す")
`,
        questions: [
          {
            id: 'q-2-4-1',
            type: 'choice',
            prompt: 'CVR（コンバージョン率）の説明として正しいものはどれですか？',
            choices: [
              'サイトを訪問した総ページ数',
              '1ページだけ見て離脱した割合',
              '購入や申込みなど目的の行動をした人の割合',
              '訪問者の平均滞在時間',
            ],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-2-4-2',
            type: 'choice',
            prompt: 'A/Bテストの目的として正しいものはどれですか？',
            choices: [
              '2つの案を比較し、効果の高い方を判断して改善する',
              'サーバの負荷を測定する',
              'ウイルスを検出する',
              'データを暗号化する',
            ],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-2-4-3',
            type: 'code',
            prompt: 'UU（訪問者数）が5000人で、コンバージョン数が100人のとき、CVR（%）を小数点1桁で表示してください。（答え: 2.0）',
            points: 20,
            code_tests: [{ input: '', expected_output: '2.0' }],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 第3章 情報とデータサイエンス
  // ══════════════════════════════════════════════════════════
  {
    id: 'unit-3',
    title: '第3章｜情報とデータサイエンス',
    materials: [

      // ── 3-1 データの信憑性と信頼性 ──
      {
        id: 'lesson-3-1',
        title: 'データの信憑性と信頼性',
        slide_ref: null,
        starter_code: `# データの信憑性と信頼性
# 「そのデータは信用できるか？」をチェックしよう

sources = [
    {"name": "政府統計サイト",  "official": True,  "year": 2024, "has_method": True},
    {"name": "個人ブログ",      "official": False, "year": 2015, "has_method": False},
    {"name": "学会論文",        "official": True,  "year": 2023, "has_method": True},
    {"name": "SNSの投稿",       "official": False, "year": 2024, "has_method": False},
]

print("=== 情報源の信頼性スコア ===")
for s in sources:
    score = 0
    if s["official"]:    score += 2   # 公的・専門機関か
    if s["year"] >= 2022: score += 1  # 新しいか
    if s["has_method"]:  score += 2   # 出典・手法が示されているか
    level = "高" if score >= 4 else ("中" if score >= 2 else "低")
    print(f"  {s['name']:12s} スコア{score}/5 → 信頼性【{level}】")

print("\\n=== 確認の観点（クロスチェック）===")
print("・誰が（発信者は信頼できるか）")
print("・いつ（情報は最新か）")
print("・根拠（出典・データの取得方法が示されているか）")
print("・複数の独立した情報源で裏付けが取れるか")
`,
        questions: [
          {
            id: 'q-3-1-1',
            type: 'choice',
            prompt: '情報の信憑性を確かめる方法として最も適切なものはどれですか？',
            choices: [
              '最初に見つけた情報をそのまま信じる',
              '複数の独立した信頼できる情報源で裏付け（クロスチェック）する',
              'SNSでバズっている情報を優先する',
              '古い情報ほど正しいと考える',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-1-2',
            type: 'choice',
            prompt: '一次情報（一次資料）の説明として正しいものはどれですか？',
            choices: [
              '誰かがまとめ直した二次的な解説記事',
              '当事者や調査者が直接得た元のデータ・記録',
              '必ず誤りを含む情報',
              'SNSで拡散された情報',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-1-3',
            type: 'code',
            prompt: 'リスト [2, 1, 2, 2, 1] の合計（信頼性スコアの合計）を表示してください。（答え: 8）',
            points: 20,
            code_tests: [{ input: '', expected_output: '8' }],
          },
        ],
      },

      // ── 3-2 関係データベース（RDB）とSQL ──
      {
        id: 'lesson-3-2',
        title: '関係データベース（RDB）とSQL',
        slide_ref: null,
        starter_code: `# 関係データベース(RDB)とSQL
# テーブル(表)をPythonで模擬し、SQLの考え方を体験しよう

students = [
    {"id": 1, "name": "山田太郎", "class_id": "A01", "score": 85},
    {"id": 2, "name": "鈴木花子", "class_id": "A02", "score": 92},
    {"id": 3, "name": "佐藤次郎", "class_id": "A01", "score": 78},
    {"id": 4, "name": "田中三郎", "class_id": "A02", "score": 88},
    {"id": 5, "name": "高橋四郎", "class_id": "A01", "score": 95},
]
classes = {"A01": "1年A組", "A02": "1年B組"}  # 別テーブル

print("=== SELECT * FROM students ===")
for s in students:
    print(f"  {s['id']}: {s['name']} / {classes[s['class_id']]} / {s['score']}点")

print("\\n=== WHERE class_id = 'A01'（絞り込み）===")
for s in [s for s in students if s["class_id"] == "A01"]:
    print(f"  {s['name']}: {s['score']}点")

# JOIN（テーブルの結合）+ 集計
avg = sum(s["score"] for s in students) / len(students)
print(f"\\n=== 集計：AVG(score) ===")
print(f"全体の平均点: {avg:.1f}点")
`,
        questions: [
          {
            id: 'q-3-2-1',
            type: 'choice',
            prompt: '関係データベース（RDB）でデータを操作するための言語はどれですか？',
            choices: ['HTML', 'CSS', 'SQL', 'CSV'],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-3-2-2',
            type: 'choice',
            prompt: 'SQLで特定の条件に合うデータだけを取得するためのキーワードはどれですか？',
            choices: ['FROM', 'WHERE', 'CREATE', 'DROP'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-2-3',
            type: 'code',
            prompt: 'リスト [85, 92, 78, 88, 95] の中から90点以上の人数を数えて表示してください。（答え: 2）',
            points: 20,
            code_tests: [{ input: '', expected_output: '2' }],
          },
        ],
      },

      // ── 3-3 NoSQLとJSON形式 ──
      {
        id: 'lesson-3-3',
        title: 'NoSQLとJSON形式',
        slide_ref: null,
        starter_code: `# NoSQL と JSON形式
# 表(RDB)では扱いにくい「入れ子構造」をJSONで表現しよう

import json

# JSON（キーと値・配列・入れ子）で表したユーザーデータ
user = {
    "id": 101,
    "name": "山田太郎",
    "hobbies": ["プログラミング", "サッカー", "読書"],
    "address": {"pref": "東京都", "city": "渋谷区"},
}

print("=== Python辞書 → JSON文字列 ===")
text = json.dumps(user, ensure_ascii=False, indent=2)
print(text)

print("\\n=== JSON文字列 → Python辞書（パース）===")
parsed = json.loads(text)
print(f"名前: {parsed['name']}")
print(f"趣味の数: {len(parsed['hobbies'])}")
print(f"住所: {parsed['address']['pref']}{parsed['address']['city']}")

print("\\n=== RDB と NoSQL ===")
print("RDB   : 行と列の表。構造が決まったデータに強い")
print("NoSQL : 柔軟な構造(JSON等)。大量・多様なデータに強い")
`,
        questions: [
          {
            id: 'q-3-3-1',
            type: 'choice',
            prompt: 'NoSQLデータベースの説明として正しいものはどれですか？',
            choices: [
              'SQLを使わないと操作できないデータベース',
              'RDB以外のデータベースの総称で、柔軟な構造や大規模データに対応する',
              'セキュリティが低いデータベース',
              '日本専用のデータベース形式',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-3-2',
            type: 'choice',
            prompt: 'JSON形式の特徴として正しいものはどれですか？',
            choices: [
              '画像専用のファイル形式である',
              'キーと値の組み合わせや配列・入れ子で構造化データを表現できる',
              '表計算ソフト専用の形式である',
              '人間には全く読めない形式である',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-3-3',
            type: 'code',
            prompt: 'リスト ["プログラミング", "サッカー", "読書"] の要素数を len() で表示してください。（答え: 3）',
            points: 20,
            code_tests: [{ input: '', expected_output: '3' }],
          },
        ],
      },

      // ── 3-4 データ収集（WebAPI・スクレイピング） ──
      {
        id: 'lesson-3-4',
        title: 'データ収集（WebAPI・スクレイピング）',
        slide_ref: null,
        starter_code: `# データ収集：WebAPI と スクレイピング
# APIの応答(JSON)を受け取り、必要なデータを取り出そう

# WebAPIから返ってきたと想定したJSON応答
api_response = {
    "city": "Tokyo",
    "forecast": [
        {"day": "月", "temp": 28, "weather": "晴れ"},
        {"day": "火", "temp": 31, "weather": "曇り"},
        {"day": "水", "temp": 26, "weather": "雨"},
        {"day": "木", "temp": 30, "weather": "晴れ"},
    ],
}

print(f"=== {api_response['city']} の天気予報(API) ===")
for f in api_response["forecast"]:
    print(f"  {f['day']}曜: {f['temp']}℃ / {f['weather']}")

# 取得したデータを分析
temps = [f["temp"] for f in api_response["forecast"]]
print(f"\\n平均気温: {sum(temps)/len(temps):.1f}℃")
print(f"晴れの日数: {sum(1 for f in api_response['forecast'] if f['weather']=='晴れ')}日")

print("\\n=== 収集方法の違い ===")
print("WebAPI    : 提供側が用意した窓口から正式にデータ取得（推奨）")
print("スクレイピング: HTMLから抽出。規約・著作権・負荷に注意が必要")
`,
        questions: [
          {
            id: 'q-3-4-1',
            type: 'choice',
            prompt: 'WebAPIの説明として正しいものはどれですか？',
            choices: [
              'Webページの見た目を装飾する言語',
              'プログラムからデータを取得・操作できるよう公開された窓口（インターフェース）',
              'ウイルス対策ソフトの一種',
              '画像を圧縮する形式',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-4-2',
            type: 'choice',
            prompt: 'Webスクレイピングを行う際の注意点として適切でないものはどれですか？',
            choices: [
              'サイトの利用規約を確認する',
              '著作権や個人情報に配慮する',
              'サーバへ短時間に大量アクセスして負荷をかける',
              'APIが提供されていればAPIの利用を優先する',
            ],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-3-4-3',
            type: 'code',
            prompt: 'リスト [28, 31, 26, 30] の平均値を計算して小数点1桁で表示してください。（答え: 28.8）',
            points: 20,
            code_tests: [{ input: '', expected_output: '28.8' }],
          },
        ],
      },

      // ── 3-5 データクリーニングとフォーマット変換 ──
      {
        id: 'lesson-3-5',
        title: 'データクリーニングとフォーマット変換',
        slide_ref: null,
        starter_code: `# データクリーニング(前処理)
# 実際のデータには不備が多い。きれいにしよう！

raw_data = [
    {"name": "山田", "age": "18", "score": "85"},
    {"name": "鈴木", "age": "seventeen", "score": "92"},  # 数字でない
    {"name": "佐藤", "age": "17", "score": None},          # 欠損値
    {"name": "田中", "age": "18", "score": "88"},
    {"name": "山田", "age": "18", "score": "85"},          # 重複行
    {"name": "高橋", "age": "16", "score": "200"},         # 外れ値
]

cleaned, seen = [], set()
for d in raw_data:
    key = (d["name"], d["age"])
    if key in seen:
        print(f"[削除] 重複: {d['name']}"); continue
    seen.add(key)
    if d["score"] is None:
        print(f"[削除] 欠損値: {d['name']}"); continue
    try:
        age, score = int(d["age"]), int(d["score"])
    except (ValueError, TypeError):
        print(f"[削除] 変換エラー: {d['name']}"); continue
    if not (0 <= score <= 100):
        print(f"[削除] 外れ値: {d['name']} score={score}"); continue
    cleaned.append({"name": d["name"], "age": age, "score": score})

print(f"\\n=== クリーニング後（{len(cleaned)}件）===")
for d in cleaned:
    print(f"  {d}")
print(f"\\n平均点: {sum(d['score'] for d in cleaned)/len(cleaned):.1f}点")
`,
        questions: [
          {
            id: 'q-3-5-1',
            type: 'choice',
            prompt: 'データの前処理（クリーニング）に含まれない作業はどれですか？',
            choices: ['欠損値の処理', '外れ値の除外', '重複行の削除', 'Webサイトへの公開'],
            correct: 3,
            points: 10,
          },
          {
            id: 'q-3-5-2',
            type: 'choice',
            prompt: '「ワイド形式」を「ロング形式」に変換するなど、分析しやすい形に整える作業を何といいますか？',
            choices: ['暗号化', 'フォーマット変換（整形）', 'デプロイ', 'コンパイル'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-5-3',
            type: 'code',
            prompt: 'リスト [10, None, 30, None, 50] からNoneを除いた要素の平均を整数で表示してください。（答え: 30）',
            points: 20,
            code_tests: [{ input: '', expected_output: '30' }],
          },
        ],
      },

      // ── 3-6 重回帰分析の基礎 ──
      {
        id: 'lesson-3-6',
        title: '重回帰分析の基礎',
        slide_ref: null,
        starter_code: `# 重回帰分析の基礎：相関と単回帰
# 「身長から体重を予測する」式を作ってみよう

data = [
    {"height": 165, "weight": 60},
    {"height": 170, "weight": 65},
    {"height": 158, "weight": 52},
    {"height": 175, "weight": 70},
    {"height": 162, "weight": 58},
    {"height": 180, "weight": 75},
]

def mean(v): return sum(v) / len(v)

heights = [d["height"] for d in data]
weights = [d["weight"] for d in data]
mh, mw = mean(heights), mean(weights)

# 単回帰の傾きと切片（最小二乗法）
b = sum((h-mh)*(w-mw) for h, w in zip(heights, weights)) / sum((h-mh)**2 for h in heights)
a = mw - b*mh

print("=== 単回帰分析 ===")
print(f"予測式: 体重 = {b:.2f} × 身長 + {a:.2f}")
h_new = 168
print(f"身長{h_new}cm の予測体重: {b*h_new + a:.1f}kg")

print("\\n=== 重回帰分析とは ===")
print("説明変数を複数（例: 身長・年齢・運動量）使って")
print("目的変数（体重）を予測する手法")
`,
        questions: [
          {
            id: 'q-3-6-1',
            type: 'choice',
            prompt: '重回帰分析の「目的変数」とは何ですか？',
            choices: ['予測に使う変数（説明変数）', '予測したい変数', '使わない変数', 'モデルの誤差'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-6-2',
            type: 'choice',
            prompt: '重回帰分析が単回帰分析と異なる点はどれですか？',
            choices: [
              '目的変数が複数ある',
              '説明変数を複数使って予測する',
              '必ず分類を行う',
              'データが不要である',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-6-3',
            type: 'code',
            prompt: 'リスト [60, 65, 52, 70, 58, 75] の平均値を計算して小数点1桁で表示してください。（答え: 63.3）',
            points: 20,
            code_tests: [{ input: '', expected_output: '63.3' }],
          },
        ],
      },

      // ── 3-7 重回帰分析のモデル選択と評価 ──
      {
        id: 'lesson-3-7',
        title: '重回帰分析のモデル選択と評価',
        slide_ref: null,
        starter_code: `# 重回帰モデルの評価：決定係数(R²)とRMSE
# 「予測がどれだけ当たっているか」を数値で測ろう

actual    = [60, 65, 52, 70, 58, 75]   # 実際の値
predicted = [61, 64, 54, 69, 57, 74]   # モデルの予測値

n = len(actual)
mean_actual = sum(actual) / n

# 残差平方和(SSE) と 全変動(SST)
sse = sum((a - p) ** 2 for a, p in zip(actual, predicted))
sst = sum((a - mean_actual) ** 2 for a in actual)

r2   = 1 - sse / sst
rmse = (sse / n) ** 0.5

print("=== モデルの評価 ===")
print(f"決定係数 R²: {r2:.3f}  （1に近いほど良い）")
print(f"RMSE     : {rmse:.2f}  （小さいほど誤差が少ない）")

print("\\n=== モデル選択の考え方 ===")
print("・説明変数を増やすほど訓練データには合うが、過学習に注意")
print("・自由度調整済みR²やテストデータでの評価で選ぶ")
`,
        questions: [
          {
            id: 'q-3-7-1',
            type: 'choice',
            prompt: '決定係数（R²）の説明として正しいものはどれですか？',
            choices: [
              '値が0に近いほどモデルの精度が高い',
              '目的変数の変動のうち、モデルで説明できる割合を示す（最大1）',
              '説明変数の数を表す',
              '常に負の値をとる',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-7-2',
            type: 'choice',
            prompt: '「過学習（オーバーフィッティング）」を防ぐ方法として適切なものはどれですか？',
            choices: [
              '説明変数をできるだけ多く詰め込む',
              '訓練データとは別のテストデータで性能を確認する',
              '評価をせずにモデルを採用する',
              'データを減らせば減らすほど良い',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-7-3',
            type: 'code',
            prompt: '実測 [60,65,52] と予測 [61,64,54] の残差平方和（差の2乗の合計）を表示してください。（答え: 6）',
            points: 20,
            code_tests: [{ input: '', expected_output: '6' }],
          },
        ],
      },

      // ── 3-8 主成分分析と次元削減 ──
      {
        id: 'lesson-3-8',
        title: '主成分分析と次元削減',
        slide_ref: null,
        starter_code: `# 主成分分析(PCA)と次元削減のイメージ
# たくさんの教科の点数を「総合力」という1つの軸にまとめよう

students = [
    {"name": "A", "math": 80, "sci": 78, "eng": 50, "soc": 55},
    {"name": "B", "math": 60, "sci": 62, "eng": 85, "soc": 88},
    {"name": "C", "math": 90, "sci": 92, "eng": 60, "soc": 58},
    {"name": "D", "math": 55, "sci": 50, "eng": 90, "soc": 92},
]

print("=== 元データ（4次元：4教科）===")
for s in students:
    print(f"  {s['name']}: 数{s['math']} 理{s['sci']} 英{s['eng']} 社{s['soc']}")

# 次元削減のイメージ：理系軸(数+理) と 文系軸(英+社) の2次元へ
print("\\n=== 2次元に削減（理系力・文系力）===")
for s in students:
    sci_axis = (s["math"] + s["sci"]) / 2
    lib_axis = (s["eng"] + s["soc"]) / 2
    print(f"  {s['name']}: 理系力={sci_axis:.0f}  文系力={lib_axis:.0f}")

print("\\n主成分分析(PCA): 情報をできるだけ保ったまま")
print("変数の数(次元)を減らし、データを見やすくする手法")
`,
        questions: [
          {
            id: 'q-3-8-1',
            type: 'choice',
            prompt: '主成分分析（PCA）の主な目的はどれですか？',
            choices: [
              'データを暗号化すること',
              '情報をできるだけ保ったまま変数の数（次元）を減らすこと',
              'データを複製して増やすこと',
              'ネットワークを高速化すること',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-8-2',
            type: 'choice',
            prompt: '次元削減を行うメリットとして適切なものはどれですか？',
            choices: [
              'データの可視化や分析がしやすくなる',
              '必ず精度が100%になる',
              'データが完全に元通り復元できる',
              '計算が必ず遅くなる',
            ],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-3-8-3',
            type: 'code',
            prompt: '数学80点・理科78点の平均（理系力）を計算して小数点1桁で表示してください。（答え: 79.0）',
            points: 20,
            code_tests: [{ input: '', expected_output: '79.0' }],
          },
        ],
      },

      // ── 3-9 教師あり学習と決定木 ──
      {
        id: 'lesson-3-9',
        title: '教師あり学習と決定木',
        slide_ref: null,
        starter_code: `# 教師あり学習：決定木(if-thenルール)で分類しよう
# 「勉強時間」と「睡眠時間」から合否を判定する木を作る

def decision_tree(study, sleep):
    # 学習データから作られた木をルールで表現
    if study >= 5:
        if sleep >= 6:
            return "合格"
        else:
            return "合格（睡眠やや不足）"
    else:
        if study >= 3:
            return "微妙（要努力）"
        else:
            return "不合格"

tests = [
    {"name": "あおい", "study": 8, "sleep": 7},
    {"name": "ひかる", "study": 4, "sleep": 5},
    {"name": "つばさ", "study": 2, "sleep": 8},
    {"name": "みなと", "study": 6, "sleep": 4},
]

print("=== 決定木による判定 ===")
for t in tests:
    result = decision_tree(t["study"], t["sleep"])
    print(f"  {t['name']}: 勉強{t['study']}h・睡眠{t['sleep']}h → {result}")

print("\\n決定木: データを質問(条件)で枝分かれさせて分類・予測")
print("長所: 判断理由が見える / 短所: 過学習しやすい")
`,
        questions: [
          {
            id: 'q-3-9-1',
            type: 'choice',
            prompt: '教師あり学習の説明として正しいものはどれですか？',
            choices: [
              '正解ラベルのないデータから構造を見つける',
              '正解（ラベル）付きデータで学習し、未知データを予測・分類する',
              '試行錯誤で報酬を最大化する',
              'データを暗号化する',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-9-2',
            type: 'choice',
            prompt: '決定木のデメリットとして正しいものはどれですか？',
            choices: [
              '判断理由が全く説明できない',
              '木が深くなると過学習（オーバーフィッティング）しやすい',
              '数値データを一切扱えない',
              '必ず分類しかできず予測には使えない',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-9-3',
            type: 'code',
            prompt: '変数 study=8, sleep=7 のとき、study>=5 かつ sleep>=6 を満たすかどうかを True/False で表示してください。（答え: True）',
            points: 20,
            code_tests: [{ input: '', expected_output: 'True' }],
          },
        ],
      },

      // ── 3-10 k-近傍法（kNN）と分類評価 ──
      {
        id: 'lesson-3-10',
        title: 'k-近傍法（kNN）と分類評価',
        slide_ref: null,
        starter_code: `# k-近傍法(kNN)：近いk個の多数決で分類しよう
import math

train = [
    {"study": 8, "sleep": 7, "label": "合格"},
    {"study": 6, "sleep": 6, "label": "合格"},
    {"study": 9, "sleep": 8, "label": "合格"},
    {"study": 2, "sleep": 5, "label": "不合格"},
    {"study": 1, "sleep": 4, "label": "不合格"},
    {"study": 3, "sleep": 6, "label": "不合格"},
]

def dist(a, b):
    return math.sqrt((a["study"]-b["study"])**2 + (a["sleep"]-b["sleep"])**2)

def knn(point, k=3):
    ds = sorted(train, key=lambda d: dist(point, d))[:k]
    votes = {}
    for d in ds:
        votes[d["label"]] = votes.get(d["label"], 0) + 1
    return max(votes, key=votes.get)

new = {"study": 5, "sleep": 6}
print(f"新データ: 勉強{new['study']}h・睡眠{new['sleep']}h")
print(f"kNN(k=3)の予測: {knn(new, 3)}")

# 分類評価：混同行列から正解率を計算
TP, TN, FP, FN = 8, 7, 2, 3   # 真陽性・真陰性・偽陽性・偽陰性
accuracy = (TP + TN) / (TP + TN + FP + FN)
print(f"\\n正解率(Accuracy): {accuracy:.2%}")
print(f"適合率(Precision): {TP/(TP+FP):.2%}")
print(f"再現率(Recall): {TP/(TP+FN):.2%}")
`,
        questions: [
          {
            id: 'q-3-10-1',
            type: 'choice',
            prompt: 'k-近傍法（kNN）でkの値を大きくすると一般にどうなりますか？',
            choices: [
              'より複雑で不安定な分類境界になる',
              'よりなめらかな分類境界になり、ノイズの影響を受けにくくなる',
              '学習データが増える',
              '必ず正解率が100%になる',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-10-2',
            type: 'choice',
            prompt: '分類モデルの「正解率（Accuracy）」の説明として正しいものはどれですか？',
            choices: [
              '全予測のうち正しく分類できた割合',
              'データの総数',
              '学習にかかった時間',
              '説明変数の数',
            ],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-3-10-3',
            type: 'code',
            prompt: '点A(0,0)と点B(3,4)のユークリッド距離を計算して表示してください。（答え: 5.0）',
            points: 20,
            code_tests: [{ input: '', expected_output: '5.0' }],
          },
        ],
      },

      // ── 3-11 階層的クラスタリング ──
      {
        id: 'lesson-3-11',
        title: '階層的クラスタリング',
        slide_ref: null,
        starter_code: `# 階層的クラスタリング：近いものから順にまとめよう
# 距離が最も近いペアを繰り返し統合し、樹形図(デンドログラム)を作る

points = {"A": 1, "B": 2, "C": 5, "D": 8, "E": 9}  # 1次元の位置

clusters = [[k] for k in points]   # 最初は全員が別クラスタ
print("初期クラスタ:", clusters)

def cluster_pos(c):
    return sum(points[p] for p in c) / len(c)

step = 1
while len(clusters) > 1:
    # 最も近い2クラスタを探す
    best, bi, bj = None, 0, 1
    for i in range(len(clusters)):
        for j in range(i+1, len(clusters)):
            d = abs(cluster_pos(clusters[i]) - cluster_pos(clusters[j]))
            if best is None or d < best:
                best, bi, bj = d, i, j
    merged = clusters[bi] + clusters[bj]
    print(f"ステップ{step}: {clusters[bi]} と {clusters[bj]} を統合 (距離{best:.1f}) → {merged}")
    clusters = [c for k, c in enumerate(clusters) if k not in (bi, bj)] + [merged]
    step += 1

print("\\n最終的に1つのクラスタへ:", clusters)
`,
        questions: [
          {
            id: 'q-3-11-1',
            type: 'choice',
            prompt: '階層的クラスタリングの説明として正しいものはどれですか？',
            choices: [
              '正解ラベルを使って学習する教師あり学習である',
              '近いデータ同士を順に統合（または分割）し、樹形図で階層構造を表す',
              '事前にクラスタ数kを必ず指定しなければ動かない',
              'データを暗号化する手法である',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-11-2',
            type: 'choice',
            prompt: '階層的クラスタリングの結果を可視化する図を何といいますか？',
            choices: ['ヒストグラム', 'デンドログラム（樹形図）', '散布図', '円グラフ'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-11-3',
            type: 'code',
            prompt: '位置1の点Aと位置2の点Bの距離（差の絶対値）を abs() で計算して表示してください。（答え: 1）',
            points: 20,
            code_tests: [{ input: '', expected_output: '1' }],
          },
        ],
      },

      // ── 3-12 k-means法とアソシエーション分析 ──
      {
        id: 'lesson-3-12',
        title: 'k-means法とアソシエーション分析',
        slide_ref: null,
        starter_code: `# k-means法：データを自動的にk個のグループへ分けよう

def dist(p, q):
    return ((p[0]-q[0])**2 + (p[1]-q[1])**2) ** 0.5

def mean_point(ps):
    n = len(ps)
    return (sum(p[0] for p in ps)/n, sum(p[1] for p in ps)/n)

data = [(2,45),(3,50),(2,48),(7,80),(8,85),(7,78),(5,65),(5,60),(6,68)]
centroids = [data[0], data[3], data[6]]   # 初期の重心

for _ in range(10):
    clusters = [[], [], []]
    for p in data:
        nearest = min(range(3), key=lambda i: dist(p, centroids[i]))
        clusters[nearest].append(p)
    new_c = [mean_point(c) if c else centroids[i] for i, c in enumerate(clusters)]
    if sum(dist(centroids[i], new_c[i]) for i in range(3)) < 0.001:
        break
    centroids = new_c

for i, c in enumerate(clusters):
    print(f"クラスタ{i+1}: {len(c)}点  重心=({centroids[i][0]:.1f}, {centroids[i][1]:.1f})")

# アソシエーション分析：「一緒に買われる」ルールを見つける
baskets = [{"パン","牛乳"}, {"パン","卵","牛乳"}, {"パン","卵"}, {"牛乳","卵"}, {"パン","牛乳"}]
both = sum(1 for b in baskets if {"パン","牛乳"} <= b)
support = both / len(baskets)
print(f"\\n『パン→牛乳』の支持度(support): {support:.0%}")
`,
        questions: [
          {
            id: 'q-3-12-1',
            type: 'choice',
            prompt: 'k-means法はどの種類の機械学習に分類されますか？',
            choices: ['教師あり学習', '教師なし学習', '強化学習', '転移学習'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-12-2',
            type: 'choice',
            prompt: 'アソシエーション分析（バスケット分析）でわかることはどれですか？',
            choices: [
              '商品の価格を自動で決める',
              '「商品Aを買う人は商品Bも買う」といった関連ルール',
              '顧客の顔を認識する',
              '文章の感情を判定する',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-12-3',
            type: 'code',
            prompt: '5件中3件で「パンと牛乳」が一緒に買われたときの支持度を百分率の整数で表示してください（例: 60）。（答え: 60）',
            points: 20,
            code_tests: [{ input: '', expected_output: '60' }],
          },
        ],
      },

      // ── 3-13 ニューラルネットワークの仕組み ──
      {
        id: 'lesson-3-13',
        title: 'ニューラルネットワークの仕組み',
        slide_ref: null,
        starter_code: `# ニューラルネットワークの仕組み
# 1つのニューロン（重み付き和 → 活性化関数）を実装しよう

import math

def sigmoid(x):
    return 1 / (1 + math.exp(-x))

def neuron(inputs, weights, bias):
    total = sum(i*w for i, w in zip(inputs, weights)) + bias
    return sigmoid(total)

# 入力（例: 勉強時間・睡眠時間を正規化した値）
inputs  = [0.8, 0.6]
weights = [1.5, 1.0]   # 各入力の重要度
bias    = -1.2

output = neuron(inputs, weights, bias)
print("=== 1ニューロンの計算 ===")
print(f"入力: {inputs}")
print(f"重み: {weights}  バイアス: {bias}")
print(f"出力(0〜1): {output:.3f}")
print(f"判定: {'合格の可能性が高い' if output >= 0.5 else '不合格の可能性が高い'}")

print("\\n=== 3層の構造 ===")
print("入力層 → 隠れ層（特徴を抽出・変換）→ 出力層（予測）")
print("各結合の『重み』を学習で調整して精度を上げる")
`,
        questions: [
          {
            id: 'q-3-13-1',
            type: 'choice',
            prompt: 'ニューラルネットワークの「隠れ層」の役割として正しいものはどれですか？',
            choices: [
              'データを受け取る入口になる',
              '最終的な予測値を出力する',
              '入力から特徴を抽出・変換する',
              'データを保存する',
            ],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-3-13-2',
            type: 'choice',
            prompt: '活性化関数（シグモイドなど）の役割として正しいものはどれですか？',
            choices: [
              'ニューロンの出力に非線形性を与え、複雑なパターンを表現できるようにする',
              'データを暗号化する',
              '学習データを増やす',
              '計算を必ず速くする',
            ],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-3-13-3',
            type: 'code',
            prompt: '入力[2,3]と重み[4,5]の重み付き和（積の合計）を計算して表示してください。（答え: 23）',
            points: 20,
            code_tests: [{ input: '', expected_output: '23' }],
          },
        ],
      },

      // ── 3-14 ディープラーニングと実装（NNC） ──
      {
        id: 'lesson-3-14',
        title: 'ディープラーニングと実装（NNC）',
        slide_ref: null,
        starter_code: `# ディープラーニング（深層学習）と実装
# 隠れ層を増やした「深い」ネットワークの学習の流れを確認しよう

# 学習の進み方をシミュレート（誤差が小さくなっていく様子）
loss = 1.000
print("=== 学習(エポック)ごとの誤差(loss) ===")
for epoch in range(1, 9):
    loss = loss * 0.7        # 学習が進むと誤差が減っていく
    acc = (1 - loss) * 100
    bar = "■" * int(acc // 5)
    print(f"  Epoch {epoch}: loss={loss:.3f}  正解率≈{acc:.1f}% {bar}")

print("\\n=== ディープラーニングの特徴 ===")
print("・隠れ層を多数重ねた『深い』ニューラルネットワーク")
print("・特徴量を人手で設計せず、データから自動で学習する")
print("・NNC(Neural Network Console)等でGUIで設計・学習できる")
print("・画像・音声・言語など大量データで高い性能を発揮")
`,
        questions: [
          {
            id: 'q-3-14-1',
            type: 'choice',
            prompt: 'ディープラーニング（深層学習）の説明として正しいものはどれですか？',
            choices: [
              '隠れ層を1つだけ持つ単純なモデルである',
              '隠れ層を多数重ねたニューラルネットワークで、特徴を自動で学習する',
              'データを暗号化する技術である',
              '表計算ソフトの機能の一つである',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-14-2',
            type: 'choice',
            prompt: '学習を1回（全データを一通り学習する単位）回すことを何といいますか？',
            choices: ['エポック', 'ピクセル', 'クエリ', 'パケット'],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-3-14-3',
            type: 'code',
            prompt: '誤差(loss)が1.0のとき、0.7を掛けた後の値を小数点1桁で表示してください。（答え: 0.7）',
            points: 20,
            code_tests: [{ input: '', expected_output: '0.7' }],
          },
        ],
      },

      // ── 3-15 テキストマイニング（Word2vec・感情分析） ──
      {
        id: 'lesson-3-15',
        title: 'テキストマイニング（Word2vec・感情分析）',
        slide_ref: null,
        starter_code: `# テキストマイニング：単語の頻度と感情分析
# 文章を分析して「よく出る言葉」と「ポジ/ネガ」を判定しよう

reviews = [
    "この映画は本当に最高だった。感動して涙が出た。",
    "話がつまらない。時間の無駄で残念だった。",
    "映像が美しくて最高。また観たい、感動的な作品。",
]

# 単語頻度（簡易：キーワードの出現回数）
keywords = ["最高", "感動", "残念", "つまらない", "美しい"]
print("=== 単語の出現回数 ===")
for w in keywords:
    count = sum(r.count(w) for r in reviews)
    print(f"  {w}: {'★'*count} ({count}回)")

# 感情分析（感情辞書で点数化）
positive = {"最高", "感動", "美しい", "涙"}
negative = {"つまらない", "残念", "無駄"}
print("\\n=== 感情分析 ===")
for r in reviews:
    p = sum(w in r for w in positive)
    n = sum(w in r for w in negative)
    judge = "ポジティブ😊" if p > n else ("ネガティブ😟" if n > p else "中立")
    print(f"  [{judge}] {r[:18]}...")

print("\\nWord2vec: 単語を数値ベクトルに変換し、意味の近さを計算できる")
`,
        questions: [
          {
            id: 'q-3-15-1',
            type: 'choice',
            prompt: 'Word2vecの説明として正しいものはどれですか？',
            choices: [
              '画像を圧縮する技術',
              '単語を数値ベクトルに変換し、単語同士の意味の近さを計算できるようにする手法',
              '文章を暗号化する技術',
              '音声を文字に変換する技術',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-15-2',
            type: 'choice',
            prompt: '感情分析（センチメント分析）の説明として正しいものはどれですか？',
            choices: [
              '文章がポジティブかネガティブかなどの感情傾向を判定する',
              '文章の文字数を数える',
              '文章を別の言語に翻訳する',
              '文章を音声に変換する',
            ],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-3-15-3',
            type: 'code',
            prompt: '文字列 "最高。また観たい、最高の作品。" の中に "最高" が何回出てくるか count() で数えて表示してください。（答え: 2）',
            points: 20,
            code_tests: [{ input: '', expected_output: '2' }],
          },
        ],
      },

      // ── 3-16 画像認識とYOLO ──
      {
        id: 'lesson-3-16',
        title: '画像認識とYOLO',
        slide_ref: null,
        starter_code: `# 画像認識と物体検出(YOLO)
# 画像を「数値の集まり(ピクセル)」として扱い、検出結果を読み解こう

# 5x5のモノクロ画像（0=黒, 1=白）— 簡単な十字
image = [
    [0,0,1,0,0],
    [0,0,1,0,0],
    [1,1,1,1,1],
    [0,0,1,0,0],
    [0,0,1,0,0],
]
print("=== 画像データ(5x5) ===")
for row in image:
    print("  " + "".join("■" if v else "・" for v in row))

white = sum(sum(row) for row in image)
print(f"白い画素の数: {white}")

# YOLOが返す検出結果（物体名・信頼度・位置）を想定
detections = [
    {"label": "人",   "conf": 0.95, "box": (50, 60, 120, 300)},
    {"label": "自転車", "conf": 0.88, "box": (140, 180, 260, 360)},
    {"label": "犬",   "conf": 0.72, "box": (300, 240, 380, 330)},
]
print("\\n=== YOLOの物体検出結果 ===")
for d in detections:
    print(f"  {d['label']}: 信頼度{d['conf']:.0%}  位置{d['box']}")

print(f"\\n信頼度80%以上の物体: {sum(1 for d in detections if d['conf']>=0.8)}個")
print("\\nYOLO: 画像を1回見るだけで複数の物体の種類と位置を同時に検出")
`,
        questions: [
          {
            id: 'q-3-16-1',
            type: 'choice',
            prompt: 'YOLO（物体検出）でできることとして正しいものはどれですか？',
            choices: [
              '画像内の複数の物体の「種類」と「位置」を検出する',
              '文章を翻訳する',
              '音声を文字起こしする',
              'データベースを設計する',
            ],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-3-16-2',
            type: 'choice',
            prompt: '画像認識で「信頼度（confidence）」が表すものとして正しいものはどれですか？',
            choices: [
              '画像のファイルサイズ',
              'その検出結果がどれくらい確からしいかの度合い',
              '画像の解像度',
              '画像の色数',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-16-3',
            type: 'code',
            prompt: 'リスト [0.95, 0.88, 0.72] のうち 0.8 以上の要素の個数を数えて表示してください。（答え: 2）',
            points: 20,
            code_tests: [{ input: '', expected_output: '2' }],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 第4章 情報システムとプログラミング
  // ══════════════════════════════════════════════════════════
  {
    id: 'unit-4',
    title: '第4章｜情報システムとプログラミング',
    materials: [

      // ── 4-1 情報システムの処理形態とネットワーク構成 ──
      {
        id: 'lesson-4-1',
        title: '情報システムの処理形態とネットワーク構成',
        slide_ref: null,
        starter_code: `# 情報システムの処理形態とネットワーク構成

# ── バッチ処理（まとめて一括処理）──
print("=== バッチ処理（月末給与計算）===")
employees = [
    {"name": "山田", "rate": 1100, "hours": 160},
    {"name": "鈴木", "rate": 1200, "hours": 150},
    {"name": "佐藤", "rate": 1050, "hours": 170},
]
total = 0
for e in employees:
    pay = e["rate"] * e["hours"]
    total += pay
    print(f"  {e['name']}: {pay:,}円")
print(f"総支払額: {total:,}円  → 一括処理(バッチ)")

# ── リアルタイム処理(OLTP) ──
print("\\n=== リアルタイム処理（ATM取引）===")
balance = 50000
for amount in [10000, 20000, 30000]:
    if amount <= balance:
        balance -= amount
        print(f"  {amount:,}円引き出し → 残高{balance:,}円")
    else:
        print(f"  {amount:,}円引き出し → 残高不足")

print("\\n=== ネットワーク構成 ===")
print("クライアントサーバ型: サーバが集中管理（Web等）")
print("P2P型: 端末同士が対等に直接通信")
`,
        questions: [
          {
            id: 'q-4-1-1',
            type: 'choice',
            prompt: 'バッチ処理の例として正しいものはどれですか？',
            choices: [
              'ATMでのリアルタイム残高照会',
              '月末の給与計算や一括メール送信',
              '検索エンジンでの即時検索',
              'ゲームの操作への即座の反応',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-1-2',
            type: 'choice',
            prompt: 'P2P（Peer to Peer）の説明として正しいものはどれですか？',
            choices: [
              '必ずサーバを介して通信する方式',
              'サーバを介さず端末同士が対等に直接通信する方式',
              '1台のコンピュータが全処理を行う方式',
              '暗号化通信の一種',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-1-3',
            type: 'code',
            prompt: '時給1100円で160時間働いたときの給与を計算して表示してください。（答え: 176000）',
            points: 20,
            code_tests: [{ input: '', expected_output: '176000' }],
          },
        ],
      },

      // ── 4-2 情報システムのセキュリティ設計 ──
      {
        id: 'lesson-4-2',
        title: '情報システムのセキュリティ設計',
        slide_ref: null,
        starter_code: `# 情報システムのセキュリティ設計
# 「多層防御」と「ログ監視」の考え方を体験しよう

# 多層防御（複数の対策を重ねる）
layers = [
    "ファイアウォール（不正な通信を遮断）",
    "認証・アクセス制御（本人確認と権限管理）",
    "暗号化（盗まれても読めなくする）",
    "ログ監視（異常を検知）",
    "バックアップ（被害からの復旧）",
]
print("=== 多層防御 ===")
for i, l in enumerate(layers, 1):
    print(f"  第{i}層: {l}")

# アクセスログから不審なアクセスを検知
logs = [
    {"user": "yamada", "fail": 1},
    {"user": "suzuki", "fail": 0},
    {"user": "guest",  "fail": 7},   # ログイン失敗が多い→不審
    {"user": "admin",  "fail": 5},
]
print("\\n=== ログイン失敗の監視 ===")
THRESHOLD = 5
for log in logs:
    status = "⚠ 要注意（攻撃の可能性）" if log["fail"] >= THRESHOLD else "正常"
    print(f"  {log['user']:8s} 失敗{log['fail']}回 → {status}")
`,
        questions: [
          {
            id: 'q-4-2-1',
            type: 'choice',
            prompt: '「多層防御（多重防御）」の考え方として正しいものはどれですか？',
            choices: [
              '1つの強力な対策だけに頼る',
              '複数の異なる対策を重ねて、1つ破られても全体を守る',
              'パスワードを長くするだけでよい',
              'ログは残さない方が安全である',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-2-2',
            type: 'choice',
            prompt: 'ファイアウォールの主な役割として正しいものはどれですか？',
            choices: [
              'データを自動でバックアップする',
              'ネットワークの不正な通信を監視・遮断する',
              '文章を翻訳する',
              '画像を圧縮する',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-2-3',
            type: 'code',
            prompt: 'リスト [1, 0, 7, 5] のうち 5 以上の要素（不審ユーザー）の数を数えて表示してください。（答え: 2）',
            points: 20,
            code_tests: [{ input: '', expected_output: '2' }],
          },
        ],
      },

      // ── 4-3 要件定義とシステム開発プロセス ──
      {
        id: 'lesson-4-3',
        title: '要件定義とシステム開発プロセス',
        slide_ref: null,
        starter_code: `# 要件定義とシステム開発プロセス
# 「何を作るか」を決め、開発の流れを確認しよう

# 要件定義：機能要件と非機能要件
requirements = {
    "機能要件（何ができるか）": [
        "ユーザー登録・ログインができる",
        "予定を登録・一覧表示できる",
        "予定をカレンダーで確認できる",
    ],
    "非機能要件（品質・条件）": [
        "3秒以内に画面が表示される",
        "スマホでも使える",
        "個人情報を暗号化して保存する",
    ],
}
print("=== 要件定義 ===")
for category, items in requirements.items():
    print(f"\\n【{category}】")
    for it in items:
        print(f"  ・{it}")

# 開発プロセス（ウォーターフォール）
process = ["要件定義", "設計", "実装", "テスト", "運用・保守"]
print("\\n=== ウォーターフォールモデル ===")
print(" → ".join(process))
print("\\nアジャイル: 小さく作って改善を繰り返す進め方もある")
`,
        questions: [
          {
            id: 'q-4-3-1',
            type: 'choice',
            prompt: 'ウォーターフォールモデルの正しい開発順序はどれですか？',
            choices: [
              '実装 → 要件定義 → 設計 → テスト → 運用',
              '要件定義 → 設計 → 実装 → テスト → 運用・保守',
              '設計 → 実装 → 要件定義 → テスト → 運用',
              'テスト → 設計 → 実装 → 要件定義 → 運用',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-3-2',
            type: 'choice',
            prompt: '「非機能要件」の例として正しいものはどれですか？',
            choices: [
              'ユーザー登録ができる',
              '予定を一覧表示できる',
              '3秒以内に画面が表示される（性能・応答速度）',
              'メールを送信できる',
            ],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-4-3-3',
            type: 'code',
            prompt: 'リスト ["要件定義", "設計", "実装", "テスト", "運用・保守"] を " → " でつなげて表示してください。',
            points: 20,
            code_tests: [{ input: '', expected_output: '要件定義 → 設計 → 実装 → テスト → 運用・保守' }],
          },
        ],
      },

      // ── 4-4 システムの分割設計とアルゴリズム ──
      {
        id: 'lesson-4-4',
        title: 'システムの分割設計とアルゴリズム',
        slide_ref: null,
        starter_code: `# システムの分割設計とアルゴリズム
# 大きな問題を小さな部品(関数)に分けて解こう

# ── 分割：機能ごとに関数化（モジュール化）──
def validate(score):
    return 0 <= score <= 100

def to_grade(score):
    if score >= 80: return "A"
    if score >= 60: return "B"
    return "C"

def report(name, score):
    if not validate(score):
        return f"{name}: 入力エラー"
    return f"{name}: {score}点 → 評価{to_grade(score)}"

for n, s in [("山田", 85), ("鈴木", 58), ("佐藤", 120)]:
    print(report(n, s))

# ── アルゴリズム：二分探索 O(log n) ──
def binary_search(arr, target):
    left, right, steps = 0, len(arr)-1, 0
    while left <= right:
        steps += 1
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid, steps
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1, steps

data = sorted([64, 34, 25, 12, 22, 11, 90, 45])
idx, steps = binary_search(data, 45)
print(f"\\nソート済み: {data}")
print(f"二分探索で45を発見: {idx}番目 / {steps}ステップ")
`,
        questions: [
          {
            id: 'q-4-4-1',
            type: 'choice',
            prompt: 'システムを小さな部品（関数・モジュール）に分けて設計する利点はどれですか？',
            choices: [
              '再利用や修正がしやすく、分担して開発できる',
              '必ず動作が遅くなる',
              'バグが見つけにくくなる',
              'プログラムが必ず長くなる',
            ],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-4-4-2',
            type: 'choice',
            prompt: '二分探索が使える条件として正しいものはどれですか？',
            choices: [
              'データに重複がないこと',
              'データがソート（整列）済みであること',
              'データが10件以上あること',
              'データが文字列であること',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-4-3',
            type: 'code',
            prompt: 'sorted() で [5, 2, 8, 1, 9, 3] を昇順にソートし、「最小:1 最大:9」の形式で表示してください。',
            points: 20,
            code_tests: [{ input: '', expected_output: '最小:1 最大:9' }],
          },
        ],
      },

      // ── 4-5 プログラミングと実装（Python） ──
      {
        id: 'lesson-4-5',
        title: 'プログラミングと実装（Python）',
        slide_ref: null,
        starter_code: `# プログラミングと実装（Python）
# 変数・条件分岐・繰り返し・関数の基本を総復習しよう

# 関数：FizzBuzz（プログラミングの定番問題）
def fizzbuzz(n):
    if n % 15 == 0:
        return "FizzBuzz"
    elif n % 3 == 0:
        return "Fizz"
    elif n % 5 == 0:
        return "Buzz"
    else:
        return str(n)

print("=== FizzBuzz (1〜15) ===")
for i in range(1, 16):
    print(fizzbuzz(i), end=" ")
print()

# リスト内包表記とフィルタ
numbers = [12, 7, 30, 5, 18, 24, 3]
evens = [n for n in numbers if n % 2 == 0]
print(f"\\n元のリスト: {numbers}")
print(f"偶数だけ: {evens}")
print(f"合計: {sum(numbers)}  最大: {max(numbers)}  最小: {min(numbers)}")

# 辞書でカウント
text = "banana"
count = {}
for c in text:
    count[c] = count.get(c, 0) + 1
print(f"\\n'{text}' の文字数: {count}")
`,
        questions: [
          {
            id: 'q-4-5-1',
            type: 'choice',
            prompt: 'Pythonの「for」文の役割として正しいものはどれですか？',
            choices: [
              '条件によって処理を分岐する',
              '決まった回数や要素ごとに処理を繰り返す',
              '関数を定義する',
              '変数を削除する',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-5-2',
            type: 'choice',
            prompt: 'Pythonで「15で割り切れる」を判定する条件式はどれですか？',
            choices: ['n / 15 == 0', 'n % 15 == 0', 'n // 15 == 0', 'n ** 15 == 0'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-5-3',
            type: 'code',
            prompt: '1から10までの整数の合計を計算して表示してください。（答え: 55）',
            points: 20,
            code_tests: [{ input: '', expected_output: '55' }],
          },
        ],
      },

      // ── 4-6 テストと品質管理 ──
      {
        id: 'lesson-4-6',
        title: 'テストと品質管理',
        slide_ref: null,
        starter_code: `# テストと品質管理
# 「作った関数が正しく動くか」をテストで確かめよう

def add_tax(price, rate=0.10):
    return int(price * (1 + rate))

# テストケース（入力 → 期待される結果）
test_cases = [
    {"input": 100,  "expected": 110},
    {"input": 200,  "expected": 220},
    {"input": 0,    "expected": 0},
    {"input": 1500, "expected": 1650},
]

print("=== 単体テスト（add_tax）===")
passed = 0
for t in test_cases:
    result = add_tax(t["input"])
    ok = result == t["expected"]
    if ok: passed += 1
    mark = "✓ PASS" if ok else "✗ FAIL"
    print(f"  {mark}: add_tax({t['input']}) = {result}（期待: {t['expected']}）")

print(f"\\n結果: {passed}/{len(test_cases)} 件 合格")
print(f"テスト成功率: {passed/len(test_cases):.0%}")

print("\\n=== テストの種類 ===")
print("単体テスト: 部品(関数)ごと / 結合テスト: 部品を組み合わせて")
print("境界値（0や上限）や異常値もテストすると品質が上がる")
`,
        questions: [
          {
            id: 'q-4-6-1',
            type: 'choice',
            prompt: '個々の関数やモジュール単位で正しく動くかを確認するテストを何といいますか？',
            choices: ['単体テスト', '結合テスト', '運用テスト', '負荷テスト'],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-4-6-2',
            type: 'choice',
            prompt: 'テストで「境界値（0や最大値など）」を確認する理由として正しいものはどれですか？',
            choices: [
              '境界付近は不具合が起きやすいため',
              '境界値はテストしてはいけない決まりがあるため',
              '計算を速くするため',
              'データを暗号化するため',
            ],
            correct: 0,
            points: 10,
          },
          {
            id: 'q-4-6-3',
            type: 'code',
            prompt: '価格100円に消費税10%を加えた金額を整数で表示してください。（答え: 110）',
            points: 20,
            code_tests: [{ input: '', expected_output: '110' }],
          },
        ],
      },

      // ── 4-7 システムの評価・改善・保守 ──
      {
        id: 'lesson-4-7',
        title: 'システムの評価・改善・保守',
        slide_ref: null,
        starter_code: `# システムの評価・改善・保守
# 運用後のデータを見て、システムを継続的に良くしていこう

# 月ごとの応答時間(秒)とエラー件数を評価
monthly = [
    {"month": "4月", "response": 2.8, "errors": 12},
    {"month": "5月", "response": 2.1, "errors": 8},
    {"month": "6月", "response": 1.5, "errors": 3},
]
print("=== 運用データの評価 ===")
for m in monthly:
    status = "良好" if m["response"] <= 2.0 and m["errors"] <= 5 else "改善余地あり"
    print(f"  {m['month']}: 応答{m['response']}秒 / エラー{m['errors']}件 → {status}")

first, last = monthly[0], monthly[-1]
improve = (first["response"] - last["response"]) / first["response"] * 100
print(f"\\n応答時間の改善: {improve:.0f}% 短縮（{first['response']}秒→{last['response']}秒）")

print("\\n=== 保守の種類 ===")
print("予防保守: 故障の前に対策 / 是正保守: 不具合を修正")
print("適応保守: 環境変化に対応 / 完全化保守: 性能・機能を向上")
print("\\nPDCA: 評価(Check) → 改善(Act) を回し続けることが重要")
`,
        questions: [
          {
            id: 'q-4-7-1',
            type: 'choice',
            prompt: 'システムの「保守」に含まれない作業はどれですか？',
            choices: [
              '不具合（バグ）の修正',
              '環境変化への対応',
              '性能の改善',
              '要件定義を行う前の市場調査',
            ],
            correct: 3,
            points: 10,
          },
          {
            id: 'q-4-7-2',
            type: 'choice',
            prompt: 'PDCAサイクルの「C（Check）」が表すものはどれですか？',
            choices: ['計画', '実行', '評価', '改善'],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-4-7-3',
            type: 'code',
            prompt: '応答時間が2.8秒から1.5秒に改善したときの差（短縮した秒数）を小数点1桁で表示してください。（答え: 1.3）',
            points: 20,
            code_tests: [{ input: '', expected_output: '1.3' }],
          },
        ],
      },
    ],
  },

  // ══════════════════════════════════════════════════════════
  // 第5章 探究活動
  // ══════════════════════════════════════════════════════════
  {
    id: 'unit-5',
    title: '第5章｜探究活動',
    materials: [

      // ── 5-1 探究活動と社会実装 ──
      {
        id: 'lesson-5-1',
        title: '探究活動と社会実装',
        slide_ref: null,
        starter_code: `# 探究活動と社会実装
# 「問い」を立て、データで検証し、社会に役立てる流れを体験しよう

# 探究のサイクル
cycle = ["課題設定", "情報収集", "整理・分析", "まとめ・表現", "振り返り"]
print("=== 探究のプロセス ===")
print(" → ".join(cycle) + " →（次の課題へ）")

# 例：地域の「ゴミ削減」をデータで検証する
print("\\n=== 探究テーマ例：地域のゴミ削減 ===")
print("問い: 分別の呼びかけでゴミ量は減るのか？")

before = [120, 118, 125, 122]   # 施策前の週ごとのゴミ量(kg)
after  = [110, 105, 100, 98]    # 施策後

avg_before = sum(before) / len(before)
avg_after  = sum(after) / len(after)
reduction  = (avg_before - avg_after) / avg_before * 100

print(f"施策前の平均: {avg_before:.1f}kg")
print(f"施策後の平均: {avg_after:.1f}kg")
print(f"削減率: {reduction:.1f}%  → 施策に効果あり！")

print("\\n=== 社会実装 ===")
print("分析結果を提案・サービス・仕組みとして社会で実際に役立てること")
print("（例: 自治体への提案、アプリ化、ポスター掲示など）")
`,
        questions: [
          {
            id: 'q-5-1-1',
            type: 'choice',
            prompt: '探究活動のプロセスとして最も適切な順序はどれですか？',
            choices: [
              'まとめ → 課題設定 → 情報収集 → 分析',
              '課題設定 → 情報収集 → 整理・分析 → まとめ・表現 → 振り返り',
              '情報収集 → まとめ → 課題設定 → 振り返り',
              '分析 → 課題設定 → 情報収集 → まとめ',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-5-1-2',
            type: 'choice',
            prompt: '「社会実装」の説明として最も適切なものはどれですか？',
            choices: [
              '分析結果を誰にも見せずに保管すること',
              '探究で得た成果を、実際のサービスや仕組みとして社会で役立てること',
              'データを暗号化すること',
              'プログラムを高速化すること',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-5-1-3',
            type: 'code',
            prompt: 'リスト [120, 118, 125, 122] の平均値を計算して小数点1桁で表示してください。（答え: 121.3）',
            points: 20,
            code_tests: [{ input: '', expected_output: '121.3' }],
          },
        ],
      },
    ],
  },
];

// ※ 実行時のカリキュラム検索は src/lib/curriculum/firestore.ts の
//    findMaterialInUnits を使用します（このファイルは初期シード専用）。
