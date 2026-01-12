import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { trigger, state, style, transition, animate } from '@angular/animations';

export interface NotificationData {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  icon?: string;
  duration?: number; // milliseconds, default 10000
}

@Component({
  selector: 'app-notification-toast',
  standalone: true,
  imports: [CommonModule, IonicModule],
  templateUrl: './notification-toast.component.html',
  styleUrls: ['./notification-toast.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  animations: [
    trigger('slideDown', [
      state('void', style({
        transform: 'translateY(-100%)',
        opacity: 0
      })),
      state('*', style({
        transform: 'translateY(0)',
        opacity: 1
      })),
      transition('void => *', animate('300ms ease-out')),
      transition('* => void', animate('200ms ease-in'))
    ])
  ]
})
export class NotificationToastComponent implements OnInit, OnDestroy {
  @Input() notification!: NotificationData;
  @Output() close = new EventEmitter<string>();

  private autoCloseTimer?: any;

  ngOnInit() {
    // Auto-close após duração especificada (padrão 10 segundos)
    const duration = this.notification.duration || 10000;
    this.autoCloseTimer = setTimeout(() => {
      this.closeNotification();
    }, duration);
  }

  ngOnDestroy() {
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
    }
  }

  closeNotification() {
    this.close.emit(this.notification.id);
  }

  getIcon(): string {
    if (this.notification.icon) {
      return this.notification.icon;
    }

    // Ícones padrão por tipo
    switch (this.notification.type) {
      case 'success':
        return 'checkmark-circle';
      case 'warning':
        return 'warning';
      case 'error':
        return 'close-circle';
      case 'info':
      default:
        return 'information-circle';
    }
  }

  getTypeClass(): string {
    return `notification-${this.notification.type}`;
  }
}
