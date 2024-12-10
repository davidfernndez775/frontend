import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service.service';
import { inject } from '@angular/core';
import { AuthStatus } from '../interfaces';

export const isAuthenticatedGuard: CanActivateFn = (route, state) => {
  // inyectamos el servicio
  const authService = inject(AuthService);
  const router = inject(Router);
  // chequeamos el status
  if (authService.authStatus() === AuthStatus.authenticated) return true;
  // if (authService.authStatus() === AuthStatus.checking) return false;

  // si no esta autenticado retorna al usuario a la pantalla de login y
  // regresa un false
  router.navigateByUrl('/auth');
  return false;
};
