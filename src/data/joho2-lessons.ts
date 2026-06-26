// ============================================================
//  情報2 教材データ（情報II教員研修用テキスト準拠）
//  slide_ref: Google SlidesのURL または PDFのURL を設定してください。
//  null のままでもPythonエディタ・確認テストは動作します。
// ============================================================

export interface CodeTest {
  input: string;
  expected_output: string;
}

export interface Question {
  id: string;
  type: 'choice' | 'code';
  prompt: string;
  choices?: string[];
  correct?: number;
  points: number;
  code_tests?: CodeTest[];
}

export interface Material {
  id: string;
  title: string;
  slide_ref: string | null;
  starter_code: string;
  questions: Question[];
}

export interface Unit {
  id: string;
  title: string;
  materials: Material[];
}

// ============================================================
//  ▼ 教材データ本体（slide_ref にGoogle SlidesのURLを貼るだけで表示）
// ============================================================
export const JOHO2_UNITS: Unit[] = [

  // ──────────────────────────────────────────────────────────
  // 第1章 情報社会の進展と情報技術
  // ──────────────────────────────────────────────────────────
  {
    id: 'unit-1',
    title: '第1章｜情報社会の進展と情報技術',
    materials: [
      {
        id: 'lesson-1-1',
        title: 'コンピュータの処理能力と技術の進化',
        slide_ref: null,
        starter_code: `# ムーアの法則シミュレーション
# トランジスタ数が2年ごとに2倍になるとすると、
# n年後のトランジスタ数を計算しよう

initial = 2300   # 1971年のIntel 4004（約2300個）
years = 52       # 2023年まで（52年後）

# 2年ごとに倍増するので、倍増回数 = years / 2
doublings = years / 2
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
            id: 'q-1-1-1',
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
            id: 'q-1-1-2',
            type: 'choice',
            prompt: 'IoT（Internet of Things）の説明として正しいものはどれですか？',
            choices: [
              'インターネット上で物を売買するサービス',
              'コンピュータだけがインターネットに接続される仕組み',
              '家電・車・センサーなどあらゆるモノがインターネットに接続される仕組み',
              'データを暗号化してインターネットで送る技術',
            ],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-1-1-3',
            type: 'code',
            prompt: '4年後（4年 = 2回の倍増）にトランジスタ数が1000個から何個になるか計算して表示してください。',
            points: 20,
            code_tests: [{ input: '', expected_output: '4000' }],
          },
        ],
      },

      {
        id: 'lesson-1-2',
        title: '情報セキュリティの基礎（CIA・脅威・無線LAN）',
        slide_ref: null,
        starter_code: `# 情報セキュリティ：パスワード強度チェッカー
# 強いパスワードの条件を確認しよう

def check_password(password):
    score = 0
    feedback = []

    if len(password) >= 8:
        score += 1
    else:
        feedback.append("8文字以上にしてください")

    if any(c.isupper() for c in password):
        score += 1
    else:
        feedback.append("大文字を含めてください")

    if any(c.isdigit() for c in password):
        score += 1
    else:
        feedback.append("数字を含めてください")

    symbols = "!@#$%^&*"
    if any(c in symbols for c in password):
        score += 1
    else:
        feedback.append("記号(!@#$%^&*)を含めてください")

    if score == 4:
        strength = "強い"
    elif score >= 2:
        strength = "普通"
    else:
        strength = "弱い"

    print(f"パスワード強度: {strength}（{score}/4点）")
    for f in feedback:
        print(f"  ✗ {f}")

check_password("password")
print()
check_password("MyPass123!")
`,
        questions: [
          {
            id: 'q-1-2-1',
            type: 'choice',
            prompt: '情報セキュリティの3要素（CIA）に含まれないものはどれですか？',
            choices: ['機密性（Confidentiality）', '完全性（Integrity）', '可用性（Availability）', '互換性（Compatibility）'],
            correct: 3,
            points: 10,
          },
          {
            id: 'q-1-2-2',
            type: 'choice',
            prompt: '無線LANの暗号化方式として現在推奨されているものはどれですか？',
            choices: ['WEP', 'WPA', 'WPA2/WPA3', 'オープンネットワーク（暗号化なし）'],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-1-2-3',
            type: 'code',
            prompt: 'ランサムウェアの説明を print() で表示してください。出力は「ランサムウェア: データを暗号化して身代金を要求するマルウェア」',
            points: 20,
            code_tests: [{ input: '', expected_output: 'ランサムウェア: データを暗号化して身代金を要求するマルウェア' }],
          },
        ],
      },

      {
        id: 'lesson-1-3',
        title: 'デジタルデータの表現と情報モラル',
        slide_ref: null,
        starter_code: `# デジタルデータの表現
# コンピュータは全てを0と1で表現する

# 10進数 → 2進数の変換
number = 65  # 'A'のASCIIコード

print(f"10進数: {number}")
print(f"2進数:  {bin(number)}")
print(f"16進数: {hex(number)}")

# 文字とASCIIコードの関係
print(f"\\nASCII {number} の文字: {chr(number)}")
print(f"'B' のASCIIコード: {ord('B')}")

# 色のRGB表現（0〜255の3つの数値で表現）
red   = (255, 0, 0)
green = (0, 255, 0)
blue  = (0, 0, 255)
white = (255, 255, 255)

print(f"\\n赤: RGB{red}")
print(f"緑: RGB{green}")
print(f"青: RGB{blue}")
print(f"白: RGB{white}")

# データサイズの計算
kb = 1024
mb = kb * 1024
gb = mb * 1024
print(f"\\n1GB = {gb:,} バイト")
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
            prompt: '著作権について正しい説明はどれですか？',
            choices: [
              '著作権は申請しないと発生しない',
              '創作物は自動的に著作権で保護される',
              '教育目的なら無断コピーは全て許可される',
              '著作権の保護期間は10年間',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-3-3',
            type: 'code',
            prompt: "Pythonのchr()関数を使って、ASCIIコード72の文字を表示してください（答えは大文字のアルファベット1文字）",
            points: 20,
            code_tests: [{ input: '', expected_output: 'H' }],
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 第2章 コミュニケーションとコンテンツ
  // ──────────────────────────────────────────────────────────
  {
    id: 'unit-2',
    title: '第2章｜コミュニケーションとコンテンツ',
    materials: [
      {
        id: 'lesson-2-1',
        title: 'メディアとコンテンツ戦略',
        slide_ref: null,
        starter_code: `# メディア分析ツール
# テキストコンテンツの基本分析をしよう

text = """
情報IIでは、プログラミングやデータサイエンスを学びます。
デジタル社会において、情報技術の活用能力は非常に重要です。
SNSやWebサイトなどのメディアを通じて、効果的に情報を発信しましょう。
"""

lines = [line for line in text.strip().split("\\n") if line]
char_count = len(text.replace("\\n", "").replace(" ", ""))

print(f"=== コンテンツ分析 ===")
print(f"行数: {len(lines)} 行")
print(f"文字数（空白除く）: {char_count} 文字")

keywords = ["情報", "デジタル", "メディア", "プログラミング"]
print(f"\\n=== キーワード出現回数 ===")
for word in keywords:
    count = text.count(word)
    bar = "■" * count
    print(f"{word}: {bar} ({count}回)")
`,
        questions: [
          {
            id: 'q-2-1-1',
            type: 'choice',
            prompt: 'クロスメディアの説明として正しいものはどれですか？',
            choices: [
              '複数のメディアで全く異なる内容を発信する手法',
              '同じコンテンツを複数のメディアで展開し、メディア間を行き来させる手法',
              '1つのメディアだけで情報を発信する手法',
              '海外向けのメディア戦略',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-2-1-2',
            type: 'choice',
            prompt: 'コンテンツ制作の5段階プロセスの正しい順序はどれですか？',
            choices: [
              '要件定義 → 調査 → プロトタイプ → 仮説立案 → 検証',
              '仮説立案 → 調査 → 要件定義 → プロトタイプ → 検証',
              '調査 → 仮説立案 → 要件定義 → プロトタイプ → 検証・改善',
              'プロトタイプ → 調査 → 仮説立案 → 要件定義 → 検証',
            ],
            correct: 2,
            points: 10,
          },
        ],
      },

      {
        id: 'lesson-2-2',
        title: 'ユーザー中心設計・コンテンツの評価と改善',
        slide_ref: null,
        starter_code: `# Webアナリティクス指標の計算
# コンテンツの効果を数値で測定しよう

data = {
    "pv": 10000,
    "uu": 3500,
    "bounce": 2100,
    "cv": 175,
}

pv     = data["pv"]
uu     = data["uu"]
bounce = data["bounce"]
cv     = data["cv"]

bounce_rate  = (bounce / uu) * 100
cvr          = (cv / uu) * 100
pv_per_user  = pv / uu

print("=== Webアナリティクスレポート ===")
print(f"ページビュー（PV）: {pv:,} 回")
print(f"ユニークユーザー（UU）: {uu:,} 人")
print(f"1人あたりPV: {pv_per_user:.1f} ページ")
print(f"直帰率: {bounce_rate:.1f}%")
print(f"コンバージョン率（CVR）: {cvr:.1f}%")

print("\\n=== A/Bテスト結果 ===")
a_cvr = 2.5
b_cvr = 3.8
improvement = ((b_cvr - a_cvr) / a_cvr) * 100
print(f"バージョンA のCVR: {a_cvr}%")
print(f"バージョンB のCVR: {b_cvr}%")
print(f"改善率: +{improvement:.1f}%")
`,
        questions: [
          {
            id: 'q-2-2-1',
            type: 'choice',
            prompt: 'ペルソナとは何ですか？',
            choices: [
              'WebサイトのデザインテンプレートのことTarget',
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
            prompt: 'CVR（コンバージョン率）の説明として正しいものはどれですか？',
            choices: [
              'サイトを訪問した総ページ数',
              '1ページだけ見て離脱した割合',
              '購買や問い合わせなど目的の行動をした割合',
              '訪問者の平均滞在時間',
            ],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-2-2-3',
            type: 'code',
            prompt: 'UU（訪問者数）が5000人で、コンバージョン数が100人のとき、CVR（%）を計算して小数点1桁で表示してください。例: 2.0',
            points: 20,
            code_tests: [{ input: '', expected_output: '2.0' }],
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 第3章（前半）データと関係データベース・収集
  // ──────────────────────────────────────────────────────────
  {
    id: 'unit-3',
    title: '第3章｜情報とデータサイエンス（基礎）',
    materials: [
      {
        id: 'lesson-3-1',
        title: 'データベースとSQL',
        slide_ref: null,
        starter_code: `# Pythonでデータベース操作を模擬してみよう
# 実際のDBの代わりにリストと辞書で表現します

students = [
    {"id": 1, "name": "山田太郎", "class_id": "A01", "score": 85},
    {"id": 2, "name": "鈴木花子", "class_id": "A02", "score": 92},
    {"id": 3, "name": "佐藤次郎", "class_id": "A01", "score": 78},
    {"id": 4, "name": "田中三郎", "class_id": "A02", "score": 88},
    {"id": 5, "name": "高橋四郎", "class_id": "A01", "score": 95},
]

classes = {
    "A01": "1年A組",
    "A02": "1年B組",
}

print("=== 全生徒一覧（SELECT * FROM students）===")
for s in students:
    class_name = classes[s["class_id"]]
    print(f"  {s['id']}: {s['name']} / {class_name} / {s['score']}点")

print("\\n=== A01の生徒（WHERE class_id = 'A01'）===")
a01_students = [s for s in students if s["class_id"] == "A01"]
for s in a01_students:
    print(f"  {s['name']}: {s['score']}点")

avg = sum(s["score"] for s in students) / len(students)
print(f"\\n全体の平均点: {avg:.1f}点")
`,
        questions: [
          {
            id: 'q-3-1-1',
            type: 'choice',
            prompt: '関係データベース（RDB）でデータを操作するための言語はどれですか？',
            choices: ['HTML', 'CSS', 'SQL', 'Python'],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-3-1-2',
            type: 'choice',
            prompt: 'SQLで特定条件のデータだけを取得するキーワードはどれですか？',
            choices: ['FROM', 'WHERE', 'INSERT', 'UPDATE'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-1-3',
            type: 'choice',
            prompt: 'NoSQLデータベースの説明として正しいものはどれですか？',
            choices: [
              'SQLを使わないと操作できないデータベース',
              'RDB以外のデータベースの総称で、非構造化データや大規模データに対応',
              'セキュリティが低いデータベース',
              '日本専用のデータベース形式',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-1-4',
            type: 'code',
            prompt: 'リスト [85, 92, 78, 88, 95] の中から90点以上の人数を数えて表示してください。（答え: 2）',
            points: 20,
            code_tests: [{ input: '', expected_output: '2' }],
          },
        ],
      },

      {
        id: 'lesson-3-2',
        title: 'データの収集・整理・前処理',
        slide_ref: null,
        starter_code: `# データクリーニング（前処理）の実践
# 実際のデータには不備が多い。きれいにしよう！

raw_data = [
    {"name": "山田", "age": "18", "score": "85"},
    {"name": "鈴木", "age": "seventeen", "score": "92"},  # 数字でない
    {"name": "佐藤", "age": "17", "score": None},          # 欠損値
    {"name": "田中", "age": "18", "score": "88"},
    {"name": "山田", "age": "18", "score": "85"},          # 重複行
    {"name": "高橋", "age": "16", "score": "200"},         # 外れ値
]

print("=== クリーニング前のデータ ===")
for d in raw_data:
    print(f"  {d}")

cleaned = []
seen = set()

for d in raw_data:
    key = (d["name"], d["age"])
    if key in seen:
        print(f"\\n[削除] 重複: {d['name']}")
        continue
    seen.add(key)

    if d["score"] is None:
        print(f"[削除] 欠損値: {d['name']}")
        continue

    try:
        age   = int(d["age"])
        score = int(d["score"])
    except (ValueError, TypeError):
        print(f"[削除] 変換エラー: {d['name']}")
        continue

    if not (0 <= score <= 100):
        print(f"[削除] 外れ値: {d['name']} score={score}")
        continue

    cleaned.append({"name": d["name"], "age": age, "score": score})

print(f"\\n=== クリーニング後のデータ（{len(cleaned)}件） ===")
for d in cleaned:
    print(f"  {d}")

avg = sum(d["score"] for d in cleaned) / len(cleaned)
print(f"\\n平均点: {avg:.1f}点")
`,
        questions: [
          {
            id: 'q-3-2-1',
            type: 'choice',
            prompt: 'データの前処理（クリーニング）に含まれない作業はどれですか？',
            choices: ['欠損値の処理', '外れ値の除外', '重複行の削除', 'Webサイトへの公開'],
            correct: 3,
            points: 10,
          },
          {
            id: 'q-3-2-2',
            type: 'choice',
            prompt: 'pandasのmelt()関数は何をする関数ですか？',
            choices: [
              'データを並び替えるSort処理',
              'ワイドフォーマットをロングフォーマットに変換する',
              'データを削除する',
              'グラフを表示する',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-3-2-3',
            type: 'code',
            prompt: 'リスト [10, None, 30, None, 50] からNoneを除いた要素の平均を整数で表示してください。（答え: 30）',
            points: 20,
            code_tests: [{ input: '', expected_output: '30' }],
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 第3章（後半）データ分析・機械学習
  // ──────────────────────────────────────────────────────────
  {
    id: 'unit-4',
    title: '第3章｜データ分析と機械学習',
    materials: [
      {
        id: 'lesson-4-1',
        title: '重回帰分析とモデルの評価',
        slide_ref: null,
        starter_code: `# 重回帰分析の基礎：相関と予測
# Pythonで統計計算を実装しよう

data = [
    {"height": 165, "weight": 60, "run_50m": 7.8},
    {"height": 170, "weight": 65, "run_50m": 7.5},
    {"height": 158, "weight": 52, "run_50m": 8.2},
    {"height": 175, "weight": 70, "run_50m": 7.3},
    {"height": 162, "weight": 58, "run_50m": 7.9},
    {"height": 180, "weight": 75, "run_50m": 7.1},
]

def mean(values):
    return sum(values) / len(values)

def correlation(x_list, y_list):
    mx = mean(x_list)
    my = mean(y_list)
    n  = len(x_list)
    cov   = sum((x - mx) * (y - my) for x, y in zip(x_list, y_list)) / n
    std_x = (sum((x - mx) ** 2 for x in x_list) / n) ** 0.5
    std_y = (sum((y - my) ** 2 for y in y_list) / n) ** 0.5
    return cov / (std_x * std_y)

heights = [d["height"] for d in data]
weights = [d["weight"] for d in data]
times   = [d["run_50m"] for d in data]

r_hw = correlation(heights, weights)
r_ht = correlation(heights, times)

print("=== 相関分析結果 ===")
print(f"身長と体重の相関係数: {r_hw:.3f}")
print(f"身長と50m走の相関係数: {r_ht:.3f}")

avg_h = mean(heights)
avg_w = mean(weights)
b = sum((h - avg_h) * (w - avg_w) for h, w in zip(heights, weights)) / \
    sum((h - avg_h) ** 2 for h in heights)
a = avg_w - b * avg_h

print(f"\\n単回帰予測式: 体重 = {b:.2f} × 身長 + {a:.2f}")
h_new = 168
print(f"身長 {h_new}cm の予測体重: {b * h_new + a:.1f}kg")
`,
        questions: [
          {
            id: 'q-4-1-1',
            type: 'choice',
            prompt: '重回帰分析の「目的変数」とは何ですか？',
            choices: ['予測に使う変数（説明変数）', '予測したい変数', '使わない変数', 'モデルの誤差'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-1-2',
            type: 'choice',
            prompt: '決定係数（R²）の説明として正しいものはどれですか？',
            choices: [
              '値が0に近いほどモデルの精度が高い',
              '目的変数の変動の何%をモデルで説明できるかを示す（0〜1）',
              '説明変数の数を表す',
              '常に負の値をとる',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-1-3',
            type: 'code',
            prompt: 'リスト [3, 7, 5, 9, 6] の平均値を計算して表示してください。（答え: 6.0）',
            points: 20,
            code_tests: [{ input: '', expected_output: '6.0' }],
          },
        ],
      },

      {
        id: 'lesson-4-2',
        title: '分類アルゴリズム（決定木・k-近傍法）',
        slide_ref: null,
        starter_code: `# k-近傍法（kNN）の実装
# 新しいデータを「最も近いk個の多数決」で分類しよう

import math

train_data = [
    {"study": 8, "sleep": 7, "result": "合格"},
    {"study": 6, "sleep": 6, "result": "合格"},
    {"study": 9, "sleep": 8, "result": "合格"},
    {"study": 2, "sleep": 5, "result": "不合格"},
    {"study": 1, "sleep": 4, "result": "不合格"},
    {"study": 3, "sleep": 6, "result": "不合格"},
    {"study": 7, "sleep": 7, "result": "合格"},
    {"study": 2, "sleep": 7, "result": "不合格"},
]

def euclidean_distance(a, b):
    return math.sqrt((a["study"] - b["study"]) ** 2 +
                     (a["sleep"] - b["sleep"]) ** 2)

def knn_predict(new_point, k=3):
    distances = []
    for d in train_data:
        dist = euclidean_distance(new_point, d)
        distances.append({"data": d, "dist": dist})
    distances.sort(key=lambda x: x["dist"])

    top_k = distances[:k]
    votes = {}
    for item in top_k:
        label = item["data"]["result"]
        votes[label] = votes.get(label, 0) + 1

    return max(votes, key=votes.get), top_k

new_student = {"study": 5, "sleep": 6}
pred, neighbors = knn_predict(new_student, k=3)

print(f"新しい生徒: 勉強{new_student['study']}時間・睡眠{new_student['sleep']}時間")
print(f"\\n最近傍の3人:")
for n in neighbors:
    print(f"  {n['data']['result']} (距離: {n['dist']:.2f})")
print(f"\\n予測結果: {pred}")
`,
        questions: [
          {
            id: 'q-4-2-1',
            type: 'choice',
            prompt: '決定木のデメリットとして正しいものはどれですか？',
            choices: [
              '視覚的にわかりにくい',
              '結果の理由が説明できない',
              '過学習（オーバーフィッティング）しやすい',
              '数値データしか扱えない',
            ],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-4-2-2',
            type: 'choice',
            prompt: 'k-近傍法でkの値を大きくすると何が起きますか？',
            choices: [
              'より複雑な分類境界になる（過学習のリスク）',
              'よりなめらかな分類境界になる',
              'データが増える',
              '計算速度が上がる',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-2-3',
            type: 'code',
            prompt: '点A(0,0)と点B(3,4)のユークリッド距離を計算して表示してください。（答え: 5.0）',
            points: 20,
            code_tests: [{ input: '', expected_output: '5.0' }],
          },
        ],
      },

      {
        id: 'lesson-4-3',
        title: 'クラスタリングとニューラルネットワーク',
        slide_ref: null,
        starter_code: `# k-means法の簡易実装
# データを自動的にk個のグループに分けよう

def dist(p1, p2):
    return ((p1[0]-p2[0])**2 + (p1[1]-p2[1])**2) ** 0.5

def mean_point(points):
    n = len(points)
    return (sum(p[0] for p in points)/n, sum(p[1] for p in points)/n)

# 2次元データ（勉強時間・テスト点数）
data_points = [
    (2, 45), (3, 50), (2, 48),
    (7, 80), (8, 85), (7, 78),
    (5, 65), (5, 60), (6, 68),
]

centroids = [data_points[0], data_points[3], data_points[6]]

print("=== k-means クラスタリング（k=3）===")

for iteration in range(10):
    clusters = [[], [], []]
    for point in data_points:
        dists   = [dist(point, c) for c in centroids]
        nearest = dists.index(min(dists))
        clusters[nearest].append(point)

    new_centroids = [mean_point(c) if c else centroids[i] for i, c in enumerate(clusters)]
    moved = sum(dist(centroids[i], new_centroids[i]) for i in range(3))
    centroids = new_centroids

    if moved < 0.001:
        print(f"  {iteration+1}回目で収束")
        break

labels = ["A", "B", "C"]
for i, cluster in enumerate(clusters):
    print(f"\\nクラスタ{labels[i]}（{len(cluster)}点）: 重心=({centroids[i][0]:.1f}, {centroids[i][1]:.1f})")
    for p in cluster:
        print(f"  勉強{p[0]}時間・{p[1]}点")
`,
        questions: [
          {
            id: 'q-4-3-1',
            type: 'choice',
            prompt: 'クラスタリングは機械学習のどの種類に分類されますか？',
            choices: ['教師あり学習', '教師なし学習', '強化学習', '転移学習'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-4-3-2',
            type: 'choice',
            prompt: 'ニューラルネットワークの「隠れ層」の役割として正しいものはどれですか？',
            choices: [
              'データを受け取る入口',
              '最終的な予測値を出力する',
              '特徴を抽出・変換する',
              'データを保存する',
            ],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-4-3-3',
            type: 'choice',
            prompt: 'オーバーフィッティング（過学習）とはどのような状態ですか？',
            choices: [
              'モデルの精度が全データで低い状態',
              '訓練データには高精度だが未知のデータには機能しない状態',
              'データが多すぎてモデルが学習できない状態',
              'モデルの計算量が多すぎて動かない状態',
            ],
            correct: 1,
            points: 10,
          },
        ],
      },
    ],
  },

  // ──────────────────────────────────────────────────────────
  // 第4章 情報システムとプログラミング
  // ──────────────────────────────────────────────────────────
  {
    id: 'unit-5',
    title: '第4章｜情報システムとプログラミング',
    materials: [
      {
        id: 'lesson-5-1',
        title: '情報システムの構成と処理形態',
        slide_ref: null,
        starter_code: `# 情報システムの処理形態シミュレーション

# ── バッチ処理 ──
print("=== バッチ処理（月末給与計算） ===")
employees = [
    {"name": "山田", "hourly_rate": 1100, "hours": 160},
    {"name": "鈴木", "hourly_rate": 1200, "hours": 150},
    {"name": "佐藤", "hourly_rate": 1050, "hours": 170},
]

total = 0
for emp in employees:
    salary = emp["hourly_rate"] * emp["hours"]
    total += salary
    print(f"  {emp['name']}: {salary:,}円")
print(f"総支払額: {total:,}円")
print("→ 全データをまとめて一括処理（バッチ処理）")

print()

# ── OLTP ──
print("=== OLTP（ATM取引処理） ===")
balance = 50000

def withdraw(amount):
    global balance
    if amount > balance:
        return False, "残高不足"
    balance -= amount
    return True, f"残高: {balance:,}円"

for amount in [10000, 20000, 30000]:
    ok, msg = withdraw(amount)
    status = "✓ 成功" if ok else "✗ 失敗"
    print(f"  {amount:,}円引き出し → {status}: {msg}")
`,
        questions: [
          {
            id: 'q-5-1-1',
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
            id: 'q-5-1-2',
            type: 'choice',
            prompt: 'P2P（Peer to Peer）の説明として正しいものはどれですか？',
            choices: [
              'サーバを介して通信する方式',
              'サーバを介さず端末同士が直接通信する方式',
              '1台のコンピュータが全処理を行う方式',
              '暗号化通信の一種',
            ],
            correct: 1,
            points: 10,
          },
        ],
      },

      {
        id: 'lesson-5-2',
        title: '暗号化・セキュリティ・認証',
        slide_ref: null,
        starter_code: `# 暗号化の実装：シーザー暗号

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

message   = "Hello Python"
shift_key = 3

encrypted = caesar_encrypt(message, shift_key)
decrypted = caesar_decrypt(encrypted, shift_key)

print(f"元のメッセージ: {message}")
print(f"鍵（シフト数）: {shift_key}")
print(f"暗号文: {encrypted}")
print(f"復号文: {decrypted}")

print()
print("=== 多要素認証の3要素 ===")
auth_methods = {
    "知識情報（知っていること）": ["パスワード", "PIN"],
    "所持情報（持っているもの）": ["SMS認証", "ICカード"],
    "生体情報（生体的特徴）":     ["指紋認証", "顔認証"],
}
for category, examples in auth_methods.items():
    print(f"\\n【{category}】")
    for ex in examples:
        print(f"  ・{ex}")
`,
        questions: [
          {
            id: 'q-5-2-1',
            type: 'choice',
            prompt: '公開鍵暗号方式の特徴として正しいものはどれですか？',
            choices: [
              '暗号化と復号に同じ鍵を使う',
              '公開鍵で暗号化し、秘密鍵で復号する',
              '処理速度が共通鍵暗号より速い',
              '鍵配送問題が解決できない',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-5-2-2',
            type: 'choice',
            prompt: '多要素認証（MFA）に使われる「所持情報」の例として正しいものはどれですか？',
            choices: ['パスワード', 'PIN番号', 'SMS認証（スマートフォン）', '顔認証'],
            correct: 2,
            points: 10,
          },
          {
            id: 'q-5-2-3',
            type: 'code',
            prompt: 'シーザー暗号でshift=3のとき "XYZ" を暗号化した結果を表示してください。（答え: ABC）',
            points: 20,
            code_tests: [{ input: '', expected_output: 'ABC' }],
          },
        ],
      },

      {
        id: 'lesson-5-3',
        title: 'アルゴリズムとシステム開発',
        slide_ref: null,
        starter_code: `# ソートと探索アルゴリズムの実装

data_original = [64, 34, 25, 12, 22, 11, 90, 3, 78, 45]

# ── バブルソート O(n²) ──
def bubble_sort(arr):
    arr = arr.copy()
    n   = len(arr)
    comparisons = 0
    for i in range(n):
        for j in range(0, n-i-1):
            comparisons += 1
            if arr[j] > arr[j+1]:
                arr[j], arr[j+1] = arr[j+1], arr[j]
    return arr, comparisons

# ── 二分探索 O(log n) ──
def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    steps = 0
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

sorted_data, comparisons = bubble_sort(data_original)
print(f"元データ: {data_original}")
print(f"ソート後: {sorted_data}")
print(f"比較回数（バブルソート）: {comparisons}回")

target = 45
idx, steps = binary_search(sorted_data, target)
print(f"\\n二分探索: {target} を発見")
print(f"位置: {idx}番目 / 探索ステップ: {steps}回")
`,
        questions: [
          {
            id: 'q-5-3-1',
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
            id: 'q-5-3-2',
            type: 'choice',
            prompt: '二分探索が使える条件として正しいものはどれですか？',
            choices: [
              'データが重複していないこと',
              'データがソート（整列）済みであること',
              'データが10件以上あること',
              'データが数値であること',
            ],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-5-3-3',
            type: 'code',
            prompt: 'sorted() で [5, 2, 8, 1, 9, 3] を昇順にソートし、「最小:1 最大:9」の形式で表示してください。',
            points: 20,
            code_tests: [{ input: '', expected_output: '最小:1 最大:9' }],
          },
        ],
      },
    ],
  },
];

// ──────────────────────────────────────────────────────────
//  ユーティリティ関数
// ──────────────────────────────────────────────────────────
export function findMaterial(materialId: string) {
  const allMaterials = JOHO2_UNITS.flatMap((u) => u.materials);
  const index = allMaterials.findIndex((m) => m.id === materialId);
  if (index === -1) return null;
  return { material: allMaterials[index], index, allMaterials };
}
