import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-placeholder-panel',
  standalone: true,
  template: `
    <section class="panel">
      <p class="eyebrow">{{ eyebrow }}</p>
      <h1>{{ title }}</h1>
    </section>
  `,
  styles: [`
    .panel {
      border: 1px solid #dde3ee;
      border-radius: 8px;
      background: #ffffff;
      padding: 28px;
    }

    .eyebrow {
      margin: 0 0 8px;
      color: #64748b;
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      color: #172033;
      font-size: 1.8rem;
      line-height: 1.2;
    }
  `]
})
export class PlaceholderPanelComponent {
  @Input({ required: true }) eyebrow = '';
  @Input({ required: true }) title = '';
}
