import { MatDialogRef } from '@angular/material/dialog';
import { ClaimDeviceDialogComponent } from './claim-device-dialog.component';
import { createComponent } from '../../../../testing/component-test-utils';

describe('ClaimDeviceDialogComponent', () => {
  const dialogRef = { close: vi.fn() };

  const build = () =>
    createComponent(ClaimDeviceDialogComponent, [{ provide: MatDialogRef, useValue: dialogRef }]);

  beforeEach(() => vi.resetAllMocks());

  it('el formulario arranca vacío', () => {
    const component = build();
    expect(component.form.value.claimToken).toBe('');
    expect(component.form.invalid).toBe(true);
  });

  it('con el form inválido, submit no cierra', () => {
    const component = build();

    component.submit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it.each([
    ['ABCD-1234', 'formato XXXX-XXXX'],
    ['ABCD1234EFGH5678IJKL', 'token largo (20+)'],
    ['TOKEN_CON-GUIONES_20CHARS', 'alfanumérico con - y _ de 20+'],
  ])('acepta el claimToken %s (%s)', (token) => {
    const component = build();
    component.form.patchValue({ claimToken: token });

    expect(component.form.valid).toBe(true);

    component.submit();

    expect(dialogRef.close).toHaveBeenCalledWith({ claimToken: token.toUpperCase() });
  });

  it('normaliza lowercase a uppercase al enviar', () => {
    const component = build();
    component.form.patchValue({ claimToken: 'abcd-1234' });
    expect(component.form.valid).toBe(true);
    component.submit();
    expect(dialogRef.close).toHaveBeenCalledWith({ claimToken: 'ABCD-1234' });
  });

  it.each([
    'ABC-1234',
    'corto',
    'espacios en el medio token token',
  ])('rechaza el claimToken %s', (token) => {
    const component = build();
    component.form.patchValue({ claimToken: token });

    expect(component.form.invalid).toBe(true);
  });

  it('cancel cierra con undefined', () => {
    const component = build();

    component.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith(undefined);
  });
});