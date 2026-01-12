import { Component, OnInit, OnDestroy } from '@angular/core';
import { ApiService, ApiResponse } from '../services/api.service';
import { AuthService } from '../services/auth.service';
import { TarefasService } from '../services/tarefas-api.service';
import { Subscription } from 'rxjs';

interface LeaderboardUser {
  rank: number;
  id: string;
  name: string | null;
  avatar: string | null;
  totalScore: number;
  level: number;
  streak: number;
  activitiesCount: number;
  levelInfo: {
    level: number;
    title: string;
    progress: number;
    nextLevelScore: number;
  };
}

interface LeaderboardData {
  leaderboard: LeaderboardUser[];
  currentUser: {
    rank: number;
    percentile: number;
    totalScore: number;
    level: number;
    isInTopList: boolean;
    name: string | null;
    avatar: string | null;
    levelInfo: {
      level: number;
      title: string;
      progress: number;
      nextLevelScore: number;
    };
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

@Component({
  selector: 'app-estatisticas',
  templateUrl: './estatisticas.page.html',
  styleUrls: ['./estatisticas.page.scss'],
  standalone: false
})
export class EstatisticasPage implements OnInit, OnDestroy {

  chartData: { label: string, value: number }[] = [];
  maxValue = 10;
  yAxisValues: number[] = [];
  gridLines: number[] = [0, 1, 2, 3, 4];

  totalTarefas = 0;
  totalPontos = 0;
  totalMinutos = 0;
  desportoMaisPraticado = '';
  totalDesportoMaisPraticado = 0;

  // Resumo semanal
  atividadesSemana = 0;
  minutosSemana = 0;
  pontosSemana = 0;

  // Estatísticas mensais
  estatisticasMensais: { mes: string, total: number, minutos: number }[] = [];

  // Leaderboard
  leaderboardData: LeaderboardData | null = null;
  leaderboardLoading = false;
  leaderboardError = '';

  // Subscription para mudanças nas tarefas
  private tarefasSubscription?: Subscription;

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

  constructor(
    private tarefasService: TarefasService,
    private apiService: ApiService,
    private authService: AuthService
  ) { }

  ngOnInit() {
    this.carregarEstatisticas();
    
    // Subscrever às mudanças nas tarefas
    this.tarefasSubscription = this.tarefasService.tarefas$.subscribe(tarefas => {
      console.log('[EstatisticasPage] Tarefas atualizadas:', tarefas.length);
      this.carregarEstatisticasLocais();
    });
  }

  ionViewWillEnter() {
    this.carregarEstatisticas();
  }

  ngOnDestroy() {
    if (this.tarefasSubscription) {
      this.tarefasSubscription.unsubscribe();
    }
  }

  carregarEstatisticas() {
    // Carregar estatísticas locais
    this.carregarEstatisticasLocais();

    // Carregar dados do leaderboard da API
    this.carregarLeaderboard();
  }

  carregarEstatisticasLocais() {
    // Estatísticas gerais
    const tarefasConcluidas = this.tarefasService.getTarefasConcluidas();
    this.totalTarefas = tarefasConcluidas.length;
    this.totalPontos = this.tarefasService.getTotalPontos();
    this.totalMinutos = tarefasConcluidas.reduce((sum, t) => sum + t.duracao, 0);

    // Desporto mais praticado
    const desporto = this.tarefasService.getDesportoMaisPraticado();
    this.desportoMaisPraticado = this.nomesTipoAtividade[desporto.nome] || 'Nenhum';
    this.totalDesportoMaisPraticado = desporto.total;

    // Resumo semanal
    const estatisticasSemana = this.tarefasService.getEstatisticasSemana();
    this.atividadesSemana = estatisticasSemana.total;
    this.minutosSemana = estatisticasSemana.minutos;
    this.pontosSemana = estatisticasSemana.pontos;

    // Gráfico dos últimos 7 dias
    this.carregarGraficoSemanal();

    // Estatísticas mensais
    this.estatisticasMensais = this.tarefasService.getAtividadesPorMes();
  }

  carregarLeaderboard() {
    this.leaderboardLoading = true;
    this.leaderboardError = '';

    this.apiService.getLeaderboard(1, 10).subscribe({
      next: (response: ApiResponse<LeaderboardData>) => {
        if (response.success && response.data) {
          this.leaderboardData = response.data;
        } else {
          this.leaderboardError = 'Erro ao carregar leaderboard';
        }
        this.leaderboardLoading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar leaderboard:', error);
        this.leaderboardError = 'Não foi possível carregar o leaderboard';
        this.leaderboardLoading = false;
      }
    });
  }

  getMedalIcon(rank: number): string {
    switch (rank) {
      case 1: return 'trophy';
      case 2: return 'medal';
      case 3: return 'ribbon';
      default: return '';
    }
  }

  getMedalColor(rank: number): string {
    switch (rank) {
      case 1: return '#FFD700'; // Ouro
      case 2: return '#C0C0C0'; // Prata
      case 3: return '#CD7F32'; // Bronze
      default: return '';
    }
  }

  isCurrentUser(userId: string): boolean {
    return this.authService.getCurrentUserId() === userId;
  }

  formatScore(score: number): string {
    return Math.round(score).toLocaleString('pt-PT');
  }

  getLevelTitle(level: number): string {
    if (level >= 50) return 'Lendário';
    if (level >= 40) return 'Mestre';
    if (level >= 30) return 'Atleta Ouro';
    if (level >= 20) return 'Atleta Prata';
    if (level >= 10) return 'Atleta Bronze';
    return 'Iniciante';
  }

  carregarGraficoSemanal() {
    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const dadosPorDia: { [key: number]: number } = {};

    // Inicializar todos os dias com 0
    for (let i = 0; i < 7; i++) {
      dadosPorDia[i] = 0;
    }

    // Contar atividades da semana (últimos 6 dias + hoje + próximos 6 dias)
    const tarefasSemana = this.tarefasService.getAtividadesSemana();
    tarefasSemana.forEach(tarefa => {
      const data = new Date(tarefa.dataAtividade);
      const diaSemana = data.getDay();
      dadosPorDia[diaSemana]++;
    });

    // Montar dados do gráfico
    this.chartData = diasSemana.map((label, index) => ({
      label: label,
      value: dadosPorDia[index]
    }));

    // Calcular valor máximo para o eixo Y
    const maxAtividades = Math.max(...Object.values(dadosPorDia), 1);
    this.maxValue = Math.ceil(maxAtividades / 2) * 2 + 2;
    
    // Gerar valores do eixo Y
    this.yAxisValues = [];
    for (let i = this.maxValue; i >= 0; i -= this.maxValue / 4) {
      this.yAxisValues.push(Math.round(i));
    }
  }

  formatarMes(mesAno: string): string {
    const [ano, mes] = mesAno.split('-');
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    return `${meses[parseInt(mes) - 1]} ${ano}`;
  }

}
