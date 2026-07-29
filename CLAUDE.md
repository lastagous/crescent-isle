# クレセントアイル攻略ガイド — 開発ガイド

FF14 クレセントアイルの非公式攻略サイト。Astro (SSG) + Svelte + Tailwind CSS、GitHub Pages 配信（`base: /crescent-isle`）。ページ構成・セットアップは [README.md](README.md) 参照。

このファイルは**デザインシステム**を記述する。新しいページ・コンポーネントを追加する際は、まずここに定義済みのトークン/クラスで表現できないか確認し、できない場合のみローカルに定義する。

## デザイントークン ([tailwind.config.mjs](tailwind.config.mjs))

| トークン | 値 | 用途 |
|---|---|---|
| `night` (DEFAULT/50/100/200/300) | `#0a0f1e` 〜 `#243254` | 背景階調。`night`=ページ背景、`night-200`=カード面、`night-300`=罫線/ホバー |
| `moon` (DEFAULT/light/dim) | `#c8d8f0` / `#e2ecff` / `#8aa8d0` | 本文テキスト。`moon-light`=見出し・強調、`moon-dim`=補助ラベル |
| `teal` (DEFAULT/dark/glow) | `#2dd4bf` / `#0d9488` / `#5eead4` | アクセントカラー（リンク・アクティブ状態・強調枠） |
| `gold` (DEFAULT/dim/pale) | `#fbbf24` / `#d97706` / `#fde68a` | 注意喚起・Tips・報酬系の強調 |
| `crimson` (DEFAULT/dark) | `#f43f5e` / `#9f1239` | 警告・ボス・危険表示 |
| `slate` (DEFAULT/light) | `#94a3b8` / `#cbd5e1` | 中立・非アクティブ表示 |

フォント: `font-display`(Cinzel, 見出し用) / `font-body`(Noto Sans JP, 本文既定) / `font-mono`(JetBrains Mono, 数値・バッジ)。
`h1`〜`h4` は `global.css` の `@layer base` で自動的に `font-display` になる。

**新しい色が必要な場合は raw hex ではなく `tailwind.config.mjs` にトークンを追加すること。** ページ内 `<style>` で `#5eead4` のような raw hex を書かない（既存コードにいくつか残存、[既知の課題](#既知の課題backlog)参照）。

## 共通コンポーネントクラス ([global.css](src/styles/global.css) `@layer components`)

| クラス | 用途 |
|---|---|
| `.section-card` | カード状コンテナ（背景 `night-200` + 枠線 + 角丸 + glow shadow） |
| `.badge` / `.badge-teal` `.badge-gold` `.badge-red` `.badge-slate` | インラインラベル（種別・状態タグ）。色バリエーションが必要な場合はここに追加する（ページローカルに `.badge-*` を作らない） |
| `.btn` / `.btn-teal` `.btn-ghost` | ボタン。新しいボタン種別（outline 等）もここに追加する |
| `.divider` | セクション区切りの横線 |
| `.page-hero` | ページ冒頭のヒーローセクション（背景グロー付き） |
| `.data-table` | テーブル共通スタイル（th/td/hover） |

## ページ構造の型

すべてのコンテンツページ（[chests](src/pages/chests.astro), [fate](src/pages/fate.astro), [gear](src/pages/gear.astro), [leveling](src/pages/leveling.astro), [records](src/pages/records.astro), [story](src/pages/story.astro), [support-jobs](src/pages/support-jobs.astro), [tower](src/pages/tower.astro)）は以下の型に従う:

```astro
<BaseLayout title="..." description="...">
  <div class="page-hero">
    <div class="container mx-auto px-4 pt-16 pb-8 relative z-10">
      <h1 class="font-display text-4xl md:text-5xl text-moon-light">ページタイトル</h1>
    </div>
  </div>

  <div class="container mx-auto px-4 py-12 max-w-6xl">
    <!-- 2カラム構成の場合: <div class="flex gap-8 ..."> 本文 + 右サイドTOC -->
    <section id="sec-xxx" class="mb-12">
      <h2 class="font-display text-sm text-moon-dim uppercase tracking-widest mb-5 border-b border-night-300/60 pb-2">
        セクション見出し
      </h2>
      ...
    </section>
  </div>
</BaseLayout>
```

- **hero部分**（`.page-hero` + `h1.font-display.text-4xl.md:text-5xl.text-moon-light`）は全ページで完全に統一されている。維持すること。
- **h2セクション見出し**（`font-display text-sm text-moon-dim uppercase tracking-widest mb-5 border-b border-night-300/60 pb-2`）も定型。新セクションはこのクラス文字列をそのまま流用する。
- **本文コンテナの `max-w-*`** は `max-w-6xl` が既定。`gear`（`max-w-7xl`、フィルターサイドバーが横に付くため）と `fate`（`max-w-5xl`）だけ異なる — 意図的な逸脱かは要確認（[既知の課題](#既知の課題backlog)）。
- **右サイドTOC**: `TableOfContents.svelte`（`client:visible`、`items={tocItems}` で見出しリストを渡す）が leveling / records / story / support-jobs で使用。tower のみ独自の `TocObserver.svelte` を使用（階層ナビゲーションという別要件のため意図的）。

## 拡張時のルール

1. バッジやボタンの新しいバリエーションが必要 → まず `.badge-*` / `.btn-*` に追加できないか検討し、`global.css` に追加する。ページの `<style>` に類似クラスを再定義しない。
2. 色は必ずトークン経由（`text-teal`, `bg-crimson/10` 等）。raw hex / rgba を書かない。
3. 複数ページで同じマークアップ（例: 職業アイコン付きセル）が出てきたら、2箇所目が出た時点で `global.css` の共通クラスか共有 Astro コンポーネントに切り出す。
4. ページ本文の `max-w-*` を `6xl` 以外にする場合は理由をコメントで残す。

## 既知の課題（backlog）

設計監査で見つかった、意図的な差別化ではなさそうな逸脱。対応時はこのセクションから削除する。

- `fate.astro` / `gear.astro` の `max-w-5xl` / `max-w-7xl`、`gear.astro` / `tower.astro` の `py-10`（他は `py-12`）— 意図的か要確認。
- `chests.astro` の `.chest-group-title` 等がトークンではなく raw hex（`#5eead4` `#6b8aad` 等）を使用。
- `BaseLayout.astro` の `ogImage` 既定値が旧base名 `/crescent-isle-guide/og-default.png` のままで、`public/` に該当ファイルも存在しない（OGP画像が壊れている）。
