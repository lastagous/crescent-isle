# 🌙 クレセントアイル 攻略ガイド

**FF14 クレセントアイル**の総合攻略サイト。Astro × Svelte ハイブリッド構成で構築。

## 技術スタック

| 技術 | 用途 |
|------|------|
| [Astro](https://astro.build/) | 静的サイト生成（SSG）フレームワーク |
| [Svelte](https://svelte.dev/) | インタラクティブ UI コンポーネント |
| [Tailwind CSS](https://tailwindcss.com/) | スタイリング |
| GitHub Pages | ホスティング |

## ページ構成

```
/crescent-isle/
├── index          → トップページ（概要・ナビ）
├── support-jobs   → サポートジョブ解説
├── gear           → 装備ガイド
├── story          → ストーリー攻略（ネタバレ機能付き）
├── chests         → 宝箱マップ
├── pots           → ポット採集マップ
├── carrots        → にんじん採集マップ
├── fate           → FATE 攻略一覧
├── ce             → CE（大規模FATE）攻略
└── tower          → 力の塔 階層攻略
```

## Svelte コンポーネント

| コンポーネント | 機能 |
|--------------|------|
| `SpoilerToggle.svelte` | ストーリーのネタバレ ON/OFF トグル |
| `MapViewer.svelte` | 宝箱・ポット・にんじん位置の SVG マップ |
| `Accordion.svelte` | FATE/CE ギミック解説アコーディオン |
| `TowerNavigator.svelte` | 力の塔の階層ナビゲーター |

## セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバー起動 (http://localhost:4321)
npm run dev

# 本番ビルド
npm run build

# ビルド結果のプレビュー
npm run preview
```

## GitHub Pages デプロイ

1. `astro.config.mjs` の `site` と `base` をリポジトリに合わせて修正

```js
export default defineConfig({
  site: 'https://your-username.github.io',
  base: '/your-repo-name',
  // ...
});
```

2. GitHub リポジトリの Settings → Pages → Source を **GitHub Actions** に設定

3. `main` ブランチに push すると自動デプロイ

## カスタマイズ

- **カラーパレット** → `tailwind.config.mjs` の `colors` を変更
- **フォント** → `src/styles/global.css` の Google Fonts インポートを変更
- **ナビゲーション** → `src/components/layout/Header.svelte` の `navItems` を更新
- **マップデータ** → 各ページの `markers` 配列に実際の座標を入力

## ライセンス

FINAL FANTASY XIV © 2010–2024 SQUARE ENIX CO., LTD. All Rights Reserved.  
このサイトはファンが運営する非公式攻略サイトです。
