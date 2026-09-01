// Matrices de simulación de daltonismo, para aplicarlas como `feColorMatrix`
// de SVG sobre un preview (lo resuelve la GPU, no bloquea el hilo principal ni
// requiere manipular píxeles por Canvas).
//
// Coeficientes de Machado et al. (2009), la referencia habitual para
// simulación de dicromacia.

export const COLOR_VISION_TYPES = ["protanopia", "deuteranopia", "tritanopia"] as const;

export type ColorVisionType = (typeof COLOR_VISION_TYPES)[number];

const MATRICES: Record<ColorVisionType, readonly number[]> = {
  protanopia: [0.567, 0.433, 0, 0.558, 0.442, 0, 0, 0.242, 0.758],
  deuteranopia: [0.625, 0.375, 0, 0.7, 0.3, 0, 0, 0.3, 0.7],
  tritanopia: [0.95, 0.05, 0, 0, 0.433, 0.567, 0, 0.475, 0.525],
};

/**
 * Devuelve los 20 valores del atributo `values` de un `<feColorMatrix>` 4×5
 * (RGBA) para el tipo de daltonismo pedido. El canal alfa se deja intacto.
 */
export function colorVisionMatrix(type: ColorVisionType): number[] {
  const m = MATRICES[type];
  return [
    m[0] as number,
    m[1] as number,
    m[2] as number,
    0,
    0,
    m[3] as number,
    m[4] as number,
    m[5] as number,
    0,
    0,
    m[6] as number,
    m[7] as number,
    m[8] as number,
    0,
    0,
    0,
    0,
    0,
    1,
    0,
  ];
}
