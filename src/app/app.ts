import { Component, inject, effect } from '@angular/core';
import { ThemeService } from './services/theme.service';
import { TranslateService } from '@ngx-translate/core';
import { faSun, faMoon, faCaretDown, IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgFor } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HeatmapComponent } from './components/heatmap/heatmap.component';
import { Language } from './models/language.model';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FontAwesomeModule, NgFor, FormsModule, HeatmapComponent],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  public faSun: IconDefinition = faSun;
  public faMoon: IconDefinition = faMoon;
  public faCaretDown: IconDefinition = faCaretDown;

  public languages: Language[] = [
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
    { code: 'es', label: 'Español' },
    { code: 'fr', label: 'Français' }
  ];

  public theme: ThemeService = inject(ThemeService);
  public translate: TranslateService = inject(TranslateService);

  constructor() {
    effect(() => {
      document.body.classList.toggle('dark-mode', this.theme.darkMode());
    });

    this.translate.setDefaultLang('en');
    this.translate.use('en');

  }

  public changeLanguage(event: Event): void {
    const select: HTMLSelectElement = event.target as HTMLSelectElement;
    this.translate.use(select.value);
  }
}