import { createEvaluationId } from '../../../domain/model/valueobjects/evaluation-id.value-object';
import { createEvaluationDeviceId } from '../../../domain/model/valueobjects/evaluation-device-id.value-object';
import { TelemetryEvaluation, TelemetryEvaluationPage } from '../../../domain/services/telemetry-evaluation-query-service';
import { TelemetryEvaluationPageResource, TelemetryEvaluationResource } from '../resources/telemetry-evaluation.resource';
import { createSystemUptime } from '../../../domain/model/valueobjects/system-uptime.value-object';
import { absentHydrology } from '../../../domain/model/valueobjects/hydrology.value-object';
import { absentPowerStatus } from '../../../domain/model/valueobjects/power-status.value-object';

export const telemetryEvaluationResourceToDomain = (resource: TelemetryEvaluationResource): TelemetryEvaluation => {
  const hydrology = resource.hydrology
    ? Object.freeze({
        rainfallMm: resource.hydrology.rainfallMm ?? 0,
        waterLevelCm: resource.hydrology.waterLevelCm ?? 0,
      })
    : absentHydrology();

  const powerStatus = resource.powerStatus
    ? Object.freeze({
        batteryPercent: resource.powerStatus.batteryPercent ?? null,
        solarCharging: Boolean(resource.powerStatus.solarCharging),
      })
    : absentPowerStatus();

  return Object.freeze({
    id: createEvaluationId(resource.id),
    deviceId: createEvaluationDeviceId(resource.deviceId),
    deviceTime: resource.deviceTime,
    uptime: createSystemUptime(resource.uptime),
    airQuality: Object.freeze({
      co2: resource.airQuality.co2,
      temperature: resource.airQuality.temperature,
      humidity: resource.airQuality.humidity,
    }),
    particulateMatter: Object.freeze({
      pm1_0: resource.particulateMatter.pm1_0,
      pm2_5: resource.particulateMatter.pm2_5,
      pm10: resource.particulateMatter.pm10,
    }),
    hydrology,
    powerStatus,
    connectivity: Object.freeze({
      status: resource.connectivity.status,
      network: resource.connectivity.network,
      signalStrength: resource.connectivity.signalStrength,
    }),
    location: Object.freeze({
      country: resource.location.country,
    }),
    healthStatus: resource.healthStatus,
    status: resource.status,
    recordedAt: resource.recordedAt,
    createdAt: resource.createdAt,
  });
};

export const telemetryEvaluationPageResourceToDomain = (
  resource: TelemetryEvaluationPageResource
): TelemetryEvaluationPage => {
  return Object.freeze({
    content: Object.freeze(resource.content.map(telemetryEvaluationResourceToDomain)),
    totalElements: resource.totalElements,
    totalPages: resource.totalPages,
    size: resource.size,
    number: resource.number,
  });
};
