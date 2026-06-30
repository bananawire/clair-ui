export interface TelemetryEvaluationResource {
  readonly id: string;
  readonly deviceId: string;
  readonly deviceTime: string;
  readonly uptime: number;
  readonly airQuality: AirQualityResource;
  readonly particulateMatter: ParticulateMatterResource;
  readonly connectivity: ConnectivityResource;
  readonly location: LocationResource;
  readonly healthStatus: number;
  readonly status: string;
  readonly recordedAt: string;
  readonly createdAt: string;
}

export interface AirQualityResource {
  readonly co2: number | null;
  readonly temperature: number | null;
  readonly humidity: number | null;
}

export interface ParticulateMatterResource {
  readonly pm1_0: number | null;
  readonly pm2_5: number | null;
  readonly pm10: number | null;
}

export interface ConnectivityResource {
  readonly status: string | null;
  readonly network: string | null;
  readonly signalStrength: number | null;
}

export interface LocationResource {
  readonly country: string | null;
}

export interface TelemetryEvaluationPageResource {
  readonly content: TelemetryEvaluationResource[];
  readonly totalElements: number;
  readonly totalPages: number;
  readonly size: number;
  readonly number: number;
}
