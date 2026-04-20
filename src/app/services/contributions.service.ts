import { computed, inject, Injectable, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, shareReplay } from 'rxjs';
import { ContributionsData, HeatmapItem } from '../models/heatmap.model';

import { toSignal } from '@angular/core/rxjs-interop';
@Injectable({ providedIn: 'root' })
export class ContributionsService {
  private http: HttpClient = inject(HttpClient);

  private contributions$: Observable<ContributionsData> = this.http
    .get<ContributionsData>('assets/contributions.json')
    .pipe(shareReplay(1));

  public contributions: Signal<ContributionsData | null> = toSignal(this.contributions$, { initialValue: null });

  public heatmap: Signal<HeatmapItem[]> = computed(() => this.contributions()?.heatmap ?? []);

  public monthlyTotals = (year: string): Signal<number[]> =>
    computed(() => this.contributions()?.monthlyTotals[year] ?? []);

  public busiestMonth = (year: string): Signal<string> =>
    computed(() => this.contributions()?.busiestMonth[year] ?? '');
}