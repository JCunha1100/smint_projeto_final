/**
 * Configuração da Base de Dados (Prisma)
 * 
 * Inicializa e exporta o cliente Prisma para acesso à base de dados SQLite.
 * Inclui função de teste de conexão.
 */

import { PrismaClient } from '@prisma/client';

// Inicializar cliente Prisma
// Em desenvolvimento, mostra queries, erros e warnings
// Em produção, mostra apenas erros
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error']
});

export default prisma;

/**
 * Testar conexão com a base de dados
 * Executa uma query simples para verificar se a conexão está ativa
 * @returns {Promise<boolean>} True se conexão bem-sucedida
 */
export async function testConnection() {
  try {
    // Executar query simples para testar conexão
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexão com a base de dados estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Falha na conexão com a base de dados:', error.message);
    return false;
  }
}
