import {
  createDeviceThresholdCommandToResource,
  updateDeviceThresholdCommandToResource,
} from './update-device-threshold.transform';
import { createCreateDeviceThresholdCommand } from '../../../domain/model/commands/create-device-threshold.command';
import { createUpdateDeviceThresholdCommand } from '../../../domain/model/commands/update-device-threshold.command';
import { createDeviceId } from '../../../domain/model/valueobjects/device-id.value-object';

const deviceId = createDeviceId('device-1');

describe('createDeviceThresholdCommandToResource', () => {
  it('extrae metric, value.value y enabled (deviceId va en la URL)', () => {
    const command = createCreateDeviceThresholdCommand(deviceId, 'CO2', 1000, true);

    const resource = createDeviceThresholdCommandToResource(command);

    expect(resource).toEqual({ metric: 'CO2', value: 1000, enabled: true });
  });

  it('con enabled=false', () => {
    const command = createCreateDeviceThresholdCommand(deviceId, 'PM25', 35, false);

    const resource = createDeviceThresholdCommandToResource(command);

    expect(resource.enabled).toBe(false);
  });
});

describe('updateDeviceThresholdCommandToResource', () => {
  it('extrae metric, value.value y enabled', () => {
    const command = createUpdateDeviceThresholdCommand(deviceId, 'TEMPERATURE', 30, true);

    const resource = updateDeviceThresholdCommandToResource(command);

    expect(resource).toEqual({ metric: 'TEMPERATURE', value: 30, enabled: true });
  });
});