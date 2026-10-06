import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeviceThresholdHttpGateway } from './device-threshold-http.gateway';
import { API_CONFIG } from '../../../../api.config';

describe('DeviceThresholdHttpGateway', () => {
  let gateway: DeviceThresholdHttpGateway;
  let http: HttpTestingController;

  const deviceUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.devices;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    gateway = TestBed.inject(DeviceThresholdHttpGateway);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('getThresholds hace GET a /thresholds', () => {
    gateway.getThresholds('device-1').subscribe();
    const r = http.expectOne(`${deviceUrl}/device-1/thresholds`);
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });

  it('createThreshold hace POST a /thresholds', () => {
    const body = { metric: 'CO2' as const, value: 1000, enabled: true };
    gateway.createThreshold('device-1', body).subscribe();
    const r = http.expectOne(`${deviceUrl}/device-1/thresholds`);
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toEqual(body);
    r.flush({});
  });

  it('updateThreshold hace PUT a /thresholds', () => {
    const body = { metric: 'PM25' as const, value: 35, enabled: false };
    gateway.updateThreshold('device-1', body).subscribe();
    const r = http.expectOne(`${deviceUrl}/device-1/thresholds`);
    expect(r.request.method).toBe('PUT');
    r.flush({});
  });

  it('deleteThreshold hace DELETE a /thresholds/{metric}', () => {
    gateway.deleteThreshold('device-1', 'CO2').subscribe();
    const r = http.expectOne(`${deviceUrl}/device-1/thresholds/CO2`);
    expect(r.request.method).toBe('DELETE');
    r.flush(null);
  });
});