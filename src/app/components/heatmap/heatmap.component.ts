import {
  Component,
  AfterViewInit,
  ElementRef,
  ViewChild,
  signal,
  computed,
  effect,
  inject,
  type Signal,
  WritableSignal
} from '@angular/core';
import * as echarts from 'echarts';
import { ChartColors, HeatmapItem } from '../../models/heatmap.model';
import { ThemeService } from '../../services/theme.service';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { ContributionsService } from '../../services/contributions.service';

@Component({
  selector: 'app-heatmap',
  standalone: true,
  imports: [TranslateModule],
  templateUrl: './heatmap.component.html',
  styleUrls: ['./heatmap.component.scss']
})
export class HeatmapComponent implements AfterViewInit {

  @ViewChild('chartContainer', { static: true })
  public chartContainer: ElementRef<HTMLDivElement> | undefined;

  private chart: echarts.ECharts | null = null

  private contributionsService: ContributionsService = inject(ContributionsService);
  private themeService: ThemeService = inject(ThemeService);
  private translateService: TranslateService = inject(TranslateService);

  private heatmap: Signal<HeatmapItem[]> = this.contributionsService.heatmap;

  public selectedYear: WritableSignal<number | null> = signal<number | null>(null);
  public selectedPalette: WritableSignal<string> = signal<string>('green');

  private chartReady: WritableSignal<boolean> = signal(false);

  private darkMode: Signal<boolean> = computed(() => this.themeService.isDarkMode());

  private chartColorStyles: Signal<ChartColors> = computed(() => {
    const dark: boolean = this.darkMode();
    return {
      textStyleColor: dark ? '#FFF' : '#000',
      tooltipBackgroundColor: dark ? '#333' : '#fff',
      itemBorderColor: dark ? '#333' : '#ccc',
      itemColor: dark ? '#1e1e1e' : '#fff',
      splitLineColor: dark ? '#989898' : 'rgb(52,52,52)',
      seriesItemColor: dark ? '#464646' : '#ecebeb'
    };
  });

  public colorPalettes: Record<string, string[]> = {
    green:  ['#f0fff0', '#b2f2b2', '#80e080', '#4cd94c', '#1fbf1f'],
    orange: ['#fff4e6', '#ffd699', '#ffb84d', '#ff9900', '#ff6600'],
    blue:   ['#e6f2ff', '#99ccff', '#66b3ff', '#3399ff', '#0066ff'],
    red:    ['#ffe6e6', '#ff9999', '#ff6666', '#ff3333', '#ff0000'],
    brown:  ['#f5ede6', '#e0c9b2', '#cca680', '#b37d4c', '#995c33'],
    purple: ['#f5e6ff', '#d9b3ff', '#c280ff', '#a64dff', '#8000ff']
  };
  public paletteKeys: string[] = Object.keys(this.colorPalettes);

  private yearCache: Map<string, number> = new Map<string, number>();

  private getYear(date: string): number {
    if (!this.yearCache.has(date)) {
      this.yearCache.set(date, new Date(date).getFullYear());
    }
    return this.yearCache.get(date)!;
  }

  private years: Signal<number[]> = computed(() =>
    [...new Set(this.heatmap().map(d => this.getYear(d.date)))].sort((a,b) => a-b)
  );

  private yearData: Signal<[string, number][]> = computed(() =>
    this.heatmap()
      .filter(d => this.getYear(d.date) === this.selectedYear())
      .map(d => [d.date, Number(d.count)] as [string, number])
  );

  private maxCount: Signal<number> = computed(() => {
    const data = this.yearData();
    return data.length ? Math.max(...data.map(d => d[1])) : 0;
  });

  public isFirstYear: Signal<boolean> = computed(() =>
    this.years().length > 0 && this.selectedYear() === this.years()[0]
  );

  public isLastYear: Signal<boolean> = computed(() =>
    this.years().length > 0 && this.selectedYear() === this.years()[this.years().length - 1]
  );

  constructor() {
    effect(() => {
      const years: number[] = this.years();

      if (years.length && (this.selectedYear() === null || !years.includes(this.selectedYear()!))) {
        this.selectedYear.set(years[0]);
      }

      if (this.chartReady()) {
        this.updateChart();
      }
    });

    this.translateService.onLangChange.subscribe(() => {
      if (this.chartReady()) {
        requestAnimationFrame(() => this.updateChart());
      }
    });
  }

  public ngAfterViewInit(): void {
    this.chart = echarts.init(this.chartContainer?.nativeElement);
    this.chartReady.set(true);

    if(this.chartContainer) {
      new ResizeObserver(() => this.chart?.resize())
      .observe(this.chartContainer.nativeElement);
    }
  }

  private updateChart(): void {
    const selectedYear: number | null = this.selectedYear();
    const palette: string[] = this.colorPalettes[this.selectedPalette()];
    const isDarkMode: boolean = this.darkMode();
    const heatmapData: [string, number][] = this.yearData();
    if (!heatmapData.length || selectedYear === null) return;

    const max: number = this.maxCount();

    this.chart?.setOption({
      backgroundColor: isDarkMode ? '#121212' : '#fff',
      title: {
        left: 'center',
        textStyle: { color: this.chartColorStyles().textStyleColor },
        title: ''
      },
      tooltip: {
        formatter: (params: any) => {
          const [date, count] = params.value;
          return this.translateService.instant('HEATMAP.TOOLTIP', { date, count });
        },
        backgroundColor: this.chartColorStyles().tooltipBackgroundColor,
        textStyle: { color: this.chartColorStyles().textStyleColor }
      },
      visualMap: {
        min: 0,
        max,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: -10,
        inRange: { color: palette },
        textStyle: { color: this.chartColorStyles().textStyleColor }
      },
      calendar: {
        top: 80,
        left: 60,
        bottom: 50,
        cellSize: ['auto','auto'],
        yearLabel: { show: false },
        dayLabel: {
          show: true,
          margin: 10,
          position: 'start',
          firstDay: 0,
          nameMap: this.translateService.instant('HEATMAP.DAYS') as string[],
          color: this.chartColorStyles().textStyleColor
        },
        monthLabel: {
          nameMap: this.translateService.instant('HEATMAP.MONTHS') as string[],
          color: this.chartColorStyles().textStyleColor
        },
        range: `${selectedYear}`,
        itemStyle: {
          borderColor: this.chartColorStyles().itemBorderColor,
          borderWidth: 1,
          color: this.chartColorStyles().itemColor
        },
        splitLine: {
          show: true,
          lineStyle: {
            color: this.chartColorStyles().splitLineColor,
            width: 1.2
          }
        }
      },
      series: [{
        type: 'heatmap',
        coordinateSystem: 'calendar',
        data: heatmapData.map(([date, count]) => ({
          value: [date, count],
          itemStyle: {
            color: count === 0
              ? this.chartColorStyles().seriesItemColor
              : palette[Math.min(count-1, palette.length-1)]
          }
        }))
      }]
    });
  }

  public prevYear(): void {
    const years: number[] = this.years();
    const indexOfSelectedYear : number= years.indexOf(this.selectedYear()!);
    if (indexOfSelectedYear > 0) {
      this.selectedYear.set(years[indexOfSelectedYear - 1]);
    }
  }

  public nextYear(): void {
    const years: number[] = this.years();
    const indexOfSelectedYear: number = years.indexOf(this.selectedYear()!);
    if (indexOfSelectedYear < years.length - 1) {
      this.selectedYear.set(years[indexOfSelectedYear + 1]);
    }
  }

  public changePalette(palette: string): void {
    this.selectedPalette.set(palette);
  }
}