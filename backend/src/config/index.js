/**
 * Configuração da Aplicação
 * 
 * Carrega variáveis de ambiente e define configurações globais:
 * - Porta do servidor
 * - Configuração JWT
 * - Configuração de hashing (bcrypt)
 * - Configuração de base de dados
 * - Pesos e multiplicadores de pontuação
 * - Configuração de paginação
 */

import dotenv from 'dotenv';

// Carregar variáveis de ambiente
dotenv.config();

export const config = {
  // Porta do servidor (padrão: 3000)
  port: parseInt(process.env.PORT || '3000', 10),
  // Ambiente de execução (development/production)
  nodeEnv: process.env.NODE_ENV || 'development',
  
  // Configuração JWT para autenticação
  jwt: {
    // Chave secreta para assinar tokens (mudar em produção!)
    secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
    // Tempo de expiração do token (padrão: 7 dias)
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  
  // Configuração bcrypt para hashing de palavras-passe
  bcrypt: {
    // Número de rounds para hashing (maior = mais seguro mas mais lento)
    rounds: parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
  },
  
  // Configuração da base de dados
  database: {
    // URL de conexão (ficheiro local para SQLite)
    url: process.env.DATABASE_URL || 'file:./dev.db'
  },
  
  // Configuração de pontuação (gamificação)
  scoring: {
    // Multiplicadores por nível de intensidade
    intensityMultipliers: {
      LOW: 0.8,      // Baixa intensidade
      MODERATE: 1.1, // Intensidade moderada
      HIGH: 1.5,     // Alta intensidade
      EXTREME: 1.5   // Intensidade extrema
    },
    // Pontos base por tipo de desporto
    basePoints: {
      RUNNING: 100,
      WALKING: 60,
      CYCLING: 90,
      SWIMMING: 110,
      GYM: 80,
      YOGA: 50,
      FOOTBALL: 95,
      BASKETBALL: 85,
      TENNIS: 75,
      HIIT: 100,
      HIKING: 80,
      DANCING: 70,
      BOXING: 90,
      OTHER: 50
    }
  },
  
  // Configuração de paginação
  pagination: {
    defaultLimit: 20,  // Limite padrão por página
    maxLimit: 100      // Limite máximo permitido
  }
};
