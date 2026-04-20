export interface HeatmapItem { 
    date: string; count: number; 
}

export interface ContributionsData {
  heatmap: HeatmapItem[];
  monthlyTotals: { [year: string]: number[] };
  busiestMonth: { [year: string]: string };
}

export interface ChartColors {
    textStyleColor: string;
    tooltipBackgroundColor: string;
    itemBorderColor: string;
    itemColor: string;
    splitLineColor: string;
    seriesItemColor: string;
}