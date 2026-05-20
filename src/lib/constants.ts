import type { CategoryOption, ColorOption, SizeOption } from '@/types/settings';

export const DEFAULT_CATEGORIES: CategoryOption[] = [
  { id: '', name: 'REMERA', label: 'Remera' },
  { id: '', name: 'PANTALON', label: 'Pantalón' },
  { id: '', name: 'BUZO', label: 'Buzo' },
  { id: '', name: 'CAMPERA', label: 'Campera' },
  { id: '', name: 'CAMISA', label: 'Camisa' },
  { id: '', name: 'MUSCULOSA', label: 'Musculosa' },
  { id: '', name: 'SHORT', label: 'Short' },
  { id: '', name: 'BERMUDA', label: 'Bermuda' },
  { id: '', name: 'ACCESORIO', label: 'Accesorio' },
];

export const DEFAULT_COLORS: ColorOption[] = [
  { id: '', name: 'NEGRO', label: 'Negro', hex: '#000000' },
  { id: '', name: 'BLANCO', label: 'Blanco', hex: '#FFFFFF' },
  { id: '', name: 'GRIS', label: 'Gris', hex: '#808080' },
  { id: '', name: 'AZUL', label: 'Azul', hex: '#0066CC' },
  { id: '', name: 'ROJO', label: 'Rojo', hex: '#CC0000' },
  { id: '', name: 'VERDE', label: 'Verde', hex: '#009933' },
  { id: '', name: 'AMARILLO', label: 'Amarillo', hex: '#FFCC00' },
  { id: '', name: 'ROSA', label: 'Rosa', hex: '#FF66B2' },
  { id: '', name: 'VIOLETA', label: 'Violeta', hex: '#6600CC' },
  { id: '', name: 'NARANJA', label: 'Naranja', hex: '#FF6600' },
  { id: '', name: 'MARRON', label: 'Marrón', hex: '#663300' },
];

export const COLOR_LABELS: Record<string, string> = Object.fromEntries(
  DEFAULT_COLORS.map((c) => [c.name, c.label])
);

export const COLOR_HEX: Record<string, string> = Object.fromEntries(
  DEFAULT_COLORS.map((c) => [c.name, c.hex ?? '#999'])
);

export const DEFAULT_SIZES: SizeOption[] = [
  { id: '', name: 'XS', label: 'XS' },
  { id: '', name: 'S', label: 'S' },
  { id: '', name: 'M', label: 'M' },
  { id: '', name: 'L', label: 'L' },
  { id: '', name: 'XL', label: 'XL' },
  { id: '', name: 'XXL', label: 'XXL' },
  { id: '', name: 'XXXL', label: 'XXXL' },
];
