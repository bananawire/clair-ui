import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertStatus } from '../../../domain/model/valueobjects/alert-status.value-object';

@Component({
  selector: 'app-alert-status-badge',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `<span class="badge" [style.backgroundColor]="resolveColor(status)">{{ 'alertStatus.' + status.toLowerCase() | translate }}</span>`,
  styleUrl: './alert-status-badge.component.css',
})
export class AlertStatusBadgeComponent {
  @Input() status!: AlertStatus;

  resolveColor(status: AlertStatus): string {
    switch (status) {
      case 'ACTIVE': return '#10b981';
      case 'ACKNOWLEDGED': return '#f59e0b';
      case 'RESOLVED': return '#6b7280';
      default: return '#6b7280';
    }
  }
}
