import { ParamMap, Router, ActivatedRoute } from '@angular/router';
import { SpaceDevicesNavigationStateService } from './space-devices-navigation-state.service';

const paramMap = (values: Record<string, string | null>): ParamMap =>
  ({
    get: (key: string) => values[key] ?? null,
    has: (key: string) => key in values,
    getAll: (key: string) => (values[key] ? [values[key]!] : []),
    keys: Object.keys(values),
  }) as ParamMap;

describe('SpaceDevicesNavigationStateService', () => {
  let service: SpaceDevicesNavigationStateService;
  const router = { navigate: vi.fn() };
  const route = {} as ActivatedRoute;

  beforeEach(() => {
    service = new SpaceDevicesNavigationStateService();
    localStorage.clear();
    vi.resetAllMocks();
  });

  afterEach(() => localStorage.clear());

  describe('readSelectionFromQueryParams', () => {
    it('sin deviceId ni spaceId devuelve null', () => {
      expect(service.readSelectionFromQueryParams(paramMap({}))).toBeNull();
    });

    it('sin deviceId ni spaceId devuelve null', () => {
      expect(service.readSelectionFromQueryParams(paramMap({}))).toBeNull();
    });

    it('con deviceId vacío devuelve null', () => {
      expect(service.readSelectionFromQueryParams(paramMap({ deviceId: '' }))).toBeNull();
    });

    // DEFECTO CONOCIDO: deviceId = "   " no dispara el early return porque "   " es
    // truthy en JS. El método devuelve { spaceId: null, deviceId: null } en lugar de null.
    it('con deviceId "   " devuelve un objeto con ambos campos null (defecto)', () => {
      const result = service.readSelectionFromQueryParams(paramMap({ deviceId: '   ' }));
      expect(result).toEqual({ spaceId: null, deviceId: null });
    });

    it('con ambos devuelve el objeto congelado', () => {
      const result = service.readSelectionFromQueryParams(
        paramMap({ deviceId: 'd-1', spaceId: 's-1' }),
      );
      expect(result).toEqual({ deviceId: 'd-1', spaceId: 's-1' });
      expect(Object.isFrozen(result!)).toBe(true);
    });

    it('recorta espacios vacíos', () => {
      const result = service.readSelectionFromQueryParams(
        paramMap({ deviceId: 'd-1', spaceId: '   ' }),
      );
      expect(result).toEqual({ deviceId: 'd-1', spaceId: null });
    });
  });

  describe('readSelectionFromLocalStorage', () => {
    it('sin nada guardado devuelve null', () => {
      expect(service.readSelectionFromLocalStorage()).toBeNull();
    });

    it('JSON inválido devuelve null', () => {
      localStorage.setItem('clair.spaceDevices.lastSelection', 'not json {');
      expect(service.readSelectionFromLocalStorage()).toBeNull();
    });

    it('objeto sin ids devuelve null', () => {
      localStorage.setItem(
        'clair.spaceDevices.lastSelection',
        JSON.stringify({ spaceId: null, deviceId: null }),
      );
      expect(service.readSelectionFromLocalStorage()).toBeNull();
    });

    it('con ids válidos devuelve el objeto congelado', () => {
      localStorage.setItem(
        'clair.spaceDevices.lastSelection',
        JSON.stringify({ spaceId: 's-1', deviceId: 'd-1' }),
      );
      const result = service.readSelectionFromLocalStorage();
      expect(result).toEqual({ spaceId: 's-1', deviceId: 'd-1' });
      expect(Object.isFrozen(result!)).toBe(true);
    });
  });

  describe('persist / clear', () => {
    it('persist guarda el JSON', () => {
      service.persistSelectionToLocalStorage({ spaceId: 's-1', deviceId: null });
      expect(localStorage.getItem('clair.spaceDevices.lastSelection')).toBe(
        JSON.stringify({ spaceId: 's-1', deviceId: null }),
      );
    });

    it('clear elimina la clave', () => {
      service.persistSelectionToLocalStorage({ spaceId: 's-1', deviceId: 'd-1' });
      service.clearLocalStorageSelection();
      expect(localStorage.getItem('clair.spaceDevices.lastSelection')).toBeNull();
    });
  });

  describe('syncQueryParams', () => {
    it('llama a router.navigate con merge y sin replaceUrl', () => {
      service.syncQueryParams(router as unknown as Router, route, {
        spaceId: 's-1',
        deviceId: 'd-1',
      });

      expect(router.navigate).toHaveBeenCalledWith([], {
        relativeTo: route,
        queryParams: { spaceId: 's-1', deviceId: 'd-1' },
        queryParamsHandling: 'merge',
        replaceUrl: false,
      });
    });

    it('replaceUrl=true se propaga', () => {
      service.syncQueryParams(
        router as unknown as Router,
        route,
        { spaceId: 's-1', deviceId: null },
        true,
      );
      expect(router.navigate).toHaveBeenCalledWith(
        [],
        expect.objectContaining({ replaceUrl: true }),
      );
    });
  });
});