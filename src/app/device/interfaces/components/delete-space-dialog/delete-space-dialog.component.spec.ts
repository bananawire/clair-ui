import { MatDialogRef } from '@angular/material/dialog';
import { DeleteSpaceDialogComponent } from './delete-space-dialog.component';
import { createComponent } from '../../../../testing/component-test-utils';

describe('DeleteSpaceDialogComponent', () => {
  const dialogRef = { close: vi.fn() };

  const build = () =>
    createComponent(DeleteSpaceDialogComponent, [
      { provide: MatDialogRef, useValue: dialogRef },
    ]);

  beforeEach(() => vi.resetAllMocks());

  it('confirm cierra con true', () => {
    build().confirm();
    expect(dialogRef.close).toHaveBeenCalledWith(true);
  });

  it('cancel cierra con false', () => {
    build().cancel();
    expect(dialogRef.close).toHaveBeenCalledWith(false);
  });
});