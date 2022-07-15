import {Injectable} from '@angular/core';
import {environment} from "../../../../environments/environment";

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor() {
  }

  getToken(): string {
    const token = localStorage.getItem(environment.tokenKey);
    return token ? token : '';
  }

  logout(): void {
    localStorage.removeItem(environment.tokenKey);
  }
}
