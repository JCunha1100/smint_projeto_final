/**
 * Rotas de Autenticação
 * 
 * trata de todas as rotas relacionadas com autenticação de utilizadores:
 * - Registo (público)
 * - Login (público)
 * - Operações protegidas (perfil, atualização, eliminação)
 */

import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.js';
import {
  registerValidation,
  loginValidation
} from '../middleware/validation.js';
import {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  deleteAccount,
  refreshToken
} from '../controllers/authController.js';

// Criar router
const router = Router();

// Rotas públicas (não requerem autenticação)
// POST /api/auth/register - Registar novo utilizador
router.post('/register', registerValidation, register);
// POST /api/auth/login - Iniciar sessão
router.post('/login', loginValidation, login);

// Middleware de autenticação para rotas seguintes
router.use(authMiddleware);

// Rotas protegidas (requerem token JWT válido)
// GET /api/auth/me - Obter perfil do utilizador atual
router.get('/me', getProfile);
// PUT /api/auth/me - Atualizar perfil
router.put('/me', updateProfile);
// PUT /api/auth/password - Alterar palavra-passe
router.put('/password', changePassword);
// DELETE /api/auth/me - Eliminar conta
router.delete('/me', deleteAccount);
// POST /api/auth/refresh - Renovar token
router.post('/refresh', refreshToken);

export default router;
