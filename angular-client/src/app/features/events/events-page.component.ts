import { Component } from '@angular/core';

import { PlaceholderPanelComponent } from '../../shared/placeholder-panel.component';

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [PlaceholderPanelComponent],
  template: `
    <app-placeholder-panel eyebrow="Activity" title="Story Events" />
  `
})
export class EventsPageComponent {
}
