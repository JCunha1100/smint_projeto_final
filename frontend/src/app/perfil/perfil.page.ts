import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { TarefasService } from '../services/tarefas-api.service';
import { TemaService } from '../services/tema.service';
import { AuthService, User } from '../services/auth.service';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: false
})
export class PerfilPage implements OnInit {

  modoEscuro = false;
  totalAtividades = 0;
  totalMinutos = 0;
  totalHoras = '0h';
  totalHorasDetalhado = '0h 0m';
  totalFavoritos = 5;
  duracaoMedia = 0;
  totalPontos = 0;
  nomeUtilizador = 'Atleta';
  currentUser: User | null = null;

  constructor(
    private tarefasService: TarefasService,
    private router: Router,
    private temaService: TemaService,
    private authService: AuthService,
    private alertController: AlertController,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    this.carregarDadosUsuario();
    this.carregarEstatisticas();
    this.modoEscuro = this.temaService.getTemaEscuro();
    
    this.temaService.temaEscuro$.subscribe(escuro => {
      this.modoEscuro = escuro;
    });
  }

  carregarDadosUsuario() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.nomeUtilizador = this.currentUser.name;
    }
  }

  ionViewWillEnter() {
    this.carregarDadosUsuario();
    this.carregarEstatisticas();
  }

  carregarEstatisticas() {
    // Considerar apenas tarefas concluídas para as estatísticas
    const tarefas = this.tarefasService.getTarefasConcluidas();
    
    this.totalAtividades = tarefas.length;
    
    // Calcular total de minutos
    this.totalMinutos = tarefas.reduce((total, tarefa) => total + tarefa.duracao, 0);
    
    // Calcular total de pontos
    this.totalPontos = this.tarefasService.getTotalPontos();
    
    // Calcular total de favoritas (de todas as tarefas, não apenas concluídas)
    this.totalFavoritos = this.tarefasService.getTarefas().filter(t => t.favorita).length;
    
    // Converter para horas
    const horas = Math.floor(this.totalMinutos / 60);
    const minutos = this.totalMinutos % 60;
    this.totalHoras = `${horas}h`;
    this.totalHorasDetalhado = `${horas}h ${minutos}m`;
    
    // Calcular duração média
    this.duracaoMedia = this.totalAtividades > 0 ? Math.round(this.totalMinutos / this.totalAtividades) : 0;
  }

  alterarTema() {
    this.temaService.alternarTema();
  }

  async logout() {
    const alert = await this.alertController.create({
      header: 'Terminar Sessão',
      message: 'Tem certeza que deseja sair?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Sair',
          handler: () => {
            this.authService.logout();
            this.router.navigate(['/login']);
          }
        }
      ]
    });

    await alert.present();
  }

}
