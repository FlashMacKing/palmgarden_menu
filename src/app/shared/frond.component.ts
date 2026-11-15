import { Component, Input, OnChanges } from '@angular/core';

type Pt = [number, number];

/**
 * A feather-palm frond, generated: a curved rachis with leaflets on both sides
 * that grow then taper toward the tip. Base sits at the bottom centre of the box.
 */
@Component({
  selector: 'app-frond',
  standalone: true,
  template: `
    <svg viewBox="0 0 300 420" aria-hidden="true">
      <path [attr.d]="leaves" fill="currentColor" />
      <path [attr.d]="rachis" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" />
    </svg>
  `,
  styles: [`:host { display: block; line-height: 0; } svg { width: 100%; height: auto; overflow: visible; }`],
})
export class FrondComponent implements OnChanges {
  /** Sideways curvature of the rachis, -1 … 1. */
  @Input() bend = 0.4;
  @Input() count = 24;

  leaves = '';
  rachis = '';

  constructor() {
    this.build();
  }

  ngOnChanges(): void {
    this.build();
  }

  private build(): void {
    const B: Pt = [150, 418];
    const C: Pt = [150 + this.bend * 150, 210];
    const T: Pt = [150 + this.bend * 90, 18];
    const at = (t: number): Pt => [
      (1 - t) ** 2 * B[0] + 2 * (1 - t) * t * C[0] + t * t * T[0],
      (1 - t) ** 2 * B[1] + 2 * (1 - t) * t * C[1] + t * t * T[1],
    ];
    const tangent = (t: number): Pt => {
      const x = 2 * (1 - t) * (C[0] - B[0]) + 2 * t * (T[0] - C[0]);
      const y = 2 * (1 - t) * (C[1] - B[1]) + 2 * t * (T[1] - C[1]);
      const l = Math.hypot(x, y);
      return [x / l, y / l];
    };
    const rot = ([x, y]: Pt, a: number): Pt => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a)];
    const f = (n: number) => n.toFixed(1);

    let d = '';
    for (let i = 0; i < this.count; i++) {
      const t = 0.14 + (i / (this.count - 1)) * 0.84;
      const P = at(t);
      const u = tangent(t);
      const len = 108 * Math.pow(Math.sin(Math.PI * (0.12 + 0.88 * t)), 0.75) * (1 - 0.3 * t) + 6;
      const angle = ((52 - 26 * t) * Math.PI) / 180;
      for (const side of [-1, 1]) {
        // Leaflets point forward along the rachis and droop slightly with gravity.
        let dir = rot(u, side * angle);
        dir = [dir[0], dir[1] + 0.28];
        const dl = Math.hypot(dir[0], dir[1]);
        dir = [dir[0] / dl, dir[1] / dl];
        const n: Pt = [-dir[1], dir[0]];
        const w = len * 0.11;
        const E: Pt = [P[0] + dir[0] * len, P[1] + dir[1] * len];
        const M: Pt = [P[0] + dir[0] * len * 0.45, P[1] + dir[1] * len * 0.45];
        d +=
          `M${f(P[0])} ${f(P[1])}` +
          `Q${f(M[0] + n[0] * w)} ${f(M[1] + n[1] * w)} ${f(E[0])} ${f(E[1])}` +
          `Q${f(M[0] - n[0] * w * 0.6)} ${f(M[1] - n[1] * w * 0.6)} ${f(P[0])} ${f(P[1])}Z`;
      }
    }
    this.leaves = d;
    this.rachis = `M${B[0]} ${B[1]}Q${f(C[0])} ${f(C[1])} ${f(T[0])} ${f(T[1])}`;
  }
}
