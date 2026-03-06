# 暇つぶし読書仕分けアプリ

青空文庫の作品をランダムに1件ずつ表示し、「読んだ」「読んでない」で仕分けて保存できるWebアプリです。

## スクリーンショット

```
┌─────────────────────────────────┐
│   暇つぶし読書仕分けアプリ       │
│  青空文庫の作品をランダムに…     │
│                                 │
│  ┌───────────────────────────┐  │
│  │  羅生門                   │  │
│  │  著者：芥川龍之介          │  │
│  └───────────────────────────┘  │
│                                 │
│  [ランダム表示] [読んだ] [読んでない] │
│                                 │
│  読んだ: 3件    読んでない: 5件  │
└─────────────────────────────────┘
```

## 機能

- 青空文庫の作品（サンプル50作品収録）をランダム表示
- 「読んだ」「読んでない」で仕分けて localStorage に保存
- 同じ作品の連続表示を防止
- 重複保存を防止（読んだ ↔ 読んでない の付け替えも自動対応）
- ページ再読み込み後も保存内容が維持される
- 保存済み一覧を画面下に表示

## ローカルでの確認方法

HTMLファイルをそのままブラウザで開くと、`file://` プロトコルで動作します。

```bash
# 方法1: ファイルを直接開く（最も手軽）
open index.html        # macOS
start index.html       # Windows
xdg-open index.html    # Linux

# 方法2: Python の簡易サーバーを使う（推奨）
python3 -m http.server 8000
# ブラウザで http://localhost:8000 を開く

# 方法3: Node.js の http-server を使う
npx http-server -p 8000
# ブラウザで http://localhost:8000 を開く
```

## GitHub Pages で公開する方法

1. このリポジトリを GitHub にプッシュ
2. リポジトリの「Settings」→「Pages」を開く
3. 「Source」を `Deploy from a branch` に設定
4. ブランチを `main`（または `master`）、フォルダを `/ (root)` に設定して「Save」
5. しばらく待つと `https://<ユーザー名>.github.io/<リポジトリ名>/` で公開される

## データ取得方法の説明

### 現在の実装（サンプルデータ）

`script.js` の `SAMPLE_BOOKS` 配列に青空文庫の実在作品50件を収録しています。外部通信なしで完全動作します。

### 青空文庫データへの差し替え方法

`script.js` の `loadBooks()` 関数が差し替えポイントです。以下のように書き換えることで外部データに対応できます。

```javascript
// 例：青空文庫の非公式JSON APIを使う場合
async function loadBooks() {
  try {
    const res = await fetch("https://example.com/aozora-books.json");
    const data = await res.json();
    books = data.map(item => ({
      title:  item.title,
      author: item.person_name,
    }));
  } catch (e) {
    // 取得失敗時はサンプルデータにフォールバック
    console.warn("外部データ取得失敗。サンプルデータを使用します。", e);
    books = SAMPLE_BOOKS;
    showError("作品データの取得に失敗しました。サンプルデータを使用しています。");
  }
}
```

**注意**: 外部APIを使う場合は CORS の設定や GitHub Pages での動作確認が必要です。

## ファイル構成

```
.
├── index.html   # HTML構造
├── style.css    # スタイル
├── script.js    # アプリロジック（作品データも含む）
└── README.md    # このファイル
```

## localStorage の仕様

| キー | 内容 |
|------|------|
| `hima_read_books` | 「読んだ」作品の配列（JSON） |
| `hima_unread_books` | 「読んでない」作品の配列（JSON） |

保存データの形式：
```json
[
  { "title": "羅生門", "author": "芥川龍之介" },
  { "title": "走れメロス", "author": "太宰治" }
]
```

## 今後の改善案

- [ ] 青空文庫の公式データ（CSV/API）からリアルタイム取得
- [ ] 保存済み作品の削除・編集機能
- [ ] 作品の青空文庫ページへのリンク追加
- [ ] 仕分け済みの作品をランダム表示から除外するオプション
- [ ] データのエクスポート（CSV / JSON）機能
- [ ] 作品ジャンル・時代別フィルター
- [ ] 読んだ日時の記録
- [ ] PWA 対応（オフライン動作・ホーム画面追加）
