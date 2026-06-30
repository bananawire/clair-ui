import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AUTH_COMMAND_SERVICE, AuthCommandService } from '../../../domain/services/auth-command-service';
import { createVerificationCode } from '../../../domain/model/valueobjects/verification-code.value-object';
import { createConfirmRegistrationCommand } from '../../../domain/model/commands/confirm-registration.command';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-confirm-page',
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
    MatSnackBarModule,
    RouterLink,
    TranslatePipe,
  ],
  templateUrl: './confirm-page.component.html',
  styleUrl: './confirm-page.component.css',
})
export class ConfirmPageComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authCommandService = inject(AUTH_COMMAND_SERVICE) as AuthCommandService;
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  confirmForm: FormGroup = this.fb.group({
    code: ['', [Validators.required, Validators.pattern('^[A-Z0-9]{4}-[A-Z0-9]{4}$')]],
  });

  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  sessionId: string | null = null;

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('sessionId');
    if (!this.sessionId) {
      this.errorMessage = this.translate.instant('confirm.error.invalidSession');
      this.snackBar.open(this.errorMessage!, this.translate.instant('confirm.snackbar.close'), { duration: 4000 });
    }
  }

  onSubmit(): void {
    if (this.confirmForm.invalid || !this.sessionId) {
      this.confirmForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { code } = this.confirmForm.value;

    try {
      const codeVo = createVerificationCode(code);
      const command = createConfirmRegistrationCommand(this.sessionId, codeVo);

      this.authCommandService.handleConfirmRegistration(command).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.loading = false;
          this.successMessage = this.translate.instant('confirm.success');
          this.snackBar.open(this.successMessage!, this.translate.instant('confirm.snackbar.close'), { duration: 2500 });
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, 1500);
        },
        error: (err) => {
          this.loading = false;
          this.errorMessage = err?.error?.message || this.translate.instant('confirm.error.invalidCode');
          this.snackBar.open(this.errorMessage ?? this.translate.instant('confirm.error.invalidCode'), this.translate.instant('confirm.snackbar.close'), { duration: 4000 });
        },
      });
    } catch (err: any) {
      this.loading = false;
      this.errorMessage = err.message || this.translate.instant('confirm.validationError');
      this.snackBar.open(this.errorMessage ?? this.translate.instant('confirm.validationError'), this.translate.instant('confirm.snackbar.close'), { duration: 4000 });
    }
  }
}
