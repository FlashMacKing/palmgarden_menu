import { Component, NgZone, PLATFORM_ID, afterNextRender, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { RouterLink } from '@angular/router';
import { LogoComponent } from '../shared/logo.component';
import { FrondComponent } from '../shared/frond.component';

const INK = '#0d2418';

/** qrcode is CommonJS: its API may sit on the namespace or on `default`. */
async function loadQr(): Promise<typeof import('qrcode')> {
  const mod: any = await import('qrcode');
  return mod.default ?? mod;
}

/** Printable table card with a QR code that opens the menu. */
@Component({
  selector: 'app-qr',
  standalone: true,
  imports: [LogoComponent, FrondComponent, RouterLink],
  templateUrl: './qr.component.html',
  styleUrl: './qr.component.scss',
})
export class QrComponent {
  private readonly sanitizer = inject(DomSanitizer);
  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private readonly zone = inject(NgZone);

  readonly url = signal('');
  readonly svg = signal<SafeHtml | null>(null);

  constructor() {
    afterNextRender(() => {
      // Default to the address this app is served from, e.g. https://palmgarden.tn/
      this.zone.run(() => this.update(new URL('.', document.baseURI).href));
    });
  }

  async update(value: string): Promise<void> {
    this.url.set(value.trim());
    if (!this.isBrowser || !this.url()) {
      this.svg.set(null);
      return;
    }
    const QR = await loadQr();
    const markup = await QR.toString(this.url(), {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 0,
      color: { dark: INK, light: '#0000' },
    });
    // Markup is generated locally by the qrcode library, not user HTML.
    this.svg.set(this.sanitizer.bypassSecurityTrustHtml(markup));
  }

  async downloadPng(): Promise<void> {
    if (!this.url()) return;
    const QR = await loadQr();
    const dataUrl = await QR.toDataURL(this.url(), {
      errorCorrectionLevel: 'M',
      width: 1200,
      margin: 2,
      color: { dark: INK, light: '#ffffff' },
    });
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = 'palm-garden-menu-qr.png';
    a.click();
  }

  print(): void {
    window.print();
  }
}
