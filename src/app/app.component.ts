import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'image-gallery';
  url2 = 'http://assets.loris.ai/home-assignment-gallery-feed.json';
  url = 'http://localhost:4200/assets/home-assignment-gallery-feed.json';

}
