import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  PLATFORM_ID,
  ViewChild,
  computed,
  inject,
  signal,
} from '@angular/core';
import { NgTemplateOutlet, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CORKAGE_FEE, CURRENCY, HAPPY_HOUR, MENU, happyPrice, MenuCategory, MenuItem, MenuSection, Price, formatPrice } from '../menu.data';
import { LogoComponent } from '../shared/logo.component';
import { FrondComponent } from '../shared/frond.component';

/** Hero fronds. x/y place the frond's base (as % of the hero), rot aims it (deg, clockwise from up). */
interface Frond { x: number; y: number; w: number; rot: number; bend: number; tone: 'deep' | 'mid' | 'lit'; depth: number; delay: number; }

const FRONDS: Frond[] = [
  { x: 4, y: 104, w: 330, rot: 28, bend: 0.5, tone: 'deep', depth: 0.4, delay: 0 },
  { x: 98, y: 100, w: 310, rot: -32, bend: -0.45, tone: 'deep', depth: 0.5, delay: 0.08 },
  { x: -6, y: 26, w: 230, rot: 118, bend: 0.4, tone: 'mid', depth: 0.9, delay: 0.18 },
  { x: 106, y: 18, w: 240, rot: -122, bend: -0.35, tone: 'mid', depth: 1, delay: 0.26 },
  { x: 108, y: 70, w: 180, rot: -74, bend: 0.3, tone: 'lit', depth: 1.5, delay: 0.36 },
  { x: -8, y: 64, w: 160, rot: 70, bend: -0.3, tone: 'lit', depth: 1.4, delay: 0.44 },
];

interface SearchGroup {
  category: MenuCategory;
  section: MenuSection;
  items: MenuItem[];
}

