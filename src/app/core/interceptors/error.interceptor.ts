import {Injectable} from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor, HttpErrorResponse, HttpHeaders, HttpResponse
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { ToastrService } from 'ngx-toastr';
import { catchError, finalize, mergeMap, tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';
import { environment } from '../../../environments/environment';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  private token: string;

  constructor(private toasterService: ToastrService, private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // @ts-ignore
    return next.handle(req).pipe(catchError(err => {

      if (err instanceof HttpErrorResponse && err.status === 401) {
        return this.handle401Error(req, next);
      }
      switch (err.status) {
        case 400:
          if (err.error !== undefined) {
            // console.log(err.error);
          } else {
            for (const key in err) {
              if (err.hasOwnProperty(key)) {
                this.toasterService.error(err[key]);
              }
            }
          }
          break;

        // case 401:
        //   this.toasterService.error('Your session is invalid, please login again!', 'User Unauthorized!');
        //   this.authService.logout();
        //   break;
        case 404:
          this.toasterService.error('404: URL Not Found..', 'Not Found!');
          break;

        case 405:
          this.toasterService.error('Requested method not allowed..', 'Not Allowed!');
          break;

        case 413:
          this.toasterService.error('File size too large..', 'File too large!');
          break;

        case 500:
          this.toasterService.error('Please contact the system Administrator or try again later..', 'Internal Server Error!');
          break;
      }
      // Handling err.error
      const allErrors = Object.assign(
        {},
        // @ts-ignore
        ...(function _flatten(o, n) {
          return [].concat(
            ...Object.keys(o).map(k =>
              // @ts-ignore
              typeof o[k] === 'object' ? _flatten(o[k], k) :
                {[n + ' ' + (k.match(/\d+/g) === null ? k : '')]: o[k]}
            )
          );
        })(err.error)
      );

      let msg = '';
      for (const [key, value] of Object.entries(allErrors)) {
        // msg += key + ': ' + value + '\n';
        msg += value + '\n';
      }

      if (msg !== '') {
        this.toasterService.error(msg.replace(/<[^>]*>?/gm, ''), 'Error', {
          // positionClass: 'toast-bottom-center'
        });
      } else {
        this.toasterService.error('An error occurred', '', {
          // positionClass: 'toast-bottom-center'
        });
      }
      return throwError(err);
    }));
  }


  // tslint:disable-next-line:typedef
  private handle401Error(request: HttpRequest<any>, next: HttpHandler) {
    return this.authService.requestRefreshToken().pipe(
      tap(
        () => {
        },
        (error) => {
          error.status === 401 ? this.authService.logout() : '';
        },
      ),
      mergeMap((res: any) => {
        let ok: string;
        // this.authService.setAccessToken(res.access, true);
        this.token = res.access;
        request = this.authorization(request);
        return next.handle(request).pipe(
          tap(
            (event: HttpEvent<any>) => ok = event instanceof HttpResponse ? 'succeeded' : '',
            (error: HttpErrorResponse) => error?.status === 401 ? this.authService.logout() : ''
          ),
          // Log when response observable either completes or errors
          finalize(() => {
            // const elapsed = Date.now() - started;
            // const msg = `${request.method} "${request.urlWithParams}" ${ok} in ${elapsed} ms.`;
          }));
      }));
  }

  authorization(request: HttpRequest<any>): HttpRequest<any> {
    return request.clone({
      url: environment.PROTOCOL + '//' + environment.API_HOST + request.url,
      headers: new HttpHeaders({
        Authorization: `Bearer ${this.token}`,
        // Accept: `application/json ; version= ${environment.VERSION}`
        Accept: `*/*`
      })
    });
  }
}

