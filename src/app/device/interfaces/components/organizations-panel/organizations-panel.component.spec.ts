import { ChangeDetectorRef, DestroyRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { OrganizationsPanelComponent } from './organizations-panel.component';
import { DEVICE_COMMAND_SERVICE } from '../../../domain/services/device-command-service';
import { DEVICE_QUERY_SERVICE } from '../../../domain/services/device-query-service';
import { Organization, Space } from '../../../domain/services/device-query-service';
import { createOrganizationId } from '../../../domain/model/valueobjects/organization-id.value-object';
import { createSpaceId } from '../../../domain/model/valueobjects/space-id.value-object';
import { createUserId } from '../../../domain/model/valueobjects/user-id.value-object';

const org = (id: string, name = 'Org'): Organization =>
  ({
    id: createOrganizationId(id),
    name,
    ownerUserId: createUserId('user-1'),
    createdAt: 'x',
    updatedAt: 'y',
  }) as Organization;

const space = (id: string, orgId: string, name = 'Sala'): Space =>
  ({
    id: createSpaceId(id),
    name,
    organizationId: createOrganizationId(orgId),
    ownerUserId: createUserId('user-1'),
    createdAt: 'x',
    updatedAt: 'y',
  }) as Space;

describe('OrganizationsPanelComponent', () => {
  const commandService = {
    handleCreateOrganization: vi.fn(),
    handleUpdateOrganizationName: vi.fn(),
    handleDeleteOrganization: vi.fn(),
    handleCreateSpace: vi.fn(),
    handleUpdateSpaceName: vi.fn(),
  };
  const queryService = {
    handleGetCurrentUserOrganizations: vi.fn(),
    handleGetSpacesByOrganization: vi.fn(),
    handleGetDevicesBySpace: vi.fn(),
  };
  const dialog = { open: vi.fn() };
  const snackBar = { open: vi.fn() };
  const cdr = { markForCheck: vi.fn(), detectChanges: vi.fn() };
  const destroyRefMock = {
    onDestroy: () => () => {},
  };

  const build = (): OrganizationsPanelComponent => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        { provide: DEVICE_COMMAND_SERVICE, useValue: commandService },
        { provide: DEVICE_QUERY_SERVICE, useValue: queryService },
        { provide: MatDialog, useValue: dialog },
        { provide: MatSnackBar, useValue: snackBar },
        { provide: TranslateService, useValue: { instant: (k: string) => k } },
        { provide: ChangeDetectorRef, useValue: cdr },
        { provide: DestroyRef, useValue: destroyRefMock },
      ],
    });
    return TestBed.runInInjectionContext(() => new OrganizationsPanelComponent());
  };

  beforeEach(() => {
    vi.resetAllMocks();
    localStorage.clear();
    queryService.handleGetCurrentUserOrganizations.mockReturnValue(of([]));
    queryService.handleGetSpacesByOrganization.mockReturnValue(of([]));
    queryService.handleGetDevicesBySpace.mockReturnValue(of({ totalElements: 0 }));
  });

  afterEach(() => localStorage.clear());

  describe('ngOnInit', () => {
    it('carga las organizaciones al inicializar', () => {
      const component = build();
      queryService.handleGetCurrentUserOrganizations.mockReturnValue(of([org('org-1')]));

      component.ngOnInit();

      expect(queryService.handleGetCurrentUserOrganizations).toHaveBeenCalledOnce();
      expect(component.organizations).toHaveLength(1);
    });
  });

  describe('toggleOrganization', () => {
    it('expande la organización y persiste el estado', () => {
      const component = build();
      component.organizations = [org('org-1')];

      component.toggleOrganization(createOrganizationId('org-1'));

      expect(component.expandedOrganizationIds['org-1']).toBe(true);
      expect(localStorage.getItem('clair.organizationsPanel.expandedOrganizationIds')).toBe(
        JSON.stringify(['org-1']),
      );
    });

    it('colapsa la organización ya expandida', () => {
      const component = build();
      component.expandedOrganizationIds = { 'org-1': true };

      component.toggleOrganization(createOrganizationId('org-1'));

      expect(component.expandedOrganizationIds['org-1']).toBe(false);
    });

    it('al expandir, carga los spaces si no estaban cargados', () => {
      const component = build();

      component.toggleOrganization(createOrganizationId('org-1'));

      expect(queryService.handleGetSpacesByOrganization).toHaveBeenCalledOnce();
    });

    it('no vuelve a cargar spaces ya cargados', () => {
      const component = build();
      component.spacesByOrganizationId = { 'org-1': [] };

      component.toggleOrganization(createOrganizationId('org-1'));

      expect(queryService.handleGetSpacesByOrganization).not.toHaveBeenCalled();
    });
  });

  describe('ensureOrganizationExpanded', () => {
    it('si ya estaba expandido no hace nada', () => {
      const component = build();
      component.expandedOrganizationIds = { 'org-1': true };

      component.ensureOrganizationExpanded(createOrganizationId('org-1'));

      expect(queryService.handleGetSpacesByOrganization).not.toHaveBeenCalled();
    });

    it('si no estaba, lo expande y carga spaces', () => {
      const component = build();

      component.ensureOrganizationExpanded(createOrganizationId('org-1'));

      expect(component.expandedOrganizationIds['org-1']).toBe(true);
      expect(queryService.handleGetSpacesByOrganization).toHaveBeenCalledOnce();
    });
  });

  describe('selectSpace', () => {
    it('emite el space encontrado', () => {
      const component = build();
      const s = space('space-1', 'org-1');
      component.spacesByOrganizationId = { 'org-1': [s] };
      const emit = vi.fn();
      component.spaceSelected.subscribe(emit);

      component.selectSpace(createSpaceId('space-1'));

      expect(emit).toHaveBeenCalledWith(s);
    });

    it('si no encuentra el space, no emite', () => {
      const component = build();
      const emit = vi.fn();
      component.spaceSelected.subscribe(emit);

      component.selectSpace(createSpaceId('missing'));

      expect(emit).not.toHaveBeenCalled();
    });
  });

  describe('loadSpaces', () => {
    it('actualiza loading a true y luego a false', () => {
      const component = build();
      queryService.handleGetSpacesByOrganization.mockReturnValue(of([space('space-1', 'org-1')]));

      component.loadSpaces(createOrganizationId('org-1'));

      expect(component.loadingSpacesByOrganizationId['org-1']).toBe(false);
      expect(component.spacesByOrganizationId['org-1']).toHaveLength(1);
    });

    it('con error, guarda el mensaje y quita loading', () => {
      const component = build();
      queryService.handleGetSpacesByOrganization.mockReturnValue(
        throwError(() => ({ error: { message: 'boom' } })),
      );

      component.loadSpaces(createOrganizationId('org-1'));

      expect(component.loadingSpacesByOrganizationId['org-1']).toBe(false);
      expect(component.errorSpacesByOrganizationId['org-1']).toBeTruthy();
    });
  });

  describe('openAddOrganizationDialog', () => {
    it('si el usuario cancela (undefined), no llama al command service', () => {
      const component = build();
      dialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
      // asegurar ngOnInit inicial
      queryService.handleGetCurrentUserOrganizations.mockReturnValue(of([]));

      component.openAddOrganizationDialog();

      expect(commandService.handleCreateOrganization).not.toHaveBeenCalled();
    });

    it('con nombre confirmado, llama al command service', () => {
      const component = build();
      dialog.open.mockReturnValue({ afterClosed: () => of('Clair Org') });
      commandService.handleCreateOrganization.mockReturnValue(of(org('org-1')));

      component.openAddOrganizationDialog();

      expect(commandService.handleCreateOrganization).toHaveBeenCalledOnce();
      expect(snackBar.open).toHaveBeenCalled();
    });
  });

  describe('openDeleteOrganizationDialog', () => {
    it('si el usuario cancela, no llama al command service', () => {
      const component = build();
      dialog.open.mockReturnValue({ afterClosed: () => of(false) });

      component.openDeleteOrganizationDialog(createOrganizationId('org-1'));

      expect(commandService.handleDeleteOrganization).not.toHaveBeenCalled();
    });

    it('con confirmación, llama al command service', () => {
      const component = build();
      dialog.open.mockReturnValue({ afterClosed: () => of(true) });
      commandService.handleDeleteOrganization.mockReturnValue(of(undefined));

      component.openDeleteOrganizationDialog(createOrganizationId('org-1'));

      expect(commandService.handleDeleteOrganization).toHaveBeenCalledOnce();
    });
  });

  describe('restoreExpandedOrganizations (vía ngOnInit)', () => {
    it('restaura las orgs expandidas de localStorage', () => {
      localStorage.setItem(
        'clair.organizationsPanel.expandedOrganizationIds',
        JSON.stringify(['org-1']),
      );
      const component = build();
      queryService.handleGetCurrentUserOrganizations.mockReturnValue(of([org('org-1')]));

      component.ngOnInit();

      expect(component.expandedOrganizationIds['org-1']).toBe(true);
      expect(queryService.handleGetSpacesByOrganization).toHaveBeenCalled();
    });

    it('ignora ids que no existen en las organizaciones cargadas', () => {
      localStorage.setItem(
        'clair.organizationsPanel.expandedOrganizationIds',
        JSON.stringify(['org-unknown']),
      );
      const component = build();
      queryService.handleGetCurrentUserOrganizations.mockReturnValue(of([org('org-1')]));

      component.ngOnInit();

      expect(component.expandedOrganizationIds['org-unknown']).toBeUndefined();
    });

    it('ignora JSON inválido sin romper', () => {
      localStorage.setItem('clair.organizationsPanel.expandedOrganizationIds', 'not-json');
      const component = build();
      queryService.handleGetCurrentUserOrganizations.mockReturnValue(of([]));

      expect(() => component.ngOnInit()).not.toThrow();
    });
  });
});