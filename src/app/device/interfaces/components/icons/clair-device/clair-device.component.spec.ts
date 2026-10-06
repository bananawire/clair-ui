import { ClairDeviceComponent } from './clair-device.component';

describe('ClairDeviceComponent', () => {
  let component: ClairDeviceComponent;

  beforeEach(() => {
    component = new ClairDeviceComponent();
  });

  describe('computedClass', () => {
    it('por defecto es solo "block"', () => {
      expect(component.computedClass).toBe('block');
    });

    it('con class custom, concatena con "block"', () => {
      component.class = 'large';
      expect(component.computedClass).toBe('block large');
    });

    it('con class con espacios internos, los preserva', () => {
      component.class = 'large icon-red';
      expect(component.computedClass).toBe('block large icon-red');
    });

    it('con class vacío (default), devuelve solo "block"', () => {
      component.class = '';
      expect(component.computedClass).toBe('block');
    });
  });

  it('fill por defecto es currentColor', () => {
    expect(component.fill).toBe('currentColor');
  });

  it('fill acepta cualquier string', () => {
    component.fill = '#ff0000';
    expect(component.fill).toBe('#ff0000');
  });
});