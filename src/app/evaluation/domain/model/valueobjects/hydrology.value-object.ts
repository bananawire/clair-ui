export type Hydrology = Readonly<{
  rainfallMm: number;
  waterLevelCm: number;
}>;

export const createHydrology = (rainfallMm: number, waterLevelCm: number): Hydrology => {
  if (!Number.isFinite(rainfallMm) || rainfallMm < 0) {
    throw new Error('rainfallMm must be a finite number >= 0');
  }
  if (!Number.isFinite(waterLevelCm) || waterLevelCm < 0) {
    throw new Error('waterLevelCm must be a finite number >= 0');
  }
  return Object.freeze({ rainfallMm, waterLevelCm });
};

export const absentHydrology = (): Hydrology => Object.freeze({ rainfallMm: 0, waterLevelCm: 0 });
