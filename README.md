# ちゃぴすけ秘書アプリ🐹

Notionの i n b o x / b u y / 支払いDB と双方向でつながる、スマホ用のタイムラインアプリぷき。
Vercelにデプロイして、iPhoneのホーム画面に追加するとアプリみたいに使えるぷき😇

---

## 🛠 下準備（初回のみ）

### 1. Notionインテグレーションを作る

1. https://www.notion.so/profile/integrations を開く
2. 「新しいインテグレーション」 → 名前を「ちゃぴすけアプリ」などに
3. タイプは「内部」 / ワークスペースはchika's Notion
4. 作ったら **内部インテグレーションシークレット**（`secret_xxxx...`）をコピーしてメモ

### 2. 3つのDBにインテグレーションを接続

i n b o x / b u y / 支払いDB の各ページで：
1. 右上「…」→ 「接続先」→ さっき作った「ちゃぴすけアプリ」を探して「接続を確認」

### 3. Vercelアカウントを作る（無料）

https://vercel.com/signup — GitHubログインが楽ぷき

---

## 🚀 デプロイ方法（2通り）

### A）Vercel CLIで（一番楽）

ターミナルで：

```bash
cd chapisuke-app-real
npm i -g vercel
vercel login
vercel        # 最初にプロジェクト作成を聞かれる→全部EnterでOK
```

プロジェクトができたら、Vercelウェブでプロジェクトを開き、**Settings → Environment Variables** に `.env.example` の内容を登録（NOTION_TOKEN だけ自分のを入れる）。

もう一度：

```bash
vercel --prod
```

で本番デプロイ。 `https://xxx.vercel.app` のアドレスがもらえるぷき。

### B）GitHub＋Vercel Webで

1. `chapisuke-app-real` フォルダをGitHubのリポジトリにプッシュ
2. Vercelで「Import Project」→ そのリポを選択
3. Environment Variables に `.env.example` の中身を入力（NOTION_TOKENに自分のシークレット）
4. Deploy ボタン→後はpushする度に自動でデプロイ

---

## 📱 iPhoneのホーム画面に追加

1. iPhoneの**Safari**で `https://xxx.vercel.app` を開く
2. 下の共有ボタン→「ホーム画面に追加」
3. 名前を「ちゃぴすけ」で追加→ アイコンができるぷき✨

---

## 🧪 ローカルで試す（任意）

```bash
cp .env.example .env
# .env のNOTION_TOKENを実の値に書き換える

npm i -g vercel
vercel dev
# → http://localhost:3000 で確認
```

---

## 📂 ファイル構成

```
chapisuke-app-real/
├─ api/
│  ├─ _notion.js       # Notion APIヘルパー
│  ├─ list.js          # GET タスク/買い出し/支払い/あとでやる
│  └─ toggle.js        # POST チェックのオンオフ
├─ public/
│  ├─ index.html       # UI本体
│  ├─ manifest.json    # PWA設定
│  ├─ sw.js            # Service Worker
│  └─ icon-*.png       # アイコン
├─ package.json
├─ vercel.json
├─ .env.example       # 環境変数の雛形
└─ README.md          # このファイル
```

---

## 🛠 ここをいじると楽しいぷき

- `public/index.html` のCSSで見た目を変えられるぷき
- `api/list.js` のfilterを変えれば「今週」を「今日」にしたりできるぷき
- 新しいセクションをひとつ追加するなら、`api/list.js` に新しい `kind` を作って `index.html` のloadAllに追加すればOKぷき

もしハマったらちゃぴすけに聞いてぷき🐹
