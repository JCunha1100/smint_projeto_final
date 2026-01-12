/**
 * Rotas de Atividades
 * 
 * Handles todas as rotas relacionadas com gestão de atividades físicas:
 * - CRUD de atividades
 * - Sistema de favoritos
 * - Estatísticas de atividades
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  createActivityValidation,
  updateActivityValidation,
  activityIdValidation,
  listActivitiesValidation
} from '../middleware/validation.js';
import {
  createActivity,
  getActivities,
  getActivity,
  updateActivity,
  deleteActivity,
  toggleFavorite,
  getFavorites,
  getActivityStats
} from '../controllers/activityController.js';

// Criar router
const router = Router();

// Todas as rotas requerem autenticação
router.use(authMiddleware);

// Operações CRUD de atividades
// POST /api/activities - Criar nova atividade
router.post('/', createActivityValidation, createActivity);
// GET /api/activities - Listar atividades com filtros e paginação
router.get('/', listActivitiesValidation, getActivities);
// GET /api/activities/stats - Obter estatísticas das atividades
router.get('/stats', getActivityStats);
// GET /api/activities/favorites - Obter atividades favoritas
router.get('/favorites', getFavorites);
// GET /api/activities/:id - Obter atividade específica
router.get('/:id', activityIdValidation, getActivity);
// PUT /api/activities/:id - Atualizar atividade
router.put('/:id', updateActivityValidation, updateActivity);
// DELETE /api/activities/:id - Eliminar atividade
router.delete('/:id', activityIdValidation, deleteActivity);

// Operações de favorito
// PATCH /api/activities/:id/favorite - Alternar estado de favorito
router.patch('/:id/favorite', activityIdValidation, toggleFavorite);

export default router;
