import { Injectable } from '@angular/core';
import { Observable, of, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AccessService {
  constructor() {}

  private authSubject = new Subject<boolean>();
  authState$ = this.authSubject.asObservable();
  _authenticated = false;

  get access() {
    if (typeof window !== 'undefined' && window.localStorage) {
      const access = localStorage.getItem('access');
      return access ? JSON.parse(access) : null;
    }
    return null;
  }

  set access(value: any) {
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('access', JSON.stringify(value));
    }
  }
}
