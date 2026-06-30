import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { DailyAlertCount } from '../../../domain/services/alert-query-service';

@Component({
  selector: 'app-alert-daily-chart',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './alert-daily-chart.component.html',
  styleUrl: './alert-daily-chart.component.css',
})
export class AlertDailyChartComponent {
  @Input() data: DailyAlertCount[] | null = null;

  readonly daysToShow = 30;

  get chartBars(): { label: string; heightPct: number; color: string }[] {
    const days = this.buildLastNDays(this.daysToShow);
    const countsByDate = new Map((this.data ?? []).map((d) => [d.date, d.count] as const));
    const series = days.map((isoDate) => ({
      date: isoDate,
      count: countsByDate.get(isoDate) ?? 0,
    }));

    const maxCount = Math.max(...series.map((d) => d.count), 1);
    return series.map((d) => {
      const rawHeight = (d.count / maxCount) * 100;
      const heightPct = d.count === 0 ? 2 : Math.max(rawHeight, 6);
      return {
        label: d.date.slice(5),
        heightPct,
        color: this.barColor(d.count),
      };
    });
  }

  private buildLastNDays(days: number): string[] {
    const out: string[] = [];
    // Use local date boundaries so "Today" matches what users see and what the API returns.
    const today = new Date();
    // Newest-to-oldest so "Today" renders on the left.
    for (let i = 0; i < days; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      out.push(this.formatLocalIsoDate(d));
    }
    return out;
  }

  private formatLocalIsoDate(d: Date): string {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  private barColor(count: number): string {
    if (count <= 3) return '#10b981';
    if (count <= 7) return '#f59e0b';
    return '#ef4444';
  }
}
