import { z } from 'zod';

/**
 * Profil-Typen als Enum
 */
export const ProfileSchema = z.enum(['standard', 'baby', 'sport', 'blood_pressure']);

export type ProfileType = z.infer<typeof ProfileSchema>;

/**
 * Barcode Request Validation
 */
export const BarcodeRequestSchema = z.object({
  barcode: z.string()
    .min(8, 'Barcode muss mindestens 8 Zeichen lang sein')
    .max(18, 'Barcode darf maximal 18 Zeichen lang sein')
    .regex(/^\d+$/, 'Barcode darf nur Zahlen enthalten')
    .transform(s => s.trim()),
  profile: ProfileSchema.default('standard'),
});

export type BarcodeRequest = z.infer<typeof BarcodeRequestSchema>;

/**
 * Water Analysis Values Schema
 */
export const WaterAnalysisValuesSchema = z.object({
  ph: z.number().min(0).max(14).optional(),
  calcium: z.number().min(0).max(1500).optional(),
  magnesium: z.number().min(0).max(500).optional(),
  sodium: z.number().min(0).max(1000).optional(),
  potassium: z.number().min(0).max(500).optional(),
  chloride: z.number().min(0).max(1000).optional(),
  sulfate: z.number().min(0).max(3000).optional(),
  bicarbonate: z.number().min(0).max(3000).optional(),
  nitrate: z.number().min(0).max(200).optional(),
  totalDissolvedSolids: z.number().min(0).max(5000).optional(),
});

export type WaterAnalysisValues = z.infer<typeof WaterAnalysisValuesSchema>;

/**
 * OCR Request Validation
 */
export const OcrRequestSchema = z.object({
  text: z.string().trim().max(5000, 'Text darf maximal 5000 Zeichen lang sein').optional(),
  profile: ProfileSchema.default('standard'),
  values: WaterAnalysisValuesSchema.partial().optional(),
  confidence: z.number()
    .min(0, 'Confidence muss zwischen 0 und 100 liegen')
    .max(100, 'Confidence muss zwischen 0 und 100 liegen')
    .optional(),
  brand: z.string().trim().max(200).optional(),
  productName: z.string().trim().max(200).optional(),
  barcode: z.string().trim().max(32).optional(),
}).superRefine((data, ctx) => {
  const textLength = data.text?.length ?? 0;
  const hasText = textLength > 0;
  const hasValues = data.values && Object.keys(data.values).length > 0;

  if (hasText && textLength < 10) {
    ctx.addIssue({
      origin: "string",
      code: z.ZodIssueCode.too_small,
      minimum: 10,
      inclusive: true,
      type: 'string',
      message: 'Text muss mindestens 10 Zeichen lang sein',
      path: ['text'],
    });
  }

  if (!hasValues && textLength === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Es müssen entweder ein Etikett-Text oder Werte übergeben werden.',
      path: ['text'],
    });
  }
});

export type OcrRequest = z.infer<typeof OcrRequestSchema>;

/**
 * Scan History Filter Schema
 */
export const ScanHistoryFilterSchema = z.object({
  profile: ProfileSchema.optional(),
  minScore: z.number().min(0).max(100).optional(),
  maxScore: z.number().min(0).max(100).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  brand: z.string().optional(),
  limit: z.number().min(1).max(100).default(50),
  offset: z.number().min(0).default(0),
});

export type ScanHistoryFilter = z.infer<typeof ScanHistoryFilterSchema>;

/**
 * Compare Water Request Schema
 */
export const CompareWaterRequestSchema = z.object({
  waterSourceIds: z.array(z.string().cuid())
    .min(2, 'Mindestens 2 Wasser zum Vergleich erforderlich')
    .max(4, 'Maximal 4 Wasser können verglichen werden'),
  profile: ProfileSchema.default('standard'),
});

export type CompareWaterRequest = z.infer<typeof CompareWaterRequestSchema>;

/**
 * Helper: Safe parse with error formatting
 */
export function validateRequest<T>(
  schema: z.ZodSchema<T>,
  data: unknown
): { success: true; data: T } | { success: false; error: string } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const firstError = result.error.issues[0];
  const errorMessage = firstError
    ? `${firstError.path.join('.')}: ${firstError.message}`
    : 'Validierungsfehler';

  return { success: false, error: errorMessage };
}
