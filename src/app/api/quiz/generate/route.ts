import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const { title } = await request.json();

        // Anthropic Claude APIによるクイズ自動生成
        const apiKey = process.env.ANTHROPIC_API_KEY;
        if (!apiKey) {
            return NextResponse.json({ error: 'API key not configured' }, { status: 503 });
        }

        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01',
                'content-type': 'application/json',
            },
            body: JSON.stringify({
                model: 'claude-haiku-4-5-20251001',
                max_tokens: 1024,
                messages: [{
                    role: 'user',
                    content: `以下のレッスンタイトルに関する4択クイズを1問作成してください。
レッスン: ${title}

以下のJSON形式で返答してください（他のテキストは不要）:
{
  "question": "問題文",
  "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
  "correct": 0
}
correctは正解の選択肢のインデックス（0〜3）です。`
                }]
            })
        });

        if (!response.ok) {
            return NextResponse.json({ error: 'AI generation failed' }, { status: 500 });
        }

        const data = await response.json();
        const text = data.content[0].text;
        const quiz = JSON.parse(text);

        return NextResponse.json(quiz);
    } catch (error) {
        console.error('Quiz generation error:', error);
        return NextResponse.json({ error: 'Failed to generate quiz' }, { status: 500 });
    }
}
