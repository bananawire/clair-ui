import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { provideTranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';
import { AUTH_COMMAND_SERVICE } from '../../../domain/services/auth-command-service';
import { RegisterPageComponent } from './register-page.component';

describe('RegisterPageComponent', () => {
  const auth = { handleSignUp: vi.fn() };
  const snackBar = { open: vi.fn() };

  beforeEach(async () => {
    vi.resetAllMocks();
    await TestBed.configureTestingModule({
      imports: [RegisterPageComponent],
      providers: [
        provideRouter([]),
        provideTranslateService(),
        { provide: AUTH_COMMAND_SERVICE, useValue: auth },
      ],
    }).overrideProvider(MatSnackBar, { useValue: snackBar }).compileComponents();
  });

  it.each([true, undefined])('mantiene la confirmación cuando verificationRequired=%s', (verificationRequired) => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    auth.handleSignUp.mockReturnValue(of({ sessionId: 'session-1', message: 'Started', verificationRequired }));
    const component = TestBed.createComponent(RegisterPageComponent).componentInstance;
    component.registerForm.setValue({ email: 'local@example.test', password: 'Local123!', acceptTerms: true });

    component.onSubmit();

    expect(navigate).toHaveBeenCalledWith(['/confirm'], { queryParams: { sessionId: 'session-1' } });
    expect(snackBar.open).toHaveBeenCalledWith('register.snackbar.success', 'register.snackbar.close', { duration: 3000 });
  });

  it('envía a login sin pedir código solo cuando el backend indica false', () => {
    const navigate = vi.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true);
    auth.handleSignUp.mockReturnValue(of({ sessionId: 'local-1', message: 'Created', verificationRequired: false }));
    const component = TestBed.createComponent(RegisterPageComponent).componentInstance;
    component.registerForm.setValue({ email: 'local@example.test', password: 'Local123!', acceptTerms: true });

    component.onSubmit();

    expect(navigate).toHaveBeenCalledWith(['/login']);
    expect(snackBar.open).toHaveBeenCalledWith('register.snackbar.localSuccess', 'register.snackbar.close', { duration: 3000 });
  });
});
