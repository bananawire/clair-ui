import { DeviceDetailPanelComponent } from './device-detail-panel.component';

describe('DeviceDetailPanelComponent', () => {
  let component: DeviceDetailPanelComponent;

  beforeEach(() => {
    component = new DeviceDetailPanelComponent();
  });

  it('onBackRequested emite backRequested', () => {
    const emit = vi.fn();
    component.backRequested.subscribe(emit);

    component.onBackRequested();

    expect(emit).toHaveBeenCalledOnce();
  });

  it('onEditRequested emite editRequested', () => {
    const emit = vi.fn();
    component.editRequested.subscribe(emit);

    component.onEditRequested();

    expect(emit).toHaveBeenCalledOnce();
  });

  it('onDeleteRequested emite deleteRequested', () => {
    const emit = vi.fn();
    component.deleteRequested.subscribe(emit);

    component.onDeleteRequested();

    expect(emit).toHaveBeenCalledOnce();
  });

  it('onPowerToggleRequested emite powerToggleRequested', () => {
    const emit = vi.fn();
    component.powerToggleRequested.subscribe(emit);

    component.onPowerToggleRequested();

    expect(emit).toHaveBeenCalledOnce();
  });

  it('onEditThresholdsRequested emite thresholdsEditRequested', () => {
    const emit = vi.fn();
    component.thresholdsEditRequested.subscribe(emit);

    component.onEditThresholdsRequested();

    expect(emit).toHaveBeenCalledOnce();
  });

  describe('valores por defecto', () => {
    it('telemetry empieza en null', () => {
      expect(component.telemetry).toBeNull();
    });

    it('thresholds empieza en null', () => {
      expect(component.thresholds).toBeNull();
    });
  });

  it('cada evento se emite de forma independiente', () => {
    const back = vi.fn();
    const edit = vi.fn();
    const del = vi.fn();
    component.backRequested.subscribe(back);
    component.editRequested.subscribe(edit);
    component.deleteRequested.subscribe(del);

    component.onEditRequested();

    expect(edit).toHaveBeenCalledOnce();
    expect(back).not.toHaveBeenCalled();
    expect(del).not.toHaveBeenCalled();
  });
});