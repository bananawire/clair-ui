import { Injectable, Inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { AuthCommandService } from '../../../domain/services/auth-command-service';
import { AuthGateway, AUTH_GATEWAY } from '../../../infrastructure/api/gateways/auth.gateway';
import { SignUpCommand } from '../../../domain/model/commands/sign-up.command';
import { SignInCommand } from '../../../domain/model/commands/sign-in.command';
import { RefreshTokenCommand } from '../../../domain/model/commands/refresh-token.command';
import { ConfirmRegistrationCommand } from '../../../domain/model/commands/confirm-registration.command';
import { SignInWithGoogleCommand } from '../../../domain/model/commands/sign-in-with-google.command';

import { UserId, createUserId } from '../../../domain/model/valueobjects/user-id.value-object';
import { AccessToken, createAccessToken } from '../../../domain/model/valueobjects/access-token.value-object';
import { RefreshToken, createRefreshToken } from '../../../domain/model/valueobjects/refresh-token.value-object';
import {
  signUpCommandToResource,
  signInCommandToResource,
  refreshTokenCommandToResource,
  confirmRegistrationCommandToResource,
  signInWithGoogleCommandToResource,
} from '../../../interfaces/rest/transform/auth-transform';

@Injectable({ providedIn: 'root' })
export class AuthCommandServiceImpl implements AuthCommandService {
  constructor(@Inject(AUTH_GATEWAY) private readonly authGateway: AuthGateway) {}

  handleSignUp(command: SignUpCommand): Observable<{ sessionId: string; message: string; verificationRequired: boolean }> {
    const resource = signUpCommandToResource(command);
    return this.authGateway.signUp(resource).pipe(
      map((response) => ({
        sessionId: response.sessionId,
        message: response.message,
        verificationRequired: response.verificationRequired ?? true,
      }))
    );
  }

  handleSignIn(command: SignInCommand): Observable<{ accessToken: AccessToken; refreshToken: RefreshToken }> {
    const resource = signInCommandToResource(command);
    return this.authGateway.signIn(resource).pipe(
      map((response) => ({
        accessToken: createAccessToken(response.token),
        refreshToken: createRefreshToken(response.refreshToken),
      }))
    );
  }

  handleRefreshToken(command: RefreshTokenCommand): Observable<{ accessToken: AccessToken; refreshToken: RefreshToken }> {
    const resource = refreshTokenCommandToResource(command);
    return this.authGateway.refreshToken(resource).pipe(
      map((response) => ({
        accessToken: createAccessToken(response.token),
        refreshToken: createRefreshToken(response.refreshToken),
      }))
    );
  }

  handleConfirmRegistration(command: ConfirmRegistrationCommand): Observable<{ userId: UserId; email: string }> {
    const resource = confirmRegistrationCommandToResource(command);
    return this.authGateway.confirmRegistration(resource).pipe(
      map((response) => ({
        userId: createUserId(response.id),
        email: response.email,
      }))
    );
  }

  handleSignOut(): Observable<void> {
    return this.authGateway.signOut();
  }

  handleGoogleSignIn(command: SignInWithGoogleCommand): Observable<{ accessToken: AccessToken; refreshToken: RefreshToken }> {
    const resource = signInWithGoogleCommandToResource(command);
    return this.authGateway.googleSignIn(resource).pipe(
      map((response) => ({
        accessToken: createAccessToken(response.token),
        refreshToken: createRefreshToken(response.refreshToken),
      }))
    );
  }

  getGoogleAuthorizeUrl(): string {
    return this.authGateway.getGoogleAuthorizeUrl();
  }
}
