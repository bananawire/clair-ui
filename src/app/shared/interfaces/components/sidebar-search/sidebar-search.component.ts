import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  ElementRef,
  HostListener,
  ViewChild,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { catchError, forkJoin, map, of, switchMap } from 'rxjs';
import {
  DEVICE_CONTEXT_FACADE,
  DeviceContextFacade,
  FacadeDevice,
  FacadeSpace,
} from '../../../../device/interfaces/acl/device-context-facade';

type ResultGroup = 'pages' | 'spaces' | 'devices';

interface SearchEntry {
  readonly id: string;
  readonly group: ResultGroup;
  readonly icon: string;
  /** Translation key for pages; literal text for spaces and devices */
  readonly label: string;
  readonly translateLabel: boolean;
  readonly detail?: string;
  /** Extra words that should match, in both languages */
  readonly keywords: string;
  readonly route: string;
  readonly queryParams?: Record<string, string>;
  readonly fragment?: string;
}

interface ResultSection {
  readonly group: ResultGroup;
  readonly items: SearchEntry[];
}

const MAX_PER_GROUP = 6;

const PAGE_ENTRIES: SearchEntry[] = [
  { id: 'p-overview', group: 'pages', icon: 'dashboard', label: 'sidebar.nav.overview', translateLabel: true, keywords: 'overview home inicio resumen dashboard panel', route: '/overview' },
  { id: 'p-air', group: 'pages', icon: 'air', label: 'sidebar.nav.airQuality', translateLabel: true, keywords: 'air quality calidad aire analytics pm2.5 co2 temperatura humedad', route: '/analytics' },
  { id: 'p-alerts', group: 'pages', icon: 'warning', label: 'sidebar.nav.alertsActions', translateLabel: true, keywords: 'alerts alertas acciones actions avisos', route: '/alerts' },
  { id: 'p-reports', group: 'pages', icon: 'description', label: 'sidebar.nav.reports', translateLabel: true, keywords: 'reports reportes informes csv export exportar', route: '/reports' },
  { id: 'p-spaces', group: 'pages', icon: 'meeting_room', label: 'sidebar.nav.spaceDevices', translateLabel: true, keywords: 'spaces devices espacios dispositivos organizaciones organizations sensores', route: '/space-devices' },
  { id: 'p-plans', group: 'pages', icon: 'workspace_premium', label: 'sidebar.upgradePlan', translateLabel: true, keywords: 'plans planes premium upgrade mejorar pago suscripción subscription', route: '/select-plan' },
  { id: 'p-settings', group: 'pages', icon: 'settings', label: 'sidebar.settings', translateLabel: true, keywords: 'settings configuración ajustes preferencias', route: '/settings' },
  { id: 'p-profile', group: 'pages', icon: 'person', label: 'settings.profileCard.title', translateLabel: true, detail: 'sidebar.settings', keywords: 'profile perfil cuenta account email correo plan', route: '/settings', fragment: 'profile' },
  { id: 'p-appearance', group: 'pages', icon: 'contrast', label: 'settings.appearanceCard.title', translateLabel: true, detail: 'sidebar.settings', keywords: 'appearance apariencia tema theme modo oscuro claro dark light', route: '/settings', fragment: 'appearance' },
  { id: 'p-language', group: 'pages', icon: 'translate', label: 'settings.languageCard.title', translateLabel: true, detail: 'sidebar.settings', keywords: 'language idioma english español inglés spanish', route: '/settings', fragment: 'language' },
  { id: 'p-session', group: 'pages', icon: 'logout', label: 'settings.sessionCard.title', translateLabel: true, detail: 'sidebar.settings', keywords: 'session sesión logout cerrar salir sign out', route: '/settings', fragment: 'session' },
];

/** Lowercase and strip accents so "configuracion" matches "Configuración". */
const normalize = (text: string): string =>
  text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

