import { Component, computed, effect, inject } from '@angular/core';
import { AuthService } from './auth/services/auth-service.service';
import { Router } from '@angular/router';
import { AuthStatus } from './auth/interfaces';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
})
export class AppComponent {
  // como todos los componentes pasan a traves del app.component
  // se puede llamar aqui la funcion de autenticacion
  private authService = inject(AuthService);
  private router = inject(Router);

  // variable para determinar cuando termina un chequeo de autenticacion
  public finishAuthCheck = computed<boolean>(() => {
    // si todavia no ha terminado el chequeo devuelve false
    if (this.authService.authStatus() === AuthStatus.checking) return false;
    // si ya termino el chequeo
    return true;
  });

  public authStatusChangedEffect = effect(() => {
    // se dispara el efecto cada vez que cambia el status de autenticacion
    switch (this.authService.authStatus()) {
      case AuthStatus.checking:
        console.log('checking');
        return;
      case AuthStatus.authenticated:
        console.log('authenticated');
        this.router.navigateByUrl('/dashboard');
        return;
      case AuthStatus.notAuthenticated:
        console.log('not authenticated');
        this.router.navigateByUrl('/auth');
        return;
    }
  });
}
