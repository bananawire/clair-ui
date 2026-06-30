import { Component } from '@angular/core';
import { Location } from '@angular/common';
import { MatDialog } from '@angular/material/dialog';
import { PaymentModalComponent } from '../../components/payment-modal/payment-modal.component';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-premium-checkout',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './premium-checkout.component.html',
  styleUrl: './premium-checkout.component.css'
})
export class PremiumCheckoutComponent {
  autorenewDate: string;

  constructor(private location: Location, private dialog: MatDialog) {
    const date = new Date();
    date.setDate(date.getDate() + 20);
    this.autorenewDate = date.toLocaleDateString('en-GB'); // dd/mm/yyyy format
  }

  goBack() {
    this.location.back();
  }

  onPress() {
    this.dialog.open(PaymentModalComponent, {
      width: '400px',
      panelClass: 'custom-dialog-container',
      disableClose: true
    });
  }
}
