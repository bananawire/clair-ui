import { ChangeDetectorRef } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { of } from 'rxjs';
import { createComponent } from '../../../../testing/component-test-utils';
import { DEVICE_THRESHOLD_COMMAND_SERVICE } from '../../../domain/services/device-threshold-command-service';
import { DEVICE_THRESHOLD_QUERY_SERVICE } from '../../../domain/services/device-threshold-query-service';
import { EditDeviceThresholdsDialogComponent } from './edit-device-thresholds-dialog.component';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';

describe('EditDeviceThresholdsDialogComponent', () => {
  const dialogRef = { close: vi.fn() };
  const snackBar = { open: vi.fn() };
  const cdr = { markForCheck: vi.fn(), detectChanges: vi.fn() };
  const queryService = {
    handleGetDeviceThresholdsByDevice: vi.fn(() => of([])),
  };
  const commandService = {
    handleCreateDeviceThreshold: vi.fn(),
    handleUpdateDeviceThreshold: vi.fn(),
  };

  const build = (): EditDeviceThresholdsDialogComponent =>
    createComponent(EditDeviceThresholdsDialogComponent, [
      { provide: MatDialogRef, useValue: dialogRef },
      { provide: MAT_DIALOG_DATA, useValue: { deviceId: 'device-1' } },
      { provide: MatSnackBar, useValue: snackBar },
      { provide: ChangeDetectorRef, useValue: cdr },
      { provide: FormBuilder, useClass: FormBuilder },
      { provide: DEVICE_THRESHOLD_QUERY_SERVICE, useValue: queryService },
      { provide: DEVICE_THRESHOLD_COMMAND_SERVICE, useValue: commandService },
    ]);

  beforeEach(() => {
    vi.resetAllMocks();
    queryService.handleGetDeviceThresholdsByDevice.mockReturnValue(of([]));
  });

  it('keeps outdoor metrics in the 3x2 slider order', () => {
    const component = build();

    expect(component.sliderConfigs.map((cfg) => cfg.metric)).toEqual([
      'PM25',
      'CO2',
      'TEMPERATURE',
      'HUMIDITY',
      'RAINFALL',
      'WATER_LEVEL',
    ]);
  });

  it('uses a responsive 3 → 2 → 1 column grid in CSS', () => {
    const css = readFileSync(
      resolve(__dirname, './edit-device-thresholds-dialog.component.css'),
      'utf8',
    );

    expect(css).toContain('grid-template-columns: repeat(3, minmax(0, 1fr));');
    expect(css).toContain('grid-template-rows: repeat(2, minmax(0, 1fr));');
    expect(css).toContain('grid-template-columns: repeat(2, minmax(0, 1fr));');
    expect(css).toContain('grid-template-columns: 1fr;');
    expect(css).not.toContain('grid-template-columns: repeat(4,');
  });
});
