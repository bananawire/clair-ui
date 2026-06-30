import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  OnInit,
  HostListener,
  ChangeDetectorRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClairLyricsComponent } from '../clair-lyrics/clair-lyrics.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  NOTIFICATIONS_CONTEXT_FACADE,
  NotificationsContextFacade,
  PushNotificationLog,
} from '../../../../notifications/interfaces/acl/notifications-context-facade';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, ClairLyricsComponent, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent implements OnInit {
  @Input() isSidebarOpen = true;
  @Output() sidebarToggleRequested = new EventEmitter<void>();

  private readonly notificationsContextFacade = inject(NOTIFICATIONS_CONTEXT_FACADE) as NotificationsContextFacade;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);

  notifications: ReadonlyArray<PushNotificationLog> = [];
  isNotificationPanelOpen = false;
  unreadCount = 0;
  loading = false;

  ngOnInit(): void {
    this.loadNotifications(true);
  }

  onToggleSidebar(): void {
    this.sidebarToggleRequested.emit();
  }

  toggleNotifications(event: MouseEvent): void {
    event.stopPropagation();
    this.isNotificationPanelOpen = !this.isNotificationPanelOpen;
    
    if (this.isNotificationPanelOpen) {
      this.loadNotifications(false);
    }
    this.cdr.markForCheck();
  }

  loadNotifications(initial: boolean = false): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.notificationsContextFacade.getPushNotifications(0).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (page) => {
        this.notifications = page.content || [];
        this.calculateUnreadCount();
        this.loading = false;

        if (!initial && this.isNotificationPanelOpen) {
          this.markAllAsRead();
        }

        this.cdr.markForCheck();
      },
      error: (err) => {
        console.error('[HeaderComponent] Error loading notifications:', err);
        this.loading = false;
        this.cdr.markForCheck();
      }
    });
  }

  private calculateUnreadCount(): void {
    const lastViewedStr = localStorage.getItem('lastViewedNotifications');
    if (!lastViewedStr) {
      this.unreadCount = this.notifications.length;
      return;
    }

    const lastViewedTime = new Date(lastViewedStr).getTime();
    this.unreadCount = this.notifications.filter(
      (n) => new Date(n.createdAt).getTime() > lastViewedTime
    ).length;
  }

  markAllAsRead(): void {
    const nowStr = new Date().toISOString();
    localStorage.setItem('lastViewedNotifications', nowStr);
    this.unreadCount = 0;
    this.cdr.markForCheck();
  }

  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isNotificationPanelOpen) {
      this.isNotificationPanelOpen = false;
      this.cdr.markForCheck();
    }
  }

  getRelativeTime(createdAt: string): string {
    const created = new Date(createdAt).getTime();
    const now = new Date().getTime();
    const diffMs = now - created;

    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return this.translate.instant('header.relativeTime.justNow');
    } else if (diffMins < 60) {
      return this.translate.instant('header.relativeTime.minutesAgo', { minutes: diffMins });
    } else if (diffHours < 24) {
      return this.translate.instant('header.relativeTime.hoursAgo', { hours: diffHours });
    } else {
      return this.translate.instant('header.relativeTime.daysAgo', { days: diffDays });
    }
  }
}
