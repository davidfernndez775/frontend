import { computed, inject, Injectable, signal } from '@angular/core';
import { environment } from '../../../environments/environments';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import {
  AuthStatus,
  CheckTokenResponse,
  LoginResponse,
  User,
} from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  // *variables internas del servicio
  // importamos la url del endpoint
  private readonly baseUrl: string = environment.baseUrl;
  // inyectamos el servicio http para las peticiones
  private http = inject(HttpClient);
  // variable para guardar el usuario actual, se recomienda usar null
  // en lugar de undefined
  private _currentUser = signal<User | null>(null);
  // variable para guardar el estado de autenticacion, se establece por defecto
  // checking porque es el estado al inicio de la aplicacion
  private _authStatus = signal<AuthStatus>(AuthStatus.checking);
  // *variables al mundo exterior
  // creamos una variable publica que tome el valor del usuario, se usa computed
  // para que su valor dependa exclusivamente de la variable privada. Nadie puede
  // redefinirla por su cuenta
  public currentUser = computed(() => this._currentUser());
  // mismo procedimiento con la variable authStatus
  public authStatus = computed(() => this._authStatus());

  constructor() {
    // invocamos el metodo en el mismo inicio
    this.checkAuthStatus().subscribe();
  }

  // *funcion para indicar que el usuario esta autenticado
  private setAuthetication(user: User, token: string): boolean {
    // cuando se asignen los valores automaticamente se sobreescriben las variables
    // privadas y luego las publicas, recordemos que ambas son signals
    this._currentUser.set(user);
    this._authStatus.set(AuthStatus.authenticated);
    // guardamos el token
    localStorage.setItem('token', token);
    return true;
  }

  // *funcion para el login
  login(email: string, password: string): Observable<boolean> {
    const url = `${this.baseUrl}/auth/login`;
    const body = { email: email, password: password };
    return this.http.post<LoginResponse>(url, body).pipe(
      // si todo esta bien se invoca la funcion de autenticacion
      map(({ user, token }) => this.setAuthetication(user, token)),
      // sino devuelve el mensaje de error
      catchError((err) => throwError(() => err.error.message))
    );
  }
  // *funcion para chequear la validez del token
  checkAuthStatus(): Observable<boolean> {
    // definimos el endpoint en el backend para hacer la comprobacion
    const url = `${this.baseUrl}/auth/check-token`;
    // obtenemos el token almacenado en el local storage, se usa el if porque
    // use side server rendering

    const token = localStorage.getItem('token');
    // comprobamos que exista un token en el local storage
    if (!token) {
      this._authStatus.set(AuthStatus.notAuthenticated);
      return of(false);
    }

    // si existe enviamos el token al backend, recordar que el token
    // viaja en los headers de la peticion
    const headers = new HttpHeaders().set('Authorization', `Bearer ${token}`);
    return this.http.get<CheckTokenResponse>(url, { headers }).pipe(
      // si todo esta bien invocamos la funcion de autenticacion
      map(({ token, user }) => this.setAuthetication(user, token)),
      // si hay un error
      catchError(() => {
        // indicamos que el usuario no esta autenticado
        this._authStatus.set(AuthStatus.notAuthenticated);
        return of(false);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this._currentUser.set(null);
    this._authStatus.set(AuthStatus.notAuthenticated);
  }
}
