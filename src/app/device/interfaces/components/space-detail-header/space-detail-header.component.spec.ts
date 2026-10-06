import { SpaceDetailHeaderComponent } from './space-detail-header.component';

describe('SpaceDetailHeaderComponent', () => {
  let component: SpaceDetailHeaderComponent;

  beforeEach(() => {
    component = new SpaceDetailHeaderComponent();
  });

  it.each([
    ['requestClaimDevice', 'claimDeviceRequested'],
    ['requestPairDevice', 'pairDeviceRequested'],
    ['requestEditSpace', 'editSpaceRequested'],
    ['requestDeleteSpace', 'deleteSpaceRequested'],
  ] as const)('%s emite %s', (method, event) => {
    const emit = vi.fn();
    (component[event] as { subscribe: (fn: typeof emit) => void }).subscribe(emit);

    (component[method] as () => void)();

    expect(emit).toHaveBeenCalledOnce();
  });

  it('space por defecto es null', () => {
    expect(component.space).toBeNull();
  });

  it('cada evento se emite de forma independiente', () => {
    const claim = vi.fn();
    const pair = vi.fn();
    const edit = vi.fn();
    component.claimDeviceRequested.subscribe(claim);
    component.pairDeviceRequested.subscribe(pair);
    component.editSpaceRequested.subscribe(edit);

    component.requestPairDevice();

    expect(pair).toHaveBeenCalledOnce();
    expect(claim).not.toHaveBeenCalled();
    expect(edit).not.toHaveBeenCalled();
  });
});