/**
 * Middleware de Autenticação
 * 
 * Handles toda a lógica de autenticação JWT:
 * - Verificação de tokens
 * - Geração de tokens
 * - Hash e verificação de palavras-passe
 */

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { config } from '../config/index.js';

/**
 * Middleware de autenticação
 * Verifica o token JWT e anexa o utilizador ao request
 * 
 * Se o token for válido: req.user contém dados do utilizador
 * Se inválido: retorna erro 401
 */
export async function authMiddleware(req, res, next) {
  try {
    // Verificar header de autorização
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Autenticação necessária',
        message: 'Por favor forneça um token Bearer válido'
      });
    }
    
    // Extrair token do header
    const token = authHeader.split(' ')[1];
    
    try {
      // Verificar e decodificar token JWT
      const decoded = jwt.verify(token, config.jwt.secret);
      
      // Buscar utilizador na base de dados
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          totalScore: true,
          level: true,
          createdAt: true
        }
      });
      
      // Se utilizador não existir, token é inválido
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'Token inválido',
          message: 'Utilizador não encontrado'
        });
      }
      
      // Anexar utilizador ao request
      req.user = user;
      req.userId = user.id;
      next();
    } catch (jwtError) {
      // Tratar erros específicos de JWT
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token expirado',
          message: 'Por favor inicie sessão novamente'
        });
      }
      
      return res.status(401).json({
        success: false,
        error: 'Token inválido',
        message: 'Autenticação falhou'
      });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    return res.status(500).json({
      success: false,
      error: 'Erro do servidor',
      message: 'Verificação de autenticação falhou'
    });
  }
}

/**
 * Middleware de autenticação opcional
 * Anexa utilizador se token for válido, mas não retorna erro se não for
 * Útil para endpoints públicos que têm comportamento diferente para autenticados
 */
export async function optionalAuthMiddleware(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    
    // Se não houver token, continuar sem autenticação
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      const decoded = jwt.verify(token, config.jwt.secret);
      
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          email: true,
          name: true,
          totalScore: true,
          level: true,
          createdAt: true
        }
      });
      
      // Se utilizador existir, anexar ao request
      if (user) {
        req.user = user;
        req.userId = user.id;
      }
    } catch (jwtError) {
      // Se token for inválido, continuar sem autenticação
      // (comportamento esperado para middleware opcional)
    }
    
    next();
  } catch (error) {
    next();
  }
}

/**
 * Gerar token JWT para um utilizador
 * 
 * @param {Object} user - Objeto do utilizador
 * @returns {string} Token JWT assinado
 */
export function generateToken(user) {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email
    },
    config.jwt.secret,
    {
      expiresIn: config.jwt.expiresIn
    }
  );
}

/**
 * Verificar se uma palavra-passe corresponde a um hash
 * 
 * @param {string} password - Palavra-passe em texto limpo
 * @param {string} hash - Hash da palavra-passe armazenada
 * @returns {boolean} True se corresponderem
 */
export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

/**
 * Criar hash de uma palavra-passe
 * 
 * @param {string} password - Palavra-passe em texto limpo
 * @returns {string} Hash da palavra-passe
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, config.bcrypt.rounds);
}
