import { readFileSync } from 'node:fs';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService, TranslateService } from '@ngx-translate/core';
import { ASSISTANT_COMMAND_SERVICE } from '../../../domain/services/assistant-command-service';
import { ASSISTANT_QUERY_SERVICE } from '../../../domain/services/assistant-query-service';
import { LanguageService } from '../../../../shared/interfaces/services/language.service';
import { AssistantPanelComponent } from '../assistant-panel/assistant-panel.component';
import { SuggestedPromptsComponent } from './suggested-prompts.component';

describe('SuggestedPromptsComponent', () => {
  const spanishPrompts = [
    '¿Qué hago con mi abuela por el calor?',
    '¿Cómo evito el dengue en casa?',
    '¿Qué llevo en mi mochila de emergencia?',
  ];

  let fixture: ComponentFixture<SuggestedPromptsComponent>;
  let translate: TranslateService;

  const buttons = () =>
    Array.from(fixture.nativeElement.querySelectorAll('button')) as HTMLButtonElement[];

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestedPromptsComponent, AssistantPanelComponent],
      providers: [
        provideTranslateService({ lang: 'es' }),
        { provide: ASSISTANT_COMMAND_SERVICE, useValue: {} },
        { provide: ASSISTANT_QUERY_SERVICE, useValue: {} },
        { provide: LanguageService, useValue: {} },
      ],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    for (const lang of ['es', 'en']) {
      translate.setTranslation(
        lang,
        JSON.parse(readFileSync(`public/assistant/${lang}.json`, 'utf8')),
      );
    }
    translate.use('es');

    const panel = TestBed.createComponent(AssistantPanelComponent);
    fixture = TestBed.createComponent(SuggestedPromptsComponent);
    fixture.componentRef.setInput('promptKeys', panel.componentInstance.suggestionKeys);
    fixture.detectChanges();
  });

  it('muestra exactamente las tres sugerencias de emergencia en el orden solicitado', () => {
    expect(buttons().map((button) => button.textContent?.trim())).toEqual(spanishPrompts);
  });

  it('emite el texto traducido de cada sugerencia al pulsarla', () => {
    const select = vi.fn();
    fixture.componentInstance.select.subscribe(select);

    buttons().forEach((button) => button.click());

    expect(select.mock.calls).toEqual(spanishPrompts.map((prompt) => [prompt]));
  });

  it('no permite seleccionar sugerencias mientras está deshabilitado', () => {
    const select = vi.fn();
    fixture.componentInstance.select.subscribe(select);
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    buttons().forEach((button) => {
      expect(button.disabled).toBe(true);
      button.click();
    });
    fixture.componentInstance.choose('assistant.suggestions.heat');

    expect(select).not.toHaveBeenCalled();
  });

  it('mantiene las tres sugerencias traducidas al cambiar a inglés', () => {
    translate.use('en');
    fixture.detectChanges();

    expect(buttons().map((button) => button.textContent?.trim())).toEqual([
      'What should I do for my grandmother in the heat?',
      'How can I prevent dengue at home?',
      'What should I pack in my emergency kit?',
    ]);
  });
});
