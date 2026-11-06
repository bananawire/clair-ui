import { ChangeDetectorRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { of, Subject } from 'rxjs';
import { createComponent } from '../../../../testing/component-test-utils';
import { SpaceDevicesPageComponent } from './space-devices-page.component';
import { SpaceDevicesNavigationStateService } from './space-devices-navigation-state.service';
import { SpaceDevicesSelectionHydrationService } from './space-devices-selection-hydration.service';
import { SpaceDevicesPageActionsService } from './space-devices-page-actions.service';

describe('SpaceDevicesPageComponent drawer scroll lock', () => {
  const queryParamMap$ = new Subject();
  const navigationState = {
    readSelectionFromQueryParams: vi.fn(() => null),
    readSelectionFromLocalStorage: vi.fn(() => null),
    syncQueryParams: vi.fn(),
    persistSelectionToLocalStorage: vi.fn(),
    clearLocalStorageSelection: vi.fn(),
  };
  const selectionHydration = {
    hydrateFromDeviceId: vi.fn(() => of(null)),
    hydrateFromSpaceId: vi.fn(() => of(null)),
  };
  const pageActions = {
    runPairClaimDeviceFlow: vi.fn(),
    runEditDeviceThresholdsFlow: vi.fn(),
    loadDeviceThresholds: vi.fn(),
    runEditSpaceNameFlow: vi.fn(),
    runDeleteSpaceFlow: vi.fn(),
    loadDevices: vi.fn(),
    runEditDeviceNameFlow: vi.fn(),
    runDeleteDeviceFlow: vi.fn(),
    runToggleDevicePowerFlow: vi.fn(),
    watchLatestTelemetry: vi.fn(),
    watchLatestTelemetryByDevices: vi.fn(),
    watchDeviceStatus: vi.fn(),
  };
  const cdr = { markForCheck: vi.fn(), detectChanges: vi.fn() };
  const route = { queryParamMap: queryParamMap$.asObservable() };
  const router = { navigate: vi.fn() };

  const build = (): SpaceDevicesPageComponent =>
    createComponent(SpaceDevicesPageComponent, [
      { provide: SpaceDevicesNavigationStateService, useValue: navigationState },
      { provide: SpaceDevicesSelectionHydrationService, useValue: selectionHydration },
      { provide: SpaceDevicesPageActionsService, useValue: pageActions },
      { provide: ChangeDetectorRef, useValue: cdr },
      { provide: ActivatedRoute, useValue: route },
      { provide: Router, useValue: router },
      { provide: DOCUMENT, useValue: document },
    ]);

  beforeEach(() => {
    vi.resetAllMocks();
    document.body.style.overflow = '';
    navigationState.readSelectionFromQueryParams.mockReturnValue(null);
    navigationState.readSelectionFromLocalStorage.mockReturnValue(null);
  });

  afterEach(() => {
    document.body.style.overflow = '';
  });

  it('locks body scroll when organizations drawer opens and restores on close', () => {
    const component = build();
    document.body.style.overflow = 'auto';

    component.openOrganizationsDrawer();

    expect(component.isOrganizationsDrawerOpen).toBe(true);
    expect(document.body.style.overflow).toBe('hidden');
    expect(cdr.detectChanges).toHaveBeenCalled();

    component.closeOrganizationsDrawer();

    expect(component.isOrganizationsDrawerOpen).toBe(false);
    expect(document.body.style.overflow).toBe('auto');
  });

  it('restores body overflow on destroy while drawer is open', () => {
    const component = build();
    document.body.style.overflow = 'scroll';

    component.openOrganizationsDrawer();
    expect(document.body.style.overflow).toBe('hidden');

    component.ngOnDestroy();

    expect(document.body.style.overflow).toBe('scroll');
  });

  it('closes organizations drawer on Escape when open', () => {
    const component = build();

    component.openOrganizationsDrawer();
    component.onEscape();

    expect(component.isOrganizationsDrawerOpen).toBe(false);
    expect(document.body.style.overflow).toBe('');
  });

  it('ignores Escape when organizations drawer is closed', () => {
    const component = build();

    component.onEscape();

    expect(component.isOrganizationsDrawerOpen).toBe(false);
  });
});
