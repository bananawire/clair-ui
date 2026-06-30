import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ClairLogoComponent } from '../../components/icons/clair-logo/clair-logo.component';
import { GoogleIconComponent } from '../../components/icons/google/google-icon.component';
import { AUTH_COMMAND_SERVICE, AuthCommandService } from '../../../domain/services/auth-command-service';
import { createEmail } from '../../../domain/model/valueobjects/email.value-object';
import { createPassword } from '../../../domain/model/valueobjects/password.value-object';
import { createSignInCommand } from '../../../domain/model/commands/sign-in.command';
import { TokenStorageGateway, TOKEN_STORAGE_GATEWAY } from '../../../infrastructure/storage/token-storage.gateway';
import { jwtDecode } from 'jwt-decode';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NOTIFICATIONS_CONTEXT_FACADE,
  NotificationsContextFacade,
} from '../../../../notifications/interfaces/acl/notifications-context-facade';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatSnackBarModule,
    RouterLink,
    ClairLogoComponent,
    GoogleIconComponent,
    TranslatePipe,
  ],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css',
})
export class LoginPageComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authCommandService = inject(AUTH_COMMAND_SERVICE) as AuthCommandService;
  private readonly tokenStorage = inject(TOKEN_STORAGE_GATEWAY);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly notificationsContextFacade = inject(NOTIFICATIONS_CONTEXT_FACADE) as NotificationsContextFacade;
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  loginForm: FormGroup = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(8)]],
  });

  loading = false;
  errorMessage: string | null = null;
  hidePassword = true;

  onGoogleSignIn(): void {
    const authorizeUrl = this.authCommandService.getGoogleAuthorizeUrl();
    window.location.href = authorizeUrl;
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;

    const { email, password } = this.loginForm.value;

    try {
      const emailVo = createEmail(email);
      const passwordVo = createPassword(password);
      const command = createSignInCommand(emailVo, passwordVo);

      console.log('[Login] Sending sign-in request...', { email });

      this.authCommandService.handleSignIn(command).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: (result) => {
          console.log('[Login] Success');
          this.loading = false;
          const token = result.accessToken.value;
          this.tokenStorage.setTokens(token, result.refreshToken.value);

          try {
            const payload = jwtDecode<{ sub: string }>(token);
            if (payload && payload.sub) {
              this.notificationsContextFacade.loginUser(payload.sub);
              this.notificationsContextFacade.requestPermission();
            }
          } catch (e) {
            console.error('[Login] Error decoding token for OneSignal:', e);
          }

          this.snackBar.open(this.translate.instant('login.snackbar.success'), this.translate.instant('login.snackbar.close'), { duration: 2500 });
          this.router.navigate(['/']);
        },
        error: (err) => {
          console.error('[Login] Error:', err);
          this.loading = false;
          if (err.status === 401) {
            this.errorMessage = this.translate.instant('login.error.invalidCredentials');
          } else if (err.status === 0) {
            this.errorMessage = this.translate.instant('login.error.cannotConnect');
          } else {
            this.errorMessage = err?.error?.message || this.translate.instant('login.error.unexpected');
          }

          if (this.errorMessage) {
            this.snackBar.open(this.errorMessage, this.translate.instant('login.snackbar.close'), { duration: 4000 });
          }
        },
      });
    } catch (err: any) {
      console.error('[Login] Validation error:', err);
      this.loading = false;
      this.errorMessage = err.message || this.translate.instant('login.validationError');
    }
  }

}
