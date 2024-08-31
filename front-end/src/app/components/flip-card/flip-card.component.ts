import { Component, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'app-flip-card',
  templateUrl: './flip-card.component.html',
  styleUrls: ['./flip-card.component.css'],
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => FlipCardComponent),
      multi: true,
    },
  ],
})
export class FlipCardComponent implements ControlValueAccessor {
  isFlipped = false;
  private _value = true;
  private _disabled: boolean = false;

  onChange: any = () => {};
  onTouched: any = () => {};

  get value() {
    return this._value;
  }

  set value(val: boolean) {
    this._value = val;
    this.isFlipped = !val;
    this.onChange(val);
    this.onTouched();
  }

  flipCard() {
   if (this._disabled) {
      return; // Prevent flipping if the component is disabled
    }
    this.value = !this.value;
  }

  // ControlValueAccessor methods
  writeValue(value: boolean): void {
    this.value = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this._disabled = isDisabled;
  }
}
