import { Component } from '@angular/core';
import { FreePlanCardComponent } from '../../components/free-plan-card/free-plan-card.component';
import { PremiumPlanCardComponent } from '../../components/premium-plan-card/premium-plan-card.component';
import { Router } from '@angular/router';
import { Location } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-select-plan',
  standalone: true,
  imports: [FreePlanCardComponent, PremiumPlanCardComponent, TranslatePipe],
  templateUrl: './select-plan.component.html',
  styleUrl: './select-plan.component.css'
})
export class SelectPlanComponent {
  constructor(private router: Router, private location: Location) { }

  goBack() {
    this.location.back();
  }

  onPress() {
    console.log('Plan selected');
  }

  onPremiumSelect() {
    this.router.navigate(['/checkout-premium']);
  }
}
