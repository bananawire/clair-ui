import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NOTIFICATIONS_CONTEXT_FACADE, NotificationsContextFacade } from './notifications/interfaces/acl/notifications-context-facade';
import { LanguageService } from './shared/interfaces/services/language.service';
import { ThemeService } from './shared/interfaces/services/theme.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit {
  private readonly notificationsContextFacade = inject(NOTIFICATIONS_CONTEXT_FACADE) as NotificationsContextFacade;
  private readonly languageService = inject(LanguageService);
  private readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    this.themeService.initialize();
    this.languageService.initialize();
    this.notificationsContextFacade.initOneSignal();
  }
}
