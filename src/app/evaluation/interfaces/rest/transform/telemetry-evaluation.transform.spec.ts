import { telemetryEvaluationResourceToDomain } from './telemetry-evaluation.transform';
import { TelemetryEvaluationResource } from '../resources/telemetry-evaluation.resource';

const baseResource = (): TelemetryEvaluationResource => ({
  id: '11111111-1111-1111-1111-111111111111',
  deviceId: '22222222-2222-2222-2222-222222222222',
  deviceTime: '2026-10-04T10:00:00Z',
  uptime: 120,
  airQuality: { co2: 400, temperature: 22, humidity: 45 },
  particulateMatter: { pm1_0: 1, pm2_5: 2, pm10: 3 },
  connectivity: { status: 'CONNECTED', network: 'WiFi', signalStrength: -50 },
  location: { country: 'PE' },
  healthStatus: 98,
  status: 'OK',
  recordedAt: '2026-10-04T10:00:00Z',
  createdAt: '2026-10-04T10:00:01Z',
});

describe('telemetryEvaluationResourceToDomain', () => {
  it('mapea hydrology y powerStatus cuando vienen del backend', () => {
    const domain = telemetryEvaluationResourceToDomain({
      ...baseResource(),
      hydrology: { rainfallMm: 1.5, waterLevelCm: 42 },
      powerStatus: { batteryPercent: 77, solarCharging: true },
    });

    expect(domain.hydrology).toEqual({ rainfallMm: 1.5, waterLevelCm: 42 });
    expect(domain.powerStatus).toEqual({ batteryPercent: 77, solarCharging: true });
  });

  it('tolera defaults indoor cuando hydrology/powerStatus están ausentes', () => {
    const domain = telemetryEvaluationResourceToDomain(baseResource());

    expect(domain.hydrology).toEqual({ rainfallMm: 0, waterLevelCm: 0 });
    expect(domain.powerStatus).toEqual({ batteryPercent: null, solarCharging: false });
  });

  it('tolera nulls parciales de outdoor con defaults seguros', () => {
    const domain = telemetryEvaluationResourceToDomain({
      ...baseResource(),
      hydrology: { rainfallMm: null, waterLevelCm: null },
      powerStatus: { batteryPercent: null, solarCharging: null },
    });

    expect(domain.hydrology).toEqual({ rainfallMm: 0, waterLevelCm: 0 });
    expect(domain.powerStatus).toEqual({ batteryPercent: null, solarCharging: false });
  });
});
