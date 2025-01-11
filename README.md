# DeadlineApp

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.0.7.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Task (1)

Requested component called `DeadlineComponent` (`deadline.component.ts`)
Takes `secondsUntilDeadline` param as input, which corresponds to `Number of seconds` until the deadline.

```html
<app-deadline [secondsUntilDeadline]="300"></app-deadline>
```

OR

```html
<app-deadline [secondsUntilDeadline]="seconds$ | async"></app-deadline>
```

From features:

- neat interface (facade) with `@Input` for the component, all the heavylifting done internally and doesn't have to bother end users
- manual change detection (OnPush), manual ChangeDetectorRef calls, getters and setters
- updates every second via `rxjs` `interval`
- transforms milliseconds to seconds via `secondsLeft` (pure) pipe
- implemented `mock-interceptor` to return `mock response` from an HTTP call to server
- small adapter was added within the `HomeComponent` - unfolding secondsLeft from within the response object and passing to component as plain value

(alternative route could have been with Resource API - which is experimental at the moment, plus signals and effects, though not sure if cutting edge Angular is of much interest to you at the moment, happy to discuss though)

## Task (2)

Added within `task-2.js` file

Usage is either `node task-2.js` and edit the `console.log` calls at the end of file
or
paste in console and still edit the very bottom of the file

Approach:

- basic sanity checks
- filtering for valid cameras (within range) and adding those to a new list (if memory critical could have been a pointer)
- doing line-sweep the distance dimension, where each camera contributes two events (start/end) sorted by distance
- each event updates a segment tree tracking coverage in the light range, using coordinate compression, whenever the active set of cameras remains fixed over a distance interval, verifying full light coverage
- if all intervals are covered, return true; otherwise false.
