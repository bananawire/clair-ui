import { Component, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-premium-plan-card',
  standalone: true,
  imports: [MatCardModule, TranslatePipe],
  templateUrl: './premium-plan-card.component.html',
  styleUrl: './premium-plan-card.component.css',
  host: { class: 'block' }
})
export class PremiumPlanCardComponent {
  @Output() onSelect = new EventEmitter<void>();

  onPress() {
    this.onSelect.emit();
  }
}
