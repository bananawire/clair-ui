import { Component, OnInit, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NOTIFICATIONS_CONTEXT_FACADE, NotificationsContextFacade } from './notifications/interfaces/acl/notifications-context-facade';
import { LanguageService } from './shared/interfaces/services/language.service';

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

  ngOnInit(): void {
    this.languageService.initialize();
    this.notificationsContextFacade.initOneSignal();
  }
}
