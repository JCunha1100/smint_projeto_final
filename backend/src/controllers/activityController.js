/**
 * Controlador de Atividades
 * 
 * Handles todas as operações relacionadas com atividades físicas:
 * - CRUD de atividades (criar, ler, atualizar, eliminar)
 * - Sistema de favoritos
 * - Estatísticas de atividades
 * - Cálculo automático de pontos e gamificação
 */

import prisma from '../config/database.js';
import { calculateScore } from '../utils/scoreCalculator.js';
import { ApiError } from '../middleware/errorHandler.js';
import { config } from '../config/index.js';

/**
 * Criar uma nova atividade
 * POST /api/activities
 * 
 * Calcula automaticamente o score baseado em:
 * - Duração (minutos)
 * - Intensidade (LOW, MODERATE, HIGH)
 * - Tipo de desporto (pesos diferentes para cada modalidade)
 * 
 * Atualiza o totalScore e verifica level up do utilizador
 */
export async function createActivity(req, res, next) {
  try {
    const { sportType, duration, date, intensity, distance, location, notes } = req.body;
    
    // Calcular score para a atividade usando scoreCalculator
    const score = calculateScore({ duration, intensity, sportType });
    
    // Criar atividade dentro de transação atómica
    const activity = await prisma.$transaction(async (tx) => {
      // Criar a atividade (não concluída por padrão)
      const newActivity = await tx.activity.create({
        data: {
          userId: req.userId,
          sportType,
          duration,
          date: new Date(date),
          intensity,
          distance: distance || null,
          location: location || null,
          notes: notes || null,
          score,
          completed: false
        }
      });
      
      // Não atualizar score do utilizador - apenas quando concluir
      await tx.user.update({
        where: { id: req.userId },
        data: {
          lastActiveAt: new Date()
        }
      });
      
      return newActivity;
    });
    
    res.status(201).json({
      success: true,
      message: 'Atividade criada com sucesso',
      data: {
        activity: {
          ...activity,
          // Calorias estimadas: duração × multiplicador de intensidade × 5
          calories: Math.round(duration * (config.scoring.intensityMultipliers[intensity] || 1) * 5)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obter todas as atividades do utilizador atual
 * GET /api/activities
 * 
 * Suporta filtros e paginação:
 * - sportType: filtrar por tipo de desporto
 * - intensity: filtrar por intensidade
 * - startDate/endDate: filtrar por intervalo de datas
 * - favorites: mostrar apenas atividades favoritas
 * - sortBy/sortOrder: ordenação
 * - page/limit: paginação
 */
export async function getActivities(req, res, next) {
  try {
    const {
      page = 1,
      limit = config.pagination.defaultLimit,
      sportType,
      intensity,
      startDate,
      endDate,
      favorites,
      sortBy = 'date',
      sortOrder = 'desc'
    } = req.query;
    
    // Converter para números e calcular offset
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), config.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;
    
    // Construir cláusula where para filtros
    const where = {
      userId: req.userId
    };
    
    if (sportType) {
      where.sportType = sportType;
    }
    
    if (intensity) {
      where.intensity = intensity;
    }
    
    if (startDate || endDate) {
      where.date = {};
      if (startDate) where.date.gte = new Date(startDate);
      if (endDate) where.date.lte = new Date(endDate);
    }
    
    if (favorites === 'true') {
      where.favoritedBy = {
        some: { userId: req.userId }
      };
    }
    
    // Construir objeto de ordenação
    const orderBy = {};
    orderBy[sortBy] = sortOrder;
    
    // Buscar atividades e contar total em paralelo
    const [activities, total] = await Promise.all([
      prisma.activity.findMany({
        where,
        orderBy,
        skip,
        take: limitNum,
        include: {
          favoritedBy: {
            where: { userId: req.userId },
            select: { id: true }
          }
        }
      }),
      prisma.activity.count({ where })
    ]);
    
    // Adicionar campo isFavorite às atividades
    const activitiesWithFavorite = activities.map(activity => ({
      ...activity,
      isFavorite: activity.favoritedBy.length > 0
    }));
    
    res.json({
      success: true,
      data: {
        activities: activitiesWithFavorite,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasMore: skip + limitNum < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obter uma atividade específica pelo ID
 * GET /api/activities/:id
 */
export async function getActivity(req, res, next) {
  try {
    const { id } = req.params;
    
    // Buscar apenas se pertencer ao utilizador atual
    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: req.userId
      },
      include: {
        favoritedBy: {
          where: { userId: req.userId },
          select: { id: true }
        }
      }
    });
    
    if (!activity) {
      throw new ApiError(404, 'Atividade não encontrada');
    }
    
    res.json({
      success: true,
      data: {
        activity: {
          ...activity,
          isFavorite: activity.favoritedBy.length > 0
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Atualizar uma atividade
 * PUT /api/activities/:id
 * 
 * Recalcula o score se duração, intensidade ou tipo mudarem
 * Atualiza totalScore do utilizador com a diferença
 */
export async function updateActivity(req, res, next) {
  try {
    const { id } = req.params;
    const { sportType, duration, date, intensity, distance, location, notes, completed } = req.body;
    
    // Verificar se atividade existe e pertence ao utilizador
    const existingActivity = await prisma.activity.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });
    
    if (!existingActivity) {
      throw new ApiError(404, 'Atividade não encontrada');
    }
    
    // Calcular novo score se houver mudanças nos campos relevantes
    const newScore = calculateScore({
      duration: duration || existingActivity.duration,
      intensity: intensity || existingActivity.intensity,
      sportType: sportType || existingActivity.sportType
    });
    
    // Calcular diferença de score
    const scoreDifference = newScore - existingActivity.score;
    
    // Verificar se está a concluir a atividade pela primeira vez
    const isCompletingNow = completed === true && !existingActivity.completed;
    
    // Atualizar dentro de transação
    const result = await prisma.$transaction(async (tx) => {
      // Atualizar a atividade
      const updatedActivity = await tx.activity.update({
        where: { id },
        data: {
          ...(sportType && { sportType }),
          ...(duration && { duration }),
          ...(date && { date: new Date(date) }),
          ...(intensity && { intensity }),
          ...(distance !== undefined && { distance }),
          ...(location !== undefined && { location }),
          ...(notes !== undefined && { notes }),
          ...(completed !== undefined && { completed }),
          score: newScore
        }
      });
      
      // Adicionar pontos ao utilizador se estiver a concluir agora
      if (isCompletingNow) {
        const user = await tx.user.update({
          where: { id: req.userId },
          data: {
            totalScore: { increment: newScore }
          },
          select: {
            id: true,
            totalScore: true,
            level: true
          }
        });
        
        // Verificar level up
        const newLevel = Math.floor(user.totalScore / 100) + 1;
        if (newLevel > user.level) {
          await tx.user.update({
            where: { id: req.userId },
            data: { level: newLevel }
          });
          
          // Criar notificação de level up
          await tx.notification.create({
            data: {
              userId: req.userId,
              type: 'ACHIEVEMENT',
              message: `🎉 Parabéns! Atingiste o nível ${newLevel}!`
            }
          });
        }
      } else if (scoreDifference !== 0 && existingActivity.completed) {
        // Se já estava concluída e mudou o score, atualizar a diferença
        await tx.user.update({
          where: { id: req.userId },
          data: {
            totalScore: { increment: scoreDifference }
          }
        });
      }
      
      return updatedActivity;
    });
    
    res.json({
      success: true,
      message: isCompletingNow ? 'Atividade concluída com sucesso!' : 'Atividade atualizada com sucesso',
      data: { activity: result }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar uma atividade
 * DELETE /api/activities/:id
 * 
 * Decrementa o totalScore do utilizador pelo score da atividade eliminada
 */
export async function deleteActivity(req, res, next) {
  try {
    const { id } = req.params;
    
    // Verificar se atividade existe
    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: req.userId
      }
    });
    
    if (!activity) {
      throw new ApiError(404, 'Atividade não encontrada');
    }
    
    // Eliminar dentro de transação
    await prisma.$transaction(async (tx) => {
      // Eliminar a atividade
      await tx.activity.delete({
        where: { id }
      });
      
      // Decrementar totalScore do utilizador
      await tx.user.update({
        where: { id: req.userId },
        data: {
          totalScore: { decrement: activity.score }
        }
      });
    });
    
    res.json({
      success: true,
      message: 'Atividade eliminada com sucesso'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Alternar estado de favorito de uma atividade
 * PATCH /api/activities/:id/favorite
 * 
 * @param {boolean} req.body.isFavorite - true para adicionar, false para remover
 */
export async function toggleFavorite(req, res, next) {
  try {
    const { id } = req.params;
    const { isFavorite } = req.body;
    
    // Verificar se atividade existe e pertence ao utilizador
    const activity = await prisma.activity.findFirst({
      where: {
        id,
        userId: req.userId
      },
      include: {
        favoritedBy: {
          where: { userId: req.userId }
        }
      }
    });
    
    if (!activity) {
      throw new ApiError(404, 'Atividade não encontrada');
    }
    
    const alreadyFavorited = activity.favoritedBy.length > 0;
    
    if (isFavorite && !alreadyFavorited) {
      // Adicionar aos favoritos
      await prisma.favorite.create({
        data: {
          userId: req.userId,
          activityId: id
        }
      });
    } else if (!isFavorite && alreadyFavorited) {
      // Remover dos favoritos
      await prisma.favorite.deleteMany({
        where: {
          userId: req.userId,
          activityId: id
        }
      });
    }
    
    res.json({
      success: true,
      message: isFavorite ? 'Atividade adicionada aos favoritos' : 'Atividade removida dos favoritos',
      data: { isFavorite }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obter atividades favoritadas
 * GET /api/activities/favorites
 */
export async function getFavorites(req, res, next) {
  try {
    const { page = 1, limit = 20 } = req.query;
    
    const pageNum = parseInt(page, 10);
    const limitNum = Math.min(parseInt(limit, 10), config.pagination.maxLimit);
    const skip = (pageNum - 1) * limitNum;
    
    const [favorites, total] = await Promise.all([
      prisma.favorite.findMany({
        where: { userId: req.userId },
        include: {
          activity: true
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limitNum
      }),
      prisma.favorite.count({
        where: { userId: req.userId }
      })
    ]);
    
    // Extrair apenas as atividades
    const activities = favorites.map(f => f.activity);
    
    res.json({
      success: true,
      data: {
        activities,
        pagination: {
          page: pageNum,
          limit: limitNum,
          total,
          totalPages: Math.ceil(total / limitNum),
          hasMore: skip + limitNum < total
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obter estatísticas das atividades
 * GET /api/activities/stats
 * 
 * @param {string} req.query.period - 'week', 'month', 'year' ou null (todo o histórico)
 * 
 * Retorna:
 * - Resumo (total de atividades, minutos, score, distância)
 * - Desporto mais praticado
 * - Distribuição por tipo de desporto
 * - Estatísticas diárias para gráficos
 */
export async function getActivityStats(req, res, next) {
  try {
    const { period = 'month' } = req.query;
    
    const now = new Date();
    let startDate;
    
    // Calcular data de início baseada no período
    switch (period) {
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = null;
    }
    
    const where = {
      userId: req.userId,
      ...(startDate && {
        date: { gte: startDate }
      })
    };
    
    // Obter estatísticas agregadas em paralelo
    const [totalMinutes, totalScore, totalDistance, sportBreakdown] = await Promise.all([
      // Total de minutos
      prisma.activity.aggregate({
        where,
        _sum: { duration: true }
      }),
      // Total de score
      prisma.activity.aggregate({
        where,
        _sum: { score: true }
      }),
      // Total de distância (apenas atividades com distância)
      prisma.activity.aggregate({
        where: { ...where, distance: { not: null } },
        _sum: { distance: true }
      }),
      // Contagem por tipo de desporto
      prisma.activity.groupBy({
        by: ['sportType'],
        where,
        _count: { sportType: true },
        orderBy: { _count: { sportType: 'desc' } }
      })
    ]);
    
    // Desporto mais praticado
    const mostPracticed = sportBreakdown[0] || null;
    
    // Atividades por data para gráficos
    const activitiesByDate = await prisma.activity.findMany({
      where,
      select: {
        date: true,
        duration: true,
        score: true
      },
      orderBy: { date: 'asc' }
    });
    
    // Agrupar por dia
    const dailyStats = activitiesByDate.reduce((acc, activity) => {
      const dateKey = new Date(activity.date).toISOString().split('T')[0];
      if (!acc[dateKey]) {
        acc[dateKey] = { date: dateKey, count: 0, duration: 0, score: 0 };
      }
      acc[dateKey].count++;
      acc[dateKey].duration += activity.duration;
      acc[dateKey].score += activity.score;
      return acc;
    }, {});
    
    res.json({
      success: true,
      data: {
        summary: {
          totalActivities: activitiesByDate.length,
          totalMinutes: totalMinutes._sum.duration || 0,
          totalScore: totalScore._sum.score || 0,
          totalDistance: Math.round((totalDistance._sum.distance || 0) * 100) / 100
        },
        mostPracticed: mostPracticed ? {
          sportType: mostPracticed.sportType,
          count: mostPracticed._count.sportType
        } : null,
        sportBreakdown: sportBreakdown.map(s => ({
          sportType: s.sportType,
          count: s._count.sportType
        })),
        dailyStats: Object.values(dailyStats)
      }
    });
  } catch (error) {
    next(error);
  }
}
