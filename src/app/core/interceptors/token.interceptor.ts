import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpResponse, HttpErrorResponse
} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AccountService} from '../services/accounts/account.service';
import {ContentTypeEnum} from '../structs/content-type.enum';
import {environment} from '../../../environments/environment';
import {tap} from 'rxjs/operators';
import {Router} from '@angular/router';
import {Path} from '../structs';
import {LoaderService} from "../../shared/services/loader.service";

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private accountService: AccountService,
              private router: Router,
              private loaderService:LoaderService
  ) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.accountService.getToken();
    this.loaderService.isLoading.next(true);
    if (token) {
      request = request.clone({
        setHeaders: {
          'Content-Type': ContentTypeEnum.ApplicationJson,
          Authorization: `${environment.tokenKey} ${token}`,
          'Content-Security-Policy': `frame-ancestors ${environment.security.allowedOrigins}`,
          'X-Frame-Options': `ALLOW-FROM ${environment.security.allowedOrigins}`,
          'X-XSS-Protection': '1; mode=block'
        }
      });
    }
    return next.handle(request).pipe(
      tap(
        event => {
          if (event instanceof HttpResponse) {
            console.log('Api Call Success');
            this.loaderService.isLoading.next(false);
          }
        },
        error => {
          if (error instanceof HttpErrorResponse) {
            if ([401, 403].includes(error.status)) {
              this.accountService.logout();
              this.router.navigateByUrl(Path.Login);
              console.error(error.error);
            }
            if (error) {
              const message = error.error;
              console.error(message);
              this.loaderService.isLoading.next(false);
            }
          }
        }
      )
    );
  }
}
