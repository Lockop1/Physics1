/** Single source of physical constants. Templates must import from here. */
export const g = 9.8; // m/s²
export const G = 6.674e-11; // N·m²/kg²
export const M_E = 5.97e24; // kg
export const R_E = 6.37e6; // m

export const CONSTANTS = { g, G, M_E, R_E } as const;
