import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { AsyncPipe, NgIf } from '@angular/common';
import { DeadlineComponent } from '../../components/deadline/deadline.component';
import { DataService } from '../../services/data.service';
import { interval, map, startWith, switchMap, tap, timer } from 'rxjs';

@Component({
  selector: 'app-home',
  imports: [NgIf, AsyncPipe, DeadlineComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  standalone: true,
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {
  private readonly dataService: DataService = inject(DataService);

  readonly secondsUntilDeadline$ = this.dataService
    .getDeadline()
    .pipe(map((response) => response.secondsLeft));

  readonly one$ = this.dataService
    .getDeadline()
    .pipe(map((response) => response.secondsLeft / 3));

  readonly two$ = this.dataService
    .getDeadline()
    .pipe(map((response) => response.secondsLeft / 2));

  readonly three$ = this.dataService
    .getDeadline()
    .pipe(map((response) => response.secondsLeft));

  // just a weird example, when you initially have a value,
  // then it shows deadline
  // then you again push new values
  readonly everyThreeSeconds$ = interval(3000).pipe(
    map((_) => _ * 10),
    startWith(1),
    tap((_) => console.log('everyThreeSeconds$', _))
  );
}
