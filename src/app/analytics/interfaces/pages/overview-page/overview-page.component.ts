import { Component, Inject } from '@angular/core';
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
}
