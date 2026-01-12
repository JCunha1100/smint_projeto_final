/**
 * Middleware de Tratamento de Erros
 * 
 * Handles todo o tratamento de erros da aplicação:
 * - Erros personalizados da API (ApiError)
 * - Erros do Prisma (erros de base de dados)
 * - Erros de JWT
 * - Erros inesperados
 */

import prisma from '../config/database.js';

/**
 * Classe de erro personalizado para a API
 * Usada para erros operacionais conhecidos
 */
export class ApiError extends Error {
  constructor(statusCode, message, details = null) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
  }
}

/**
 * Middleware de tratamento de erros principal
 * 
 * Classifica erros e retorna resposta apropriada:
 * - Erros do Prisma (códigos P*)
 * - Erros de JWT
 * - Erros operacionais (ApiError)
 * - Erros inesperados (500)
 */
export function errorHandler(err, req, res, next) {
  console.error('Erro:', err);
  
  // Tratar erros específicos do Prisma
  if (err.code) {
    switch (err.code) {
      case 'P2002':
        // Violação de restrição única (email já existe, etc.)
        return res.status(409).json({
          success: false,
          error: 'Conflito',
          message: 'Já existe um registo com este valor',
          field: err.meta?.target
        });
      case 'P2025':
        // Registo não encontrado
        return res.status(404).json({
          success: false,
          error: 'Não encontrado',
          message: 'O recurso solicitado não foi encontrado'
        });
      default:
        // Outros erros de base de dados
        return res.status(500).json({
          success: false,
          error: 'Erro de base de dados',
          message: 'Ocorreu um erro ao processar a sua requisição'
        });
    }
  }
  
  // Tratar erros de JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: 'Token inválido',
      message: 'O token de autenticação é inválido'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: 'Token expirado',
      message: 'A sua sessão expirou. Por favor inicie sessão novamente.'
    });
  }
  
  // Erros operacionais (conhecidos e esperados)
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      details: err.details
    });
  }
  
  // Erros inesperados (em produção não mostrar detalhes)
  return res.status(500).json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Ocorreu um erro inesperado'
  });
}

/**
 * Middleware para rotas não encontradas (404)
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    error: 'Não encontrado',
    message: `Não foi possível ${req.method} ${req.originalUrl}`
  });
}

/**
 * Wrapper para handlers assíncronos
 * Captura erros em Promises e passa para o próximo middleware
 */
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

/**
 * Helper para criar resposta de erro
 */
export function createErrorResponse(res, statusCode, message, details = null) {
  return res.status(statusCode).json({
    success: false,
    error: message,
    details
  });
}

/**
 * Helper para criar resposta de sucesso
 */
export function createSuccessResponse(res, statusCode, data, message = null) {
  return res.status(statusCode).json({
    success: true,
    message,
    ...data
  });
}

/**
 * Helper para resposta paginada
 */
export function paginatedResponse(res, data, pagination) {
  return res.status(200).json({
    success: true,
    data,
    pagination: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
      hasMore: pagination.page * pagination.limit < pagination.total
    }
  });
}
