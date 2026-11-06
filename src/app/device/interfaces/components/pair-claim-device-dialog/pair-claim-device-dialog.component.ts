import { Component, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TranslatePipe } from '@ngx-translate/core';
import { Subject } from 'rxjs';

export type PairClaimDeviceDialogData = Readonly<{
  autoClaimEnabled: boolean;
  initialHardwareId?: string | null;
  initialClaimToken?: string | null;
  startStep?: 'pair' | 'claim';
}>;

export type PairClaimDeviceDialogResult = Readonly<{
  claimed: boolean;
  claimToken: string | null;
  hardwareId: string | null;
}>;

export type PairClaimWizardStep = 'pair' | 'claim';

export type PairClaimDialogRequest =
  | Readonly<{ type: 'pair'; hardwareId: string }>
  | Readonly<{ type: 'claim'; claimToken: string }>;

@Component({
  selector: 'app-pair-claim-device-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    TranslatePipe,
  ],
  templateUrl: './pair-claim-device-dialog.component.html',
  styleUrl: './pair-claim-device-dialog.component.css',
})
export class PairClaimDeviceDialogComponent implements OnDestroy {
  private readonly dialogRef = inject(
    MatDialogRef<PairClaimDeviceDialogComponent, PairClaimDeviceDialogResult | undefined>
  );
  private readonly fb = inject(FormBuilder);
  readonly data: PairClaimDeviceDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? {
    autoClaimEnabled: false,
  };

  readonly requests$ = new Subject<PairClaimDialogRequest>();

  step: PairClaimWizardStep = this.data.startStep === 'claim' ? 'claim' : 'pair';
  busy = false;
  errorMessage: string | null = null;
  claimToken: string | null = this.normalizeToken(this.data.initialClaimToken ?? null);
  pairedHardwareId: string | null = this.data.initialHardwareId ?? null;

  pairForm: FormGroup = this.fb.group({
    hardwareId: [
      this.data.initialHardwareId ?? '',
      [Validators.required, Validators.pattern(/^(CLAIR-[0-9A-Za-z]{4}|HW-\d{4})$/)],
    ],
  });

  claimForm: FormGroup = this.fb.group({
    claimToken: [
      this.claimToken ?? '',
      [
        Validators.required,
        // Accept mixed case; submitClaim/onClaimTokenInput normalize to uppercase.
        Validators.pattern(/(^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$)|(^[A-Za-z0-9_-]{20,}$)/),
      ],
    ],
  });

  get titleKey(): string {
    return this.step === 'pair' ? 'pairClaimDeviceDialog.pairTitle' : 'pairClaimDeviceDialog.claimTitle';
  }

  get descriptionKey(): string {
    return this.step === 'pair'
      ? 'pairClaimDeviceDialog.pairDescription'
      : 'pairClaimDeviceDialog.claimDescription';
  }

  ngOnDestroy(): void {
    this.requests$.complete();
  }

  submitPair(): void {
    if (this.busy || this.pairForm.invalid) return;
    this.errorMessage = null;
    this.busy = true;
    this.requests$.next({
      type: 'pair',
      hardwareId: String(this.pairForm.value.hardwareId),
    });
  }

  submitClaim(): void {
    if (this.busy || this.claimForm.invalid) return;
    this.errorMessage = null;
    const token = this.normalizeToken(String(this.claimForm.value.claimToken ?? '')) ?? '';
    this.claimForm.patchValue({ claimToken: token }, { emitEvent: false });
    this.busy = true;
    this.requests$.next({
      type: 'claim',
      claimToken: token,
    });
  }

  onClaimTokenInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    if (input.value !== upper) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      this.claimForm.patchValue({ claimToken: upper }, { emitEvent: false });
      queueMicrotask(() => {
        input.setSelectionRange(start, end);
      });
    }
  }

  cancel(): void {
    if (this.busy) return;
    this.dialogRef.close(undefined);
  }

  showClaimStep(params: Readonly<{ claimToken: string | null; hardwareId: string }>): void {
    this.busy = false;
    this.errorMessage = null;
    this.pairedHardwareId = params.hardwareId;
    this.claimToken = this.normalizeToken(params.claimToken);
    this.step = 'claim';
    this.claimForm.reset({ claimToken: this.claimToken ?? '' });
  }

  setBusy(busy: boolean): void {
    this.busy = busy;
  }

  setError(message: string | null): void {
    this.errorMessage = message;
    this.busy = false;
  }

  completeSuccessfully(claimToken: string): void {
    this.busy = false;
    this.dialogRef.close({
      claimed: true,
      claimToken,
      hardwareId: this.pairedHardwareId,
    });
  }

  private normalizeToken(value: string | null): string | null {
    if (value == null) return null;
    const normalized = value.trim().toUpperCase();
    return normalized.length === 0 ? null : normalized;
  }
}
