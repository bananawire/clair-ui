import { ApplicationConfig, provideBrowserGlobalErrorListeners, inject } from '@angular/core';
import { HttpClient, provideHttpClient, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService, provideTranslateLoader } from '@ngx-translate/core';
import { MultiTranslationHttpLoader } from './shared/infrastructure/i18n/multi-translation-http.loader';
import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { AUTH_GATEWAY } from './iam/infrastructure/api/gateways/auth.gateway';
import { AuthHttpGateway } from './iam/infrastructure/api/gateways/auth-http.gateway';
import { TOKEN_STORAGE_GATEWAY } from './iam/infrastructure/storage/token-storage.gateway';
import { LocalTokenStorageGateway } from './iam/infrastructure/storage/local-token-storage.gateway';
import { AuthHttpInterceptor } from './iam/infrastructure/api/interceptors/auth-http.interceptor';
import { AUTH_COMMAND_SERVICE } from './iam/domain/services/auth-command-service';
import { AuthCommandServiceImpl } from './iam/application/internal/commandservices/auth-command-service.impl';
import { AUTH_QUERY_SERVICE } from './iam/domain/services/auth-query-service';
import { AuthQueryServiceImpl } from './iam/application/internal/queryservices/auth-query-service.impl';
import { DEVICE_GATEWAY } from './device/infrastructure/api/gateways/device.gateway';
import { DeviceHttpGateway } from './device/infrastructure/api/gateways/device-http.gateway';
import { TELEMETRY_EVALUATION_GATEWAY } from './evaluation/infrastructure/api/gateways/telemetry-evaluation.gateway';
import { TelemetryEvaluationHttpGateway } from './evaluation/infrastructure/api/gateways/telemetry-evaluation-http.gateway';
import { EVALUATION_CONTEXT_FACADE } from './evaluation/interfaces/acl/evaluation-context-facade';
import { EvaluationContextFacadeImpl } from './evaluation/application/acl/evaluation-context-facade.impl';
import { DEVICE_CONTEXT_FACADE } from './device/interfaces/acl/device-context-facade';
import { DeviceContextFacadeImpl } from './device/application/acl/device-context-facade.impl';
import { ANALYTICS_CONTEXT_FACADE } from './analytics/interfaces/acl/analytics-context-facade';
import { AnalyticsContextFacadeImpl } from './analytics/application/acl/analytics-context-facade.impl';
import { ALERTING_CONTEXT_FACADE } from './alerting/interfaces/acl/alerting-context-facade';
import { AlertingContextFacadeImpl } from './alerting/application/acl/alerting-context-facade.impl';
import { DEVICE_QUERY_SERVICE } from './device/domain/services/device-query-service';
import { DeviceQueryServiceImpl } from './device/application/internal/queryservices/device-query-service.impl';
import { DEVICE_COMMAND_SERVICE } from './device/domain/services/device-command-service';
import { DeviceCommandServiceImpl } from './device/application/internal/commandservices/device-command-service.impl';
import { DEVICE_STATUS_QUERY_SERVICE } from './device/domain/services/device-status-query-service';
import { DeviceStatusQueryServiceImpl } from './device/application/internal/queryservices/device-status-query-service.impl';
import { DEVICE_THRESHOLD_QUERY_SERVICE } from './device/domain/services/device-threshold-query-service';
import { DeviceThresholdQueryServiceImpl } from './device/application/internal/queryservices/device-threshold-query-service.impl';
import { DEVICE_THRESHOLD_COMMAND_SERVICE } from './device/domain/services/device-threshold-command-service';
import { DeviceThresholdCommandServiceImpl } from './device/application/internal/commandservices/device-threshold-command-service.impl';
import { ANALYTICS_QUERY_SERVICE } from './analytics/domain/services/analytics-query-service';
import { AnalyticsQueryServiceImpl } from './analytics/application/internal/queryservices/analytics-query-service.impl';
import { TELEMETRY_EVALUATION_QUERY_SERVICE } from './evaluation/domain/services/telemetry-evaluation-query-service';
import { TelemetryEvaluationQueryServiceImpl } from './evaluation/application/internal/queryservices/telemetry-evaluation-query-service.impl';
import { TELEMETRY_EVALUATION_COMMAND_SERVICE } from './evaluation/domain/services/telemetry-evaluation-command-service';
import { TelemetryEvaluationCommandServiceImpl } from './evaluation/application/internal/commandservices/telemetry-evaluation-command-service.impl';
import { ANALYTICS_OVERVIEW_QUERY_SERVICE } from './analytics/domain/services/analytics-overview-query-service';
import { AnalyticsOverviewQueryServiceImpl } from './analytics/application/internal/queryservices/analytics-overview-query-service.impl';
import { REPORT_QUERY_SERVICE } from './analytics/domain/services/report-query-service';
import { ReportQueryServiceImpl } from './analytics/application/internal/queryservices/report-query-service.impl';
import { ALERT_QUERY_SERVICE } from './alerting/domain/services/alert-query-service';
import { AlertQueryServiceImpl } from './alerting/application/internal/queryservices/alert-query-service.impl';
import { NOTIFICATION_QUERY_SERVICE } from './notifications/domain/services/notification-query-service';
import { NotificationQueryServiceImpl } from './notifications/application/internal/queryservices/notification-query-service.impl';
import { NOTIFICATION_GATEWAY } from './notifications/infrastructure/api/gateways/notification.gateway';
import { NotificationHttpGateway } from './notifications/infrastructure/api/gateways/notification-http.gateway';
import { NOTIFICATIONS_CONTEXT_FACADE } from './notifications/interfaces/acl/notifications-context-facade';
import { NotificationsContextFacadeImpl } from './notifications/application/acl/notifications-context-facade.impl';
import { ASSISTANT_COMMAND_SERVICE } from './assistant/domain/services/assistant-command-service';
import { AssistantCommandServiceImpl } from './assistant/application/internal/commandservices/assistant-command-service.impl';
import { ASSISTANT_QUERY_SERVICE } from './assistant/domain/services/assistant-query-service';
import { AssistantQueryServiceImpl } from './assistant/application/internal/queryservices/assistant-query-service.impl';
import { ASSISTANT_GATEWAY } from './assistant/infrastructure/api/gateways/assistant.gateway';
import { AssistantHttpGateway } from './assistant/infrastructure/api/gateways/assistant-http.gateway';

