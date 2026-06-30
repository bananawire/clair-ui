import { HttpClient } from '@angular/common/http';
import { TranslateLoader, TranslationObject } from '@ngx-translate/core';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

const BOUNDED_CONTEXTS = [
  'shared',
  'iam',
  'device',
  'analytics',
  'alerting',
  'billing',
];

export class MultiTranslationHttpLoader implements TranslateLoader {
  constructor(private readonly http: HttpClient) {}

  getTranslation(lang: string): Observable<TranslationObject> {
    const requests = BOUNDED_CONTEXTS.map(context =>
      this.http.get<TranslationObject>(`/${context}/${lang}.json`).pipe(
        catchError(() => of({}))
      )
    );

    return forkJoin(requests).pipe(
      map(translations => translations.reduce((acc, current) => ({ ...acc, ...current }), {}))
    );
  }
}

export function multiTranslationHttpLoaderFactory(http: HttpClient): MultiTranslationHttpLoader {
  return new MultiTranslationHttpLoader(http);
}
