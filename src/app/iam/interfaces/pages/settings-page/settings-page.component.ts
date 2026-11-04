import { ChangeDetectorRef, Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { jwtDecode } from 'jwt-decode';
import { AUTH_COMMAND_SERVICE, AuthCommandService } from '../../../domain/services/auth-command-service';
import { AUTH_QUERY_SERVICE, AuthQueryService } from '../../../domain/services/auth-query-service';
import { TOKEN_STORAGE_GATEWAY } from '../../../infrastructure/storage/token-storage.gateway';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  NOTIFICATIONS_CONTEXT_FACADE,
  NotificationsContextFacade,
} from '../../../../notifications/interfaces/acl/notifications-context-facade';
import { LanguageService, SupportedLanguage } from '../../../../shared/interfaces/services/language.service';
import { Theme, ThemeService } from '../../../../shared/interfaces/services/theme.service';
import { BillingQueryServiceImpl } from '../../../../billing/application/internal/queryservices/billing-query-service.impl';
import { createUserId } from '../../../../billing/domain/model/valueobjects/user-id.value-object';
import { createGetUserPlanQuery } from '../../../../billing/domain/model/queries/get-user-plan.query';

@Component({
  selector: 'app-settings-page',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
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
export class SettingsPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly authCommandService = inject(AUTH_COMMAND_SERVICE) as AuthCommandService;
  private readonly authQueryService = inject(AUTH_QUERY_SERVICE) as AuthQueryService;
  private readonly tokenStorage = inject(TOKEN_STORAGE_GATEWAY);
  private readonly snackBar = inject(MatSnackBar);
  private readonly notificationsContextFacade = inject(NOTIFICATIONS_CONTEXT_FACADE) as NotificationsContextFacade;
  private readonly billingQueryService = inject(BillingQueryServiceImpl);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);
  private readonly translate = inject(TranslateService);

  readonly theme = this.themeService.theme;

  isLoggingOut = false;
  statusMessage = '';
  // The stored choice is ready before ngx-translate finishes loading it, so prefer it on a fresh reload.
  currentLanguage: SupportedLanguage = this.languageService.getStoredLanguage() ?? this.languageService.getCurrentLanguage();

  email: string | null = null;
  plan: 'FREEMIUM' | 'PREMIUM' | null = null;

  ngOnInit(): void {
    this.loadProfile();
  }

  setTheme(theme: Theme): void {
    if (this.theme() !== theme) {
      this.themeService.toggle();
    }
  }

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

  private loadProfile(): void {
    this.authQueryService.handleVerifyToken().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (metadata) => {
        this.email = metadata.email;
        this.cdr.markForCheck();
      },
      error: () => {
        this.email = null;
      },
    });

    const token = this.tokenStorage.getAccessToken();
    if (!token) return;
    try {
      const userId = jwtDecode<{ sub: string }>(token).sub;
      if (!userId) return;
      this.billingQueryService
        .handleGetUserPlan(createGetUserPlanQuery(createUserId(userId)))
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (userPlan) => {
            this.plan = userPlan.plan === 'PREMIUM' ? 'PREMIUM' : 'FREEMIUM';
            this.cdr.markForCheck();
          },
          error: (err) => console.error('[SettingsPage] Failed to get user plan', err),
        });
    } catch (e) {
      console.error('[SettingsPage] Error decoding token', e);
    }
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
