import { InjectionToken } from "@angular/core";
import { Observable } from "rxjs";

export interface LatestTelemetrySummary {
  readonly connectivityStatus: string | null;
  readonly signalStrength: number | null;
  readonly uptime: number;
  readonly healthStatus: number;
  readonly recordedAt: string;
  readonly network: string | null;
  readonly locationCountry: string | null;
  readonly co2: number | null;
  readonly temperature: number | null;
  readonly humidity: number | null;
  readonly pm2_5: number | null;
  readonly rainfallMm: number;
  readonly waterLevelCm: number;
  readonly batteryPercent: number | null;
  readonly solarCharging: boolean;
}

export interface EvaluationContextFacade {
  getLatestTelemetryByDevice(deviceId: string): Observable<LatestTelemetrySummary | null>;
}

export const EVALUATION_CONTEXT_FACADE = new InjectionToken<EvaluationContextFacade>(
  "EVALUATION_CONTEXT_FACADE"
);
