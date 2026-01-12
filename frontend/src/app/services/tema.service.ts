import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private STORAGE_KEY = 'tema-escuro';
  private temaEscuroSubject = new BehaviorSubject<boolean>(false);
  public temaEscuro$ = this.temaEscuroSubject.asObservable();

  constructor() {
    this.carregarTema();
  }

  private carregarTema() {
    const temaGuardado = localStorage.getItem(this.STORAGE_KEY);
    const escuro = temaGuardado === 'true';
    this.temaEscuroSubject.next(escuro);
    this.aplicarTema(escuro);
  }

  alternarTema() {
    const novoEstado = !this.temaEscuroSubject.value;
    this.temaEscuroSubject.next(novoEstado);
    localStorage.setItem(this.STORAGE_KEY, novoEstado.toString());
    this.aplicarTema(novoEstado);
  }

  getTemaEscuro(): boolean {
    return this.temaEscuroSubject.value;
  }

  private aplicarTema(escuro: boolean) {
    const root = document.documentElement;
    
    if (escuro) {
      // Paleta Escura
      root.style.setProperty('--color-primary', '#2d5777');
      root.style.setProperty('--color-accent', '#F0C808');
      root.style.setProperty('--color-background', '#1a1a1a');
      root.style.setProperty('--color-card', '#2a2a2a');
      root.style.setProperty('--color-text-primary', '#ffffff');
      root.style.setProperty('--color-text-secondary', '#cccccc');
      root.style.setProperty('--color-border', '#444444');
      root.style.setProperty('--color-shadow', 'rgba(0, 0, 0, 0.5)');
      root.style.setProperty('--ion-color-primary', '#5a9fd4');
      root.style.setProperty('--ion-color-primary-rgb', '90,159,212');
      root.style.setProperty('--ion-color-primary-contrast', '#ffffff');
    } else {
      // Paleta Original (Clara)
      root.style.setProperty('--color-primary', '#33658A');
      root.style.setProperty('--color-accent', '#F0C808');
      root.style.setProperty('--color-background', '#FFF1D0');
      root.style.setProperty('--color-card', '#ffffff');
      root.style.setProperty('--color-text-primary', '#333333');
      root.style.setProperty('--color-text-secondary', '#666666');
      root.style.setProperty('--color-border', '#e0e0e0');
      root.style.setProperty('--color-shadow', 'rgba(0, 0, 0, 0.1)');
      root.style.setProperty('--ion-color-primary', '#33658A');
      root.style.setProperty('--ion-color-primary-rgb', '51,101,138');
      root.style.setProperty('--ion-color-primary-contrast', '#ffffff');
    }
  }
}
