import { Component, OnInit, AfterViewInit, Inject, ChangeDetectorRef, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { loadStripe, Stripe, StripeElements, StripeCardNumberElement, StripeCardExpiryElement, StripeCardCvcElement } from '@stripe/stripe-js';
import { jwtDecode } from 'jwt-decode';
import { firstValueFrom } from 'rxjs';
import { TOKEN_STORAGE_GATEWAY, TokenStorageGateway } from '../../../../iam/infrastructure/storage/token-storage.gateway';
import { BillingCommandServiceImpl } from '../../../application/internal/commandservices/billing-command-service.impl';
import { createSubscriptionPaymentIntentCommand } from '../../../domain/model/commands/create-subscription-payment-intent.command';
import { createUserId } from '../../../domain/model/valueobjects/user-id.value-object';
import { environment } from '../../../../../environments/environment';

type AccessTokenPayload = {
  sub: string; // userId
  type: 'access' | 'refresh';
  jti: string;
  iat: number;
  exp: number;
};

@Component({
  selector: 'app-payment-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslatePipe],
  templateUrl: './payment-modal.component.html',
  styleUrl: './payment-modal.component.css'
})
export class PaymentModalComponent implements OnInit, AfterViewInit {
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  cardNumber: StripeCardNumberElement | null = null;
  cardExpiry: StripeCardExpiryElement | null = null;
  cardCvc: StripeCardCvcElement | null = null;

  fullName: string = '';
  addressLine: string = '';
  cardError: string | null = null;
  isProcessing: boolean = false;
  userId: string | null = null;

  private readonly translate = inject(TranslateService);

  constructor(
    public dialogRef: MatDialogRef<PaymentModalComponent>,
    @Inject(TOKEN_STORAGE_GATEWAY) private tokenStorage: TokenStorageGateway,
    private billingCommandService: BillingCommandServiceImpl,
    private snackBar: MatSnackBar,
    private cdr: ChangeDetectorRef
  ) { }

  async ngOnInit() {
    // Extract userId from JWT
    const token = this.tokenStorage.getAccessToken();
    if (token) {
      try {
        const payload = jwtDecode<AccessTokenPayload>(token);
        this.userId = payload.sub;
      } catch (e) {
        console.error('Error decoding token', e);
      }
    }

    if (!environment.stripePublicKey) {
      console.error('Stripe public key is missing in frontend config.');
      return;
    }

    this.stripe = await loadStripe(environment.stripePublicKey);
  }

  ngAfterViewInit() {
    this.setupStripeElements();
  }

  async setupStripeElements() {
    if (!this.stripe) {
      // Wait a bit if ngOnInit hasn't finished loading stripe yet
      setTimeout(() => this.setupStripeElements(), 100);
      return;
    }

    this.elements = this.stripe.elements();

    const elementStyles = {
      base: {
        color: '#ffffff',
        fontFamily: '"Inter", sans-serif',
        fontSize: '16px',
        '::placeholder': {
          color: '#757676',
        },
      },
      invalid: {
        color: '#ff5252',
        iconColor: '#ff5252',
      },
    };

    this.cardNumber = this.elements.create('cardNumber', { style: elementStyles });
    this.cardNumber.mount('#card-number-element');
    this.cardNumber.on('change', (event) => this.handleCardChange(event));

    this.cardExpiry = this.elements.create('cardExpiry', { style: elementStyles });
    this.cardExpiry.mount('#card-expiry-element');
    this.cardExpiry.on('change', (event) => this.handleCardChange(event));

    this.cardCvc = this.elements.create('cardCvc', { style: elementStyles });
    this.cardCvc.mount('#card-cvc-element');
    this.cardCvc.on('change', (event) => this.handleCardChange(event));
  }

  handleCardChange(event: any) {
    if (event.error) {
      this.cardError = event.error.message;
    } else {
      this.cardError = null;
    }
    this.cdr.detectChanges();
  }

  onCancel() {
    this.dialogRef.close();
  }

  async onAdd() {
    if (!this.stripe || !this.cardNumber) return;
    if (!this.userId) {
      this.cardError = this.translate.instant('paymentModal.error.userIdNotFound');
      return;
    }

    this.isProcessing = true;
    this.cardError = null;

    try {
      const data = await firstValueFrom(
        this.billingCommandService.handleCreateSubscriptionPaymentIntent(
          createSubscriptionPaymentIntentCommand(
            createUserId(this.userId),
            2990,
            'usd',
            window.location.origin + '/checkout-demo'
          )
        )
      );

      const result = await this.stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
          card: this.cardNumber,
          billing_details: {
            name: this.fullName,
            address: {
              line1: this.addressLine
            }
          }
        }
      });

      if (result.error) {
        this.cardError = result.error.message || this.translate.instant('paymentModal.error.paymentFailed');
      } else {
        this.snackBar.open(
          this.translate.instant('paymentModal.snackbar.success'),
          this.translate.instant('paymentModal.snackbar.close'),
          {
            duration: 5000,
            panelClass: ['subtle-snackbar']
          }
        );
        this.dialogRef.close(true);
      }
    } catch (error: any) {
      this.cardError = error.message || this.translate.instant('paymentModal.error.unexpected');
    } finally {
      this.isProcessing = false;
      this.cdr.detectChanges();
    }
  }
}
