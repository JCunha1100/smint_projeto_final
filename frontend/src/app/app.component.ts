import { Component } from '@angular/core';
import { TemaService } from './services/tema.service';
import { NotificationService } from './services/notification.service';
import { AuthService } from './services/auth.service';
import { TarefasService } from './services/tarefas-api.service';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor(
    private temaService: TemaService,
    private notificationService: NotificationService,
    private authService: AuthService,
    private tarefasService: TarefasService
  ) {
    // O tema será carregado automaticamente quando o serviço for injetado
    
    // Gerenciar tarefas e notificações baseado no estado de autenticação
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // Usuário logado - carregar tarefas e iniciar notificações
        this.tarefasService.carregarTarefas();
        this.notificationService.startActivityNotifications();
      } else {
        // Usuário deslogado - limpar tarefas e parar notificações
        this.tarefasService.limparTarefas();
        this.notificationService.stopActivityNotifications();
      }
    });
    
    // Limpar notificações antigas diariamente
    setInterval(() => {
      this.notificationService.clearOldNotifications();
    }, 24 * 60 * 60 * 1000); // A cada 24 horas
  }
}
