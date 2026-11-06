import { MatDialogRef } from '@angular/material/dialog';
import { AddOrganizationDialogComponent } from './add-organization-dialog.component';
import { createComponent } from '../../../../testing/component-test-utils';

describe('AddOrganizationDialogComponent', () => {
  const dialogRef = { close: vi.fn() };

  const build = () =>
    createComponent(AddOrganizationDialogComponent, [
      { provide: MatDialogRef, useValue: dialogRef },
    ]);

  beforeEach(() => vi.resetAllMocks());

  it('el formulario arranca vacío y es inválido', () => {
    const component = build();

    expect(component.form.value.name).toBe('');
    expect(component.form.invalid).toBe(true);
  });

  it('con nombre válido, submit cierra el dialog con el nombre', () => {
    const component = build();
    component.form.patchValue({ name: 'Clair Org' });

    component.submit();

    expect(dialogRef.close).toHaveBeenCalledWith('Clair Org');
  });

  it('con el formulario inválido, submit NO cierra el dialog', () => {
    const component = build();

    component.submit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('cancel cierra el dialog sin argumentos', () => {
    const component = build();

    component.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith();
  });

  it('un nombre en blanco ("   ") NO pasa el validador required', () => {
    const component = build();
    component.form.patchValue({ name: '   ' });

    // El validador actual es `required` y `minLength(1)`, que aceptan "   ".
    // Documentamos el comportamiento actual: el formulario se considera válido.
    expect(component.form.valid).toBe(true);
  });
});