import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import {
  NOTIFICATIONS_CONTEXT_FACADE,
  NotificationsContextFacade,
  PushNotificationLog,
} from '../../../../notifications/interfaces/acl/notifications-context-facade';

type BrowserPermission = 'granted' | 'denied' | 'default' | 'unsupported';

const LAST_VIEWED_KEY = 'lastViewedNotifications';

@Component({
  selector: 'app-notifications-bell',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule, TranslatePipe],
  templateUrl: './notifications-bell.component.html',
  styleUrl: './notifications-bell.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotificationsBellComponent implements OnInit {
  private readonly notificationsContextFacade = inject(NOTIFICATIONS_CONTEXT_FACADE) as NotificationsContextFacade;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly translate = inject(TranslateService);
  private readonly host = inject(ElementRef<HTMLElement>);

  notifications: ReadonlyArray<PushNotificationLog> = [];
  isOpen = false;
  unreadCount = 0;
  loading = false;
  permission: BrowserPermission = this.readPermission();

  ngOnInit(): void {
    this.loadNotifications(true);
  }

  toggle(event: MouseEvent): void {
    event.stopPropagation();
    this.isOpen = !this.isOpen;
    if (this.isOpen) {
      this.permission = this.readPermission();
      this.loadNotifications(false);
    }
    this.cdr.markForCheck();
  }

  close(): void {
    if (!this.isOpen) return;
    this.isOpen = false;
    this.cdr.markForCheck();
  }

  enableBrowserNotifications(): void {
    this.notificationsContextFacade.requestPermission();
    // The browser prompt resolves asynchronously; re-read the state once the user has answered.
    setTimeout(() => {
      this.permission = this.readPermission();
      this.cdr.markForCheck();
    }, 1500);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.close();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.close();
  }

  getRelativeTime(createdAt: string): string {
    const diffSecs = Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);

    if (diffSecs < 60) return this.translate.instant('header.relativeTime.justNow');
    if (diffMins < 60) return this.translate.instant('header.relativeTime.minutesAgo', { minutes: diffMins });
    if (diffHours < 24) return this.translate.instant('header.relativeTime.hoursAgo', { hours: diffHours });
    return this.translate.instant('header.relativeTime.daysAgo', { days: Math.floor(diffHours / 24) });
  }

  private loadNotifications(initial: boolean): void {
    this.loading = true;
    this.cdr.markForCheck();

    this.notificationsContextFacade
      .getPushNotifications(0)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (page) => {
          this.notifications = page.content || [];
          this.loading = false;
          if (!initial && this.isOpen) {
            this.markAllAsRead();
          } else {
            this.calculateUnreadCount();
          }
          this.cdr.markForCheck();
        },
        error: (err) => {
          console.error('[NotificationsBell] Error loading notifications:', err);
          this.loading = false;
          this.cdr.markForCheck();
        },
      });
  }

  private calculateUnreadCount(): void {
    const lastViewed = localStorage.getItem(LAST_VIEWED_KEY);
    if (!lastViewed) {
      this.unreadCount = this.notifications.length;
      return;
    }
    const lastViewedTime = new Date(lastViewed).getTime();
    this.unreadCount = this.notifications.filter((n) => new Date(n.createdAt).getTime() > lastViewedTime).length;
  }

  private markAllAsRead(): void {
    localStorage.setItem(LAST_VIEWED_KEY, new Date().toISOString());
    this.unreadCount = 0;
  }

  private readPermission(): BrowserPermission {
    return typeof Notification === 'undefined' ? 'unsupported' : Notification.permission;
  }
}
