import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthInterceptor } from './core/interceptors/auth.interceptor';
import { ErrorInterceptor } from './core/interceptors/error.interceptor';
import { SharedModule } from './shared/shared.module';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    // ShellComponent is instantiated at the top-level route ('' with no loadChildren),
    // i.e. in the root injector - but it's declared in SharedModule, which is otherwise
    // only imported by the lazy feature modules (each gets its own child injector). That
    // left every Material/CDK provider ShellComponent's template needs (MatSnackBar for
    // ErrorInterceptor, MatMenuModule's scroll-strategy token, etc.) unresolvable from
    // root. Importing SharedModule here eagerly merges all of it into the root injector.
    SharedModule
  ],
  providers: [
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
    { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
