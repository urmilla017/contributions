import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom, inject } from '@angular/core';
import { HttpClientModule, HttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { TranslateModule, TranslateLoader } from '@ngx-translate/core';
import { Observable } from 'rxjs';

export class TranslateHttpLoaderV17 implements TranslateLoader {
  private http: HttpClient = inject(HttpClient);
  private baseHref: string = inject(APP_BASE_HREF);

  getTranslation(lang: string): Observable<any> {
    return this.http.get(`${this.baseHref}/assets/i18n/${lang}.json`);
  }
}

// Standalone configuration
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    importProvidersFrom(
      HttpClientModule,
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useClass: TranslateHttpLoaderV17,
          deps: [HttpClient, APP_BASE_HREF]
        }
      })
    ),
    {
      provide: APP_BASE_HREF,
      useValue: window.location.pathname.includes('contributions') ? '/contributions' : '/'
      // useValue: window.location.origin
    }
  ]
};