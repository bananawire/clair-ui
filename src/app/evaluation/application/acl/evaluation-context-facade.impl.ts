import { TELEMETRY_EVALUATION_QUERY_SERVICE, TelemetryEvaluationQueryService } from '../../domain/services/telemetry-evaluation-query-service';
import { Inject } from '@angular/core';
import { Injectable } from "@angular/core";
import { Observable, catchError, map, of } from "rxjs";
import { EvaluationContextFacade, LatestTelemetrySummary } from "../../interfaces/acl/evaluation-context-facade";
import { TelemetryEvaluationQueryServiceImpl } from "../internal/queryservices/telemetry-evaluation-query-service.impl";
import { createGetLatestEvaluationByDeviceQuery } from "../../domain/model/queries/get-latest-evaluation-by-device.query";
import { createEvaluationDeviceId } from "../../domain/model/valueobjects/evaluation-device-id.value-object";

@Injectable({ providedIn: "root" })
export class EvaluationContextFacadeImpl implements EvaluationContextFacade {
  constructor(@Inject(TELEMETRY_EVALUATION_QUERY_SERVICE) private readonly queryService: TelemetryEvaluationQueryService) {}

  getLatestTelemetryByDevice(deviceId: string): Observable<LatestTelemetrySummary | null> {
    const query = createGetLatestEvaluationByDeviceQuery(createEvaluationDeviceId(deviceId));
    return this.queryService.handleGetLatestEvaluationByDevice(query).pipe(
      map((evaluation) => {
        if (!evaluation) return null;
        return {
          connectivityStatus: evaluation.connectivity.status,
          signalStrength: evaluation.connectivity.signalStrength,
          uptime: evaluation.uptime.value,
          healthStatus: evaluation.healthStatus,
          recordedAt: evaluation.recordedAt,
          network: evaluation.connectivity.network,
          locationCountry: evaluation.location.country,
          co2: evaluation.airQuality.co2,
          temperature: evaluation.airQuality.temperature,
          humidity: evaluation.airQuality.humidity,
          pm2_5: evaluation.particulateMatter.pm2_5,
          rainfallMm: evaluation.hydrology.rainfallMm,
          waterLevelCm: evaluation.hydrology.waterLevelCm,
          batteryPercent: evaluation.powerStatus.batteryPercent,
          solarCharging: evaluation.powerStatus.solarCharging,
        };
      }),
      catchError(() => of(null))
    );
  }
}
