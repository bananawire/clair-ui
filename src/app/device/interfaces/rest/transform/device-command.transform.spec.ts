import { deviceCommandResourceToDomain } from './device-command.transform';
import { DeviceCommandResource } from '../resources/device-command.resource';

const resource: DeviceCommandResource = {
  id: 'cmd-1',
  deviceId: 'device-1',
  type: 'RESTART',
  status: 'EXECUTED',
  payload: '{"force":true}',
  sentAt: '2026-10-04T10:00:00Z',
  executedAt: '2026-10-04T10:00:05Z',
  failureReason: null,
  createdAt: '2026-10-04T09:59:00Z',
};

describe('deviceCommandResourceToDomain', () => {
  it('mapea todos los campos y congela el resultado', () => {
    const command = deviceCommandResourceToDomain(resource);

    expect(command.id).toBe('cmd-1');
    expect(command.deviceId.value).toBe('device-1');
    expect(command.type).toBe('RESTART');
    expect(command.status).toBe('EXECUTED');
    expect(command.payload).toBe('{"force":true}');
    expect(command.sentAt).toBe('2026-10-04T10:00:00Z');
    expect(command.executedAt).toBe('2026-10-04T10:00:05Z');
    expect(command.failureReason).toBeNull();
    expect(command.createdAt).toBe('2026-10-04T09:59:00Z');
    expect(Object.isFrozen(command)).toBe(true);
  });

  it('acepta payload nulo y failureReason presente', () => {
    const command = deviceCommandResourceToDomain({
      ...resource,
      payload: null as unknown as string,
      failureReason: 'timeout',
    });

    expect(command.payload).toBeNull();
    expect(command.failureReason).toBe('timeout');
  });

  it('propaga el error si el deviceId es inválido', () => {
    expect(() => deviceCommandResourceToDomain({ ...resource, deviceId: '' })).toThrow(
      'Device ID must not be empty',
    );
  });
});