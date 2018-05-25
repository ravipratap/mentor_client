import { NgModule } from '@angular/core';
import { StarRatingComponent } from './star-rating/star-rating';
import { AutoCompleteComponent } from './auto-complete/auto-complete';
import { IonicModule } from 'ionic-angular';
@NgModule({
	declarations: [
		StarRatingComponent,
	// AutoCompleteComponent
],
	imports: [IonicModule],
	exports: [
		StarRatingComponent,
	// AutoCompleteComponent
]
})
export class ComponentsModule {}
