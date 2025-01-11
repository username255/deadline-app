import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  Input,
} from '@angular/core';
import {
  interval,
  Observable,
  of,
  Subscription,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs';
import { SecondsLeftPipe } from '../../pipes/seconds-left.pipe';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-deadline',
  imports: [SecondsLeftPipe, NgIf],
  templateUrl: './deadline.component.html',
  styleUrl: './deadline.component.scss',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
/**
 * Displays a countdown timer until a computed deadline.
 * @usageNotes
 * ```html
 * <app-deadline [secondsUntilDeadline]="300"></app-deadline>
 * ```
 * OR
 * ```html
 * <app-deadline [secondsUntilDeadline]="seconds$ | async"></app-deadline>
 * ```
 * @input secondsUntilDeadline - Number of seconds until the deadline.
 **/
export class DeadlineComponent {
  private readonly cr: ChangeDetectorRef = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  private _deadline: number = -1;

  now: number = Date.now();
  isDeadlineTime: boolean = false;

  ref!: Subscription;

  /**
   * Accepts the number of seconds from now until the deadline.
   * @param secondsAway - The number of seconds until the deadline.
   */
  @Input() set secondsUntilDeadline(secondsAway: number) {
    if (this.ref) {
      this.resetDeadline(secondsAway);
    } else {
      this.ref = this.generateDeadline(secondsAway).subscribe();
    }

    // if (this.ref) {
    //   // in case we'll push new deadline values, we need to unsubscribe from the previous one

    // }

    // this.ref = newRef;
  }

  set deadline(value: number) {
    this._deadline = value;
    this.cr.detectChanges();
  }
  get deadline(): number {
    return this._deadline;
  }

  private generateDeadline(secondsAway: number): Observable<number> {
    return of(secondsAway).pipe(
      tap((secondsAway) =>
        setTimeout(() => this.resetDeadline(secondsAway), 0)
      ),
      // needs a delay to prevent skipping N - 1 seconds rendering
      // (eg we render initial 90 and then interval starts after it's already 89
      // and renders 88 after 1 second - 1000 delay from below)
      // so need that 50ms delay to render 89 before interval starts
      tap(() => setTimeout(() => this.setNow(), 100)),
      switchMap(() => interval(1000)),
      tap(() => this.setNow()),
      takeWhile(() => !this.isDeadlineTime),
      takeUntilDestroyed(this.destroyRef)
    );
  }

  private resetDeadline(secondsAway: number): void {
    this.deadline = secondsAway * 1000 + this.now;
  }

  private setNow(): void {
    this.now = Date.now();

    if (!this.deadline) {
      return;
    }

    // due to using math.floor in the pipe need to check if deadline is up before the last tick
    this.isDeadlineTime = this.deadline - this.now < 1000;

    this.cr.detectChanges();
  }
}
