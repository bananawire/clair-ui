import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { TranslatePipe } from '@ngx-translate/core';

export type ClaimDeviceDialogResult = Readonly<{
  claimToken: string;
}>;

@Component({
  selector: 'app-claim-device-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule, MatButtonModule, TranslatePipe],
  templateUrl: './claim-device-dialog.component.html',
  styleUrl: './claim-device-dialog.component.css',
})
export class ClaimDeviceDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ClaimDeviceDialogComponent, ClaimDeviceDialogResult | undefined>);
  private readonly fb = inject(FormBuilder);

  form: FormGroup = this.fb.group({
    claimToken: [
      '',
      [
        Validators.required,
        // Accept mixed case; submit/onClaimTokenInput normalize to uppercase.
        Validators.pattern(/(^[A-Za-z0-9]{4}-[A-Za-z0-9]{4}$)|(^[A-Za-z0-9_-]{20,}$)/),
      ],
    ],
  });

  submit(): void {
    if (this.form.invalid) return;
    const claimToken = String(this.form.value.claimToken ?? '').trim().toUpperCase();
    this.dialogRef.close({
      claimToken,
    });
  }

  onClaimTokenInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const upper = input.value.toUpperCase();
    if (input.value !== upper) {
      const start = input.selectionStart;
      const end = input.selectionEnd;
      this.form.patchValue({ claimToken: upper }, { emitEvent: false });
      queueMicrotask(() => input.setSelectionRange(start, end));
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }
}
