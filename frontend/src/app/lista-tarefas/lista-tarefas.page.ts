import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TarefasService, Tarefa } from '../services/tarefas-api.service';
import { AlertController } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-lista-tarefas',
  templateUrl: './lista-tarefas.page.html',
  styleUrls: ['./lista-tarefas.page.scss'],
  standalone: false
})
export class ListaTarefasPage implements OnInit, OnDestroy {

  tarefasPendentes: Tarefa[] = [];
  tarefasConcluidas: Tarefa[] = [];
  private tarefasSubscription?: Subscription;
  
  // Filtros e ordenação
  filtroTipo: string = '';
  filtroIntensidade: string = '';
  filtroFavoritas: boolean = false;
  ordenacao: string = 'data-desc'; // data-desc, data-asc, duracao-desc, duracao-asc

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

  constructor(
    private tarefasService: TarefasService,
    private alertController: AlertController,
    private router: Router,
    private notificationService: NotificationService
  ) { }

  ngOnInit() {
    // Garantir que as tarefas sejam carregadas
    this.tarefasService.carregarTarefas();
    
    // Subscrever às mudanças nas tarefas
    this.tarefasSubscription = this.tarefasService.tarefas$.subscribe(tarefas => {
      console.log('[ListaTarefasPage] Tarefas atualizadas:', tarefas.length);
      this.carregarTarefas();
    });
  }

  ionViewWillEnter() {
    this.carregarTarefas();
  }

  ngOnDestroy() {
    if (this.tarefasSubscription) {
      this.tarefasSubscription.unsubscribe();
    }
  }

  carregarTarefas() {
    let pendentes = this.tarefasService.getTarefasNaoConcluidas();
    let concluidas = this.tarefasService.getTarefasConcluidas();

    // Aplicar filtros
    if (this.filtroTipo) {
      pendentes = pendentes.filter(t => t.tipoAtividade === this.filtroTipo);
      concluidas = concluidas.filter(t => t.tipoAtividade === this.filtroTipo);
    }

    if (this.filtroIntensidade) {
      pendentes = pendentes.filter(t => t.intensidade === this.filtroIntensidade);
      concluidas = concluidas.filter(t => t.intensidade === this.filtroIntensidade);
    }

    if (this.filtroFavoritas) {
      pendentes = pendentes.filter(t => t.favorita);
      concluidas = concluidas.filter(t => t.favorita);
    }

    // Aplicar ordenação
    const ordenarPor = (lista: Tarefa[]) => {
      switch (this.ordenacao) {
        case 'data-asc':
          return lista.sort((a, b) => new Date(a.dataAtividade).getTime() - new Date(b.dataAtividade).getTime());
        case 'data-desc':
          return lista.sort((a, b) => new Date(b.dataAtividade).getTime() - new Date(a.dataAtividade).getTime());
        case 'duracao-asc':
          return lista.sort((a, b) => a.duracao - b.duracao);
        case 'duracao-desc':
          return lista.sort((a, b) => b.duracao - a.duracao);
        default:
          return lista;
      }
    };

    this.tarefasPendentes = ordenarPor(pendentes);
    this.tarefasConcluidas = ordenarPor(concluidas);
  }

  aplicarFiltros() {
    this.carregarTarefas();
  }

  toggleFiltroFavoritas() {
    this.filtroFavoritas = !this.filtroFavoritas;
    this.aplicarFiltros();
  }

  limparFiltros() {
    this.filtroTipo = '';
    this.filtroIntensidade = '';
    this.filtroFavoritas = false;
    this.ordenacao = 'data-desc';
    this.carregarTarefas();
  }

  async concluirTarefa(tarefa: Tarefa) {
    const alert = await this.alertController.create({
      header: 'Concluir Tarefa',
      message: `Tem a certeza que quer concluir a tarefa?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Concluir',
          handler: async () => {
            const pontos = Math.round(tarefa.pontos);
            try {
              await this.tarefasService.atualizarTarefa(tarefa.id, { concluida: true } as any);
              this.notificationService.showSuccess(`🎉 Parabéns! Tarefa concluída! Você ganhou ${pontos} pontos!`);
              this.mostrarMensagemPontos(pontos);
            } catch (error) {
              console.error('Erro ao concluir tarefa:', error);
              this.notificationService.showError('Erro ao concluir tarefa. Tente novamente.');
            }
          }
        }
      ]
    });

    await alert.present();
  }

  async mostrarMensagemPontos(pontos: number) {
    const alert = await this.alertController.create({
      header: 'Parabéns por concluir a tarefa!',
      message: `Você ganhou ${pontos} pontos!`,
      buttons: ['OK']
    });

    await alert.present();
  }

  async removerTarefa(id: string) {
    const alert = await this.alertController.create({
      header: 'Remover Tarefa',
      message: 'Tem certeza que deseja remover esta tarefa?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel'
        },
        {
          text: 'Remover',
          handler: () => {
            this.tarefasService.removerTarefa(id);
            this.carregarTarefas();
            this.notificationService.showInfo('🗑️ Tarefa removida da lista.');
          }
        }
      ]
    });

    await alert.present();
  }

  editarTarefa(id: string) {
    this.router.navigate(['/adicionar-tarefa'], { queryParams: { id: id } });
  }

  async toggleFavorito(id: string, event: Event) {
    event.stopPropagation();
    try {
      await this.tarefasService.alternarFavorito(id);
      this.carregarTarefas();
    } catch (error) {
      console.error('Erro ao alternar favorito:', error);
      this.notificationService.showError('Erro ao alternar favorito. Tente novamente.');
    }
  }

  calcularPontosPrevistos(tarefa: Tarefa): number {
    // Pontos base da atividade
    const pontosBaseTipo = this.pontosBase[tarefa.tipoAtividade] || 50;
    
    // Multiplicador de duração (30 min é o padrão)
    const duracaoPadrao = 30;
    const multiplicadorDuracaoValor = tarefa.duracao / duracaoPadrao;
    
    // Multiplicador de intensidade
    const multiplicadorIntensidadeValor = this.multiplicadorIntensidade[tarefa.intensidade] || 1;
    
    // Cálculo final
    return Math.round(pontosBaseTipo * multiplicadorDuracaoValor * multiplicadorIntensidadeValor);
  }

  getNomeTipo(tipo: string): string {
    return this.nomesTipoAtividade[tipo] || tipo;
  }

  getNomeIntensidade(intensidade: string): string {
    return this.nomesIntensidade[intensidade] || intensidade;
  }

  getIconeTipo(tipo: string): string {
    return this.iconesTipo[tipo] || 'fitness';
  }

  formatarData(dataString: string): string {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  formatarHora(hora: string | undefined): string {
    if (!hora) return '';
    
    // Se a hora vem no formato ISO (ex: "2024-01-12T14:30:00")
    if (hora.includes('T')) {
      const date = new Date(hora);
      return date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    }
    
    // Se já vem no formato HH:mm
    return hora;
  }

}
