import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';

import { HttpAuthInterceptor } from './interceptors/http-auth.interceptor';
import { HttpErrorInterceptor } from './interceptors/http-error.interceptor';

// Singleton services, guards, interceptors, and constants only — no
// component declarations (frontend-constitution.md Section 2.2). Imported
// exactly once, in AppModule. Interceptor order matters: HttpAuthInterceptor
// must run first (attaches headers) so HttpErrorInterceptor sees the
// fully-formed request when it runs second.
@NgModule({
  imports: [CommonModule, HttpClientModule],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: HttpAuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: HttpErrorInterceptor, multi: true },
  ],
})
export class CoreModule {
  constructor(@Optional() @SkipSelf() parentModule: CoreModule) {
    if (parentModule) {
      throw new Error('CoreModule is already loaded. Import it only in AppModule.');
    }
  }
}
