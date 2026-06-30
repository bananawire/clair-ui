import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { AlertSeverity } from '../../../domain/model/valueobjects/alert-severity.value-object';

@Component({
  selector: 'app-alert-severity-badge',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `<span class="badge" [class]="severity.toLowerCase()">{{ 'alertSeverity.' + severity.toLowerCase() | translate }}</span>`,
  styleUrl: './alert-severity-badge.component.css',
})
export class AlertSeverityBadgeComponent {
  @Input() severity!: AlertSeverity;
}
