import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Alert } from '../../../domain/services/alert-query-service';
import { metricTypeIcon } from '../../../domain/model/valueobjects/metric-type.value-object';
import { AlertStatusBadgeComponent } from '../alert-status-badge/alert-status-badge.component';

@Component({
  selector: 'app-alert-card',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatCardModule, MatIconModule, MatButtonModule, AlertStatusBadgeComponent],
  templateUrl: './alert-card.component.html',
  styleUrl: './alert-card.component.css',
})
export class AlertCardComponent {
  @Input() alert!: Alert;

  statusColor(status: Alert['status']): string {
    switch (status) {
      case 'ACTIVE': return '#ef4444';
      case 'ACKNOWLEDGED': return '#f59e0b';
      case 'RESOLVED': return '#10b981';
      default: return '#6b7280';
    }
  }

  metricIcon(metric: Alert['metric']): string {
    return metricTypeIcon(metric);
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }
}
