import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom, of, throwError } from 'rxjs';
import {
  NinoAlertService,
  NinoAlertRequest,
  NinoAlertResponse,
  DEFAULT_NINO_ALERT_REQUEST,
  FALLBACK_NINO_ALERT_RESPONSE,
} from './nino-alert.service';
import { API_CONFIG } from '../../../../api.config';

describe('NinoAlertService', () => {
  let service: NinoAlertService;
  let httpClientMock: { post: ReturnType<typeof vi.fn> };

  beforeEach(() => {
    httpClientMock = {
      post: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        NinoAlertService,
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });

    service = TestBed.inject(NinoAlertService);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call POST /v1/alerta-nino with default demo scenario payload when no request is provided', async () => {
    const mockResponse: NinoAlertResponse = {
      message: 'Alerta generada por modelo IA',
      source: 'deepseek',
    };
    httpClientMock.post.mockReturnValue(of(mockResponse));

    const result = await firstValueFrom(service.generateAlert());

    expect(httpClientMock.post).toHaveBeenCalledWith(
      `${API_CONFIG.baseUrl}/v1/alerta-nino`,
      DEFAULT_NINO_ALERT_REQUEST
    );
    expect(result).toEqual(mockResponse);
  });

  it('should call POST /v1/alerta-nino with custom readings combined with defaults', async () => {
    const customRequest: NinoAlertRequest = {
      humidity: 92,
      temperature: 32,
    };
    const mockResponse: NinoAlertResponse = {
      message: 'Alerta personalizada',
      source: 'deepseek',
    };
    httpClientMock.post.mockReturnValue(of(mockResponse));

    const result = await firstValueFrom(service.generateAlert(customRequest));

    expect(httpClientMock.post).toHaveBeenCalledWith(
      `${API_CONFIG.baseUrl}/v1/alerta-nino`,
      {
        humidity: 92,
        temperature: 32,
        riskLevel: 'ALTO',
        riskScore: 82,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('should include optional rainfallMm and waterLevelCm when provided in request', async () => {
    const customRequest: NinoAlertRequest = {
      humidity: 90,
      temperature: 31,
      rainfallMm: 45.5,
      waterLevelCm: 120,
    };
    const mockResponse: NinoAlertResponse = {
      message: 'Alerta con lluvias y nivel de agua',
      source: 'deepseek',
    };
    httpClientMock.post.mockReturnValue(of(mockResponse));

    const result = await firstValueFrom(service.generateAlert(customRequest));

    expect(httpClientMock.post).toHaveBeenCalledWith(
      `${API_CONFIG.baseUrl}/v1/alerta-nino`,
      {
        humidity: 90,
        temperature: 31,
        riskLevel: 'ALTO',
        riskScore: 82,
        rainfallMm: 45.5,
        waterLevelCm: 120,
      }
    );
    expect(result).toEqual(mockResponse);
  });

  it('should return realistic fallback response when HTTP request errors out (Plan B)', async () => {
    httpClientMock.post.mockReturnValue(throwError(() => new Error('Network error or backend 500')));

    const result = await firstValueFrom(service.generateAlert());

    expect(result).toEqual(FALLBACK_NINO_ALERT_RESPONSE);
    expect(result.source).toBe('fallback');
    expect(result.message).toContain('dengue');
  });
});
