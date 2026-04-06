# サイト構成ドキュメント

このファイルは、同じ技術スタックで別リポジトリのサイトを新規構築するときに Claude Code へ渡す説明資料です。

---

## 技術スタック

| 役割 | 技術 |
|------|------|
| 静的サイトジェネレーター | Astro 4.x (`output: 'static'`) |
| インタラクティブUI | Svelte 4.x (`@astrojs/svelte`) |
| CSSフレームワーク | Tailwind CSS 3.x (`@astrojs/tailwind`) |
| サイトマップ | `@astrojs/sitemap` |
| ホスティング | GitHub Pages（カスタムドメイン） |

---

## ディレクトリ構成

```
/
├── public/
│   ├── CNAME               # GitHub Pages カスタムドメイン用（ドメイン名を1行で記載）
│   ├── robots.txt          # クローラー設定
│   ├── favicon-hat.png     # ファビコン（docs/favicon-hat.png を使うこと）
│   └── [コンテンツ名]/
│       ├── icons/          # アイテムアイコン等の静的画像
│       └── maps/           # マップ画像等
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.svelte   # ナビゲーション（Svelte）
│   │   │   └── Footer.astro    # フッター（Astro）
│   │   └── ui/
│   │       └── *.svelte        # インタラクティブなUIパーツ
│   ├── data/
│   │   └── *.ts                # 静的データ（型付きオブジェクト配列）
│   ├── layouts/
│   │   └── BaseLayout.astro    # 全ページ共通レイアウト
│   ├── pages/
│   │   ├── index.astro         # ルート → 最初のページへリダイレクト
│   │   └── [コンテンツ名]/
│   │       └── *.astro         # 各ページ
│   └── styles/
│       └── global.css          # Tailwindディレクティブ + カスタムコンポーネント
├── docs/
│   ├── architecture.md         # このファイル
│   └── favicon-hat.png         # 使用するファビコン画像
├── astro.config.mjs
├── tailwind.config.mjs
└── package.json
```

---

## astro.config.mjs

```js
import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://lastagous.com',
  base: '',                           // カスタムドメイン使用時は空文字
  output: 'static',
  integrations: [
    svelte(),
    tailwind({
      applyBaseStyles: false,         // global.css で @tailwind base を自分で読む
    }),
    sitemap(),                        // ビルド時に sitemap-index.xml を自動生成
  ],
  build: {
    assets: '_assets',
  },
});
```

> **注意**: `base` を空文字にするのはカスタムドメイン使用時のみ。
> GitHub Pages のサブパス（`username.github.io/repo/`）で運用する場合は `base: '/repo'` にする。

---

## tailwind.config.mjs の構成パターン

`applyBaseStyles: false` にしているため `global.css` の先頭で自分でディレクティブを書く。

```css
/* global.css */
@import url('https://fonts.googleapis.com/css2?family=...&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;
```

`tailwind.config.mjs` ではテーマカラー・フォント・カスタムアニメーションを `extend` に記述する。
デザインに応じて色・フォントは自由に変更してよい。

---

## BaseLayout.astro の構成

すべてのページがこのレイアウトを継承する。Props は以下の2つが必須。

```astro
---
export interface Props {
  title: string;
  description: string;
  ogImage?: string;   // デフォルト: /og-default.png
  ogType?: string;    // デフォルト: 'website'
}
---
```

head に含まれる SEO 関連タグ：

- `<title>` / `<meta name="description">`
- `<meta name="robots" content="index, follow">`
- `<link rel="canonical">` — `Astro.url.pathname` から自動生成
- OGP（og:title / og:description / og:image / og:locale / og:site_name）
- Twitter Card（summary_large_image）
- 構造化データ（JSON-LD / `@type: "WebSite"`）
- ファビコン — `docs/favicon-hat.png` を `public/favicon-hat.png` にコピーして使う
  ```html
  <link rel="icon" type="image/png" href="/favicon-hat.png" />
  ```

---

## ページの書き方

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
---

<BaseLayout
  title="ページ名 | サイト名 | FF14"
  description="FF14 〇〇（パッチ X.X）の〜〜。〜〜を解説。"
>
  <!-- ページ本文 -->
</BaseLayout>
```

### タイトル・説明文の書き方統一ルール

| 項目 | 形式 |
|------|------|
| title | `ページ名 \| サイト名 \| FF14` |
| description | `FF14 〇〇（パッチ X.X）の〜〜。〜〜。` |

- 説明文は必ず `FF14 〇〇（パッチ X.X）の` で書き始める
- ページタイトル・ヘッダーのラベル・h1 の3箇所は同じ名称に統一する

---

## Svelte コンポーネントの使い方

インタラクティブな要素（フィルター・タブ・アコーディオン等）は Svelte で作り、
Astro ページから `client:load` で読み込む。

```astro
import GearFilter from '../../components/ui/GearFilter.svelte';

