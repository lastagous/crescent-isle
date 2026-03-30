# クレセントアイル攻略サイト — Claude Code 引継ぎ資料

## プロジェクト概要
FF14「クレセントアイル」攻略サイト。Astro × Svelte ハイブリッド構成、GitHub Pages 静的ホスティング想定。

## 技術スタック
- **Astro 4.15** + `@astrojs/svelte` + `@astrojs/tailwind`
- **Svelte 4.2** / **Tailwind CSS 3.4**
- TypeScript / GitHub Actions 自動デプロイ（`.github/workflows/deploy.yml`）

## ディレクトリ構成

```
crescent-isle/
├── astro.config.mjs
├── tailwind.config.mjs
├── tsconfig.json
├── src/
│   ├── layouts/
│   │   └── BaseLayout.astro          # 全ページ共通レイアウト
│   ├── styles/
│   │   └── global.css                # テーマ変数・グローバルスタイル
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.svelte         # fixed、h-16=64px
│   │   │   └── Footer.astro
│   │   └── ui/
│   │       ├── GearFilter.svelte     # 装備ページ右サイドバー・ジョブフィルター
│   │       ├── TableOfContents.svelte # sticky TOC（top:80px）
│   │       ├── Accordion.svelte
│   │       ├── SpoilerToggle.svelte
│   │       ├── MapViewer.svelte
│   │       └── TowerNavigator.svelte
│   └── pages/
│       ├── index.astro               # サイトトップ
│       └── crescent-isle/
│           ├── index.astro           # コンテンツトップ
│           ├── gear.astro            # 装備一覧（メイン作業ページ）
│           ├── support-jobs.astro    # サポートジョブ（パッチ7.4対応済み）
│           ├── story.astro
│           ├── ce.astro              # クリティカルエンカウント
│           ├── fate.astro
│           ├── chests.astro
│           ├── pots.astro
│           ├── carrots.astro
│           └── tower.astro
```

## デザインシステム

**テーマ：月光と深海のFantasy Dark**

| 変数名 | カラー | 用途 |
|--------|--------|------|
| `--color-night` | `#0a0f1e` | 背景 |
| `--color-moon` | `#c8d8f0` | メインテキスト |
| `--color-teal` | `#2dd4bf` | アクセント |
| `--color-gold` | `#fbbf24` | 強調・タンク色 |
| `--color-crimson` | `#f43f5e` | 警告・+2強化色 |

フォント：Cinzel（display）× Noto Sans JP × JetBrains Mono  
**表示領域に絵文字は使用しない**（ファビコンのみ例外）

## 完了済み実装

### BaseLayout.astro
- ロードストーンツールチップ JS を body 末尾に追加済み
  ```html
  <script src="https://img.finalfantasyxiv.com/lds/pc/global/js/eorzeadb/loader.js?v2">
  ```
- `#eorzeadb_tooltip` の `box-sizing` 競合回避 CSS 追加済み
- `a.eorzeadb_link` のスタイル定義済み

### gear.astro（直近の作業対象）
ロードストーン DB ツールチップ対応・ジョブ名タグへの変更が完了。

**クレセントノートセット構成（正確なジョブ割り当て）:**

| セット名 | 装備可能ジョブ | 主能力 |
|----------|--------------|--------|
| ディフェンダー | ナイト / 戦士 / 暗黒騎士 / ガンブレイカー | STR/VIT |
| スレイヤー | **竜騎士 / リーパー** | STR |
| **ストライカー** | **モンク / 侍**（ヴァイパーは含まない） | STR |
| スカウト | **忍者 / ヴァイパー** | DEX |
| レンジャー | 吟遊詩人 / 機工士 / 踊り子 | DEX |
| ヒーラー | 白魔道士 / 学者 / 占星術師 / 賢者 | MND |
| キャスター | 黒魔道士 / 召喚士 / 赤魔道士 / ピクトマンサー / 青魔道士 | INT |

**確認済み Lodestone アイテム ID（`ldsId` フィールド）:**

