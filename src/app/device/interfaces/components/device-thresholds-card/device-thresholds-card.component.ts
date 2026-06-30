import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { DeviceTelemetrySnapshot } from '../../../application/internal/outboundservices/acl/external-telemetry-evaluation.service';
import { DeviceThreshold } from '../../../domain/services/device-threshold-query-service';
import { MetricThreshold, getMetricThresholdDetails, METRIC_THRESHOLDS } from '../../../domain/model/valueobjects/metric-threshold.value-object';

@Component({
  selector: 'app-device-thresholds-card',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    TranslatePipe,
  ],
  templateUrl: './device-thresholds-card.component.html',
  styleUrl: './device-thresholds-card.component.css',
})
export class DeviceThresholdsCardComponent {
  private readonly translate = inject(TranslateService);

  @Input() deviceId: string = '';
  @Input() telemetry: DeviceTelemetrySnapshot | null = null;
  @Input() thresholds: readonly DeviceThreshold[] | null = null;
  @Output() editRequested = new EventEmitter<void>();

  readonly metrics = METRIC_THRESHOLDS;
  readonly metricDetails = getMetricThresholdDetails;

  getMetricTranslationKey(metric: MetricThreshold): string {
    switch (metric) {
      case 'PM25': return 'pm25';
      case 'CO2': return 'co2';
      case 'TEMPERATURE': return 'temperature';
      case 'HUMIDITY': return 'humidity';
    }
  }

  thresholdFor(metric: MetricThreshold): DeviceThreshold | null {
    const thresholds = this.thresholds ?? [];
    return thresholds.find((t) => t.metric === metric) ?? null;
  }

  editThresholds(): void {
    this.editRequested.emit();
  }
}
