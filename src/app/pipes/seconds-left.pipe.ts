import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'secondsLeft',
  pure: true,
  standalone: true,
})
export class SecondsLeftPipe implements PipeTransform {
  /**
   * Transforms the input value from milliseconds to seconds.
   * @param value - The input value in milliseconds.
   * @returns A string indicating the number of seconds left.
   */
  transform(value: number): string {
    const amount = Math.floor(value / 1000);
    return `${amount}`;
  }
}
