import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { PairClaimDeviceDialogComponent } from './pair-claim-device-dialog.component';
import { createComponent } from '../../../../testing/component-test-utils';
import { firstValueFrom } from 'rxjs';

describe('PairClaimDeviceDialogComponent', () => {
  const dialogRef = { close: vi.fn() };

  const build = (data: Record<string, unknown> = { autoClaimEnabled: true }) =>
    createComponent(PairClaimDeviceDialogComponent, [
      { provide: MatDialogRef, useValue: dialogRef },
      { provide: MAT_DIALOG_DATA, useValue: data },
    ]);

  beforeEach(() => vi.resetAllMocks());

  it('arranca en el paso pair por defecto', () => {
    const component = build();
    expect(component.step).toBe('pair');
    expect(component.pairForm.invalid).toBe(true);
  });

  it('puede arrancar directamente en claim', () => {
    const component = build({ autoClaimEnabled: true, startStep: 'claim', initialClaimToken: 'ab45-f3b1' });
    expect(component.step).toBe('claim');
    expect(component.claimToken).toBe('AB45-F3B1');
    expect(component.claimForm.value.claimToken).toBe('AB45-F3B1');
  });

  it('submitPair emite request pair y marca busy', async () => {
    const component = build();
    component.pairForm.patchValue({ hardwareId: 'CLAIR-0KBG' });

    const pending = firstValueFrom(component.requests$);
    component.submitPair();
    await expect(pending).resolves.toEqual({ type: 'pair', hardwareId: 'CLAIR-0KBG' });
    expect(component.busy).toBe(true);
  });

  it('showClaimStep deja el token persistente en mayúsculas', () => {
    const component = build();
    component.showClaimStep({ claimToken: 'ab45-f3b1', hardwareId: 'CLAIR-0KBG' });

    expect(component.step).toBe('claim');
    expect(component.claimToken).toBe('AB45-F3B1');
    expect(component.pairedHardwareId).toBe('CLAIR-0KBG');
    expect(component.busy).toBe(false);
  });

  it('submitClaim normaliza a uppercase y emite request claim', async () => {
    const component = build({ autoClaimEnabled: true, startStep: 'claim' });
    component.claimForm.patchValue({ claimToken: 'ab45-f3b1' });

    const pending = firstValueFrom(component.requests$);
    component.submitClaim();
    await expect(pending).resolves.toEqual({ type: 'claim', claimToken: 'AB45-F3B1' });
  });

  it('completeSuccessfully cierra con claimed=true', () => {
    const component = build();
    component.pairedHardwareId = 'CLAIR-0KBG';
    component.completeSuccessfully('AB45-F3B1');

    expect(dialogRef.close).toHaveBeenCalledWith({
      claimed: true,
      claimToken: 'AB45-F3B1',
      hardwareId: 'CLAIR-0KBG',
    });
  });
});
