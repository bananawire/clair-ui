import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';
import { SignUpCommand } from '../model/commands/sign-up.command';
import { SignInCommand } from '../model/commands/sign-in.command';
import { RefreshTokenCommand } from '../model/commands/refresh-token.command';
import { ConfirmRegistrationCommand } from '../model/commands/confirm-registration.command';
import { SignInWithGoogleCommand } from '../model/commands/sign-in-with-google.command';

import { UserId } from '../model/valueobjects/user-id.value-object';
import { AccessToken } from '../model/valueobjects/access-token.value-object';
import { RefreshToken } from '../model/valueobjects/refresh-token.value-object';

export interface AuthCommandService {
  handleSignUp(command: SignUpCommand): Observable<{ sessionId: string; message: string; verificationRequired?: boolean }>;
  handleSignIn(command: SignInCommand): Observable<{ accessToken: AccessToken; refreshToken: RefreshToken }>;
  handleRefreshToken(command: RefreshTokenCommand): Observable<{ accessToken: AccessToken; refreshToken: RefreshToken }>;
  handleConfirmRegistration(command: ConfirmRegistrationCommand): Observable<{ userId: UserId; email: string }>;
  handleSignOut(): Observable<void>;
  handleGoogleSignIn(command: SignInWithGoogleCommand): Observable<{ accessToken: AccessToken; refreshToken: RefreshToken }>;
  getGoogleAuthorizeUrl(): string;
}

export const AUTH_COMMAND_SERVICE = new InjectionToken<AuthCommandService>('AuthCommandService');