<GearFilter client:load />
```

静的なレイアウト（ヘッダー以外の構造）は Astro コンポーネントで書く。

---

## ナビゲーション（Header.svelte）

リンクはすべてルートからの絶対パスで書く。相対パスにすると本番環境でURL重複が発生する。

```js
// NG: 相対パス
{ href: './support-jobs/', label: '...' }

// OK: 絶対パス
{ href: '/content-name/support-jobs/', label: '...' }
```

サブメニューあり・なしの両方に対応した構造：

```js
const navItems = [
  { href: '/content-name/page/', label: 'ラベル' },       // 直リンク
  {
    label: '親ラベル',
    sub: [
      { href: '/content-name/sub/', label: '子ラベル', zone: 'tag' },
    ],
  },
];
```

---

## GitHub Pages 公開設定

### リポジトリ設定
1. Settings → Pages → Source: **GitHub Actions**
2. `.github/workflows/deploy.yml` にビルド＆デプロイワークフローを作成

### カスタムドメイン
- `public/CNAME` に `lastagous.com` を1行で記述
- DNS の A レコード × 4 を GitHub Pages のIPに向ける:
  ```
  185.199.108.153
  185.199.109.153
  185.199.110.153
  185.199.111.153
  ```
- `www` → CNAME → `lastagous.github.io`

---

## SEO設定（robots.txt）

`public/robots.txt` に配置：

```
User-agent: *
Allow: /

Sitemap: https://lastagous.com/sitemap-index.xml
```

`sitemap-index.xml` はビルド時に `@astrojs/sitemap` が自動生成する。

---

## FF14 Lodestone ツールチップ

Lodestone 公式のツールチップスクリプトを使うと、アイテム名・クエスト名のリンクにホバーしたときに詳細情報のツールチップが表示される。

### スクリプトの読み込み

`BaseLayout.astro` の `<body>` 末尾に追加する。
Astro では `is:inline` を付けないとスクリプトが最適化されて動作しないため必須。

```html
<script src="https://img.finalfantasyxiv.com/lds/pc/global/js/eorzeadb/loader.js?v2" is:inline></script>
```

### リンクの書き方

`class="eorzeadb_link"` を付けた `<a>` タグにホバーするとツールチップが表示される。

```astro
<!-- アイテム -->
<a href="https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/{ldsId}/" class="eorzeadb_link">
  アイテム名
</a>

<!-- クエスト -->
<a href="https://jp.finalfantasyxiv.com/lodestone/playguide/db/quest/{ldsId}/" class="eorzeadb_link">
  クエスト名
</a>
```

`ldsId` は Lodestone の各ページURLの末尾にあるハッシュ文字列（例: `c51ad7501ea`）。
データファイルの型定義に `ldsId: string | null` を持たせ、null の場合はプレーンテキストで表示する。

```ts
type Item = {
  name: string;
  ldsId: string | null;  // null = Lodestone未掲載
};
```

```astro
{item.ldsId
  ? <a href={`https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/${item.ldsId}/`} class="eorzeadb_link">{item.name}</a>
  : <span>{item.name}</span>
}
```

### Tailwind preflight との競合と対処

Tailwind の preflight（リセットCSS）がツールチップの表示を崩す。
`BaseLayout.astro` の `<style is:global>` に以下を追加して打ち消す。

```css
/* ツールチップ領域がはみ出さないように */
#eorzeadb_tooltip {
  overflow: visible !important;
}

/* preflight: img { display:block; max-width:100% } の打ち消し
   → アイコン画像がブロック扱いになりレイアウトが崩れる */
#eorzeadb_tooltip img {
  display: inline !important;
  max-width: none !important;
}

/* preflight: table { border-collapse:collapse } の打ち消し
   → テーブルのセル間隔が潰れてItemLevelが右にはみ出す */
#eorzeadb_tooltip table {
  border-collapse: separate !important;
  width: auto !important;
}
```

### 外部CSSの既知の問題と追加修正

Lodestone のツールチップは外部CSS（`eorzeadb_external.css`）を動的に読み込む。
この CSS に以下の問題がある。

```css
/* 外部CSS内 — 変更不可 */
.db-tooltip__l_main   { box-sizing: border-box; width: 412px; }
.db-table__txt--type  { font-size: 10px; }
.db-table__wrapper--npc_content { /* display 未指定 */ }
```

対処：

```css
/* 種別ラベルが小さすぎる → 読みやすいサイズに */
#eorzeadb_tooltip .db-table__txt--type {
  font-size: 12px !important;
}

