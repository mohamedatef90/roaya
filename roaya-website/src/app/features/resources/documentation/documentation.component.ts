import { Component } from '@angular/core';
import { ComingSoonComponent } from '../coming-soon/coming-soon.component';

@Component({
  selector: 'app-documentation',
  standalone: true,
  imports: [ComingSoonComponent],
  template: `<app-coming-soon type="documentation" />`
})
export class DocumentationComponent {}
