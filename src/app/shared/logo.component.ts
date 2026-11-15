import { Component, Input } from '@angular/core';

/** "THE PALM/GARDEN" wordmark: a ring cut by a framed name plate. Uses currentColor. */
@Component({
  selector: 'app-logo',
  standalone: true,
  template: `
    <svg viewBox="0 0 320 130" role="img" aria-label="The Palm Garden" [style.width]="width">
      <circle cx="160" cy="65" r="58" fill="none" stroke="currentColor" stroke-width="3" />
      <rect x="14" y="43" width="292" height="44" [attr.fill]="plate" stroke="currentColor" stroke-width="3" />
      <text x="28" y="60" font-size="10" font-weight="600" fill="currentColor"
            font-family="'Instrument Sans', system-ui, sans-serif">The</text>
      <text x="58" y="79" textLength="236" lengthAdjust="spacingAndGlyphs" font-size="34" font-weight="800"
            fill="currentColor" font-family="'Big Shoulders Display', 'Arial Narrow', sans-serif">PALM/GARDEN</text>
    </svg>
  `,
  styles: [`:host { display: inline-block; line-height: 0; } svg { height: auto; display: block; }`],
})
export class LogoComponent {
  /** Fill colour of the name plate, so the ring looks cut behind it. */
  @Input() plate = 'var(--hero-bg)';
  @Input() width = '240px';
}
