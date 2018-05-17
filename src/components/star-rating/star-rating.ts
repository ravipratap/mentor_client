
import { Component, Input, forwardRef } from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';


/**
 * Generated class for the StarRatingComponent component.
 *
 * See https://angular.io/api/core/Component for more info on Angular
 * Components.
 */
@Component({
  selector: 'star-rating',
  templateUrl: 'star-rating.html',
  providers: [
    { 
      provide: NG_VALUE_ACCESSOR,
      multi: true,
      useExisting: forwardRef(() => StarRatingComponent),
    }
  ]
})
export class StarRatingComponent  implements ControlValueAccessor {

  _max: number = 5;
  _readOnly: boolean = false;
  _emptyStarIconName: string = 'star-outline';
  _halfStarIconName: string = 'star-half';
  _starIconName: string = 'star';
  _nullable: boolean = false;

  @Input()
  get max() {
    return this._max;
  }
  set max(val: any) {
    const newValue = this.getNumberPropertyValue(val);
    if (newValue !== this._max) {
      this._max = newValue;
      this.createStarIndexes();
    }
  }

  @Input()
  get readOnly() {
    return this._readOnly;
  }
  set readOnly(val: any) {
    this._readOnly = this.isTrueProperty(val);
  }

  @Input()
  get emptyStarIconName() {
    return this._emptyStarIconName;
  }
  set emptyStarIconName(val: any) {
    this._emptyStarIconName = val;
  }

  @Input()
  get halfStarIconName() {
    return this._halfStarIconName;
  }
  set halfStarIconName(val: any) {
    this._halfStarIconName = val;
  }

  @Input()
  get starIconName() {
    return this._starIconName;
  }
  set starIconName(val: any) {
    this._starIconName = val;
  }

  @Input()
  get nullable() {
    return this._nullable;
  }
  set nullable(val: any) {
    this._nullable = this.isTrueProperty(val);
  }

  innerValue: any;
  starIndexes: Array<number>;

  onChangeCallback: (_: any) => void = () => {};

  ngOnInit() {
    // ngFor needs an array
    this.createStarIndexes();
  }

  createStarIndexes() {
    this.starIndexes = Array(this.max).fill(1).map((x, i) => i);
  }

  getStarIconName(starIndex: number) {
    if (this.value === undefined) {
      return this.emptyStarIconName;
    }

    if (this.value > starIndex) {

      if (this.value < starIndex + 1) {
        return this.halfStarIconName;

      } else {
        return this.starIconName;
      }

    } else {
      return this.emptyStarIconName;
    }
  }

  get value(): any {
    return this.innerValue;
  }

  set value(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
      this.onChangeCallback(value);
    }
  }

  writeValue(value: any) {
    if (value !== this.innerValue) {
      this.innerValue = value;
    }
  }

  registerOnChange(fn: any) {
    this.onChangeCallback = fn;
  }

  registerOnTouched(fn: any) {
  }

  onKeyDown(event: any) {
    if (/(37|38|39|40)/.test(event.which)) {
      event.preventDefault();
      event.stopPropagation();

      let newValue = this.value + ((event.which == 38 || event.which == 39) ? 1 : -1);
      return this.rate(newValue);
    }
  }

  rate(value: number) {
    if (this.readOnly || value < 0 || value > this.max) {
      return;
    }

    if (value === this.value && this.nullable) {
      value = null;
    }

    this.value = value;
  }

  private isTrueProperty(val: any): boolean {
    if (typeof val === 'string') {
      val = val.toLowerCase().trim();
      return (val === 'true' || val === 'on');
    }
    return !!val;
  }

  private getNumberPropertyValue(val: any): number {
    if (typeof val === 'string') {
      return parseInt(val.trim());
    }
    return val;
  }

}