```
ディフェンダー: ペルト=c51ad7501ea / ベスト=697c5ec1a43 / アームレット=0c1feef4aa0
               ロインクロス=1ed88cc8b4f / フット=022056e17e3
スレイヤー:    ペルト=63060b72d3b / ベスト=7fee811da22 / アームレット=f0f4a30aae3
               ロインクロス=adb1155d75e / フット=40ff1600ef2
ストライカー:  バイコーン=null（未確認） / ジュストコール=1580f10ca2e
               グローブ=f2205d7f8af / スロップ=4e2e959d3a7 / ブーツ=dc5b81b425f
スカウト:      バイコーン=eb648fcb897 / ジュストコール=994e4a82938
               グローブ=d3ad26b2387 / スロップ=c6361c0f665 / ブーツ=f0549d08059
レンジャー:    バイコーン=d90d74a6ba1 / ジュストコール=a015c8713fe
               グローブ=eaa92e0a97f / スロップ=09b28036753 / ブーツ=68b2194e5de
ヒーラー:      シュガーローフ=b5bbb8cf99b / ローブ=84de562eb93
               リストグローブ=ca95c956aa2 / スカート=d551d9909cb / ブーツ=95ac05ca335
キャスター:    シュガーローフ=869d0dc2182 / ローブ=ef753924382
               リストグローブ=e1f6a5ce132 / スカート=2f4b97ab546 / ブーツ=b3c6c887ce9
```

### TableOfContents.svelte
- `position: sticky; top: 80px; max-height: calc(100vh - 96px); overflow-y: auto`
- クリック時スクロールオフセット: `getBoundingClientRect().top + scrollY - 80px`
- **重要**: 使用側の flex コンテナに `items-start` を付けない（sticky が壊れる）

```astro
<!-- 正しい使い方 -->
<div class="flex gap-8 relative">  <!-- items-start なし -->
  <main class="min-w-0 flex-1">...</main>
  <aside class="hidden xl:block w-52 flex-shrink-0">
    <TableOfContents client:visible items={tocItems} />
  </aside>
</div>
```

### GearFilter.svelte
- `window.dispatchEvent(new CustomEvent('jobfilter', { detail: { jobs } }))`
- gear.astro 側で `.gear-group[data-jobs]` をフィルタリング
- ロール選択: タンク / ヒーラー / 近接DPS / 遠隔物理DPS / キャスター

## 残タスク

### 優先度 高
- [ ] **ストライカーバイコーンの Lodestone ID 取得**
  - 英語名: `Arcanaut's Bicorn of Striking`
  - URL例: `https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/XXXXXXX/`
  - 見つかったら gear.astro の `ldsId: null` を実際の ID に差し替える

### 優先度 中
- [ ] **キャスターブーツ ID 要確認** (`b3c6c887ce9` — 英語版IDから推定、未検証)
- [ ] **ディフェンダーアームレット・ロインクロス ID 検証**（`0c1feef4aa0` / `1ed88cc8b4f` — 検索で直接ヒットせず推定値）

### 優先度 低
- [ ] support-jobs.astro のマスターボーナス計算表の追加
- [ ] 各ページにパンくずナビを揃える
- [ ] OGP 画像の作成（現在はプレースホルダー）
- [ ] `astro.config.mjs` の `site` / `base` をリポジトリ名に合わせて変更

## よく使うコマンド

```bash
cd crescent-isle
npm run dev    # 開発サーバー起動 (localhost:4321)
npm run build  # 本番ビルド
npm run preview # ビルド結果プレビュー
```

## ゲームデータ参照先

- エオルゼアデータベース: `https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/?q=クレセントノート`
- ミラプリライフ: `https://ff14-fc.com/equipment/`
- パママFF14DB: `https://www.mtgames.jp/ff14/`

## ロードストーンツールチップの使い方

```html
<!-- BaseLayout.astro に組み込み済み。各ページで以下の形式を使うだけ -->
<a href="https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/c51ad7501ea/"
   class="eorzeadb_link">
  クレセントノート・ディフェンダーペルト
</a>
```

Astro/TSX では gear.astro の実装を参照:
```astro
{p.ldsId
  ? <a href={`${BASE_URL}${p.ldsId}/`} class="eorzeadb_link">{p.name}</a>
  : <span class="text-moon/70">{p.name}</span>
}
```
