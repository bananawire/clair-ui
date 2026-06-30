import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { AlertCardComponent } from '../alert-card/alert-card.component';
import { Alert } from '../../../domain/services/alert-query-service';

export type AlertViewMode = 'grid' | 'list';

@Component({
  selector: 'app-alert-list',
  standalone: true,
  imports: [CommonModule, TranslatePipe, MatButtonModule, MatIconModule, MatProgressSpinnerModule, AlertCardComponent],
  templateUrl: './alert-list.component.html',
  styleUrl: './alert-list.component.css',
})
export class AlertListComponent {
  @Input() alerts: readonly Alert[] | null = null;
  @Input() loading = false;
  @Input() error = '';
  @Input() viewMode: AlertViewMode = 'grid';

  @Output() viewModeChanged = new EventEmitter<AlertViewMode>();

  setViewMode(mode: AlertViewMode): void {
    this.viewModeChanged.emit(mode);
  }
}
