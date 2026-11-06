import { MatDialogRef } from '@angular/material/dialog';
import { PairDeviceDialogComponent } from './pair-device-dialog.component';
import { createComponent } from '../../../../testing/component-test-utils';

describe('PairDeviceDialogComponent', () => {
  const dialogRef = { close: vi.fn() };

  const build = () =>
    createComponent(PairDeviceDialogComponent, [
      { provide: MatDialogRef, useValue: dialogRef },
    ]);

  beforeEach(() => vi.resetAllMocks());

  it('el formulario arranca vacío e inválido', () => {
    const component = build();
    expect(component.form.value.hardwareId).toBe('');
    expect(component.form.invalid).toBe(true);
  });

  it.each([
    'CLAIR-0KBG',
    'CLAIR-AAAA',
    'CLAIR-1234',
    'HW-0001',
    'HW-9999',
  ])('acepta el hardwareId %s', (hardwareId) => {
    const component = build();
    component.form.patchValue({ hardwareId });

    expect(component.form.valid).toBe(true);
  });

  it('submit con hardwareId válido cierra con { hardwareId }', () => {
    const component = build();
    component.form.patchValue({ hardwareId: 'CLAIR-0KBG' });

    component.submit();

    expect(dialogRef.close).toHaveBeenCalledWith({ hardwareId: 'CLAIR-0KBG' });
  });

  it.each([
    'CLAIR-0KB',
    'CLAIR-0KBGG',
    'HW-1',
    'HW-12345',
    'invalid',
    '',
  ])('rechaza el hardwareId %s', (hardwareId) => {
    const component = build();
    component.form.patchValue({ hardwareId });

    expect(component.form.invalid).toBe(true);
  });

  it('con el form inválido, submit no cierra', () => {
    const component = build();

    component.submit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('cancel cierra con undefined', () => {
    build().cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});