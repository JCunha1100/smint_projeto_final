import { Injectable } from '@angular/core';
import { Observable, BehaviorSubject, map, tap, catchError, of, firstValueFrom } from 'rxjs';
import { ApiService, Activity } from './api.service';

export interface Tarefa {
  id: string;
  tipoAtividade: string;
  duracao: number;
  dataAtividade: string;
  hora?: string;
  local: string;
  intensidade: string;
  descricao: string;
  pontos: number;
  favorita: boolean;
  concluida: boolean;
  dataCriacao: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TarefasService {
  private tarefasSubject = new BehaviorSubject<Tarefa[]>([]);
  public tarefas$ = this.tarefasSubject.asObservable();
  private isInitialized = false;

  constructor(private apiService: ApiService) {
    // Não carregar automaticamente - aguardar utilizador fazer login
  }

  // Mapeamento entre tipos do frontend e backend
  private mapTipoToSportType(tipo: string): string {
    const mapping: { [key: string]: string } = {
      'corrida': 'RUNNING',
      'caminhada': 'WALKING',
      'ciclismo': 'CYCLING',
      'natacao': 'SWIMMING',
      'musculacao': 'GYM',
      'yoga': 'YOGA',
      'futebol': 'FOOTBALL',
      'basquete': 'BASKETBALL',
      'volei': 'OTHER',
      'outro': 'OTHER'
    };
    return mapping[tipo] || 'OTHER';
  }

  private mapSportTypeToTipo(sportType: string): string {
    const mapping: { [key: string]: string } = {
      'RUNNING': 'corrida',
      'WALKING': 'caminhada',
      'CYCLING': 'ciclismo',
      'SWIMMING': 'natacao',
      'GYM': 'musculacao',
      'YOGA': 'yoga',
      'FOOTBALL': 'futebol',
      'BASKETBALL': 'basquete',
      'TENNIS': 'outro',
      'HIKING': 'caminhada',
      'DANCING': 'outro',
      'BOXING': 'outro',
      'OTHER': 'outro'
    };
    return mapping[sportType] || 'outro';
  }

  private mapIntensityToBackend(intensity: string): string {
    const mapping: { [key: string]: string } = {
      'baixa': 'LOW',
      'media': 'MODERATE',
      'alta': 'HIGH'
    };
    return mapping[intensity] || 'MODERATE';
  }

  private mapIntensityToFrontend(intensity: string): string {
    const mapping: { [key: string]: string } = {
      'LOW': 'baixa',
      'MODERATE': 'media',
      'HIGH': 'alta',
      'EXTREME': 'alta'
    };
    return mapping[intensity] || 'media';
  }

  private activityToTarefa(activity: Activity): Tarefa {
    return {
      id: activity.id,
      tipoAtividade: this.mapSportTypeToTipo(activity.sportType),
      duracao: activity.duration,
      dataAtividade: activity.date,
      hora: activity.time,
      local: activity.location || '',
      intensidade: this.mapIntensityToFrontend(activity.intensity),
      descricao: activity.notes || '',
      pontos: activity.score,
      favorita: activity.isFavorite,
      concluida: activity.completed,
      dataCriacao: new Date(activity.createdAt)
    };
  }

  private tarefaToActivity(tarefa: Partial<Tarefa>): Partial<Activity> {
    return {
      sportType: tarefa.tipoAtividade ? this.mapTipoToSportType(tarefa.tipoAtividade) : undefined,
      duration: tarefa.duracao,
      date: tarefa.dataAtividade,
      time: tarefa.hora,
      location: tarefa.local || undefined,
      intensity: tarefa.intensidade ? this.mapIntensityToBackend(tarefa.intensidade) : undefined,
      notes: tarefa.descricao || undefined,
      completed: tarefa.concluida
    };
  }

  // Carregar todas as tarefas do utilizador logado
  carregarTarefas(): void {
    this.isInitialized = true;
    this.apiService.getActivities({ limit: 100 }).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.activities.map(activity => this.activityToTarefa(activity));
        }
        return [];
      }),
      catchError(error => {
        console.error('Erro ao carregar tarefas:', error);
        return of([]);
      })
    ).subscribe(tarefas => {
      this.tarefasSubject.next(tarefas);
    });
  }

  // Limpar tarefas ao fazer logout
  limparTarefas(): void {
    this.isInitialized = false;
    this.tarefasSubject.next([]);
  }

  // Obter todas as tarefas (método síncrono para compatibilidade)
  getTarefas(): Tarefa[] {
    if (!this.isInitialized) {
      this.carregarTarefas();
    }
    return this.tarefasSubject.value;
  }

  // Adicionar nova tarefa
  async adicionarTarefa(tarefa: Omit<Tarefa, 'id' | 'favorita' | 'concluida' | 'dataCriacao'>): Promise<Tarefa> {
    try {
      const activity = this.tarefaToActivity(tarefa);
      const response = await firstValueFrom(this.apiService.createActivity(activity));
      
      if (response.success && response.data) {
        const novaTarefa = this.activityToTarefa(response.data.activity);
        this.carregarTarefas(); // Recarregar lista
        return novaTarefa;
      }
      throw new Error('Erro ao criar atividade');
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      throw error;
    }
  }

  // Atualizar tarefa
  async atualizarTarefa(id: string, tarefa: Partial<Tarefa>): Promise<void> {
    try {
      const activity = this.tarefaToActivity(tarefa);
      const response = await firstValueFrom(this.apiService.updateActivity(id, activity));
      
      if (response.success) {
        this.carregarTarefas(); // Recarregar lista
      }
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      throw error;
    }
  }

  // Remover tarefa
  async removerTarefa(id: string): Promise<void> {
    try {
      await firstValueFrom(this.apiService.deleteActivity(id));
      this.carregarTarefas(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao remover tarefa:', error);
      throw error;
    }
  }

  // Alternar favorito
  async alternarFavorito(id: string): Promise<void> {
    try {
      const tarefa = this.getTarefaPorId(id);
      if (!tarefa) {
        throw new Error('Tarefa não encontrada');
      }
      
      const novoEstado = !tarefa.favorita;
      await firstValueFrom(this.apiService.toggleFavorite(id, novoEstado));
      this.carregarTarefas(); // Recarregar lista
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      throw error;
    }
  }

  // Obter tarefa por ID
  getTarefaPorId(id: string): Tarefa | undefined {
    return this.getTarefas().find(t => t.id === id);
  }

  // Obter total de pontos (apenas de tarefas concluídas)
  getTotalPontos(): number {
    return this.getTarefasConcluidas().reduce((total, t) => total + t.pontos, 0);
  }

  // Obter desporto mais praticado
  getDesportoMaisPraticado(): { nome: string; total: number } {
    const tarefas = this.getTarefas();
    const contagemPorTipo: { [key: string]: number } = {};

    tarefas.forEach(tarefa => {
      contagemPorTipo[tarefa.tipoAtividade] = (contagemPorTipo[tarefa.tipoAtividade] || 0) + 1;
    });

    let maxTipo = '';
    let maxTotal = 0;

    Object.entries(contagemPorTipo).forEach(([tipo, total]) => {
      if (total > maxTotal) {
        maxTipo = tipo;
        maxTotal = total;
      }
    });

    return { nome: maxTipo, total: maxTotal };
  }

  // Obter atividades por mês
  getAtividadesPorMes(): Array<{ mes: string; total: number; minutos: number }> {
    const tarefas = this.getTarefas();
    const atividadesPorMes: { [key: string]: { total: number; minutos: number } } = {};

    tarefas.forEach(tarefa => {
      const data = new Date(tarefa.dataAtividade);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;

      if (!atividadesPorMes[mesAno]) {
        atividadesPorMes[mesAno] = { total: 0, minutos: 0 };
      }

      atividadesPorMes[mesAno].total++;
      atividadesPorMes[mesAno].minutos += tarefa.duracao;
    });

    return Object.entries(atividadesPorMes)
      .map(([mes, dados]) => ({ mes, ...dados }))
      .sort((a, b) => b.mes.localeCompare(a.mes));
  }

  // Obter atividades da semana (concluídas E pendentes dos próximos 7 dias)
  getAtividadesSemana(): Tarefa[] {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);
    
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - 6); // Últimos 6 dias + hoje
    
    const fimSemana = new Date(hoje);
    fimSemana.setDate(hoje.getDate() + 6); // Próximos 6 dias + hoje
    fimSemana.setHours(23, 59, 59, 999);

    return this.getTarefas().filter(tarefa => {
      const dataTarefa = new Date(tarefa.dataAtividade);
      dataTarefa.setHours(0, 0, 0, 0);
      return dataTarefa >= inicioSemana && dataTarefa <= fimSemana;
    });
  }

  // Obter estatísticas da semana
  getEstatisticasSemana(): { total: number; minutos: number; pontos: number } {
    const atividadesSemana = this.getAtividadesSemana();
    return {
      total: atividadesSemana.length,
      minutos: atividadesSemana.reduce((sum, t) => sum + t.duracao, 0),
      pontos: atividadesSemana.reduce((sum, t) => sum + t.pontos, 0)
    };
  }

  // Obter tarefas concluídas
  getTarefasConcluidas(): Tarefa[] {
    return this.getTarefas().filter(t => t.concluida);
  }

  // Obter tarefas não concluídas
  getTarefasNaoConcluidas(): Tarefa[] {
    return this.getTarefas().filter(t => !t.concluida);
  }

  // Recarregar tarefas da API
  recarregar(): void {
    this.carregarTarefas();
  }
}
