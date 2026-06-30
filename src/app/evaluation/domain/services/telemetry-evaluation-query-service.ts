import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { EvaluationId } from '../model/valueobjects/evaluation-id.value-object';
import { EvaluationDeviceId } from '../model/valueobjects/evaluation-device-id.value-object';
import { SystemUptime } from '../model/valueobjects/system-uptime.value-object';
import { GetEvaluationsByDeviceQuery } from '../model/queries/get-evaluations-by-device.query';
import { GetLatestEvaluationByDeviceQuery } from '../model/queries/get-latest-evaluation-by-device.query';

export type TelemetryEvaluation = Readonly<{
  id: EvaluationId;
  deviceId: EvaluationDeviceId;
  deviceTime: string;
  uptime: SystemUptime;
  airQuality: Readonly<{ co2: number | null; temperature: number | null; humidity: number | null }>;
  particulateMatter: Readonly<{ pm1_0: number | null; pm2_5: number | null; pm10: number | null }>;
  connectivity: Readonly<{ status: string | null; network: string | null; signalStrength: number | null }>;
  location: Readonly<{ country: string | null }>;
  healthStatus: number;
  status: string;
  recordedAt: string;
  createdAt: string;
}>;

export type TelemetryEvaluationPage = Readonly<{
  content: readonly TelemetryEvaluation[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}>;

export interface TelemetryEvaluationQueryService {
  handleGetEvaluationsByDevice(query: GetEvaluationsByDeviceQuery): Observable<TelemetryEvaluationPage>;
  handleGetLatestEvaluationByDevice(query: GetLatestEvaluationByDeviceQuery): Observable<TelemetryEvaluation | null>;
}


export const TELEMETRY_EVALUATION_QUERY_SERVICE = new InjectionToken<TelemetryEvaluationQueryService>('TelemetryEvaluationQueryService');
