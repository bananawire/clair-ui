import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Alert } from '../../../domain/services/alert-query-service';
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
    switch (metric) {
      case 'PM25': return 'cloud';
      case 'CO2': return 'co2'; // material no tiene co2, fallback later
      case 'TEMPERATURE': return 'thermostat';
      case 'HUMIDITY': return 'water_drop';
      default: return 'sensors';
    }
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleString();
  }
}
