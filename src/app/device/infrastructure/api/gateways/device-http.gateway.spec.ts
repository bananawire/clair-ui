import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { DeviceHttpGateway } from './device-http.gateway';
import { API_CONFIG } from '../../../../api.config';

describe('DeviceHttpGateway', () => {
  let gateway: DeviceHttpGateway;
  let http: HttpTestingController;

  const orgUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.organizations;
  const spaceUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.spaces;
  const deviceUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.devices;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    gateway = TestBed.inject(DeviceHttpGateway);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  describe('organizations', () => {
    it('createOrganization hace POST a la URL base', () => {
      const body = { name: 'Org' };
      gateway.createOrganization(body).subscribe();
      const r = http.expectOne(orgUrl);
      expect(r.request.method).toBe('POST');
      expect(r.request.body).toEqual(body);
      r.flush({});
    });

    it('getOrganizations hace GET a la URL base', () => {
      gateway.getOrganizations().subscribe();
      const r = http.expectOne(orgUrl);
      expect(r.request.method).toBe('GET');
      r.flush([]);
    });

    it('getOrganizationById hace GET con el id en la URL', () => {
      gateway.getOrganizationById('org-1').subscribe();
      const r = http.expectOne(`${orgUrl}/org-1`);
      expect(r.request.method).toBe('GET');
      r.flush({});
    });

    it('deleteOrganization hace DELETE con el id', () => {
      gateway.deleteOrganization('org-1').subscribe();
      const r = http.expectOne(`${orgUrl}/org-1`);
      expect(r.request.method).toBe('DELETE');
      r.flush(null);
    });

    it('updateOrganizationName hace PATCH a /name', () => {
      const body = { name: 'Nuevo' };
      gateway.updateOrganizationName('org-1', body).subscribe();
      const r = http.expectOne(`${orgUrl}/org-1/name`);
      expect(r.request.method).toBe('PATCH');
      expect(r.request.body).toEqual(body);
      r.flush(null);
    });
  });

  describe('spaces', () => {
    it('createSpace hace POST con organizationId en query string', () => {
      const body = { name: 'Sala' };
      gateway.createSpace('org-1', body).subscribe();
      const r = http.expectOne(`${spaceUrl}?organizationId=org-1`);
      expect(r.request.method).toBe('POST');
      expect(r.request.body).toEqual(body);
      r.flush({});
    });

    it('getSpacesByOrganization hace GET con query string', () => {
      gateway.getSpacesByOrganization('org-1').subscribe();
      const r = http.expectOne(`${spaceUrl}?organizationId=org-1`);
      expect(r.request.method).toBe('GET');
      r.flush([]);
    });

    it('getSpaceById hace GET con el id', () => {
      gateway.getSpaceById('space-1').subscribe();
      const r = http.expectOne(`${spaceUrl}/space-1`);
      expect(r.request.method).toBe('GET');
      r.flush({});
    });

    it('deleteSpace hace DELETE', () => {
      gateway.deleteSpace('space-1').subscribe();
      const r = http.expectOne(`${spaceUrl}/space-1`);
      expect(r.request.method).toBe('DELETE');
      r.flush(null);
    });

    it('updateSpaceName hace PATCH a /name', () => {
      const body = { name: 'Sala 2' };
      gateway.updateSpaceName('space-1', body).subscribe();
      const r = http.expectOne(`${spaceUrl}/space-1/name`);
      expect(r.request.method).toBe('PATCH');
      r.flush(null);
    });
  });

  describe('devices', () => {
    it('claimDevice hace POST a /claim', () => {
      const body = { claimToken: 'abc', spaceId: 'space-1' };
      gateway.claimDevice(body).subscribe();
      const r = http.expectOne(`${deviceUrl}/claim`);
      expect(r.request.method).toBe('POST');
      r.flush({});
    });

    it('pairDevice hace POST a /pair', () => {
      const body = { hardwareId: 'CLAIR-0KBG' };
      gateway.pairDevice(body).subscribe();
      const r = http.expectOne(`${deviceUrl}/pair`);
      expect(r.request.method).toBe('POST');
      r.flush({});
    });

    it('getDevicesBySpace hace GET con spaceId, page y size como query params', () => {
      gateway.getDevicesBySpace('space-1', 2, 20).subscribe();
      const r = http.expectOne((req) => req.url === deviceUrl);
      expect(r.request.method).toBe('GET');
      expect(r.request.params.get('spaceId')).toBe('space-1');
      expect(r.request.params.get('page')).toBe('2');
      expect(r.request.params.get('size')).toBe('20');
      r.flush({});
    });

    it('getDeviceById hace GET con el id', () => {
      gateway.getDeviceById('device-1').subscribe();
      const r = http.expectOne(`${deviceUrl}/device-1`);
      expect(r.request.method).toBe('GET');
      r.flush({});
    });

    it('deleteDevice hace DELETE', () => {
      gateway.deleteDevice('device-1').subscribe();
      const r = http.expectOne(`${deviceUrl}/device-1`);
      expect(r.request.method).toBe('DELETE');
      r.flush(null);
    });

    it('updateDeviceName hace PATCH a /name', () => {
      const body = { name: 'Sensor Norte' };
      gateway.updateDeviceName('device-1', body).subscribe();
      const r = http.expectOne(`${deviceUrl}/device-1/name`);
      expect(r.request.method).toBe('PATCH');
      r.flush(null);
    });

    it('createDeviceCommand hace POST a /commands', () => {
      const body = { type: 'RESTART' as const, payload: undefined };
      gateway.createDeviceCommand('device-1', body).subscribe();
      const r = http.expectOne(`${deviceUrl}/device-1/commands`);
      expect(r.request.method).toBe('POST');
      r.flush({});
    });

    it('getDeviceStatus hace GET a /status', () => {
      gateway.getDeviceStatus('device-1').subscribe();
      const r = http.expectOne(`${deviceUrl}/device-1/status`);
      expect(r.request.method).toBe('GET');
      r.flush({});
    });
  });
});