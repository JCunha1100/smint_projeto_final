/**
 * Controlador de Autenticação
 * 
 * Handles todas as operações relacionadas com autenticação de utilizadores:
 * - Registo de novos utilizadores
 * - Login e geração de tokens JWT
 * - Gestão de perfil
 * - Alteração e eliminação de conta
 */

import prisma from '../config/database.js';
import { generateToken, hashPassword, verifyPassword } from '../middleware/auth.js';
import { ApiError } from '../middleware/errorHandler.js';

/**
 * Registar um novo utilizador
 * POST /api/auth/register
 * 
 * @param {string} req.body.email - Email do utilizador (obrigatório)
 * @param {string} req.body.password - Palavra-passe (mínimo 6 caracteres)
 * @param {string} req.body.name - Nome do utilizador (opcional)
 */
export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body;
    
    // Verificar se já existe utilizador com este email
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });
    
    if (existingUser) {
      throw new ApiError(409, 'Email já registado');
    }
    
    // Criar hash da palavra-passe usando bcrypt
    const hashedPassword = await hashPassword(password);
    
    // Criar novo utilizador na base de dados
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        // Se não houver nome, usar parte do email antes do @
        name: name || email.split('@')[0]
      },
      // Selecionar apenas campos necessários para retornar
      select: {
        id: true,
        email: true,
        name: true,
        totalScore: true,
        level: true,
        createdAt: true
      }
    });
    
    // Gerar token JWT para o novo utilizador
    const token = generateToken(user);
    
    res.status(201).json({
      success: true,
      message: 'Utilizador registado com sucesso',
      data: {
        user,
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Iniciar sessão de um utilizador
 * POST /api/auth/login
 * 
 * @param {string} req.body.email - Email do utilizador
 * @param {string} req.body.password - Palavra-passe
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    
    // Procurar utilizador pelo email
    const user = await prisma.user.findUnique({
      where: { email }
    });
    
    if (!user) {
      throw new ApiError(401, 'Email ou palavra-passe inválidos');
    }
    
    // Verificar se a palavra-passe corresponde ao hash
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      throw new ApiError(401, 'Email ou palavra-passe inválidos');
    }
    
    // Gerar token JWT
    const token = generateToken(user);
    
    res.json({
      success: true,
      message: 'Login realizado com sucesso',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          totalScore: user.totalScore,
          level: user.level
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Obter perfil do utilizador atual
 * GET /api/auth/me
 * 
 * Requer autenticação (token JWT válido)
 */
export async function getProfile(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        totalScore: true,
        level: true,
        streak: true,
        createdAt: true,
        // Contar relações
        _count: {
          select: {
            activities: true,
            favorites: true
          }
        }
      }
    });
    
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado');
    }
    
    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Atualizar perfil do utilizador
 * PUT /api/auth/me
 * 
 * @param {string} req.body.name - Novo nome (opcional)
 * @param {string} req.body.avatar - URL do avatar (opcional)
 */
export async function updateProfile(req, res, next) {
  try {
    const { name, avatar } = req.body;
    
    const user = await prisma.user.update({
      where: { id: req.userId },
      data: {
        // Atualizar apenas campos fornecidos
        ...(name && { name }),
        ...(avatar !== undefined && { avatar })
      },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        totalScore: true,
        level: true,
        streak: true,
        createdAt: true
      }
    });
    
    res.json({
      success: true,
      message: 'Perfil atualizado com sucesso',
      data: { user }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Alterar palavra-passe
 * PUT /api/auth/password
 * 
 * @param {string} req.body.currentPassword - Palavra-passe atual
 * @param {string} req.body.newPassword - Nova palavra-passe
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;
    
    // Obter utilizador com palavra-passe (não incluída por padrão)
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado');
    }
    
    // Verificar palavra-passe atual
    const isValid = await verifyPassword(currentPassword, user.password);
    
    if (!isValid) {
      throw new ApiError(401, 'Palavra-passe atual incorreta');
    }
    
    // Criar hash da nova palavra-passe
    const hashedPassword = await hashPassword(newPassword);
    
    // Atualizar palavra-passe
    await prisma.user.update({
      where: { id: req.userId },
      data: { password: hashedPassword }
    });
    
    res.json({
      success: true,
      message: 'Palavra-passe alterada com sucesso'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Eliminar conta do utilizador
 * DELETE /api/auth/me
 * 
 * @param {string} req.body.password - Palavra-passe atual (para confirmação)
 * 
 * Esta operação elimina cascade:
 * - Todas as atividades do utilizador
 * - Todos os favoritos
 * - Todas as notificações
 */
export async function deleteAccount(req, res, next) {
  try {
    const { password } = req.body;
    
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado');
    }
    
    // Verificar palavra-passe antes de eliminar
    const isValid = await verifyPassword(password, user.password);
    
    if (!isValid) {
      throw new ApiError(401, 'Palavra-passe incorreta');
    }
    
    // Eliminar utilizador (cascade para atividades, favoritos, notificações)
    await prisma.user.delete({
      where: { id: req.userId }
    });
    
    res.json({
      success: true,
      message: 'Conta eliminada com sucesso'
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Renovar token de autenticação
 * POST /api/auth/refresh
 * 
 * Gera um novo token JWT para o utilizador atual
 */
export async function refreshToken(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId }
    });
    
    if (!user) {
      throw new ApiError(404, 'Utilizador não encontrado');
    }
    
    const token = generateToken(user);
    
    res.json({
      success: true,
      data: { token }
    });
  } catch (error) {
    next(error);
  }
}
