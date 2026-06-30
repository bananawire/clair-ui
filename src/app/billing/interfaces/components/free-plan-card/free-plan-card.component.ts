import { Component, Output, EventEmitter } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-free-plan-card',
  standalone: true,
  imports: [MatCardModule, TranslatePipe],
  templateUrl: './free-plan-card.component.html',
  styleUrl: './free-plan-card.component.css',
  host: { class: 'block' }
})
export class FreePlanCardComponent {
  @Output() onSelect = new EventEmitter<void>();

  onPress() {
    this.onSelect.emit();
  }
}
