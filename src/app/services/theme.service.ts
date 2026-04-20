import { Injectable, signal, WritableSignal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private darkModeSignal: WritableSignal<boolean> = signal(false);

  public isDarkMode(): boolean {
    return this.darkModeSignal();
  }

  public toggleDarkMode(): void {
    this.darkModeSignal.set(!this.darkModeSignal());
  }

  public get darkMode(): WritableSignal<boolean> {
    return this.darkModeSignal;
  }
}