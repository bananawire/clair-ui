import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIconModule } from '@angular/material/icon';
import { Alert } from '../../../domain/services/alert-query-service';
import { AlertSeverityBadgeComponent } from '../alert-severity-badge/alert-severity-badge.component';
import { AlertStatusBadgeComponent } from '../alert-status-badge/alert-status-badge.component';

@Component({
  selector: 'app-alert-table',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatIconModule, AlertSeverityBadgeComponent, AlertStatusBadgeComponent],
  templateUrl: './alert-table.component.html',
  styleUrl: './alert-table.component.css',
})
export class AlertTableComponent {
  @Input() alerts: readonly Alert[] | null = null;
  @Input() loading = false;

  formatTime(iso: string): string {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  }

  shortId(uuid: string): string {
    return uuid.slice(-4);
  }

  displayDevice(alert: Alert): string {
    const name = (alert.deviceName ?? '').trim();
    if (name.length > 0) return name;
    return this.shortId(alert.id.value);
  }
}
