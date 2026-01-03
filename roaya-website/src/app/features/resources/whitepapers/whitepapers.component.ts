import { Component } from '@angular/core';
import { ComingSoonComponent } from '../coming-soon/coming-soon.component';

@Component({
  selector: 'app-whitepapers',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `<app-coming-soon type="whitepapers" />`
})
export class WhitepapersComponent {}