export const appConfig: ApplicationConfig = {
  providers: [
    { provide: AUTH_COMMAND_SERVICE, useClass: AuthCommandServiceImpl },
    { provide: AUTH_QUERY_SERVICE, useClass: AuthQueryServiceImpl },
    { provide: ANALYTICS_OVERVIEW_QUERY_SERVICE, useClass: AnalyticsOverviewQueryServiceImpl },
    { provide: ALERT_QUERY_SERVICE, useClass: AlertQueryServiceImpl },
    { provide: NOTIFICATION_QUERY_SERVICE, useClass: NotificationQueryServiceImpl },
    { provide: DEVICE_QUERY_SERVICE, useClass: DeviceQueryServiceImpl },
    { provide: DEVICE_COMMAND_SERVICE, useClass: DeviceCommandServiceImpl },
    { provide: DEVICE_STATUS_QUERY_SERVICE, useClass: DeviceStatusQueryServiceImpl },
    { provide: DEVICE_THRESHOLD_QUERY_SERVICE, useClass: DeviceThresholdQueryServiceImpl },
    { provide: DEVICE_THRESHOLD_COMMAND_SERVICE, useClass: DeviceThresholdCommandServiceImpl },
    { provide: ANALYTICS_QUERY_SERVICE, useClass: AnalyticsQueryServiceImpl },
    { provide: REPORT_QUERY_SERVICE, useClass: ReportQueryServiceImpl },
    { provide: TELEMETRY_EVALUATION_QUERY_SERVICE, useClass: TelemetryEvaluationQueryServiceImpl },
    { provide: TELEMETRY_EVALUATION_COMMAND_SERVICE, useClass: TelemetryEvaluationCommandServiceImpl },
    { provide: ASSISTANT_COMMAND_SERVICE, useClass: AssistantCommandServiceImpl },
    { provide: ASSISTANT_QUERY_SERVICE, useClass: AssistantQueryServiceImpl },
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptorsFromDi()),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideTranslateService({ lang: 'en', fallbackLang: 'en' }),
    provideTranslateLoader(() => new MultiTranslationHttpLoader(inject(HttpClient))),
    { provide: AUTH_GATEWAY, useClass: AuthHttpGateway },
    { provide: TOKEN_STORAGE_GATEWAY, useClass: LocalTokenStorageGateway },
    { provide: DEVICE_GATEWAY, useClass: DeviceHttpGateway },
    { provide: NOTIFICATION_GATEWAY, useClass: NotificationHttpGateway },
    { provide: TELEMETRY_EVALUATION_GATEWAY, useClass: TelemetryEvaluationHttpGateway },
    { provide: ASSISTANT_GATEWAY, useClass: AssistantHttpGateway },
    { provide: EVALUATION_CONTEXT_FACADE, useClass: EvaluationContextFacadeImpl },
    { provide: DEVICE_CONTEXT_FACADE, useClass: DeviceContextFacadeImpl },
    { provide: ANALYTICS_CONTEXT_FACADE, useClass: AnalyticsContextFacadeImpl },
    { provide: ALERTING_CONTEXT_FACADE, useClass: AlertingContextFacadeImpl },
    { provide: NOTIFICATIONS_CONTEXT_FACADE, useClass: NotificationsContextFacadeImpl },
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
};
