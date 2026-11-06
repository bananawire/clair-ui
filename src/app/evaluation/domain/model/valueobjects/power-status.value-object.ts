export type PowerStatus = Readonly<{
  batteryPercent: number | null;
  solarCharging: boolean;
}>;

export const createPowerStatus = (
  batteryPercent: number | null,
  solarCharging: boolean
): PowerStatus => {
  if (
    batteryPercent != null &&
    (!Number.isFinite(batteryPercent) || batteryPercent < 0 || batteryPercent > 100)
  ) {
    throw new Error('batteryPercent must be null or within [0, 100]');
  }
  return Object.freeze({ batteryPercent, solarCharging: Boolean(solarCharging) });
};

export const absentPowerStatus = (): PowerStatus =>
  Object.freeze({ batteryPercent: null, solarCharging: false });
