import { HttpHandlerFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { of } from 'rxjs';
import { API_ROUTES } from '../utils/api-routes';

export function mockInterceptor(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
) {
  if (req.url === API_ROUTES.DEADLINE) {
    return of(new HttpResponse({ body: { secondsLeft: 90 }, status: 200 }));
  }
  return next(req);
}
