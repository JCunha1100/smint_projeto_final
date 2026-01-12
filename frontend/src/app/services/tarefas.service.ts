import { Injectable } from '@angular/core';

export interface Tarefa {
  id: string;
  tipoAtividade: string;
  duracao: number;
  dataAtividade: string;
  local: string;
  intensidade: string;
  descricao: string;
  pontos: number;
  concluida: boolean;
  favorita: boolean;
  dataCriacao: Date;
}

@Injectable({
  providedIn: 'root'
})
export class TarefasService {
  private STORAGE_KEY = 'tarefas';

  constructor() { }

  // Obter todas as tarefas
  getTarefas(): Tarefa[] {
    const tarefasString = localStorage.getItem(this.STORAGE_KEY);
    if (tarefasString) {
      return JSON.parse(tarefasString);
    }
    return [];
  }

  // Obter tarefas não concluídas
  getTarefasNaoConcluidas(): Tarefa[] {
    return this.getTarefas().filter(t => !t.concluida);
  }

  // Obter tarefas concluídas
  getTarefasConcluidas(): Tarefa[] {
    return this.getTarefas().filter(t => t.concluida);
  }

  // Adicionar nova tarefa
  adicionarTarefa(tarefa: Omit<Tarefa, 'id' | 'concluida' | 'favorita' | 'dataCriacao'>): Tarefa {
    const tarefas = this.getTarefas();
    const novaTarefa: Tarefa = {
      ...tarefa,
      id: Date.now().toString(),
      concluida: false,
      favorita: false,
      dataCriacao: new Date()
    };
    tarefas.unshift(novaTarefa); // Adiciona no início (topo da lista)
    this.salvarTarefas(tarefas);
    return novaTarefa;
  }

  // Concluir tarefa
  concluirTarefa(id: string): number {
    const tarefas = this.getTarefas();
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
      tarefa.concluida = true;
      this.salvarTarefas(tarefas);
      return tarefa.pontos;
    }
    return 0;
  }

  // Remover tarefa
  removerTarefa(id: string): void {
    const tarefas = this.getTarefas().filter(t => t.id !== id);
    this.salvarTarefas(tarefas);
  }

  // Obter tarefa por ID
  getTarefaPorId(id: string): Tarefa | undefined {
    return this.getTarefas().find(t => t.id === id);
  }

  // Atualizar tarefa existente
  atualizarTarefa(id: string, dadosAtualizados: Partial<Tarefa>): boolean {
    const tarefas = this.getTarefas();
    const index = tarefas.findIndex(t => t.id === id);
    if (index !== -1) {
      tarefas[index] = { ...tarefas[index], ...dadosAtualizados };
      this.salvarTarefas(tarefas);
      return true;
    }
    return false;
  }

  // Salvar tarefas no localStorage
  private salvarTarefas(tarefas: Tarefa[]): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(tarefas));
  }

  // Obter total de pontos ganhos
  getTotalPontos(): number {
    return this.getTarefasConcluidas().reduce((total, tarefa) => total + tarefa.pontos, 0);
  }

  // Alternar favorito
  alternarFavorito(id: string): boolean {
    const tarefas = this.getTarefas();
    const tarefa = tarefas.find(t => t.id === id);
    if (tarefa) {
      tarefa.favorita = !tarefa.favorita;
      this.salvarTarefas(tarefas);
      return true;
    }
    return false;
  }

  // Obter desporto mais praticado
  getDesportoMaisPraticado(): { nome: string, total: number } {
    const tarefasConcluidas = this.getTarefasConcluidas();
    const contagem: { [key: string]: number } = {};
    
    tarefasConcluidas.forEach(tarefa => {
      contagem[tarefa.tipoAtividade] = (contagem[tarefa.tipoAtividade] || 0) + 1;
    });

    let maxNome = '';
    let maxTotal = 0;
    
    for (const tipo in contagem) {
      if (contagem[tipo] > maxTotal) {
        maxTotal = contagem[tipo];
        maxNome = tipo;
      }
    }

    return { nome: maxNome, total: maxTotal };
  }

  // Obter atividades por mês
  getAtividadesPorMes(): { mes: string, total: number, minutos: number }[] {
    const tarefasConcluidas = this.getTarefasConcluidas();
    const porMes: { [key: string]: { total: number, minutos: number } } = {};

    tarefasConcluidas.forEach(tarefa => {
      const data = new Date(tarefa.dataAtividade);
      const mesAno = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      
      if (!porMes[mesAno]) {
        porMes[mesAno] = { total: 0, minutos: 0 };
      }
      
      porMes[mesAno].total++;
      porMes[mesAno].minutos += tarefa.duracao;
    });

    return Object.keys(porMes)
      .sort()
      .map(mes => ({
        mes: mes,
        total: porMes[mes].total,
        minutos: porMes[mes].minutos
      }));
  }

  // Obter atividades da semana
  getAtividadesSemana(): Tarefa[] {
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
    inicioSemana.setHours(0, 0, 0, 0);

    return this.getTarefasConcluidas().filter(tarefa => {
      const dataTarefa = new Date(tarefa.dataAtividade);
      return dataTarefa >= inicioSemana;
    });
  }

  // Obter estatísticas da semana
  getEstatisticasSemana(): { total: number, minutos: number, pontos: number } {
    const tarefasSemana = this.getAtividadesSemana();
    return {
      total: tarefasSemana.length,
      minutos: tarefasSemana.reduce((sum, t) => sum + t.duracao, 0),
      pontos: tarefasSemana.reduce((sum, t) => sum + t.pontos, 0)
    };
  }
}
