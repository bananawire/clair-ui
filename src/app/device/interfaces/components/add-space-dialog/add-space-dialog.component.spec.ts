import { MatDialogRef } from '@angular/material/dialog';
import { AddSpaceDialogComponent } from './add-space-dialog.component';
import { createComponent } from '../../../../testing/component-test-utils';

describe('AddSpaceDialogComponent', () => {
  const dialogRef = { close: vi.fn() };

  const build = () =>
    createComponent(AddSpaceDialogComponent, [{ provide: MatDialogRef, useValue: dialogRef }]);

  beforeEach(() => vi.resetAllMocks());

  it('el formulario arranca vacío', () => {
    const component = build();
    expect(component.form.value.name).toBe('');
    expect(component.form.invalid).toBe(true);
  });

  it('con nombre válido, submit cierra con el nombre', () => {
    const component = build();
    component.form.patchValue({ name: 'Sala 1' });

    component.submit();

    expect(dialogRef.close).toHaveBeenCalledWith('Sala 1');
  });

  it('con el form inválido, submit no cierra', () => {
    const component = build();

    component.submit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('cancel cierra sin argumentos', () => {
    const component = build();

    component.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});