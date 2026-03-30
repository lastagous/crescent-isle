// ─── アイテムアイコン 設定ファイル ────────────────────────────────────────────
// アイテム名と icons/items/ 以下のアイコンファイルIDのマッピング
export const ITEM_ICONS: Record<string, number> = {
  '十二都市金貨':   65118,
  '十二都市銀貨':   65119,
  'ギル':           65002,
  '知見':           65117,
  'サポート経験値': 65120,
  '魔紋起動証：力の塔': 65121,
  '探査記録':       26603,
} as const;

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

/** アイテムアイコンの URL を返す */
export function itemIconUrl(id: number): string {
  return `${BASE}/icons/items/${String(id).padStart(6, '0')}.png`;
}

/** アイテム名からアイコン URL を返す（存在しない場合は undefined） */
export function itemIconUrlByName(name: string): string | undefined {
  const id = ITEM_ICONS[name];
  return id !== undefined ? itemIconUrl(id) : undefined;
}
