import { Component, Inject, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { catchError, map, Observable, of, startWith } from 'rxjs';
import { AqiCardComponent } from '../../components/aqi-card/aqi-card.component';
import { OrganizationCardComponent } from '../../components/organization-card/organization-card.component';
import { PollutantCardComponent } from '../../components/pollutant-card/pollutant-card.component';
import { AlertsCardComponent } from '../../components/alerts-card/alerts-card.component';
import {
  ANALYTICS_CONTEXT_FACADE,
  AnalyticsContextFacade,
} from '../../acl/analytics-context-facade';
import {
  analyticsOverviewSnapshotToOverviewMeasurements,
  OverviewMeasurements,
} from '../../rest/transform/analytics.transform';
import { NinoAlertService, NinoAlertResponse } from '../../../../analytics/application/internal/services/nino-alert.service';

@Component({
  selector: 'app-overview-page',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    AqiCardComponent,
    OrganizationCardComponent,
    PollutantCardComponent,
    AlertsCardComponent,
  ],
  templateUrl: './overview-page.component.html',
  styleUrl: './overview-page.component.css',
})
export class OverviewPageComponent {
  readonly viewState$: Observable<{
    status: 'loading' | 'success' | 'empty' | 'error';
    measurements: OverviewMeasurements | null;
  }>;

  private readonly ninoAlertService = inject(NinoAlertService);

  readonly ninoScenario = {
    humidity: 85,
    temperature: 30,
    riskLevel: 'ALTO',
    riskScore: 82,
  };

  isGeneratingAlert = false;
  ninoAlert: NinoAlertResponse | null = null;

  constructor(
    @Inject(ANALYTICS_CONTEXT_FACADE)
    private readonly analyticsContextFacade: AnalyticsContextFacade,
  ) {
    this.viewState$ = this.analyticsContextFacade.getOverviewDashboard().pipe(
      map(analyticsOverviewSnapshotToOverviewMeasurements),
      map((measurements) =>
        measurements
          ? ({ status: 'success' as const, measurements })
          : ({ status: 'empty' as const, measurements: null }),
      ),
      startWith({ status: 'loading' as const, measurements: null }),
      catchError(() => of({ status: 'error' as const, measurements: null })),
    );
  }

  generateNinoAlert(): void {
    if (this.isGeneratingAlert) return;
    this.isGeneratingAlert = true;

    this.ninoAlertService.generateAlert(this.ninoScenario).subscribe({
      next: (response) => {
        this.ninoAlert = response;
        this.isGeneratingAlert = false;
      },
      error: () => {
        this.isGeneratingAlert = false;
      },
    });
  }
}
