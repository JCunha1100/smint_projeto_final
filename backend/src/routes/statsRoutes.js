/**
 * Rotas de Estatísticas
 * 
 * Handles todas as rotas relacionadas com estatísticas e gamificação:
 * - Ranking/Leaderboard
 * - Dashboard
 * - Resumos (semanal, mensal, anual)
 * - Notificações
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import { leaderboardValidation } from '../middleware/validation.js';
import {
  getLeaderboard,
  getDashboard,
  getWeeklySummary,
  getMonthlySummary,
  getYearlyStats,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/statsController.js';

// Criar router
const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Dashboard e estatísticas
// GET /api/stats/dashboard - Obter dados do dashboard
router.get('/dashboard', getDashboard);
// GET /api/stats/leaderboard - Obter ranking global
router.get('/leaderboard', leaderboardValidation, getLeaderboard);
// GET /api/stats/weekly - Obter resumo semanal
router.get('/weekly', getWeeklySummary);
// GET /api/stats/monthly - Obter resumo mensal
router.get('/monthly', getMonthlySummary);
// GET /api/stats/yearly - Obter estatísticas anuais
router.get('/yearly', getYearlyStats);

// Rotas de notificações
// GET /api/stats/notifications - Obter notificações
router.get('/notifications', getNotifications);
// PATCH /api/stats/notifications/read-all - Marcar todas como lidas
router.patch('/notifications/read-all', markAllNotificationsRead);
// PATCH /api/stats/notifications/:id/read - Marcar uma como lida
router.patch('/notifications/:id/read', markNotificationRead);

export default router;
