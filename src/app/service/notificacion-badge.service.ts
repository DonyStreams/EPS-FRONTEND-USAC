import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificacionBadgeService {
  private countSubject = new BehaviorSubject<number>(0);
  readonly count$: Observable<number> = this.countSubject.asObservable();

  setCount(count: number): void {
    this.countSubject.next(count ?? 0);
  }
}
