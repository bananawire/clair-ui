import { ChatComposerComponent } from './chat-composer.component';

describe('ChatComposerComponent', () => {
  const keydown = (key: string, shiftKey = false) =>
    ({ key, shiftKey, isComposing: false, preventDefault: vi.fn() }) as unknown as KeyboardEvent;

  let composer: ChatComposerComponent;
  let sent: string[];

  beforeEach(() => {
    composer = new ChatComposerComponent();
    sent = [];
    composer.send.subscribe((value) => sent.push(value));
  });

  it('no envía un mensaje vacío', () => {
    composer.value = '   ';
    composer.submit();

    expect(composer.canSend).toBe(false);
    expect(sent).toEqual([]);
  });

  it('Enter envía el texto recortado y Shift+Enter no', () => {
    composer.value = '  ¿Debo ventilar?  ';

    composer.onKeydown(keydown('Enter', true));
    expect(sent).toEqual([]);

    composer.onKeydown(keydown('Enter'));
    expect(sent).toEqual(['¿Debo ventilar?']);
  });

  it('no envía mientras está deshabilitado ni por encima de 1000 caracteres', () => {
    composer.value = 'Hola';
    composer.disabled = true;
    composer.submit();

    composer.disabled = false;
    composer.value = 'x'.repeat(1001);
    composer.submit();

    expect(sent).toEqual([]);
  });

  it('emite cada cambio del borrador', () => {
    const drafts: string[] = [];
    composer.valueChange.subscribe((value) => drafts.push(value));

    composer.onInput({ target: { value: 'Hol' } } as unknown as Event);

    expect(drafts).toEqual(['Hol']);
    expect(composer.value).toBe('Hol');
  });
});
