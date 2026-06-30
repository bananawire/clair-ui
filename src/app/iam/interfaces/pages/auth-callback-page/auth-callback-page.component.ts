import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { TokenStorageGateway, TOKEN_STORAGE_GATEWAY } from '../../../infrastructure/storage/token-storage.gateway';
import { jwtDecode } from 'jwt-decode';
import {
  NOTIFICATIONS_CONTEXT_FACADE,
  NotificationsContextFacade,
} from '../../../../notifications/interfaces/acl/notifications-context-facade';

@Component({
  selector: 'app-auth-callback-page',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule, MatSnackBarModule, RouterLink, TranslatePipe],
  templateUrl: './auth-callback-page.component.html',
  styleUrl: './auth-callback-page.component.css',
})
export class AuthCallbackPageComponent {
  private readonly router = inject(Router);
  private readonly tokenStorage = inject(TOKEN_STORAGE_GATEWAY);
  private readonly snackBar = inject(MatSnackBar);
  private readonly notificationsContextFacade = inject(NOTIFICATIONS_CONTEXT_FACADE) as NotificationsContextFacade;
  private readonly translate = inject(TranslateService);

  errorMessage: string | null = null;

  constructor() {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const refreshToken = params.get('refreshToken');
    const reason = params.get('reason');

    if (reason === 'google_oauth_failed') {
      this.errorMessage = this.translate.instant('authCallback.error.googleFailed');
      this.snackBar.open(this.errorMessage!, this.translate.instant('authCallback.snackbar.close'), { duration: 4000 });
      return;
    }

    if (token && refreshToken) {
      this.tokenStorage.setTokens(token, refreshToken);

      try {
        const payload = jwtDecode<{ sub: string }>(token);
        if (payload && payload.sub) {
          this.notificationsContextFacade.loginUser(payload.sub);
          this.notificationsContextFacade.requestPermission();
        }
      } catch (e) {
        console.error('[AuthCallback] Error decoding token for OneSignal:', e);
      }

      this.snackBar.open(this.translate.instant('authCallback.snackbar.success'), this.translate.instant('authCallback.snackbar.close'), { duration: 2000 });
      this.router.navigate(['/overview']);
    } else {
      this.errorMessage = this.translate.instant('authCallback.error.missingTokens');
      this.snackBar.open(this.errorMessage!, this.translate.instant('authCallback.snackbar.close'), { duration: 4000 });
    }
  }
}
