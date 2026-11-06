import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { ClairLyricsComponent } from '../clair-lyrics/clair-lyrics.component';
import { AiAssistantComponent } from '../icons/ai-assistant/ai-assistant.component';
import { TranslatePipe } from '@ngx-translate/core';

// Profile, notifications and theme live in Settings; the header keeps navigation and the assistant only.
@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, ClairLyricsComponent, AiAssistantComponent, TranslatePipe],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HeaderComponent {
  @Input() isSidebarOpen = true;
  @Output() sidebarToggleRequested = new EventEmitter<void>();
  @Input() isAssistantOpen = false;
  @Output() assistantToggleRequested = new EventEmitter<void>();

  onToggleSidebar(): void {
    this.sidebarToggleRequested.emit();
  }

  onToggleAssistant(event: MouseEvent): void {
    event.stopPropagation();
    this.assistantToggleRequested.emit();
  }
}
