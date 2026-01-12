import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { TarefasService } from '../services/tarefas-api.service';
import { NotificationService } from '../services/notification.service';

interface Tarefa {
  tipoAtividade: string;
  duracao: number;
  dataAtividade: string;
  hora?: string;
  local: string;
  intensidade: string;
  descricao: string;
}

@Component({
  selector: 'app-adicionar-tarefa',
  templateUrl: './adicionar-tarefa.page.html',
  styleUrls: ['./adicionar-tarefa.page.scss'],
  standalone: false
})
export class AdicionarTarefaPage implements OnInit {

  tarefaId: string | null = null;
  modoEdicao: boolean = false;
  tarefa: Tarefa = {
    tipoAtividade: '',
    duracao: 30,
    dataAtividade: new Date().toISOString(),
    hora: undefined,
    local: '',
    intensidade: '',
    descricao: ''
  };

  pontosCalculados: number = 0;
  mostrarFatura: boolean = false;
  pontosBaseTipo: number = 0;
  multiplicadorDuracaoValor: number = 0;
  multiplicadorIntensidadeValor: number = 0;

  // Pontos base por tipo de atividade
  pontosBase: { [key: string]: number } = {
    'corrida': 100,
    'caminhada': 60,
    'ciclismo': 90,
    'natacao': 110,
    'musculacao': 80,
    'yoga': 50,
    'futebol': 95,
    'basquete': 85,
    'tenis': 75,
    'outro': 50
  };

  // Multiplicadores de intensidade
  multiplicadorIntensidade: { [key: string]: number } = {
    'baixa': 0.8,
    'media': 1.1,
    'alta': 1.5
  };

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

  nomesIntensidade: { [key: string]: string } = {
    'baixa': 'Baixo',
    'media': 'Médio',
    'alta': 'Alto'
  };

  constructor(
    private tarefasService: TarefasService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    // Verificar se está em modo de edição
    this.activatedRoute.queryParams.subscribe(params => {
      if (params['id']) {
        this.tarefaId = params['id'];
        this.modoEdicao = true;
        this.carregarTarefa();
      }
    });
  }

  carregarTarefa() {
    if (this.tarefaId) {
      const tarefaExistente = this.tarefasService.getTarefaPorId(this.tarefaId);
      if (tarefaExistente) {
        this.tarefa = {
          tipoAtividade: tarefaExistente.tipoAtividade,
          duracao: tarefaExistente.duracao,
          dataAtividade: tarefaExistente.dataAtividade,
          local: tarefaExistente.local,
          intensidade: tarefaExistente.intensidade,
          descricao: tarefaExistente.descricao
        };
        this.calcularPontos();
      }
    }
  }

  calcularPontos() {
    if (!this.tarefa.tipoAtividade || !this.tarefa.duracao || !this.tarefa.intensidade) {
      this.mostrarFatura = false;
      return;
    }

    // Pontos base da atividade
    this.pontosBaseTipo = this.pontosBase[this.tarefa.tipoAtividade] || 50;

    // Multiplicador de duração (30 min é o padrão)
    const duracaoPadrao = 30;
    this.multiplicadorDuracaoValor = Math.round((this.tarefa.duracao / duracaoPadrao) * 100) / 100;

    // Multiplicador de intensidade
    this.multiplicadorIntensidadeValor = this.multiplicadorIntensidade[this.tarefa.intensidade] || 1;

    // Cálculo final
    this.pontosCalculados = Math.round(this.pontosBaseTipo * this.multiplicadorDuracaoValor * this.multiplicadorIntensidadeValor);
    
    this.mostrarFatura = true;
  }

  getNomeTipoAtividade(): string {
    return this.nomesTipoAtividade[this.tarefa.tipoAtividade] || '';
  }

  getNomeIntensidade(): string {
    return this.nomesIntensidade[this.tarefa.intensidade] || '';
  }

  guardarTarefa() {
    if (!this.tarefa.tipoAtividade || !this.tarefa.duracao || !this.tarefa.intensidade) {
      alert('Por favor, preencha todos os campos obrigatórios (*)');
      return;
    }

    // Calcular pontos antes de guardar
    if (this.pontosCalculados === 0) {
      this.calcularPontos();
    }

    if (this.modoEdicao && this.tarefaId) {
      // Atualizar tarefa existente
      this.tarefasService.atualizarTarefa(this.tarefaId, {
        tipoAtividade: this.tarefa.tipoAtividade,
        duracao: this.tarefa.duracao,
        dataAtividade: this.tarefa.dataAtividade,
        local: this.tarefa.local,
        intensidade: this.tarefa.intensidade,
        descricao: this.tarefa.descricao
      } as any).then(() => {
        this.notificationService.showSuccess(`✅ Tarefa "${this.getNomeTipoAtividade()}" atualizada com sucesso!`);
        this.limparFormulario();
        this.router.navigate(['/lista-tarefas']);
      }).catch(error => {
        alert('Erro ao atualizar tarefa. Tente novamente.');
        console.error('Erro:', error);
      });
    } else {
      // Salvar nova tarefa usando o serviço
      this.tarefasService.adicionarTarefa({
        tipoAtividade: this.tarefa.tipoAtividade,
        duracao: this.tarefa.duracao,
        dataAtividade: this.tarefa.dataAtividade,
        local: this.tarefa.local,
        intensidade: this.tarefa.intensidade,
        descricao: this.tarefa.descricao
      } as any).then(() => {
        this.notificationService.showSuccess(`✅ Tarefa "${this.getNomeTipoAtividade()}" criada! Complete para ganhar ${this.pontosCalculados} pontos!`);
        this.limparFormulario();
        this.router.navigate(['/lista-tarefas']);
      }).catch(error => {
        alert('Erro ao adicionar tarefa. Tente novamente.');
        console.error('Erro:', error);
      });
    }
  }

  limparFormulario() {
    this.tarefa = {
      tipoAtividade: '',
      duracao: 30,
      dataAtividade: new Date().toISOString(),
      local: '',
      intensidade: '',
      descricao: ''
    };
    this.pontosCalculados = 0;
    this.mostrarFatura = false;
    this.pontosBaseTipo = 0;
    this.multiplicadorDuracaoValor = 0;
    this.multiplicadorIntensidadeValor = 0;
  }

}
