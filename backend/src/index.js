/**
 * FitTrack API - Servidor Principal
 * 
 * Este é o ponto de entrada da aplicação Express.
 * Configura middlewares, rotas e inicia o servidor.
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { config } from './config/index.js';
import { testConnection } from './config/database.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

// Importação das rotas
import authRoutes from './routes/authRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import statsRoutes from './routes/statsRoutes.js';

// Carrega variáveis de ambiente do ficheiro .env
dotenv.config();

// Criar aplicação Express
const app = express();

// Middlewares globais
// cors - permite requisições de outros domínios
app.use(cors());
// morgan - logging de requisições HTTP em modo 'dev'
app.use(morgan('dev'));
// express.json() - parsing de JSON no corpo das requisições
app.use(express.json());
// express.urlencoded() - parsing de dados de formulários URL-encoded
app.use(express.urlencoded({ extended: true }));

// Endpoint de verificação de saúde da API
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'FitTrack API está em execução',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Configuração das rotas da API
// /api/auth - rotas de autenticação (registo, login, perfil)
app.use('/api/auth', authRoutes);
// /api/activities - rotas de gestão de atividades
app.use('/api/activities', activityRoutes);
// /api/stats - rotas de estatísticas e ranking
app.use('/api/stats', statsRoutes);

// Endpoint de documentação da API
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Documentação da API FitTrack',
    version: '1.0.0',
    endpoints: {
      // Rotas de autenticação
      authentication: {
        'POST /api/auth/register': 'Registar um novo utilizador',
        'POST /api/auth/login': 'Iniciar sessão',
        'GET /api/auth/me': 'Obter perfil do utilizador atual',
        'PUT /api/auth/me': 'Atualizar perfil do utilizador',
        'PUT /api/auth/password': 'Alterar palavra-passe',
        'DELETE /api/auth/me': 'Eliminar conta',
        'POST /api/auth/refresh': 'Renovar token de autenticação'
      },
      // Rotas de atividades
      activities: {
        'POST /api/activities': 'Criar nova atividade',
        'GET /api/activities': 'Listar atividades do utilizador',
        'GET /api/activities/stats': 'Obter estatísticas das atividades',
        'GET /api/activities/favorites': 'Obter atividades favoritas',
        'GET /api/activities/:id': 'Obter atividade específica',
        'PUT /api/activities/:id': 'Atualizar atividade',
        'DELETE /api/activities/:id': 'Eliminar atividade',
        'PATCH /api/activities/:id/favorite': 'Alternar favorito'
      },
      // Rotas de estatísticas
      statistics: {
        'GET /api/stats/dashboard': 'Obter dados do dashboard',
        'GET /api/stats/leaderboard': 'Obter ranking de utilizadores',
        'GET /api/stats/weekly': 'Obter resumo semanal',
        'GET /api/stats/monthly': 'Obter resumo mensal',
        'GET /api/stats/yearly': 'Obter estatísticas anuais',
        'GET /api/stats/notifications': 'Obter notificações',
        'PATCH /api/stats/notifications/read-all': 'Marcar todas como lidas',
        'PATCH /api/stats/notifications/:id/read': 'Marcar uma como lida'
      }
    }
  });
});

// Middleware de tratamento de erros
// 404 - rota não encontrada
app.use(notFoundHandler);
// 500 - erro interno do servidor
app.use(errorHandler);

// Função para iniciar o servidor
async function startServer() {
  // Testar conexão com a base de dados
  const dbConnected = await testConnection();
  
  // Se a conexão falhar, encerrar a aplicação
  if (!dbConnected) {
    console.error('Falha ao conectar à base de dados. A encerrar...');
    process.exit(1);
  }
  
  // Iniciar servidor na porta configurada
  app.listen(config.port, () => {
    console.log(`
    ╔═══════════════════════════════════════════════╗
    ║                                               ║
    ║   🏃 Servidor FitTrack API                    ║
    ║                                               ║
    ║   Ambiente: ${config.nodeEnv.padEnd(28)}║
    ║   Porta: ${config.port.toString().padEnd(33)}║
    ║                                               ║
    ║   Documentação: http://localhost:${config.port}/api        ║
    ║   Verificação: http://localhost:${config.port}/health      ║
    ║                                               ║
    ╚═══════════════════════════════════════════════╝
    `);
  });
}

// Tratamento de exceções não capturadas
process.on('uncaughtException', (error) => {
  console.error('Exceção não capturada:', error);
  process.exit(1);
});

// Tratamento de promessas rejeitadas não tratadas
process.on('unhandledRejection', (reason, promise) => {
  console.error('Rejeição não tratada em:', promise, 'motivo:', reason);
  process.exit(1);
});

// Iniciar o servidor
startServer();

// Exportar app para testes
export default app;
