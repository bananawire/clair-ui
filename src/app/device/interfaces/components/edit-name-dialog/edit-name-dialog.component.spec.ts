import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { EditNameDialogComponent, EditNameDialogData } from './edit-name-dialog.component';
import { createComponent } from '../../../../testing/component-test-utils';

const data: EditNameDialogData = {
  currentValue: 'Sensor Norte',
  title: 'Editar nombre',
  fieldLabel: 'Nombre',
  placeholder: 'Ingresa el nombre',
};

describe('EditNameDialogComponent', () => {
  const dialogRef = { close: vi.fn() };

  const build = (override: Partial<EditNameDialogData> = {}) =>
    createComponent(EditNameDialogComponent, [
      { provide: MatDialogRef, useValue: dialogRef },
      { provide: MAT_DIALOG_DATA, useValue: { ...data, ...override } },
    ]);

  beforeEach(() => vi.resetAllMocks());

  it('expone el data recibido', () => {
    const component = build();
    expect(component.data.currentValue).toBe('Sensor Norte');
    expect(component.data.title).toBe('Editar nombre');
  });

  it('el formulario arranca con el currentValue', () => {
    const component = build();
    expect(component.form.value.value).toBe('Sensor Norte');
    expect(component.form.valid).toBe(true);
  });

  it('con currentValue null/vacío arranca con string vacío', () => {
    const component = build({ currentValue: '' });
    expect(component.form.value.value).toBe('');
    expect(component.form.invalid).toBe(true);
  });

  it('con nombre válido, submit cierra con el valor', () => {
    const component = build();
    component.form.patchValue({ value: 'Sensor Sur' });

    component.submit();

    expect(dialogRef.close).toHaveBeenCalledWith('Sensor Sur');
  });

  it('con el form inválido (vacío), submit no cierra', () => {
    const component = build({ currentValue: '' });

    component.submit();

    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('cancel cierra sin argumentos', () => {
    build().cancel();
    expect(dialogRef.close).toHaveBeenCalledWith();
  });
});