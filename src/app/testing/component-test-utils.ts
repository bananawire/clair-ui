import { Provider, Type } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

/**
 * TranslateService de pruebas: devuelve la clave tal cual y, si hay parámetros,
 * los agrega en JSON (ej: `aqiCard.updated.secondsAgo:{"seconds":5}`).
 */
export const fakeTranslate = {
  instant: (key: string, params?: Record<string, unknown>): string =>
    params ? `${key}:${JSON.stringify(params)}` : key,
};

/** Crea el componente como clase (sin renderizar su plantilla) para probar su lógica. */
export function createComponent<T>(component: Type<T>, providers: Provider[] = []): T {
  TestBed.resetTestingModule();
  TestBed.configureTestingModule({
    providers: [{ provide: TranslateService, useValue: fakeTranslate }, ...providers],
  });
  return TestBed.runInInjectionContext(() => new component());
}