/* NPC・クエスト発行情報が縦並びにならない → grid で整列 */
#eorzeadb_tooltip .db-table__wrapper--npc_content {
  display: grid !important;
}
```

**やってはいけない対処**:

```css
/* NG: * への一括適用は .db-tooltip__l_main の box-sizing:border-box を上書きし
        width: 412px のレイアウトが完全に崩壊する */
#eorzeadb_tooltip * {
  box-sizing: content-box !important;
}
```

### リンクのスタイル

`eorzeadb_link` クラスへのスタイルは Tailwind の `a` リセットと別途定義が必要。

```css
a.eorzeadb_link {
  color: var(--color-moon);      /* サイトのテーマカラーに合わせる */
  text-decoration: none;
}
a.eorzeadb_link:hover {
  color: var(--color-accent);
  text-decoration: underline;
}
```

---

## SaintCoinach によるゲームデータ抽出

FF14 のアイテム名・アイコン・各種マスタデータはゲームファイルから直接抽出する。
アイコンは必ず SaintCoinach で取得すること（外部CDNは使わない）。

### ローカル環境

インストール済みの SaintCoinach は以下のパスにある：

```
F:\SaintCoinach.Cmd\SaintCoinach.Cmd.exe
```

### 起動方法

コマンドプロンプトで以下を実行：

```
cd F:\SaintCoinach.Cmd
.\SaintCoinach.Cmd.exe "C:\Program Files (x86)\SquareEnix\FINAL FANTASY XIV - A Realm Reborn"
```

起動後、対話式プロンプトが表示される。

### 主要コマンド

| コマンド | 内容 |
|---------|------|
| `lang Japanese` | 出力言語を日本語に設定（起動直後に実行） |
| `exd Item` | Item シートを CSV でエクスポート |
| `exd` | 全シートを CSV でエクスポート |
| `ui 026039` | 指定番号のUIアイコンを PNG で出力 |
| `ui 20000-30000` | 範囲指定でアイコンを一括出力 |
| `uihd 026039` | HD版アイコンを出力 |
| `maps` | マップ画像を出力 |

出力先は `SaintCoinach.Cmd.exe` と同じフォルダ内に自動生成される。

### アイテムCSVの使い方

`exd Item` で出力される `Item.csv` の主要カラム：

| カラム | 内容 |
|--------|------|
| `#` | アイテムID |
| `Name` | アイテム名（lang で指定した言語） |
| `Icon` | アイコン番号（例: `26039`） |
| `LevelItem` | アイテムレベル |
| `ClassJobCategory` | 装備可能ジョブカテゴリのID |

CSV をそのままコピーするのではなく、必要なアイテムのみ `src/data/*.ts` に手動で転記する。

### アイコンのパス規則

SaintCoinach で抽出したアイコンファイル名から、`public/` に配置するパスを組み立てる。

**ルール（6桁ゼロ埋め → フォルダ = 上3桁 + `000`）：**

```
アイコン番号: 26039
ゼロ埋め6桁: 026039
フォルダ:    026000
ファイルパス: /icons/026000/026039.png
```

```ts
function iconPath(id: number): string {
  const padded = String(id).padStart(6, '0');
  const folder = padded.slice(0, 3) + '000';
  return `/icons/${folder}/${padded}.png`;
}
```

### 抽出済みアイコンの場所

過去に抽出したアイコンが以下に保存されている（118フォルダ分）：

```
F:\SaintCoinach.Cmd\2026.03.07.0000.0000\ui\icon\
├── 026000\
│   ├── 026001.png        # 通常サイズ
│   ├── 026001_hr1.png    # HD版（高解像度）
│   └── ...
└── ...（118フォルダ）
```

必要なアイコンがこの中にあれば、新たに抽出せずそのまま `public/` にコピーして使える。
ない場合は SaintCoinach.Cmd で追加抽出する。

抽出したPNGは `public/[コンテンツ名]/icons/` に配置し、上記パスで参照する。
外部CDN（XIVAPI等）は使わず、必ず SaintCoinach で抽出したものを使うこと。

---

## データ管理

コンテンツのデータ（アイテム一覧・ステータス表等）は `src/data/*.ts` に TypeScript の型付き配列として定義し、Astro ページでインポートして使う。
API は使わず、全データをビルド時に埋め込む静的サイト構成。

```ts
// src/data/items.ts
export type Item = {
  id: number;
  name: string;
  ilvl: number;
  ldsId: string | null;
};

export const ITEMS: Item[] = [
  { id: 1, name: '...', ilvl: 700, ldsId: 'c51ad7501ea' },
];
```
