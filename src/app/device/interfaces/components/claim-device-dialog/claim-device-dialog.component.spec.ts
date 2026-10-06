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
    ['token_con-guiones_20chars', 'alfanumérico con - y _ de 20+'],
  ])('acepta el claimToken %s (%s)', (token) => {
    const component = build();
    component.form.patchValue({ claimToken: token });

    expect(component.form.valid).toBe(true);

    component.submit();

    expect(dialogRef.close).toHaveBeenCalledWith({ claimToken: token });
  });

  it.each([
    'ABC-1234',
    'abcd-1234',
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