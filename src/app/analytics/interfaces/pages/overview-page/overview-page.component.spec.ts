import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateService } from '@ngx-translate/core';
import { of, throwError, Subject } from 'rxjs';
import { By } from '@angular/platform-browser';
import { OverviewPageComponent } from './overview-page.component';
import {
  ANALYTICS_CONTEXT_FACADE,
  AnalyticsContextFacade,
} from '../../acl/analytics-context-facade';
import {
  NinoAlertService,
  NinoAlertResponse,
} from '../../../application/internal/services/nino-alert.service';

describe('OverviewPageComponent - El Niño Feature', () => {
  let fixture: ComponentFixture<OverviewPageComponent>;
  let component: OverviewPageComponent;
  let mockNinoAlertService: { generateAlert: ReturnType<typeof vi.fn> };
  let mockAnalyticsFacade: Partial<AnalyticsContextFacade>;

  beforeEach(async () => {
    mockNinoAlertService = {
      generateAlert: vi.fn(),
    };

    mockAnalyticsFacade = {
      getOverviewDashboard: vi.fn().mockReturnValue(of(null)),
      getLiveDashboardMetricsByDevice: vi.fn(),
      streamLiveTelemetry: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [OverviewPageComponent],
      providers: [
        provideTranslateService(),
        { provide: ANALYTICS_CONTEXT_FACADE, useValue: mockAnalyticsFacade },
        { provide: NinoAlertService, useValue: mockNinoAlertService },
      ],
    }).compileComponents();
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(OverviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  it('should create component with default El Niño scenario parameters', () => {
    createComponent();

    expect(component).toBeTruthy();
    expect(component.ninoScenario).toEqual({
      humidity: 85,
      temperature: 30,
      riskLevel: 'ALTO',
      riskScore: 82,
    });
    expect(component.isGeneratingAlert).toBe(false);
    expect(component.ninoAlert).toBeNull();
  });

  it('should render the El Niño banner and indicators in the DOM', () => {
    createComponent();

    const bannerEl = fixture.debugElement.query(By.css('.nino-header-banner'));
    const riskCardEl = fixture.debugElement.query(By.css('.nino-risk-card'));
    const locationTagEl = fixture.debugElement.query(By.css('.nino-location-tag'));
    const indicatorValues = fixture.debugElement
      .queryAll(By.css('.indicator-value'))
      .map((el) => el.nativeElement.textContent.trim());

    expect(bannerEl).toBeTruthy();
    expect(riskCardEl).toBeTruthy();
    expect(locationTagEl.nativeElement.textContent.trim()).toBe('Piura');
    expect(indicatorValues).toContain('85 %');
    expect(indicatorValues).toContain('30 °C');
    expect(fixture.debugElement.query(By.css('.nino-alert-result'))).toBeNull();
  });

  it('should trigger alert generation and render AI (DeepSeek) response upon success', () => {
    const aiResponse: NinoAlertResponse = {
      message: 'Se pronostica incremento de zancudos por calor y humedad extrema.',
      source: 'deepseek',
    };
    mockNinoAlertService.generateAlert.mockReturnValue(of(aiResponse));
    createComponent();

    const generateBtn = fixture.debugElement.query(By.css('.nino-alert-btn'));
    generateBtn.nativeElement.click();
    fixture.detectChanges();

    expect(mockNinoAlertService.generateAlert).toHaveBeenCalledWith(component.ninoScenario);
    expect(component.ninoAlert).toEqual(aiResponse);
    expect(component.isGeneratingAlert).toBe(false);

    const alertResultEl = fixture.debugElement.query(By.css('.nino-alert-result'));
    expect(alertResultEl).toBeTruthy();
    expect(alertResultEl.classes['fallback-tone']).toBeFalsy();

    const sourcePill = fixture.debugElement.query(By.css('.alert-source-pill'));
    expect(sourcePill.classes['ai']).toBe(true);

    const messageEl = fixture.debugElement.query(By.css('.alert-message'));
    expect(messageEl.nativeElement.textContent.trim()).toBe(aiResponse.message);
  });

  it('should render fallback tone when response source is fallback', () => {
    const fallbackResponse: NinoAlertResponse = {
      message: 'Alerta oficial de contingencia: cubra los depósitos de agua.',
      source: 'fallback',
    };
    mockNinoAlertService.generateAlert.mockReturnValue(of(fallbackResponse));
    createComponent();

    const generateBtn = fixture.debugElement.query(By.css('.nino-alert-btn'));
    generateBtn.nativeElement.click();
    fixture.detectChanges();

    expect(component.ninoAlert).toEqual(fallbackResponse);

    const alertResultEl = fixture.debugElement.query(By.css('.nino-alert-result'));
    expect(alertResultEl).toBeTruthy();
    expect(alertResultEl.classes['fallback-tone']).toBe(true);

    const sourcePill = fixture.debugElement.query(By.css('.alert-source-pill'));
    expect(sourcePill.classes['ai']).toBeFalsy();

    const messageEl = fixture.debugElement.query(By.css('.alert-message'));
    expect(messageEl.nativeElement.textContent.trim()).toBe(fallbackResponse.message);
  });

  it('should reflect loading state in UI while generation is pending', () => {
    const pendingSubject = new Subject<NinoAlertResponse>();
    mockNinoAlertService.generateAlert.mockReturnValue(pendingSubject.asObservable());
    createComponent();

    const generateBtn = fixture.debugElement.query(By.css('.nino-alert-btn'));
    generateBtn.nativeElement.click();
    fixture.detectChanges();

    expect(component.isGeneratingAlert).toBe(true);
    expect(generateBtn.nativeElement.disabled).toBe(true);
    expect(fixture.debugElement.query(By.css('.nino-spinner'))).toBeTruthy();
    expect(fixture.debugElement.query(By.css('.btn-icon'))).toBeNull();
  });

  it('should reset isGeneratingAlert when service call fails', () => {
    mockNinoAlertService.generateAlert.mockReturnValue(
      throwError(() => new Error('Service failure')),
    );
    createComponent();

    const generateBtn = fixture.debugElement.query(By.css('.nino-alert-btn'));
    generateBtn.nativeElement.click();
    fixture.detectChanges();

    expect(component.isGeneratingAlert).toBe(false);
    expect(component.ninoAlert).toBeNull();
    expect(generateBtn.nativeElement.disabled).toBe(false);
  });

  it('should not call generateAlert multiple times if already generating', () => {
    const pendingSubject = new Subject<NinoAlertResponse>();
    mockNinoAlertService.generateAlert.mockReturnValue(pendingSubject.asObservable());
    createComponent();

    const generateBtn = fixture.debugElement.query(By.css('.nino-alert-btn'));
    generateBtn.nativeElement.click();
    fixture.detectChanges();

    expect(component.isGeneratingAlert).toBe(true);
    expect(mockNinoAlertService.generateAlert).toHaveBeenCalledTimes(1);

    // Call directly or click again while pending
    component.generateNinoAlert();
    expect(mockNinoAlertService.generateAlert).toHaveBeenCalledTimes(1);
  });
});
