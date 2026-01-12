import { Component, OnInit, OnDestroy } from '@angular/core';
import { TarefasService, Tarefa } from '../services/tarefas-api.service';
import { AuthService, User } from '../services/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: false
})
export class HomePage implements OnInit, OnDestroy {

  nomeUtilizador = 'Atleta';
  currentUser: User | null = null;
  atividadesAtivas: Tarefa[] = [];
  totalPontos = 0;
  atividadesHoje = 0;
  minutosHoje = 0;
  private tarefasSubscription?: Subscription;

  // Nomes para exibição
  nomesTipoAtividade: { [key: string]: string } = {
    'corrida': 'Corrida',
    'caminhada': 'Caminhada',
    'ciclismo': 'Ciclismo',
    'natacao': 'Natação',
    'musculacao': 'Musculação',
    'yoga': 'Yoga',
    'futebol': 'Futebol',
    'basquete': 'Basquete',
    'tenis': 'Ténis',
    'outro': 'Outro'
  };

  iconesTipo: { [key: string]: string } = {
    'corrida': 'walk',
    'caminhada': 'walk-outline',
    'ciclismo': 'bicycle',
    'natacao': 'water',
    'musculacao': 'barbell',
    'yoga': 'body',
    'futebol': 'football',
    'basquete': 'basketball',
    'tenis': 'tennisball',
    'outro': 'fitness'
  };

  constructor(
    private tarefasService: TarefasService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.carregarDadosUsuario();
    
    // Garantir que as tarefas sejam carregadas
    this.tarefasService.carregarTarefas();
    
    // Subscrever às mudanças nas tarefas
    this.tarefasSubscription = this.tarefasService.tarefas$.subscribe(tarefas => {
      console.log('[HomePage] Tarefas atualizadas:', tarefas.length);
      this.carregarDados();
    });
  }

  ionViewWillEnter() {
    this.carregarDadosUsuario();
    this.carregarDados();
  }

  ngOnDestroy() {
    if (this.tarefasSubscription) {
      this.tarefasSubscription.unsubscribe();
    }
  }

  carregarDadosUsuario() {
    this.currentUser = this.authService.getCurrentUser();
    if (this.currentUser) {
      this.nomeUtilizador = this.currentUser.name;
    }
  }

  carregarDados() {
    // Carregar atividades (apenas as 3 mais recentes)
    this.atividadesAtivas = this.tarefasService.getTarefas().slice(0, 3);
    
    // Carregar total de pontos
    this.totalPontos = this.tarefasService.getTotalPontos();
    
    // Carregar estatísticas do dia
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const tarefas = this.tarefasService.getTarefas();
    const tarefasHoje = tarefas.filter(tarefa => {
      const dataTarefa = new Date(tarefa.dataAtividade);
      dataTarefa.setHours(0, 0, 0, 0);
      return dataTarefa.getTime() === hoje.getTime();
    });
    
    this.atividadesHoje = tarefasHoje.length;
    this.minutosHoje = tarefasHoje.reduce((total, tarefa) => total + tarefa.duracao, 0);
  }

  getNomeTipo(tipo: string): string {
    return this.nomesTipoAtividade[tipo] || tipo;
  }

  getIconeTipo(tipo: string): string {
    return this.iconesTipo[tipo] || 'fitness';
  }

}
