import { z } from 'zod';

export const createProductSchema = z.object({
  name: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede exceder 50 caracteres')
    .transform((v) => v.toUpperCase().trim()),
  description: z.string().max(500).optional(),
  categoryId: z.string().uuid('Seleccioná una categoría válida'),
  pointOfSaleId: z.string().uuid('Seleccioná un punto de venta válido'),
  depositoId: z.string().uuid('Depósito inválido').nullable().optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;

export const createCategorySchema = z.object({
  name: z.string().min(1, 'Requerido').max(30).transform((v) => v.toUpperCase().trim()),
  label: z.string().min(1, 'Requerido').max(30).transform((v) => v.trim()),
});

export const createColorSchema = z.object({
  name: z.string().min(1, 'Requerido').max(20).transform((v) => v.toUpperCase().trim()),
  label: z.string().min(1, 'Requerido').max(20).transform((v) => v.trim()),
  hex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Formato: #RRGGBB')
    .or(z.literal(''))
    .optional(),
});

export const createSizeSchema = z.object({
  name: z.string().min(1, 'Requerido').max(10).transform((v) => v.toUpperCase().trim()),
  label: z.string().min(1, 'Requerido').max(10).transform((v) => v.trim()),
});
