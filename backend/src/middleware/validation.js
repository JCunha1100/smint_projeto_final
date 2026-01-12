/**
 * Middleware de Validação
 * 
 * Handles validação de dados de entrada usando express-validator:
 * - Validação de registo e login
 * - Validação de criação e atualização de atividades
 * - Validação de parâmetros de query (filtros, paginação)
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * Processar erros de validação
 * Se houver erros, retorna 400 com detalhes
 */
export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Validação falhou',
      details: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
}

/**
 * Regras de validação para registo de utilizador
 * - email: obrigatório, formato válido
 * - password: obrigatório, mínimo 6 chars, pelo menos 1 número
 * - name: opcional, 2-50 caracteres
 */
export const registerValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor forneça um email válido')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Palavra-passe deve ter pelo menos 6 caracteres')
    .matches(/\d/)
    .withMessage('Palavra-passe deve conter pelo menos um número'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Nome deve ter entre 2 e 50 caracteres'),
  handleValidationErrors
];

/**
 * Regras de validação para login
 * - email: obrigatório, formato válido
 * - password: obrigatório
 */
export const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Por favor forneça um email válido')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Palavra-passe é obrigatória'),
  handleValidationErrors
];

/**
 * Regras de validação para criação de atividade
 * - sportType: obrigatório, um dos tipos válidos
 * - duration: obrigatório, 1-1440 minutos
 * - date: obrigatório, formato ISO 8601
 * - intensity: obrigatório, um dos níveis válidos
 * - distance: opcional, número positivo
 * - location: opcional, máximo 200 caracteres
 * - notes: opcional, máximo 1000 caracteres
 */
export const createActivityValidation = [
  body('sportType')
    .isIn(['RUNNING', 'CYCLING', 'GYM', 'FOOTBALL', 'SWIMMING', 'YOGA', 'HIIT', 'WALKING', 'TENNIS', 'BASKETBALL', 'HIKING', 'DANCING', 'BOXING', 'OTHER'])
    .withMessage('Tipo de desporto inválido'),
  body('duration')
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duração deve ser entre 1 e 1440 minutos'),
  body('date')
    .isISO8601()
    .withMessage('Por favor forneça uma data válida'),
  body('intensity')
    .isIn(['LOW', 'MODERATE', 'HIGH', 'EXTREME'])
    .withMessage('Nível de intensidade inválido'),
  body('distance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Distância deve ser um número positivo'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Localização não deve exceder 200 caracteres'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notas não devem exceder 1000 caracteres'),
  handleValidationErrors
];

/**
 * Regras de validação para atualização de atividade
 * Todos os campos são opcionais mas devem ser válidos se fornecidos
 */
export const updateActivityValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de atividade inválido'),
  body('sportType')
    .optional()
    .isIn(['RUNNING', 'CYCLING', 'GYM', 'FOOTBALL', 'SWIMMING', 'YOGA', 'HIIT', 'WALKING', 'TENNIS', 'BASKETBALL', 'HIKING', 'DANCING', 'BOXING', 'OTHER'])
    .withMessage('Tipo de desporto inválido'),
  body('duration')
    .optional()
    .isInt({ min: 1, max: 1440 })
    .withMessage('Duração deve ser entre 1 e 1440 minutos'),
  body('date')
    .optional()
    .isISO8601()
    .withMessage('Por favor forneça uma data válida'),
  body('intensity')
    .optional()
    .isIn(['LOW', 'MODERATE', 'HIGH', 'EXTREME'])
    .withMessage('Nível de intensidade inválido'),
  body('distance')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Distância deve ser um número positivo'),
  body('location')
    .optional()
    .trim()
    .isLength({ max: 200 })
    .withMessage('Localização não deve exceder 200 caracteres'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notas não devem exceder 1000 caracteres'),
  body('isFavorite')
    .optional()
    .isBoolean()
    .withMessage('isFavorite deve ser um valor booleano'),
  handleValidationErrors
];

/**
 * Regras de validação para ID de atividade na URL
 */
export const activityIdValidation = [
  param('id')
    .isUUID()
    .withMessage('ID de atividade inválido'),
  handleValidationErrors
];

/**
 * Regras de validação para listagem de atividades
 * Filtros e paginação
 */
export const listActivitiesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  query('sportType')
    .optional()
    .isIn(['RUNNING', 'CYCLING', 'GYM', 'FOOTBALL', 'SWIMMING', 'YOGA', 'HIIT', 'WALKING', 'TENNIS', 'BASKETBALL', 'HIKING', 'DANCING', 'BOXING', 'OTHER'])
    .withMessage('Tipo de desporto inválido'),
  query('intensity')
    .optional()
    .isIn(['LOW', 'MODERATE', 'HIGH', 'EXTREME'])
    .withMessage('Intensidade inválida'),
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data de início deve ser uma data válida'),
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data de fim deve ser uma data válida'),
  query('favorites')
    .optional()
    .isBoolean()
    .withMessage('favorites deve ser um valor booleano'),
  query('sortBy')
    .optional()
    .isIn(['date', 'duration', 'score', 'createdAt'])
    .withMessage('Campo de ordenação inválido'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Ordem de ordenação deve ser asc ou desc'),
  handleValidationErrors
];

/**
 * Regras de validação para query do ranking
 */
export const leaderboardValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número inteiro positivo'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  handleValidationErrors
];
