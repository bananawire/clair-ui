import { Component, DestroyRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AUTH_COMMAND_SERVICE, AuthCommandService } from '../../../domain/services/auth-command-service';
import { TOKEN_STORAGE_GATEWAY } from '../../../infrastructure/storage/token-storage.gateway';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NOTIFICATIONS_CONTEXT_FACADE,
  NotificationsContextFacade,
} from '../../../../notifications/interfaces/acl/notifications-context-facade';
import { LanguageService, SupportedLanguage } from '../../../../shared/interfaces/services/language.service';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatFormFieldModule,
    MatSelectModule,
    TranslatePipe,
  ],
  templateUrl: './settings-page.component.html',
  styleUrl: './settings-page.component.css',
})
export class SettingsPageComponent {
  private readonly router = inject(Router);
  private readonly authCommandService = inject(AUTH_COMMAND_SERVICE) as AuthCommandService;
  private readonly tokenStorage = inject(TOKEN_STORAGE_GATEWAY);
  private readonly snackBar = inject(MatSnackBar);
  private readonly notificationsContextFacade = inject(NOTIFICATIONS_CONTEXT_FACADE) as NotificationsContextFacade;
  private readonly destroyRef = inject(DestroyRef);
  private readonly languageService = inject(LanguageService);
  private readonly translate = inject(TranslateService);

  isLoggingOut = false;
  statusMessage = '';
  currentLanguage: SupportedLanguage = this.languageService.getCurrentLanguage();

  onLanguageChange(language: SupportedLanguage): void {
    this.languageService.setLanguage(language);
    this.currentLanguage = language;
  }

  logout(): void {
    if (this.isLoggingOut) return;
    this.isLoggingOut = true;
    this.statusMessage = '';

    this.authCommandService.handleSignOut().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.clearSessionAndNavigate(this.translate.instant('settings.snackbar.sessionClosed')),
      error: () => this.clearSessionAndNavigate(this.translate.instant('settings.snackbar.sessionClosedLocal')),
    });
  }

  private clearSessionAndNavigate(message: string): void {
    this.notificationsContextFacade.logoutUser();
    this.tokenStorage.clearTokens();
    this.statusMessage = message;
    this.isLoggingOut = false;
    this.snackBar.open(message, this.translate.instant('settings.snackbar.close'), { duration: 3000 });
    this.router.navigate(['/login']);
  }
}
