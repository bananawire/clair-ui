import { OrganizationsBarComponent } from './organizations-bar.component';
import { createOrganizationId } from '../../../domain/model/valueobjects/organization-id.value-object';
import { createSpaceId } from '../../../domain/model/valueobjects/space-id.value-object';

describe('OrganizationsBarComponent', () => {
  let component: OrganizationsBarComponent;

  beforeEach(() => {
    component = new OrganizationsBarComponent();
  });

  it.each([
    ['toggleOrganization', 'organizationToggled'],
    ['selectSpace', 'spaceSelected'],
    ['openAddSpaceDialog', 'addSpaceRequested'],
    ['openEditSpaceDialog', 'editSpaceRequested'],
    ['openEditOrganizationDialog', 'editOrganizationRequested'],
    ['openDeleteOrganizationDialog', 'deleteOrganizationRequested'],
  ] as const)('%s emite %s con el argumento', (method, event) => {
    const emit = vi.fn();
    (component[event] as { subscribe: (fn: typeof emit) => void }).subscribe(emit);
    const arg = createOrganizationId('org-1');

    (component[method] as (a: unknown) => void)(arg);

    expect(emit).toHaveBeenCalledWith(arg);
  });

  it('openAddOrganizationDialog emite sin argumentos', () => {
    const emit = vi.fn();
    component.addOrganizationRequested.subscribe(emit);

    component.openAddOrganizationDialog();

    expect(emit).toHaveBeenCalledOnce();
  });

  it('trackBySpaceId devuelve el id.value', () => {
    const space = { id: createSpaceId('space-1') } as never;
    expect(component.trackBySpaceId(0, space)).toBe('space-1');
  });

  it('trackByOrganizationId devuelve el id.value', () => {
    const org = { id: createOrganizationId('org-1') } as never;
    expect(component.trackByOrganizationId(0, org)).toBe('org-1');
  });

  describe('valores por defecto', () => {
    it('organizations empieza vacío', () => {
      expect(component.organizations).toEqual([]);
    });

    it('expandedOrganizationIds empieza vacío', () => {
      expect(component.expandedOrganizationIds).toEqual({});
    });

    it('spacesByOrganizationId empieza vacío', () => {
      expect(component.spacesByOrganizationId).toEqual({});
    });

    it('deviceCountsBySpaceId empieza vacío', () => {
      expect(component.deviceCountsBySpaceId).toEqual({});
    });

    it('selectedSpaceId empieza en null', () => {
      expect(component.selectedSpaceId).toBeNull();
    });
  });
});