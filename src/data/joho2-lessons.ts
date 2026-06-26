// ============================================================
//  情報2 教材データ
//  スライドURLや問題をここで管理します。
//  slide_ref: Google SlidesのURL または PDFのURL を設定してください。
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
  correct?: number;       // choice問題の正解インデックス (0始まり)
  points: number;
  code_tests?: CodeTest[]; // code問題のテストケース
}

export interface Material {
  id: string;
  title: string;
  slide_ref: string | null; // Google Slides URL or PDF URL (null = スライドなし)
  starter_code: string;
  questions: Question[];
}

export interface Unit {
  id: string;
  title: string;
  materials: Material[];
}

// ============================================================
//  ▼▼▼ 教材データ本体 ▼▼▼
//  slide_ref にGoogle SlidesのURLを貼るだけで左ペインに表示されます
// ============================================================
export const JOHO2_UNITS: Unit[] = [
  {
    id: 'unit-1',
    title: 'プログラミング基礎',
    materials: [
      {
        id: 'lesson-1-1',
        title: '情報社会の始まり',
        // ↓ Google SlidesのURLをここに貼る（共有リンク）
        // 例: 'https://docs.google.com/presentation/d/XXXX/edit'
        slide_ref: 'https://docs.google.com/presentation/d/18xHg2kFCiUxjvC4sy1M8_xrUcmY2MdS8xz7yW0WqJrg/edit?usp=sharing',
        starter_code: `# Pythonで文字を表示してみよう
# print() 関数を使います

print("Hello, World!")
`,
        questions: [
          {
            id: 'q-1-1-1',
            type: 'choice',
            prompt: 'Pythonで文字列を画面に表示する関数はどれですか？',
            choices: ['input()', 'print()', 'show()', 'display()'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-1-2',
            type: 'code',
            prompt: '「Hello, Python!」と表示するコードを書いてください。',
            points: 20,
            code_tests: [
              { input: '', expected_output: 'Hello, Python!' },
            ],
          },
        ],
      },
      {
        id: 'lesson-1-2',
        title: '情報社会の進歩',
        slide_ref: null,
        starter_code: `# 変数を使って計算してみよう
x = 10
y = 20
print(x + y)
`,
        questions: [
          {
            id: 'q-1-2-1',
            type: 'choice',
            prompt: 'x = 5, y = 3 のとき、x * y の値はいくつですか？',
            choices: ['8', '15', '2', '53'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-1-2-2',
            type: 'code',
            prompt: '変数 a に 7、b に 3 を代入し、a と b の積（掛け算）を表示してください。',
            points: 20,
            code_tests: [
              { input: '', expected_output: '21' },
            ],
          },
        ],
      },
      {
        id: 'lesson-1-3',
        title: '条件分岐（if文）',
        slide_ref: null,
        starter_code: `# if文で条件によって処理を変えよう
score = 75

if score >= 60:
    print("合格")
else:
    print("不合格")
`,
        questions: [
          {
            id: 'q-1-3-1',
            type: 'choice',
            prompt: 'score = 55 のとき、上のコードの出力はどれですか？',
            choices: ['合格', '不合格', 'エラー', '何も表示されない'],
            correct: 1,
            points: 10,
          },
        ],
      },
    ],
  },
  {
    id: 'unit-2',
    title: 'データ構造とループ',
    materials: [
      {
        id: 'lesson-2-1',
        title: 'リストと繰り返し（for文）',
        slide_ref: null,
        starter_code: `# リストとfor文を使ってみよう
fruits = ["apple", "banana", "cherry"]

for fruit in fruits:
    print(fruit)
`,
        questions: [
          {
            id: 'q-2-1-1',
            type: 'choice',
            prompt: 'Pythonのリストで最初の要素を取り出すときのインデックスはいくつですか？',
            choices: ['1', '0', '-1', 'first'],
            correct: 1,
            points: 10,
          },
          {
            id: 'q-2-1-2',
            type: 'code',
            prompt: '1から5までの数字を順番に1行ずつ表示するコードを書いてください。',
            points: 30,
            code_tests: [
              { input: '', expected_output: '1\n2\n3\n4\n5' },
            ],
          },
        ],
      },
      {
        id: 'lesson-2-2',
        title: '関数の定義と呼び出し',
        slide_ref: null,
        starter_code: `# 関数を定義して呼び出してみよう
def greet(name):
    print("こんにちは、" + name + "さん！")

greet("田中")
greet("山田")
`,
        questions: [
          {
            id: 'q-2-2-1',
            type: 'choice',
            prompt: 'Pythonで関数を定義するキーワードはどれですか？',
            choices: ['function', 'def', 'func', 'define'],
            correct: 1,
            points: 10,
          },
        ],
      },
    ],
  },
];

// ユーティリティ: IDからMaterialを検索
export function findMaterial(materialId: string): { unit: Unit; material: Material; index: number; allMaterials: Material[] } | null {
  const allMaterials = JOHO2_UNITS.flatMap((u) => u.materials);
  for (const unit of JOHO2_UNITS) {
    const material = unit.materials.find((m) => m.id === materialId);
    if (material) {
      const index = allMaterials.findIndex((m) => m.id === materialId);
      return { unit, material, index, allMaterials };
    }
  }
  return null;
}
