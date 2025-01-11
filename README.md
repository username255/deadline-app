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

(alternative route could have been with Resource API - which is experimental at the moment, plus signals and effects, though not sure if cutting edge Angular is of much interest to you at the moment, happy to discuss though)
