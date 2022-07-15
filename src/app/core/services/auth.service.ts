import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {BehaviorSubject, Observable} from 'rxjs';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';
import {Path} from '../structs';


@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private activeUserDataSource = new BehaviorSubject<any>([]);
  activeUserData = this.activeUserDataSource.asObservable();


  constructor(
    private router: Router,
    private httpClient: HttpClient,
    private jwtHelperService: JwtHelperService,
  ) {
  }

  setActiveUser(data: any) {
    if (data) {
      this.activeUserDataSource.next(data);
    } else {
      this.activeUserDataSource.next(localStorage.getItem('user'));
    }
  }

  getActiveUser() {
    this.httpClient.get(Path.CurrentUserDetails).subscribe(data =>{
      this.activeUserDataSource.next(data);
    })
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken() && !!this.getRefreshToken(localStorage.getItem('refreshToken'));
  }

  getAccessToken(): any {
    return this.rememberMe()
      ? localStorage.getItem('Token')
      : sessionStorage.getItem('Token');
  }

  getRefreshToken(refreshToken: any): Observable<any> {
    const data = {
      refresh_token : refreshToken
    }
    return this.httpClient.post(Path.AuthToken, data);
  }

  setAccessToken(value: string, rememberMe = false): any {
    localStorage.setItem('rememberMe', rememberMe ? 'true' : 'false');
    if (rememberMe) {
      localStorage.setItem('Token', value);
    } else {
      sessionStorage.setItem('Token', value);
    }
    this.getUserInfo();
  }

  setRefreshToken(value: string) {
    if (this.rememberMe()) {
      localStorage.setItem('refreshToken', value);
    } else {
      sessionStorage.setItem('refreshToken', value);
    }
  }

  getUserInfo(): any {
    const token = this.getAccessToken();
    if (token) {
      const decodedToken = this.jwtHelperService.decodeToken(token);
      if (decodedToken) {
        return {
          id: decodedToken.user_id,
          groups: [decodedToken.role]
        };
      }
    }
    return;
  }

  logout(): void {
    const data = {
      refresh_token : localStorage.getItem('refreshToken')
    }
    this.httpClient.post(Path.Logout, data).subscribe(res => {
      localStorage.removeItem('rememberMe');
      localStorage.removeItem('Token');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      this.router.navigateByUrl('login').then(
      );
    }, error => {
      console.log(error);
    });
  }


  loginUser(data): Observable<any> {
    return this.httpClient.post(Path.Login, data);
  }

  sendPasswordResetEmail = (data): Observable<object> => {
    return this.httpClient.post(Path.ForgetPassword, data)
  }

  updatePassword(password) {
    return this.httpClient.post(Path.ChangePassword, password);
  }

  getUserDetail() {
    return this.httpClient.get(Path.CurrentUserDetails);
  }

  private rememberMe(): boolean {
    return localStorage.getItem('rememberMe') === 'true';
  }


  verifyPasswordResetConfirmationToken(queryParams){
    return this.httpClient.get(`users/verify-reset-token?${queryParams}`);
  }

  resetPasswordConfirmation(data){
    return this.httpClient.post(`users/reset-password`, data);
  }
}
