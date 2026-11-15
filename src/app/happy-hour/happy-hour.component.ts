import { Component, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HAPPY_HOUR, MENU, MenuItem, formatPrice, happyPrice } from '../menu.data';
import { LogoComponent } from '../shared/logo.component';

interface Deal {
  name: string;
  was: number;
  now: number;
}

interface Burst {
  id: number;
  pieces: { x: number; y: number; r: number; d: number; c: string; s: number }[];
}

const COLORS = ['#f5b942', '#ffcf5c', '#ff5a4e', '#f2e8d0', '#7fd6a2'];

@Component({
  selector: 'app-happy-hour',
  standalone: true,
  imports: [RouterLink, LogoComponent],
  templateUrl: './happy-hour.component.html',
  styleUrl: './happy-hour.component.scss',
})
export class HappyHourComponent {
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  readonly hh = HAPPY_HOUR;
  readonly happy = 'HAPPY'.split('');
  readonly hour = 'HOUR'.split('');
  readonly glassBubbles = Array.from({ length: 12 });
  readonly ticker = Array.from({ length: 6 });

  readonly deals: Deal[] = (MENU.flatMap((s) => s.categories).find((c) => c.id === HAPPY_HOUR.categoryId)?.items ?? [])
    .filter((i: MenuItem) => i.prices.length === 1)
    .map((i) => ({ name: i.name, was: i.prices[0].value, now: happyPrice(HAPPY_HOUR.categoryId, i.prices[0].value) ?? i.prices[0].value }));

  readonly bursts = signal<Burst[]>([]);
  readonly cheers = signal(0);
  private nextId = 0;

  piece(p: Burst['pieces'][number]): Record<string, string> {
    return { '--x': `${p.x}px`, '--y': `${p.y}px`, '--r': `${p.r}deg`, '--d': `${p.d}s`, '--s': `${p.s}px`, background: p.c };
  }

  price(v: number): string {
    return formatPrice(v);
  }

  int(v: number): string {
    return formatPrice(v).split(',')[0];
  }

  /** "Santé !" — clink the glasses and throw a little confetti. */
  toast(): void {
    this.cheers.update((n) => n + 1);
    if (!this.isBrowser || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = this.nextId++;
    const pieces = Array.from({ length: 26 }, (_, i) => {
      const angle = (i / 26) * Math.PI * 2 + Math.random() * 0.4;
      const dist = 70 + Math.random() * 90;
      return {
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist - 40,
        r: Math.random() * 540 - 270,
        d: Math.random() * 0.15,
        c: COLORS[i % COLORS.length],
        s: 6 + Math.random() * 6,
      };
    });
    this.bursts.update((b) => [...b, { id, pieces }]);
    setTimeout(() => this.bursts.update((b) => b.filter((x) => x.id !== id)), 1400);
    navigator.vibrate?.(30);
  }
}