@Component({
  selector: 'app-sidebar-search',
  standalone: true,
  imports: [CommonModule, MatIconModule, TranslatePipe],
  templateUrl: './sidebar-search.component.html',
  styleUrl: './sidebar-search.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarSearchComponent {
  private readonly router = inject(Router);
  private readonly translate = inject(TranslateService);
  private readonly deviceFacade = inject(DEVICE_CONTEXT_FACADE) as DeviceContextFacade;
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);
  private readonly host = inject(ElementRef<HTMLElement>);

  @ViewChild('searchInput', { static: true }) private readonly inputRef!: ElementRef<HTMLInputElement>;

  readonly listboxId = 'sidebar-search-results';
  readonly shortcutLabel = /Mac|iPhone|iPad/.test(navigator.platform) ? '⌘K' : 'Ctrl K';

  query = '';
  isOpen = false;
  activeIndex = 0;
  sections: ResultSection[] = [];
  loadingEntities = false;

  private entityEntries: SearchEntry[] = [];
  private entitiesRequested = false;

  get flatResults(): SearchEntry[] {
    return this.sections.flatMap((s) => s.items);
  }

  get activeDescendant(): string | null {
    const active = this.flatResults[this.activeIndex];
    return this.isOpen && active ? this.optionId(active) : null;
  }

  optionId(entry: SearchEntry): string {
    return `sidebar-search-option-${entry.id}`;
  }

  indexOf(entry: SearchEntry): number {
    return this.flatResults.indexOf(entry);
  }

  onFocus(): void {
    this.loadEntities();
    if (this.query.trim()) {
      this.isOpen = true;
    }
  }

  onInput(value: string): void {
    this.query = value;
    this.activeIndex = 0;
    this.isOpen = value.trim().length > 0;
    this.refresh();
  }

  onKeydown(event: KeyboardEvent): void {
    const total = this.flatResults.length;
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        if (!this.isOpen && this.query.trim()) this.isOpen = true;
        if (total) this.activeIndex = (this.activeIndex + 1) % total;
        this.scrollActiveIntoView();
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (total) this.activeIndex = (this.activeIndex - 1 + total) % total;
        this.scrollActiveIntoView();
        break;
      case 'Enter': {
        const target = this.flatResults[this.activeIndex];
        if (this.isOpen && target) {
          event.preventDefault();
          this.select(target);
        }
        break;
      }
      case 'Escape':
        if (this.isOpen) {
          event.preventDefault();
          this.isOpen = false;
        } else if (this.query) {
          this.clear();
        } else {
          this.inputRef.nativeElement.blur();
        }
        break;
    }
    this.cdr.markForCheck();
  }

  select(entry: SearchEntry): void {
    this.router.navigate([entry.route], { queryParams: entry.queryParams, fragment: entry.fragment });
    this.clear();
    this.inputRef.nativeElement.blur();
  }

  clear(): void {
    this.query = '';
    this.isOpen = false;
    this.activeIndex = 0;
    this.sections = [];
    this.inputRef.nativeElement.value = '';
    this.cdr.markForCheck();
  }

  labelOf(entry: SearchEntry): string {
    return entry.translateLabel ? this.translate.instant(entry.label) : entry.label;
  }

  /** Ctrl/Cmd + K focuses the search from anywhere in the app. */
  @HostListener('document:keydown', ['$event'])
  onGlobalKeydown(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.inputRef.nativeElement.focus();
      this.inputRef.nativeElement.select();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    if (this.isOpen && !this.host.nativeElement.contains(event.target as Node)) {
      this.isOpen = false;
      this.cdr.markForCheck();
    }
  }

  private refresh(): void {
    const q = normalize(this.query);
    if (!q) {
      this.sections = [];
      return;
    }

    const terms = q.split(/\s+/);
    const score = (entry: SearchEntry): number => {
      const label = normalize(this.labelOf(entry));
      const detail = entry.detail && entry.translateLabel ? this.translate.instant(entry.detail) : entry.detail ?? '';
      const haystack = `${label} ${normalize(detail)} ${normalize(entry.keywords)}`;
      if (!terms.every((t) => haystack.includes(t))) return -1;
      // Label prefix beats a word inside the label, which beats a keyword-only match.
      if (label.startsWith(q)) return 0;
      if (label.includes(q)) return 1;
      return 2;
    };

    const rank = (entries: SearchEntry[]): SearchEntry[] =>
      entries
        .map((entry) => ({ entry, s: score(entry) }))
        .filter((r) => r.s >= 0)
        .sort((a, b) => a.s - b.s)
        .slice(0, MAX_PER_GROUP)
        .map((r) => r.entry);

    const groups: ResultGroup[] = ['pages', 'spaces', 'devices'];
    const all = [...PAGE_ENTRIES, ...this.entityEntries];
    this.sections = groups
      .map((group) => ({ group, items: rank(all.filter((e) => e.group === group)) }))
      .filter((s) => s.items.length > 0);
  }

  private scrollActiveIntoView(): void {
    const id = this.activeDescendant;
    if (!id) return;
    queueMicrotask(() => document.getElementById(id)?.scrollIntoView({ block: 'nearest' }));
  }

  /** Spaces and devices are fetched once, the first time the search gets focus. */
  private loadEntities(): void {
    if (this.entitiesRequested) return;
    this.entitiesRequested = true;
    this.loadingEntities = true;

    this.deviceFacade
      .getOrganizations()
      .pipe(
        switchMap((orgs) =>
          orgs.length === 0
            ? of([] as { orgName: string; spaces: FacadeSpace[] }[])
            : forkJoin(
                orgs.map((org) =>
                  this.deviceFacade.getSpacesByOrganization(org.id).pipe(
                    map((spaces) => ({ orgName: org.name, spaces })),
                    catchError(() => of({ orgName: org.name, spaces: [] as FacadeSpace[] })),
                  ),
                ),
              ),
        ),
        switchMap((byOrg) => {
          const spaces = byOrg.flatMap((o) => o.spaces.map((space) => ({ space, orgName: o.orgName })));
          if (spaces.length === 0) return of({ spaces, devices: [] as { device: FacadeDevice; space: FacadeSpace }[] });
          return forkJoin(
            spaces.map(({ space }) =>
              this.deviceFacade.getDevicesBySpace(space.id).pipe(
                map((devices) => devices.map((device) => ({ device, space }))),
                catchError(() => of([] as { device: FacadeDevice; space: FacadeSpace }[])),
              ),
            ),
          ).pipe(map((lists) => ({ spaces, devices: lists.flat() })));
        }),
        catchError(() => of({ spaces: [], devices: [] })),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(({ spaces, devices }) => {
        this.entityEntries = [
          ...spaces.map(({ space, orgName }) => ({
            id: `s-${space.id}`,
            group: 'spaces' as const,
            icon: 'meeting_room',
            label: space.name,
            translateLabel: false,
            detail: orgName,
            keywords: '',
            route: '/space-devices',
            queryParams: { spaceId: space.id },
          })),
          ...devices.map(({ device, space }) => ({
            id: `d-${device.id}`,
            group: 'devices' as const,
            icon: 'sensors',
            label: device.name,
            translateLabel: false,
            detail: space.name,
            keywords: device.serialNumber ?? '',
            route: '/space-devices',
            queryParams: { spaceId: space.id, deviceId: device.id },
          })),
        ];
        this.loadingEntities = false;
        this.refresh();
        this.cdr.markForCheck();
      });
  }
}
