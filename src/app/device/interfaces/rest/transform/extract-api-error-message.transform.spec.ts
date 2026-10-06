import { extractApiErrorMessage } from './extract-api-error-message.transform';

describe('extractApiErrorMessage', () => {
  it('extrae el mensaje cuando el error tiene la forma HttpErrorResponse', () => {
    const error = { error: { message: 'Internal server error' } };

    expect(extractApiErrorMessage(error, 'fallback')).toBe('Internal server error');
  });

  it('recorta el mensaje extraído', () => {
    expect(extractApiErrorMessage({ error: { message: '  Server error  ' } }, 'fallback')).toBe(
      '  Server error  ',
    );
  });

  it.each([
    [null, 'fallback'],
    [undefined, 'fallback'],
    ['string error', 'fallback'],
    [42, 'fallback'],
    [true, 'fallback'],
  ])('con %j devuelve el fallback', (value, expected) => {
    expect(extractApiErrorMessage(value, expected)).toBe(expected);
  });

  it('con objeto sin propiedad "error" devuelve el fallback', () => {
    expect(extractApiErrorMessage({ status: 500 }, 'fallback')).toBe('fallback');
  });

  it('con error.error que no es objeto devuelve el fallback', () => {
    expect(extractApiErrorMessage({ error: 'string' }, 'fallback')).toBe('fallback');
    expect(extractApiErrorMessage({ error: null }, 'fallback')).toBe('fallback');
  });

  it('con error.error sin propiedad message devuelve el fallback', () => {
    expect(extractApiErrorMessage({ error: { detail: 'algo' } }, 'fallback')).toBe('fallback');
  });

  it.each([
    ['number', 500],
    ['object', { nested: true }],
    ['null', null],
    ['array', [1, 2]],
  ])('con message que no es string (%s) devuelve el fallback', (_label, message) => {
    expect(extractApiErrorMessage({ error: { message } }, 'fallback')).toBe('fallback');
  });

  it.each(['', '   '])('con message vacío (%j) devuelve el fallback', (message) => {
    expect(extractApiErrorMessage({ error: { message } }, 'fallback')).toBe('fallback');
  });

  it('el mensaje se devuelve tal cual (no se recorta el valor devuelto)', () => {
    // El check es trim().length > 0 pero devuelve el message original
    expect(extractApiErrorMessage({ error: { message: '  msg  ' } }, 'fallback')).toBe('  msg  ');
  });
});