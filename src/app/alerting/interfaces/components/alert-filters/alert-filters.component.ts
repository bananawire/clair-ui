import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { AlertStatus, AlertStatuses } from '../../../domain/model/valueobjects/alert-status.value-object';
import { MetricType, MetricTypes } from '../../../domain/model/valueobjects/metric-type.value-object';

@Component({
  selector: 'app-alert-filters',
  standalone: true,
  imports: [CommonModule, TranslatePipe, FormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './alert-filters.component.html',
  styleUrl: './alert-filters.component.css',
})
export class AlertFiltersComponent {
  readonly statuses = AlertStatuses;
  readonly metrics = MetricTypes;

  @Input() selectedStatus: AlertStatus | 'ALL' = 'ALL';
  @Input() selectedMetric: MetricType | 'ALL' = 'ALL';

  @Output() statusChanged = new EventEmitter<AlertStatus | 'ALL'>();
  @Output() metricChanged = new EventEmitter<MetricType | 'ALL'>();

  onStatusChange(value: string): void {
    this.statusChanged.emit(value as AlertStatus | 'ALL');
  }

  onMetricChange(value: string): void {
    this.metricChanged.emit(value as MetricType | 'ALL');
  }
}
