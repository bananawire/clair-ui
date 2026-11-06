import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { DeleteDeviceDialogComponent, DeleteDeviceDialogData } from './delete-device-dialog.component';
import { createComponent } from '../../../../testing/component-test-utils';

describe('DeleteDeviceDialogComponent', () => {
  const dialogRef = { close: vi.fn() };
  const data: DeleteDeviceDialogData = { deviceName: 'Sensor Norte' };

  const build = () =>
    createComponent(DeleteDeviceDialogComponent, [
      { provide: MatDialogRef, useValue: dialogRef },
      { provide: MAT_DIALOG_DATA, useValue: data },
    ]);

  beforeEach(() => vi.resetAllMocks());

  it('expone el data recibido', () => {
    const component = build();
    expect(component.data.deviceName).toBe('Sensor Norte');
  });

  it('confirm cierra con true', () => {
    const component = build();

    component.confirm();

    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('cancel cierra con false', () => {
    const component = build();

    component.cancel();

    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});