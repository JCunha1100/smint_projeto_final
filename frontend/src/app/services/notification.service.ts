import { Injectable, ApplicationRef, ComponentFactoryResolver, Injector, EmbeddedViewRef, ComponentRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NotificationToastComponent, NotificationData } from '../components/notification-toast/notification-toast.component';
import { TarefasService, Tarefa } from './tarefas-api.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private notifications: NotificationData[] = [];
  private notificationsSubject = new BehaviorSubject<NotificationData[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();
  
  private componentRefs: Map<string, ComponentRef<NotificationToastComponent>> = new Map();
  private checkInterval?: any;
  private notifiedActivities: Set<string> = new Set();

  constructor(
    private componentFactoryResolver: ComponentFactoryResolver,
    private appRef: ApplicationRef,
    private injector: Injector,
    private tarefasService: TarefasService
  ) {}

  // Iniciar verificação automática de atividades
  startActivityNotifications() {
    // Verificar a cada 5 minutos
    this.checkInterval = setInterval(() => {
      this.checkUpcomingActivities();
    }, 5 * 60 * 1000);

    // Verificar imediatamente ao iniciar
    this.checkUpcomingActivities();
  }

  stopActivityNotifications() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
    }
  }

  // Verificar atividades próximas e criar notificações
  private checkUpcomingActivities() {
    const tarefas = this.tarefasService.getTarefas();
    const now = new Date();
    
    tarefas.forEach(tarefa => {
      // Apenas notificar atividades futuras que tenham horário definido
      if (!tarefa.hora) return;

      const activityDateTime = this.parseActivityDateTime(tarefa.dataAtividade, tarefa.hora);
      if (!activityDateTime) return;

      const timeDiff = activityDateTime.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 60 * 60);
      const minutesDiff = timeDiff / (1000 * 60);

      const notificationId = `${tarefa.id}-${Math.floor(hoursDiff)}h`;

      // Evitar notificações duplicadas
      if (this.notifiedActivities.has(notificationId)) return;

      // Notificação 1 hora antes
      if (hoursDiff > 0 && hoursDiff <= 1 && minutesDiff > 50) {
        this.showNotification({
          id: notificationId,
          message: `⏰ Falta 1 hora para: ${this.getTipoAtividadeEmoji(tarefa.tipoAtividade)} ${this.formatTipoAtividade(tarefa.tipoAtividade)} às ${tarefa.hora}`,
          type: 'info',
          duration: 15000
        });
        this.notifiedActivities.add(notificationId);
      }

      // Notificação 30 minutos antes
      const notification30Id = `${tarefa.id}-30min`;
      if (minutesDiff > 0 && minutesDiff <= 30 && minutesDiff > 25 && !this.notifiedActivities.has(notification30Id)) {
        this.showNotification({
          id: notification30Id,
          message: `⚡ Faltam 30 minutos para: ${this.getTipoAtividadeEmoji(tarefa.tipoAtividade)} ${this.formatTipoAtividade(tarefa.tipoAtividade)}`,
          type: 'warning',
          duration: 15000
        });
        this.notifiedActivities.add(notification30Id);
      }

      // Notificação na hora
      const notificationNowId = `${tarefa.id}-now`;
      if (minutesDiff >= -5 && minutesDiff <= 5 && !this.notifiedActivities.has(notificationNowId)) {
        this.showNotification({
          id: notificationNowId,
          message: `🔥 Hora da sua atividade: ${this.getTipoAtividadeEmoji(tarefa.tipoAtividade)} ${this.formatTipoAtividade(tarefa.tipoAtividade)}!`,
          type: 'success',
          duration: 20000
        });
        this.notifiedActivities.add(notificationNowId);
      }
    });

    // Notificação de atividades de amanhã (apenas uma vez por dia)
    this.checkTomorrowActivities(tarefas);
  }

  private checkTomorrowActivities(tarefas: Tarefa[]) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);

    const tomorrowEnd = new Date(tomorrow);
    tomorrowEnd.setHours(23, 59, 59, 999);

    const tomorrowActivities = tarefas.filter(tarefa => {
      const activityDate = new Date(tarefa.dataAtividade);
      return activityDate >= tomorrow && activityDate <= tomorrowEnd;
    });

    const notificationId = `tomorrow-${tomorrow.toISOString().split('T')[0]}`;
    
    // Notificar apenas se for entre 18h-21h e não foi notificado hoje
    if (now.getHours() >= 18 && now.getHours() <= 21 && 
        !this.notifiedActivities.has(notificationId) && 
        tomorrowActivities.length > 0) {
      
      const message = tomorrowActivities.length === 1
        ? `📅 Você tem 1 atividade marcada para amanhã!`
        : `📅 Você tem ${tomorrowActivities.length} atividades marcadas para amanhã!`;

      this.showNotification({
        id: notificationId,
        message,
        type: 'info',
        duration: 12000
      });
      this.notifiedActivities.add(notificationId);
    }
  }

  private parseActivityDateTime(date: string, time: string): Date | null {
    try {
      const [hours, minutes] = time.split(':').map(Number);
      const activityDate = new Date(date);
      activityDate.setHours(hours, minutes, 0, 0);
      return activityDate;
    } catch {
      return null;
    }
  }

  private getTipoAtividadeEmoji(tipo: string): string {
    const emojis: { [key: string]: string } = {
      'corrida': '🏃',
      'caminhada': '🚶',
      'ciclismo': '🚴',
      'natacao': '🏊',
      'musculacao': '💪',
      'yoga': '🧘',
      'futebol': '⚽',
      'basquete': '🏀',
      'volei': '🏐',
      'outro': '🎯'
    };
    return emojis[tipo] || '🎯';
  }

  private formatTipoAtividade(tipo: string): string {
    const tipos: { [key: string]: string } = {
      'corrida': 'Corrida',
      'caminhada': 'Caminhada',
      'ciclismo': 'Ciclismo',
      'natacao': 'Natação',
      'musculacao': 'Musculação',
      'yoga': 'Yoga',
      'futebol': 'Futebol',
      'basquete': 'Basquete',
      'volei': 'Vôlei',
      'outro': 'Atividade'
    };
    return tipos[tipo] || 'Atividade';
  }

  // Mostrar notificação
  showNotification(data: NotificationData) {
    // Adicionar à lista
    this.notifications.push(data);
    this.notificationsSubject.next([...this.notifications]);

    // Criar e anexar componente ao DOM
    this.createNotificationComponent(data);
  }

  private createNotificationComponent(data: NotificationData) {
    // Criar o componente
    const componentFactory = this.componentFactoryResolver.resolveComponentFactory(NotificationToastComponent);
    const componentRef = componentFactory.create(this.injector);
    
    // Definir inputs
    componentRef.instance.notification = data;
    
    // Ouvir evento de fechar
    componentRef.instance.close.subscribe((id: string) => {
      this.removeNotification(id);
    });

    // Anexar ao DOM
    this.appRef.attachView(componentRef.hostView);
    const domElem = (componentRef.hostView as EmbeddedViewRef<any>).rootNodes[0] as HTMLElement;
    document.body.appendChild(domElem);

    // Guardar referência
    this.componentRefs.set(data.id, componentRef);
  }

  private removeNotification(id: string) {
    // Remover da lista
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notificationsSubject.next([...this.notifications]);

    // Remover componente do DOM
    const componentRef = this.componentRefs.get(id);
    if (componentRef) {
      this.appRef.detachView(componentRef.hostView);
      componentRef.destroy();
      this.componentRefs.delete(id);
    }
  }

  // Métodos públicos para diferentes tipos de notificações
  showSuccess(message: string, duration?: number) {
    this.showNotification({
      id: this.generateId(),
      message,
      type: 'success',
      duration
    });
  }

  showError(message: string, duration?: number) {
    this.showNotification({
      id: this.generateId(),
      message,
      type: 'error',
      duration
    });
  }

  showWarning(message: string, duration?: number) {
    this.showNotification({
      id: this.generateId(),
      message,
      type: 'warning',
      duration
    });
  }

  showInfo(message: string, duration?: number) {
    this.showNotification({
      id: this.generateId(),
      message,
      type: 'info',
      duration
    });
  }

  private generateId(): string {
    return `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Limpar notificações antigas ao fim do dia
  clearOldNotifications() {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    this.notifiedActivities.forEach(id => {
      // Remover notificações antigas (mais de 24h)
      if (id.includes('-')) {
        const dateStr = id.split('-')[1];
        if (dateStr && dateStr < yesterday.toISOString().split('T')[0]) {
          this.notifiedActivities.delete(id);
        }
      }
    });
  }
}
