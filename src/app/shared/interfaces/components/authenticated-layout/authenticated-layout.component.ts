import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { AssistantPanelComponent } from '../../../../assistant/interfaces/components/assistant-panel/assistant-panel.component';

@Component({
  selector: 'app-authenticated-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, AssistantPanelComponent],
  templateUrl: './authenticated-layout.component.html',
  styleUrl: './authenticated-layout.component.css',
})
export class AuthenticatedLayoutComponent {
  isSidebarOpen = true;
  isAssistantOpen = false;
  /** The panel is mounted on first open and then kept, so closing it keeps the conversation. */
  assistantMounted = false;

  toggleSidebar(): void {
    this.isSidebarOpen = !this.isSidebarOpen;
  }

  toggleAssistant(): void {
    this.isAssistantOpen = !this.isAssistantOpen;
    this.assistantMounted = true;
  }

  closeAssistant(): void {
    this.isAssistantOpen = false;
  }
}
