import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { TranslatePipe } from '@ngx-translate/core';
import {
  AssistantUsage,
  isUsageExhausted,
} from '../../../domain/model/valueobjects/assistant-usage.value-object';

@Component({
  selector: 'app-usage-indicator',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, TranslatePipe],
  templateUrl: './usage-indicator.component.html',
  styleUrl: './usage-indicator.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UsageIndicatorComponent {
  @Input() usage: AssistantUsage | null = null;

  get isFreemium(): boolean {
    return this.usage?.plan === 'FREEMIUM';
  }

  get isExhausted(): boolean {
    return this.usage ? isUsageExhausted(this.usage) : false;
  }
}
