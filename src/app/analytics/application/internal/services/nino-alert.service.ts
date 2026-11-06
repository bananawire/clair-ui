import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { API_CONFIG } from '../../../../api.config';

export interface NinoAlertRequest {
  humidity?: number;
  temperature?: number;
  riskLevel?: string;
  riskScore?: number;
  rainfallMm?: number;
  waterLevelCm?: number;
}

export interface NinoAlertResponse {
  message: string;
  source: 'deepseek' | 'fallback' | string;
}

export const DEFAULT_NINO_ALERT_REQUEST: NinoAlertRequest = {
  humidity: 85,
  temperature: 30,
  riskLevel: 'ALTO',
  riskScore: 82,
};

export const FALLBACK_NINO_ALERT_RESPONSE: NinoAlertResponse = {
  message:
    'Hay mucha humedad (85%) y calor (30°C) en tu vivienda, aumentando el riesgo de dengue. Tapa recipientes de agua y usa repelente. Siga las alertas oficiales de MINSA y SENAMHI.',
  source: 'fallback',
};

@Injectable({
  providedIn: 'root',
})
export class NinoAlertService {
  private readonly http = inject(HttpClient);
  private readonly endpointUrl = `${API_CONFIG.baseUrl}/v1/alerta-nino`;

  /**
   * Requests an El Niño warning/recommendation alert from the backend.
   * If the network or backend request fails, falls back gracefully to a realistic MINSA/SENAMHI alert.
   *
   * @param request Optional readings; falls back to the default fixed demo scenario payload if omitted.
   */
  generateAlert(request?: NinoAlertRequest): Observable<NinoAlertResponse> {
    const payload: NinoAlertRequest = {
      humidity: request?.humidity ?? DEFAULT_NINO_ALERT_REQUEST.humidity,
      temperature: request?.temperature ?? DEFAULT_NINO_ALERT_REQUEST.temperature,
      riskLevel: request?.riskLevel ?? DEFAULT_NINO_ALERT_REQUEST.riskLevel,
      riskScore: request?.riskScore ?? DEFAULT_NINO_ALERT_REQUEST.riskScore,
      ...(request?.rainfallMm !== undefined ? { rainfallMm: request.rainfallMm } : {}),
      ...(request?.waterLevelCm !== undefined ? { waterLevelCm: request.waterLevelCm } : {}),
    };

    return this.http.post<NinoAlertResponse>(this.endpointUrl, payload).pipe(
      catchError((error) => {
        console.warn('NinoAlertService: call to /v1/alerta-nino failed, falling back to local alert', error);
        return of(FALLBACK_NINO_ALERT_RESPONSE);
      })
    );
  }
}
