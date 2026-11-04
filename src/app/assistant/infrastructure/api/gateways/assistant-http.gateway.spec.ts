import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { AssistantHttpGateway } from './assistant-http.gateway';
import { API_CONFIG } from '../../../../api.config';

describe('AssistantHttpGateway', () => {
  let gateway: AssistantHttpGateway;
  let http: HttpTestingController;

  const assistantUrl = API_CONFIG.baseUrl + API_CONFIG.endpoints.assistant;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    gateway = TestBed.inject(AssistantHttpGateway);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sendMessage hace POST a /messages con el body', () => {
    const body = { conversationId: null, content: 'Hola', locale: 'es' as const };
    gateway.sendMessage(body).subscribe();
    const r = http.expectOne(`${assistantUrl}/messages`);
    expect(r.request.method).toBe('POST');
    expect(r.request.body).toEqual(body);
    r.flush({});
  });

  it('getConversations hace GET a /conversations con page y size', () => {
    gateway.getConversations(1, 20).subscribe();
    const r = http.expectOne((req) => req.url === `${assistantUrl}/conversations`);
    expect(r.request.method).toBe('GET');
    expect(r.request.params.get('page')).toBe('1');
    expect(r.request.params.get('size')).toBe('20');
    r.flush({ content: [], totalElements: 0, totalPages: 0, size: 20, number: 1 });
  });

  it('getConversationMessages hace GET a /conversations/{id}/messages', () => {
    gateway.getConversationMessages('conv-1').subscribe();
    const r = http.expectOne(`${assistantUrl}/conversations/conv-1/messages`);
    expect(r.request.method).toBe('GET');
    r.flush([]);
  });

  it('getUsage hace GET a /usage', () => {
    gateway.getUsage().subscribe();
    const r = http.expectOne(`${assistantUrl}/usage`);
    expect(r.request.method).toBe('GET');
    r.flush({});
  });

  it('rateMessage hace PUT a /messages/{id}/feedback', () => {
    gateway.rateMessage('msg-1', { rating: 'DOWN' }).subscribe();
    const r = http.expectOne(`${assistantUrl}/messages/msg-1/feedback`);
    expect(r.request.method).toBe('PUT');
    expect(r.request.body).toEqual({ rating: 'DOWN' });
    r.flush(null);
  });
});
