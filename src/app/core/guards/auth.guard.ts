import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {ToastrService} from 'ngx-toastr';
import {Path} from '../structs';
import * as path from "path";

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  private token: any;

  constructor(private router: Router, private toastr: ToastrService) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    this.token = localStorage.getItem('Token');
    if (this.token) {
      return true;
    } else {
      this.router.navigate([Path.Login], {queryParams: {returnUrl: state.url}}).then(r => {});
      localStorage.clear();
      return false;
    }
  }

}
