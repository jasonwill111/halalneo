export const TILE_COLORS = [
	'bg-info/10 text-info',
	'bg-warn/10 text-warn',
	'bg-success/10 text-success',
	'bg-accent-purple/10 text-accent-purple',
	'bg-accent-rose/10 text-accent-rose',
	'bg-primary/10 text-primary'
] as const;

export type TileColor = (typeof TILE_COLORS)[number];

export function tileColor(index: number): TileColor {
	return TILE_COLORS[index % TILE_COLORS.length];
}