const normalize = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[’']/g, '').toLowerCase().trim();

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [LogoComponent, FrondComponent, NgTemplateOutlet, RouterLink],
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.scss',
})
export class MenuComponent implements AfterViewInit, OnDestroy {
  @ViewChild('toolbar') toolbar?: ElementRef<HTMLElement>;
  @ViewChild('chips') chips?: ElementRef<HTMLElement>;
  @ViewChild('content') content?: ElementRef<HTMLElement>;
  @ViewChild('hero') hero?: ElementRef<HTMLElement>;
  @ViewChild('toTop') toTop?: ElementRef<HTMLElement>;
  @ViewChild('search') searchInput?: ElementRef<HTMLInputElement>;

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);
  private observer?: IntersectionObserver;
  private removeScroll?: () => void;

  readonly sections = MENU;
  readonly currency = CURRENCY;
  readonly corkage = CORKAGE_FEE;
  readonly fronds = FRONDS;
  readonly hh = HAPPY_HOUR;
  readonly bubbles = Array.from({ length: 9 });
  readonly palm = 'PALM'.split('');
  readonly garden = 'GARDEN'.split('');

  readonly sectionId = signal<MenuSection['id']>('drinks');
  readonly activeCategory = signal<string>(MENU[0].categories[0].id);
  readonly query = signal('');
  readonly searchOpen = signal(false);

  readonly section = computed(() => this.sections.find((s) => s.id === this.sectionId())!);

  readonly results = computed<SearchGroup[]>(() => {
    const q = normalize(this.query());
    if (!q) return [];
    const groups: SearchGroup[] = [];
    for (const section of this.sections) {
      for (const category of section.categories) {
        const catHit = normalize(category.title).includes(q);
        const items = category.items.filter(
          (i) => catHit || normalize(i.name).includes(q) || normalize(i.note ?? '').includes(q),
        );
        if (items.length) groups.push({ category, section, items });
      }
    }
    return groups;
  });

  readonly resultCount = computed(() => this.results().reduce((n, g) => n + g.items.length, 0));

  ngAfterViewInit(): void {
    this.observeSections();
    this.bindHeroParallax();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
    this.removeScroll?.();
  }

  // --- template helpers -------------------------------------------------

  /** Discounted price when the happy hour covers this category. */
  deal(categoryId: string, value: number): number | null {
    return happyPrice(categoryId, value);
  }

  isSingle(item: MenuItem): boolean {
    return item.prices.length === 1 && !item.prices[0].label;
  }

  int(price: Price): string {
    return formatPrice(price.value).split(',')[0];
  }

  dec(price: Price): string {
    return ',' + formatPrice(price.value).split(',')[1];
  }

  frondStyle(f: Frond): Record<string, string> {
    // Sizing lives in CSS so it can scale per breakpoint.
    return {
      '--x': String(f.x),
      '--y': String(f.y),
      '--w': String(f.w),
      rotate: `${f.rot}deg`,
      '--depth': String(f.depth),
      '--delay': `${f.delay}s`,
    };
  }

  // --- interactions -----------------------------------------------------

  selectSection(id: MenuSection['id']): void {
    if (id === this.sectionId() && !this.query()) return;
    this.query.set('');
    if (this.searchOpen() && this.searchInput) {
      this.searchInput.nativeElement.value = '';
      this.searchInput.nativeElement.blur();
      this.searchOpen.set(false);
    }
    this.sectionId.set(id);
    this.activeCategory.set(this.section().categories[0].id);
    if (!this.isBrowser) return;
    // Wait for the new section (and the chip bar, hidden during search) to render,
    // then jump to its top, recentre the chips and re-arm the scroll spy.
    requestAnimationFrame(() => {
      this.scrollChipIntoView(this.activeCategory());
      this.scrollToContentTop();
      this.observeSections();
    });
  }

  onSearch(value: string): void {
    const wasEmpty = !this.query();
    this.query.set(value);
    if (!this.isBrowser) return;
    if (wasEmpty && value) this.scrollToContentTop();
    if (!value) requestAnimationFrame(() => this.observeSections());
  }

  toggleSearch(input: HTMLInputElement): void {
    const open = !this.searchOpen();
    this.searchOpen.set(open);
    if (open) {
      // Focus synchronously inside the tap so mobile browsers open the keyboard.
      input.focus({ preventScroll: true });
    } else {
      input.value = '';
      input.blur();
      this.onSearch('');
    }
    if (this.isBrowser) setTimeout(() => this.observeSections(), 320);
  }

  backToTop(): void {
    const el = this.content?.nativeElement;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY - this.toolbarHeight() - 8;
    window.scrollTo({ top, behavior: this.motionOk() ? 'smooth' : 'auto' });
  }

  goToCategory(id: string, event?: Event): void {
    event?.preventDefault();
    if (!this.isBrowser) return;
    const el = document.getElementById(id);
    if (!el) return;
    this.activeCategory.set(id);
    this.scrollChipIntoView(id);
    const top = el.getBoundingClientRect().top + window.scrollY - this.toolbarHeight() - 12;
    window.scrollTo({ top, behavior: this.motionOk() ? 'smooth' : 'auto' });
  }

  // --- scroll plumbing --------------------------------------------------

  /** Writes hero scroll progress (0…1) to --p; CSS turns it into parallax. */
  private bindHeroParallax(): void {
    const hero = this.hero?.nativeElement;
    if (!this.isBrowser || !hero) return;
    const parallax = this.motionOk();
    this.zone.runOutsideAngular(() => {
      let frame = 0;
      let lastY = window.scrollY;
      const update = () => {
        frame = 0;
        const y = window.scrollY;
        const p = Math.min(1, Math.max(0, y / hero.offsetHeight));
        if (parallax) hero.style.setProperty('--p', p.toFixed(3));
        // Show "back to top" only while scrolling up deep in the list, so it never sits on a price
        // while reading. Plain class toggle: no change detection needed.
        const deep = y > hero.offsetHeight + window.innerHeight * 0.6;
        if (Math.abs(y - lastY) > 6) {
          this.toTop?.nativeElement.classList.toggle('is-visible', deep && y < lastY);
          lastY = y;
        } else if (!deep) {
          this.toTop?.nativeElement.classList.remove('is-visible');
        }
      };
      const onScroll = () => { if (!frame) frame = requestAnimationFrame(update); };
      window.addEventListener('scroll', onScroll, { passive: true });
      update();
      this.removeScroll = () => window.removeEventListener('scroll', onScroll);
    });
  }

  private observeSections(): void {
    if (!this.isBrowser || !('IntersectionObserver' in window)) return;
    this.observer?.disconnect();
    const offset = this.toolbarHeight();
    this.observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting);
        if (!visible.length) return;
        const top = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        const id = top.target.id;
        if (id && id !== this.activeCategory()) this.zone.run(() => {
          this.activeCategory.set(id);
          this.scrollChipIntoView(id);
        });
      },
      { rootMargin: `-${offset + 20}px 0px -55% 0px` },
    );
    this.content?.nativeElement.querySelectorAll('section.cat').forEach((s) => this.observer!.observe(s));
  }

  private scrollChipIntoView(id: string): void {
    const bar = this.chips?.nativeElement;
    const chip = bar?.querySelector<HTMLElement>(`[data-cat="${id}"]`);
    if (!bar || !chip) return;
    const left = chip.offsetLeft - bar.clientWidth / 2 + chip.clientWidth / 2;
    bar.scrollTo({ left, behavior: this.motionOk() ? 'smooth' : 'auto' });
  }

  private scrollToContentTop(): void {
    const el = this.content?.nativeElement;
    if (!el) return;
    const target = el.getBoundingClientRect().top + window.scrollY - this.toolbarHeight() - 8;
    if (window.scrollY > target) window.scrollTo({ top: target, behavior: 'auto' });
  }

  private toolbarHeight(): number {
    return this.toolbar?.nativeElement.offsetHeight ?? 0;
  }

  private motionOk(): boolean {
    return !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
}
