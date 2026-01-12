/**
 * Controlador de Estatísticas
 * 
 * Handles todas as operações relacionadas com estatísticas e gamificação:
 * - Ranking/Leaderboard global
 * - Dashboard do utilizador
 * - Resumos semanais, mensais e anuais
 * - Sistema de notificações
 * - Cálculo de níveis e conquistas
 */

import prisma from '../config/database.js';
import { calculateLevel, getAchievements } from '../utils/scoreCalculator.js';
import { groupByPeriod, getLastPeriods, formatDateOnly, getStartOfMonth } from '../utils/dateUtils.js';
import { ApiError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';

/**
 * Obter ranking global de utilizadores
 * GET /api/stats/leaderboard
 * 
 * Retorna lista de utilizadores ordenados por totalScore,
 * com a posição do utilizador atual destacada
 */
export async function getLeaderboard(req, res, next) {
  try {
    const { page = 1, limit = 50 } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;
    
    // Buscar utilizadores ordenados por score em paralelo com contagem total
    const [users, totalCount] = await Promise.all([
      prisma.user.findMany({
        orderBy: { totalScore: 'desc' },
        skip,
        take: limitNum,
        select: {
          id: true,
          name: true,
          avatar: true,
          totalScore: true,
          level: true,
          streak: true,
          createdAt: true,
          _count: {
            select: { activities: true }
          }
        }
      }),
      prisma.user.count()
    ]);
    
    // Calcular posição do utilizador atual
    const currentUserRank = await prisma.user.count({
      where: {
        totalScore: { gt: req.user.totalScore }
      }
    }) + 1;
    
    // Calcular percentil (percentagem de utilizadores com score inferior)
    const percentile = Math.round((1 - (currentUserRank / totalCount)) * 100);
    
    // Adicionar posição a cada utilizador do ranking
    const leaderboard = users.map((user, index) => ({
      rank: skip + index + 1,
      ...user,
      activitiesCount: user._count.activities,
      levelInfo: calculateLevel(user.totalScore)
    }));
    
    // Verificar se utilizador atual está na lista visível
    const currentUserInList = leaderboard.find(u => u.id === req.userId);
    
    res.json({
      success: true,
      data: {
        leaderboard,
        currentUser: {
          rank: currentUserRank,
          percentile,
          ...req.user,
          levelInfo: calculateLevel(req.user.totalScore),
          isInTopList: currentUserInList !== undefined
        },
        pagination: {
          page: pageNum,
          limit: limitNum,
          total: totalCount,
          totalPages: Math.ceil(totalCount / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obter dados do dashboard do utilizador
 * GET /api/stats/dashboard
 * 
 * Retorna visão geral completa:
 * - Info do utilizador (nome, email, nível, progresso)
 * - Resumo de estatísticas (total atividades, minutos, distância)
 * - Estatísticas mensais e semanais
 * - Atividades recentes
 * - Distribuição por tipo de desporto
 * - Conquistas desbloqueadas
 */
export async function getDashboard(req, res, next) {
  try {
    const now = new Date();
    const startOfMonth = getStartOfMonth(now);
    
    // Buscar todos os dados necessários em paralelo
    const [
      userStats,
      recentActivities,
      monthlyStats,
      achievements
    ] = await Promise.all([
      // Estatísticas agregadas do utilizador
      prisma.activity.aggregate({
        where: { userId: req.userId },
        _sum: {
          duration: true,
          score: true,
          distance: true
        },
        _count: true
      }),
      
      // Atividades recentes (últimas 5)
      prisma.activity.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
        take: 5,
        select: {
          id: true,
          sportType: true,
          duration: true,
          date: true,
          intensity: true,
          score: true
        }
      }),
      
      // Estatísticas do mês atual
      prisma.activity.aggregate({
        where: {
          userId: req.userId,
          date: { gte: startOfMonth }
        },
        _sum: {
          duration: true,
          score: true
        },
        _count: true
      }),
      
      // Todas as atividades para cálculo de conquistas
      prisma.activity.findMany({
        where: { userId: req.userId },
        orderBy: { date: 'desc' },
        select: {
          sportType: true,
          duration: true,
          date: true,
          intensity: true,
          score: true,
          createdAt: true
        }
      })
    ]);
    
    // Calcular info do nível
    const totalScore = userStats._sum.score || 0;
    const levelInfo = calculateLevel(totalScore);
    
    // Estatísticas da última semana
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    
    const weeklyStats = await prisma.activity.aggregate({
      where: {
        userId: req.userId,
        date: { gte: weekStart }
      },
      _sum: {
        duration: true,
        score: true
      },
      _count: true
    });
    
    // Distribuição por tipo de desporto
    const sportBreakdown = await prisma.activity.groupBy({
      by: ['sportType'],
      where: { userId: req.userId },
      _sum: {
        duration: true
      },
      _count: true,
      orderBy: { _count: { sportType: 'desc' } }
    });
    
    // Calcular conquistas desbloqueadas
    const earnedAchievements = getAchievements(achievements);
    
    res.json({
      success: true,
      data: {
        user: {
          id: req.userId,
          name: req.user.name,
          email: req.user.email,
          totalScore,
          level: levelInfo.level,
          levelProgress: levelInfo.progress,
          streak: req.user.streak || 0
        },
        summary: {
          totalActivities: userStats._count,
          totalMinutes: userStats._sum.duration || 0,
          totalDistance: Math.round((userStats._sum.distance || 0) * 100) / 100,
          averageScorePerActivity: userStats._count > 0 
            ? Math.round((totalScore / userStats._count) * 100) / 100 
            : 0
        },
        monthly: {
          activities: monthlyStats._count,
          minutes: monthlyStats._sum.duration || 0,
          score: monthlyStats._sum.score || 0
        },
        weekly: {
          activities: weeklyStats._count,
          minutes: weeklyStats._sum.duration || 0,
          score: weeklyStats._sum.score || 0
        },
        recentActivities,
        sportBreakdown: sportBreakdown.map(s => ({
          sportType: s.sportType,
          count: s._count.sportType,
          totalMinutes: s._sum.duration || 0
        })),
        achievements: earnedAchievements.slice(0, 5),
        levelInfo
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obter resumo semanal
 * GET /api/stats/weekly
 * 
 * Retorna estatísticas agregadas por dia e por tipo de desporto
 * para os últimos 7 dias
 */
export async function getWeeklySummary(req, res, next) {
  try {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - 7);
    
    const activities = await prisma.activity.findMany({
      where: {
        userId: req.userId,
        date: { gte: weekStart }
      },
      orderBy: { date: 'asc' }
    });
    
    // Agrupar por dia e por tipo de desporto
    const dailyData = {};
    const sportData = {};
    
    activities.forEach(activity => {
      const dateKey = formatDateOnly(activity.date);
      
      // Agregação por dia
      if (!dailyData[dateKey]) {
        dailyData[dateKey] = {
          date: dateKey,
          activities: 0,
          minutes: 0,
          score: 0
        };
      }
      dailyData[dateKey].activities++;
      dailyData[dateKey].minutes += activity.duration;
      dailyData[dateKey].score += activity.score;
      
      // Agregação por desporto
      if (!sportData[activity.sportType]) {
        sportData[activity.sportType] = {
          sportType: activity.sportType,
          activities: 0,
          minutes: 0
        };
      }
      sportData[activity.sportType].activities++;
      sportData[activity.sportType].minutes += activity.duration;
    });
    
    // Calcular totais
    const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
    const totalScore = activities.reduce((sum, a) => sum + a.score, 0);
    const uniqueDays = Object.keys(dailyData).length;
    
    res.json({
      success: true,
      data: {
        period: {
          start: formatDateOnly(weekStart),
          end: formatDateOnly(now)
        },
        summary: {
          totalActivities: activities.length,
          totalMinutes,
          totalScore,
          averageMinutesPerDay: Math.round(totalMinutes / uniqueDays) || 0,
          activeDays: uniqueDays
        },
        dailyData: Object.values(dailyData),
        sportBreakdown: Object.values(sportData).sort((a, b) => b.minutes - a.minutes)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obter resumo mensal
 * GET /api/stats/monthly
 * 
 * @param {string} req.query.month - Mês (1-12), padrão: mês atual
 * @param {string} req.query.year - Ano, padrão: ano atual
 * 
 * Retorna estatísticas agregadas por semana e por tipo de desporto,
 * além de distribuição por intensidade
 */
export async function getMonthlySummary(req, res, next) {
  try {
    const { month, year } = req.query;
    const now = new Date();
    // Converter para inteiros (mês é 1-indexado no input)
    const targetMonth = month ? parseInt(month, 10) - 1 : now.getMonth();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    
    // Calcular início e fim do mês
    const startOfMonth = new Date(targetYear, targetMonth, 1);
    const endOfMonth = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59);
    
    const activities = await prisma.activity.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      orderBy: { date: 'asc' }
    });
    
    // Agrupar por semana e por tipo de desporto
    const weeklyData = {};
    const sportData = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const weekNumber = Math.ceil(date.getDate() / 7);
      const weekKey = `Semana ${weekNumber}`;
      
      // Agregação semanal
      if (!weeklyData[weekKey]) {
        weeklyData[weekKey] = {
          week: weekKey,
          activities: 0,
          minutes: 0,
          score: 0
        };
      }
      weeklyData[weekKey].activities++;
      weeklyData[weekKey].minutes += activity.duration;
      weeklyData[weekKey].score += activity.score;
      
      // Agregação por desporto
      if (!sportData[activity.sportType]) {
        sportData[activity.sportType] = {
          sportType: activity.sportType,
          activities: 0,
          minutes: 0,
          score: 0
        };
      }
      sportData[activity.sportType].activities++;
      sportData[activity.sportType].minutes += activity.duration;
      sportData[activity.sportType].score += activity.score;
    });
    
    // Calcular totais
    const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
    const totalScore = activities.reduce((sum, a) => sum + a.score, 0);
    
    // Distribuição por intensidade
    const intensityData = activities.reduce((acc, activity) => {
      if (!acc[activity.intensity]) {
        acc[activity.intensity] = { intensity: activity.intensity, count: 0, minutes: 0 };
      }
      acc[activity.intensity].count++;
      acc[activity.intensity].minutes += activity.duration;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        period: {
          month: targetMonth + 1,
          year: targetYear,
          start: formatDateOnly(startOfMonth),
          end: formatDateOnly(endOfMonth)
        },
        summary: {
          totalActivities: activities.length,
          totalMinutes,
          totalScore,
          averageMinutesPerActivity: activities.length > 0 
            ? Math.round(totalMinutes / activities.length) 
            : 0,
          activeWeeks: Object.keys(weeklyData).length
        },
        weeklyData: Object.values(weeklyData),
        sportBreakdown: Object.values(sportData).sort((a, b) => b.minutes - a.minutes),
        intensityBreakdown: Object.values(intensityData).sort((a, b) => b.minutes - a.minutes),
        topActivities: activities.slice(0, 5)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obter estatísticas anuais
 * GET /api/stats/yearly
 * 
 * @param {string} req.query.year - Ano, padrão: ano atual
 * 
 * Retorna estatísticas agregadas por mês e por tipo de desporto
 * para o ano especificado
 */
export async function getYearlyStats(req, res, next) {
  try {
    const { year } = req.query;
    const now = new Date();
    const targetYear = year ? parseInt(year, 10) : now.getFullYear();
    
    // Calcular início e fim do ano
    const startOfYear = new Date(targetYear, 0, 1);
    const endOfYear = new Date(targetYear, 11, 31, 23, 59, 59);
    
    const activities = await prisma.activity.findMany({
      where: {
        userId: req.userId,
        date: {
          gte: startOfYear,
          lte: endOfYear
        }
      },
      orderBy: { date: 'asc' }
    });
    
    // Agrupar por mês e por tipo de desporto
    const monthlyData = {};
    const sportData = {};
    
    activities.forEach(activity => {
      const date = new Date(activity.date);
      const monthKey = `${targetYear}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      // Agregação mensal
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          month: monthKey,
          activities: 0,
          minutes: 0,
          score: 0
        };
      }
      monthlyData[monthKey].activities++;
      monthlyData[monthKey].minutes += activity.duration;
      monthlyData[monthKey].score += activity.score;
      
      // Agregação por desporto
      if (!sportData[activity.sportType]) {
        sportData[activity.sportType] = {
          sportType: activity.sportType,
          activities: 0,
          minutes: 0
        };
      }
      sportData[activity.sportType].activities++;
      sportData[activity.sportType].minutes += activity.duration;
    });
    
    // Calcular totais
    const totalMinutes = activities.reduce((sum, a) => sum + a.duration, 0);
    const totalScore = activities.reduce((sum, a) => sum + a.score, 0);
    const totalDistance = activities.reduce((sum, a) => sum + (a.distance || 0), 0);
    
    // Preencher meses vazios com zeros
    const allMonths = getLastPeriods('month', 12);
    const filledMonthlyData = allMonths.map(monthKey => ({
      month: monthKey,
      activities: monthlyData[monthKey]?.activities || 0,
      minutes: monthlyData[monthKey]?.minutes || 0,
      score: monthlyData[monthKey]?.score || 0
    }));
    
    res.json({
      success: true,
      data: {
        year: targetYear,
        summary: {
          totalActivities: activities.length,
          totalMinutes,
          totalScore,
          totalDistance: Math.round(totalDistance * 100) / 100,
          averageMinutesPerMonth: Math.round(totalMinutes / 12),
          activeMonths: Object.keys(monthlyData).length
        },
        monthlyData: filledMonthlyData,
        sportBreakdown: Object.values(sportData).sort((a, b) => b.minutes - a.minutes)
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obter notificações do utilizador
 * GET /api/stats/notifications
 * 
 * @param {string} req.query.page - Página, padrão: 1
 * @param {string} req.query.limit - Limite por página, padrão: 20
 * @param {string} req.query.unreadOnly - 'true' para mostrar apenas não lidas
 */
export async function getNotifications(req, res, next) {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), 100);
    const skip = (pageNum - 1) * limitNum;
    
    // Construir filtro
    const where = {
      userId: req.userId,
      ...(unreadOnly === 'true' && { isRead: false })
    };
    
    // Buscar notificações em paralelo com contagens
    const [notifications, total, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limitNum
      }),
      prisma.notification.count({ where }),
      // Contar não lidas
      prisma.notification.count({
        where: { userId: req.userId, isRead: false }
      })
    ]);
    
    res.json({
      success: true,
      data: {
        notifications,
        unreadCount,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Marcar uma notificação como lida
 * PATCH /api/stats/notifications/:id/read
 */
export async function markNotificationRead(req, res, next) {
  try {
    const { id } = req.params;
    
    // Verificar se notificação existe e pertence ao utilizador
    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });
    
    if (!notification) {
      throw new ApiError(404, 'Notificação não encontrada');
    }
    
    // Marcar como lida
    await prisma.notification.update({
      where: { id },
      data: { isRead: true }
    });
    
    res.json({
      success: true,
      message: 'Notificação marcada como lida'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Marcar todas as notificações como lidas
 * PATCH /api/stats/notifications/read-all
 */
export async function markAllNotificationsRead(req, res, next) {
  try {
    // Atualizar todas as não lidas do utilizador
    await prisma.notification.updateMany({
      where: {
        userId: req.userId,
        isRead: false
      },
      data: { isRead: true }
    });
    
    res.json({
      success: true,
      message: 'Todas as notificações marcadas como lidas'
    });
  } catch (error) {
    next(error);
  }
}
