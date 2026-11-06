import { createThresholdValue } from './threshold-value.value-object';

describe('createThresholdValue', () => {
  it.each([1, 100, 0.5, 99999])('acepta el valor %s y lo congela', (value) => {
    const threshold = createThresholdValue(value);

    expect(threshold.value).toBe(value);
    expect(Object.isFrozen(threshold)).toBe(true);
  });

  it.each([null, undefined, NaN])('rechaza el valor no numérico %j', (value) => {
    expect(() => createThresholdValue(value as unknown as number)).toThrow(
      'Threshold value must be a number',
    );
  });

  it.each([0, -1, -100])('rechaza el valor no positivo %s', (value) => {
    expect(() => createThresholdValue(value)).toThrow('Threshold value must be greater than 0');
  });
});