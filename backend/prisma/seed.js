import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { calculateScore } from '../src/utils/scoreCalculator.js';

const prisma = new PrismaClient();

/**
 * Seed database with 10 sample users and their activities
 * Designed to showcase ranking, statistics, and all app features
 */
async function main() {
  console.log('🌱 A iniciar seed da base de dados...');
  console.log('==========================================\n');

  // Limpar dados existentes
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.user.deleteMany();

  console.log('🗑️  Dados existentes removidos');

  // Criar password hash
  const password = await bcrypt.hash('password123', 12);

  // Definir os 10 utilizadores com dados realistas
  const usersData = [
    {
      email: 'carlos.silva@email.com',
      name: 'Carlos Silva',
      totalScore: 8540,
      level: 85,
      streak: 45,
      avatar: null
    },
    {
      email: 'maria.santos@email.com',
      name: 'Maria Santos',
      totalScore: 7230,
      level: 72,
      streak: 28,
      avatar: null
    },
    {
      email: 'pedro.ferreira@email.com',
      name: 'Pedro Ferreira',
      totalScore: 6120,
      level: 61,
      streak: 14,
      avatar: null
    },
    {
      email: 'ana.oliveira@email.com',
      name: 'Ana Oliveira',
      totalScore: 5890,
      level: 58,
      streak: 21,
      avatar: null
    },
    {
      email: 'ricardo.martins@email.com',
      name: 'Ricardo Martins',
      totalScore: 4560,
      level: 45,
      streak: 7,
      avatar: null
    },
    {
      email: 'catarina.coelho@email.com',
      name: 'Catarina Coelho',
      totalScore: 3890,
      level: 38,
      streak: 10,
      avatar: null
    },
    {
      email: 'jose.pereira@email.com',
      name: 'José Pereira',
      totalScore: 2940,
      level: 29,
      streak: 3,
      avatar: null
    },
    {
      email: 'sofia.costa@email.com',
      name: 'Sofia Costa',
      totalScore: 2180,
      level: 21,
      streak: 5,
      avatar: null
    },
    {
      email: 'andre.rodrigues@email.com',
      name: 'André Rodrigues',
      totalScore: 1450,
      level: 14,
      streak: 0,
      avatar: null
    },
    {
      email: 'ines.teixeira@email.com',
      name: 'Inês Teixeira',
      totalScore: 780,
      level: 7,
      streak: 2,
      avatar: null
    }
  ];

  // Criar os utilizadores
  const users = [];
  for (const userData of usersData) {
    const user = await prisma.user.create({
      data: {
        email: userData.email,
        password,
        name: userData.name,
        totalScore: userData.totalScore,
        level: userData.level,
        streak: userData.streak,
        avatar: userData.avatar,
        lastActiveAt: new Date()
      }
    });
    users.push(user);
  }

  console.log(`👤 Criados ${users.length} utilizadores`);
  console.log('----------------------------------------\n');

  // Definir atividades para cada utilizador
  // Carlos Silva (atleta muito ativo - 50 atividades)
  const carlosActivities = [
    { sportType: 'RUNNING', duration: 60, intensity: 'HIGH', date: new Date('2024-12-01'), location: 'Parque das Nações', distance: 12.5, notes: 'Treino matinal de ritmo' },
    { sportType: 'CYCLING', duration: 120, intensity: 'HIGH', date: new Date('2024-12-02'), location: 'Marginal', distance: 45.0, notes: 'Sessão de longa duração' },
    { sportType: 'HIIT', duration: 45, intensity: 'EXTREME', date: new Date('2024-12-03'), location: 'Ginasio Premium', notes: 'Treino intervals intenso' },
    { sportType: 'SWIMMING', duration: 60, intensity: 'HIGH', date: new Date('2024-12-04'), location: 'Piscina Olimpica', distance: 2.5, notes: 'Técnica e resistência' },
    { sportType: 'RUNNING', duration: 90, intensity: 'HIGH', date: new Date('2024-12-05'), location: 'Trilho da Serra', distance: 15.0, notes: 'Corrida de montanha' },
    { sportType: 'GYM', duration: 75, intensity: 'HIGH', date: new Date('2024-12-06'), location: 'Ginasio Premium', notes: 'Treino de força superior' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2024-12-07'), location: 'Campo Municipal', notes: 'Jogo semanal' },
    { sportType: 'YOGA', duration: 60, intensity: 'LOW', date: new Date('2024-12-08'), location: 'Estudio Yoga', notes: 'Recuperação e flexibilidade' },
    { sportType: 'RUNNING', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-09'), location: 'Parque Central', distance: 8.0, notes: 'Corrida leve' },
    { sportType: 'TENNIS', duration: 120, intensity: 'MODERATE', date: new Date('2024-12-10'), location: 'Clube Ténis', notes: 'Treino com professor' },
    { sportType: 'CYCLING', duration: 90, intensity: 'HIGH', date: new Date('2024-12-11'), location: 'Percurso Montanha', distance: 35.0, notes: 'Subidas e descidas' },
    { sportType: 'BOXING', duration: 60, intensity: 'HIGH', date: new Date('2024-12-12'), location: 'Boxing Academy', notes: 'Sparring e técnica' },
    { sportType: 'GYM', duration: 90, intensity: 'HIGH', date: new Date('2024-12-13'), location: 'Ginasio Premium', notes: 'Treino completo' },
    { sportType: 'SWIMMING', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-14'), location: 'Piscina Olimpica', distance: 1.8, notes: 'Treino técnico' },
    { sportType: 'HIIT', duration: 30, intensity: 'EXTREME', date: new Date('2024-12-15'), location: 'Casa', notes: 'Circuito rápido' },
    { sportType: 'RUNNING', duration: 60, intensity: 'HIGH', date: new Date('2024-12-16'), location: 'Parque das Nações', distance: 11.0, notes: 'Intervalos de ritmo' },
    { sportType: 'BASKETBALL', duration: 90, intensity: 'HIGH', date: new Date('2024-12-17'), location: 'Pavilhão Desportivo', notes: 'Jogo de equipa' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-18'), location: 'Ginasio Premium', notes: 'Treino de mobilidade' },
    { sportType: 'CYCLING', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-19'), location: 'Ciclovia', distance: 22.0, notes: 'Passeio deBike' },
    { sportType: 'RUNNING', duration: 30, intensity: 'LOW', date: new Date('2024-12-20'), location: 'Praia', distance: 4.5, notes: 'Corrida na areia' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2024-12-21'), location: 'Campo Municipal', notes: 'Jogo de Natal' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2024-12-22'), location: 'Estudio Yoga', notes: 'Yoga restaurativo' },
    { sportType: 'HIKING', duration: 180, intensity: 'MODERATE', date: new Date('2024-12-23'), location: 'Serra da Estrela', distance: 12.0, notes: 'Trilho de Natal' },
    { sportType: 'GYM', duration: 75, intensity: 'HIGH', date: new Date('2024-12-24'), location: 'Ginasio Premium', notes: 'Treino antes do Natal' },
    { sportType: 'SWIMMING', duration: 60, intensity: 'HIGH', date: new Date('2024-12-26'), location: 'Piscina Olimpica', distance: 2.5, notes: 'Pós-Natal intenso' },
    { sportType: 'RUNNING', duration: 45, intensity: 'HIGH', date: new Date('2024-12-27'), location: 'Parque Central', distance: 9.0, notes: 'Retorno aos treinos' },
    { sportType: 'HIIT', duration: 45, intensity: 'EXTREME', date: new Date('2024-12-28'), location: 'Ginasio Premium', notes: 'Ano novo a二人' },
    { sportType: 'CYCLING', duration: 90, intensity: 'HIGH', date: new Date('2024-12-29'), location: 'Percurso Costeiro', distance: 38.0, notes: 'Último treino do ano' },
    { sportType: 'RUNNING', duration: 60, intensity: 'HIGH', date: new Date('2024-12-30'), location: 'Parque das Nações', distance: 12.0, notes: 'Corrida de encerramento' },
    { sportType: 'GYM', duration: 90, intensity: 'HIGH', date: new Date('2024-12-31'), location: 'Ginasio Premium', notes: 'Treino de ano novo' },
    // Janeiro 2025
    { sportType: 'RUNNING', duration: 45, intensity: 'HIGH', date: new Date('2025-01-02'), location: 'Parque Central', distance: 8.5, notes: 'Primeiro treino do ano' },
    { sportType: 'SWIMMING', duration: 60, intensity: 'HIGH', date: new Date('2025-01-03'), location: 'Piscina Olimpica', distance: 2.5, notes: 'Natação técnica' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2025-01-04'), location: 'Campo Municipal', notes: 'Campeonato distrital' },
    { sportType: 'HIIT', duration: 30, intensity: 'EXTREME', date: new Date('2025-01-05'), location: 'Casa', notes: 'Circuito metabólico' },
    { sportType: 'CYCLING', duration: 120, intensity: 'HIGH', date: new Date('2025-01-06'), location: 'Trilho Montanha', distance: 42.0, notes: 'Longa duração' },
    { sportType: 'GYM', duration: 75, intensity: 'HIGH', date: new Date('2025-01-07'), location: 'Ginasio Premium', notes: 'Força e potência' },
    { sportType: 'TENNIS', duration: 90, intensity: 'MODERATE', date: new Date('2025-01-08'), location: 'Clube Ténis', notes: 'Treino técnico' },
    { sportType: 'RUNNING', duration: 60, intensity: 'HIGH', date: new Date('2025-01-09'), location: 'Trilho Florestal', distance: 11.0, notes: 'Corrida em trilho' },
    { sportType: 'BOXING', duration: 60, intensity: 'HIGH', date: new Date('2025-01-10'), location: 'Boxing Academy', notes: 'Treino de combate' },
    { sportType: 'BASKETBALL', duration: 60, intensity: 'MODERATE', date: new Date('2025-01-11'), location: 'Pavilhão', notes: 'Jogo amistoso' },
    { sportType: 'YOGA', duration: 60, intensity: 'LOW', date: new Date('2025-01-12'), location: 'Estudio Yoga', notes: 'Recuperação' },
    { sportType: 'SWIMMING', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-13'), location: 'Piscina Olimpica', distance: 1.8, notes: 'Treino leve' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2025-01-14'), location: 'Ginasio Premium', notes: 'Treino de manutenção' },
    { sportType: 'HIIT', duration: 45, intensity: 'HIGH', date: new Date('2025-01-15'), location: 'Ginasio Premium', notes: 'Circuito intensivo' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2025-01-16'), location: 'Praia', distance: 5.0, notes: 'Corrida na areia' },
    { sportType: 'CYCLING', duration: 75, intensity: 'MODERATE', date: new Date('2025-01-17'), location: 'Ciclovia', distance: 28.0, notes: 'Passeio cicloturismo' }
  ];

  // Maria Santos (atleta ativa - 40 atividades)
  const mariaActivities = [
    { sportType: 'RUNNING', duration: 45, intensity: 'HIGH', date: new Date('2024-12-01'), location: 'Parque Central', distance: 8.0, notes: 'Treino de ritmo' },
    { sportType: 'YOGA', duration: 60, intensity: 'LOW', date: new Date('2024-12-02'), location: 'Estudio Yoga', notes: 'Yoga vinyasa' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-03'), location: 'Fitness Club', notes: 'Treino funcional' },
    { sportType: 'CYCLING', duration: 90, intensity: 'MODERATE', date: new Date('2024-12-04'), location: 'Marginal', distance: 32.0, notes: 'Passeio deBike' },
    { sportType: 'SWIMMING', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-05'), location: 'Piscina Municipal', distance: 1.5, notes: 'Natação fitness' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2024-12-06'), location: 'Casa', notes: 'Circuito rápido' },
    { sportType: 'RUNNING', duration: 60, intensity: 'HIGH', date: new Date('2024-12-07'), location: 'Trilho da Serra', distance: 10.5, notes: 'Corrida de montanha' },
    { sportType: 'DANCING', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-08'), location: 'Estudio Dança', notes: 'Classe de Zumba' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-09'), location: 'Fitness Club', notes: 'Treino de core' },
    { sportType: 'WALKING', duration: 90, intensity: 'LOW', date: new Date('2024-12-10'), location: 'Jardim Botânico', distance: 6.0, notes: 'Passeio relaxante' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-11'), location: 'Parque Central', distance: 5.0, notes: 'Corrida leve' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2024-12-12'), location: 'Estudio Yoga', notes: 'Yoga restaurativo' },
    { sportType: 'CYCLING', duration: 75, intensity: 'MODERATE', date: new Date('2024-12-13'), location: 'Percurso Urbano', distance: 25.0, notes: 'Bike para o trabalho' },
    { sportType: 'SWIMMING', duration: 60, intensity: 'HIGH', date: new Date('2024-12-14'), location: 'Piscina Olimpica', distance: 2.2, notes: 'Treino de resistência' },
    { sportType: 'GYM', duration: 60, intensity: 'HIGH', date: new Date('2024-12-15'), location: 'Fitness Club', notes: 'Treino de força' },
    { sportType: 'HIIT', duration: 30, intensity: 'EXTREME', date: new Date('2024-12-16'), location: 'Ginasio', notes: 'Sessão intensa' },
    { sportType: 'RUNNING', duration: 45, intensity: 'HIGH', date: new Date('2024-12-17'), location: 'Parque das Nações', distance: 8.5, notes: 'Intervalos' },
    { sportType: 'DANCING', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-18'), location: 'Estudio Dança', notes: 'Dança contemporânea' },
    { sportType: 'TENNIS', duration: 90, intensity: 'MODERATE', date: new Date('2024-12-19'), location: 'Clube Ténis', notes: 'Jogo com amigas' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-20'), location: 'Fitness Club', notes: 'Treino de braços' },
    { sportType: 'WALKING', duration: 60, intensity: 'LOW', date: new Date('2024-12-21'), location: 'Zoo', distance: 4.0, notes: 'Passeio de natal' },
    { sportType: 'RUNNING', duration: 60, intensity: 'HIGH', date: new Date('2024-12-22'), location: 'Trilho Florestal', distance: 10.0, notes: 'Corrida de natal' },
    { sportType: 'YOGA', duration: 60, intensity: 'LOW', date: new Date('2024-12-23'), location: 'Casa', notes: 'Yoga de natal' },
    { sportType: 'CYCLING', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-24'), location: 'Ciclovia', distance: 15.0, notes: 'Passeio deBike' },
    { sportType: 'SWIMMING', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-26'), location: 'Piscina Municipal', distance: 1.6, notes: 'Natação pós-natal' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-27'), location: 'Fitness Club', notes: 'Treino completo' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2024-12-28'), location: 'Casa', notes: 'Ano novo, vida nova' },
    { sportType: 'RUNNING', duration: 45, intensity: 'HIGH', date: new Date('2024-12-29'), location: 'Parque Central', distance: 8.0, notes: 'Corrida de ano' },
    { sportType: 'DANCING', duration: 90, intensity: 'HIGH', date: new Date('2024-12-30'), location: 'Clube Noturno', notes: 'Festa de ano novo' },
    { sportType: 'YOGA', duration: 60, intensity: 'LOW', date: new Date('2024-12-31'), location: 'Casa', notes: 'Yoga de ano novo' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2025-01-02'), location: 'Praia', distance: 4.5, notes: 'Primeira corrida do ano' },
    { sportType: 'GYM', duration: 60, intensity: 'HIGH', date: new Date('2025-01-03'), location: 'Fitness Club', notes: 'Resoluções de fitness' },
    { sportType: 'CYCLING', duration: 60, intensity: 'MODERATE', date: new Date('2025-01-04'), location: 'Marginal', distance: 22.0, notes: 'Bike matinal' },
    { sportType: 'SWIMMING', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-05'), location: 'Piscina Olimpica', distance: 1.5, notes: 'Natação técnica' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2025-01-06'), location: 'Casa', notes: 'Circuito matinal' },
    { sportType: 'TENNIS', duration: 60, intensity: 'MODERATE', date: new Date('2025-01-07'), location: 'Clube Ténis', notes: 'Treino individual' },
    { sportType: 'RUNNING', duration: 45, intensity: 'HIGH', date: new Date('2025-01-08'), location: 'Parque das Nações', distance: 8.0, notes: 'Sessão de ritmo' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2025-01-09'), location: 'Estudio Yoga', notes: 'Yoga restaurativo' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-10'), location: 'Fitness Club', notes: 'Treino de pernas' }
  ];

  // Pedro Ferreira (moderadamente ativo - 30 atividades)
  const pedroActivities = [
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-01'), location: 'Ginasio Local', notes: 'Treino de peito' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-03'), location: 'Bairro', distance: 5.0, notes: 'Corrida matinal' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2024-12-05'), location: 'Campo Sintético', notes: 'Jogo semanal' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-07'), location: 'Ginasio Local', notes: 'Treino de costas' },
    { sportType: 'CYCLING', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-08'), location: 'Ciclovia', distance: 20.0, notes: 'Passeio de fim de semana' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-10'), location: 'Parque', distance: 4.5, notes: 'Corrida leve' },
    { sportType: 'GYM', duration: 60, intensity: 'HIGH', date: new Date('2024-12-12'), location: 'Ginasio Local', notes: 'Treino de pernas' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2024-12-14'), location: 'Casa', notes: 'Circuito cardio' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2024-12-15'), location: 'Campo Sintético', notes: 'Jogo de natal' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-17'), location: 'Ginasio Local', notes: 'Treino de ombros' },
    { sportType: 'SWIMMING', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-18'), location: 'Piscina', distance: 1.5, notes: 'Natação de recuperação' },
    { sportType: 'RUNNING', duration: 45, intensity: 'HIGH', date: new Date('2024-12-20'), location: 'Trilho', distance: 7.0, notes: 'Corrida de natal' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-22'), location: 'Ginasio Local', notes: 'Treino completo' },
    { sportType: 'CYCLING', duration: 45, intensity: 'LOW', date: new Date('2024-12-24'), location: 'Percurso Plano', distance: 12.0, notes: 'Passeio de natal' },
    { sportType: 'FOOTBALL', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-26'), location: 'Futsal', notes: 'Jogo festivo' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-28'), location: 'Ginasio Local', notes: 'Treino de braços' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-30'), location: 'Bairro', distance: 4.5, notes: 'Corrida de ano' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2025-01-02'), location: 'Casa', notes: 'Novo ano, novo eu' },
    { sportType: 'GYM', duration: 60, intensity: 'HIGH', date: new Date('2025-01-04'), location: 'Ginasio Local', notes: 'Ano novo treino' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2025-01-05'), location: 'Campo Sintético', notes: 'Retorno do campeonato' },
    { sportType: 'RUNNING', duration: 35, intensity: 'HIGH', date: new Date('2025-01-07'), location: 'Parque', distance: 5.5, notes: 'Corrida de ritmo' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-09'), location: 'Ginasio Local', notes: 'Treino de peito' },
    { sportType: 'CYCLING', duration: 60, intensity: 'MODERATE', date: new Date('2025-01-11'), location: 'Ciclovia', distance: 18.0, notes: 'Bike de fim de semana' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2025-01-12'), location: 'Casa', notes: 'Circuito rápido' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2025-01-13'), location: 'Campo Sintético', notes: 'Jogo importante' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2025-01-14'), location: 'Ginasio Local', notes: 'Treino de costas' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2025-01-15'), location: 'Bairro', distance: 4.5, notes: 'Corrida de manutenção' },
    { sportType: 'SWIMMING', duration: 30, intensity: 'LOW', date: new Date('2025-01-16'), location: 'Piscina', distance: 1.0, notes: 'Natação leve' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-17'), location: 'Ginasio Local', notes: 'Treino de pernas' }
  ];

  // Ana Oliveira (ativa consistente - 35 atividades)
  const anaActivities = [
    { sportType: 'RUNNING', duration: 40, intensity: 'HIGH', date: new Date('2024-12-01'), location: 'Parque Central', distance: 7.5, notes: 'Treino matinal' },
    { sportType: 'YOGA', duration: 60, intensity: 'LOW', date: new Date('2024-12-02'), location: 'Estudio', notes: 'Yoga power' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-03'), location: 'Studio Fitness', notes: 'Pilates' },
    { sportType: 'CYCLING', duration: 75, intensity: 'MODERATE', date: new Date('2024-12-04'), location: 'Percurso Rural', distance: 25.0, notes: 'Bike de descoberta' },
    { sportType: 'RUNNING', duration: 35, intensity: 'MODERATE', date: new Date('2024-12-05'), location: 'Litoral', distance: 6.0, notes: 'Corrida na areia' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2024-12-06'), location: 'Casa', notes: 'Circuito intenso' },
    { sportType: 'SWIMMING', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-07'), location: 'Piscina Aquecida', distance: 1.6, notes: 'Natação relaxante' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-08'), location: 'Studio Fitness', notes: 'Treino funcional' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2024-12-09'), location: 'Casa', notes: 'Yoga suave' },
    { sportType: 'RUNNING', duration: 45, intensity: 'HIGH', date: new Date('2024-12-10'), location: 'Trilho Urbano', distance: 8.0, notes: 'Sessão de ritmo' },
    { sportType: 'DANCING', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-11'), location: 'Academia Dança', notes: 'Ballet fitness' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-12'), location: 'Studio Fitness', notes: 'Core training' },
    { sportType: 'CYCLING', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-13'), location: 'Ciclovia', distance: 20.0, notes: 'Bike matinal' },
    { sportType: 'RUNNING', duration: 30, intensity: 'LOW', date: new Date('2024-12-14'), location: 'Jardim', distance: 4.5, notes: 'Corrida de recuperação' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2024-12-15'), location: 'Casa', notes: 'Tabata workout' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-16'), location: 'Studio Fitness', notes: 'Treino completo' },
    { sportType: 'SWIMMING', duration: 40, intensity: 'MODERATE', date: new Date('2024-12-17'), location: 'Piscina Aquecida', distance: 1.4, notes: 'Natação técnica' },
    { sportType: 'YOGA', duration: 60, intensity: 'LOW', date: new Date('2024-12-18'), location: 'Estudio', notes: 'Yoga restaurativo' },
    { sportType: 'RUNNING', duration: 40, intensity: 'HIGH', date: new Date('2024-12-19'), location: 'Parque Central', distance: 7.0, notes: 'Interval training' },
    { sportType: 'DANCING', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-20'), location: 'Academia Dança', notes: 'Dança do ventre' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-21'), location: 'Studio Fitness', notes: 'Treino de braços' },
    { sportType: 'CYCLING', duration: 90, intensity: 'MODERATE', date: new Date('2024-12-22'), location: 'Trilho Costeiro', distance: 30.0, notes: 'Bike de natal' },
    { sportType: 'RUNNING', duration: 35, intensity: 'MODERATE', date: new Date('2024-12-23'), location: 'Parque', distance: 5.5, notes: 'Corrida festiva' },
    { sportType: 'YOGA', duration: 60, intensity: 'LOW', date: new Date('2024-12-24'), location: 'Casa', notes: 'Yoga de natal' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-26'), location: 'Studio Fitness', notes: 'Treino de pernas' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2024-12-27'), location: 'Casa', notes: 'Circuito ano novo' },
    { sportType: 'RUNNING', duration: 45, intensity: 'HIGH', date: new Date('2024-12-28'), location: 'Trilho', distance: 7.5, notes: 'Primeira corrida do ano' },
    { sportType: 'SWIMMING', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-29'), location: 'Piscina', distance: 1.5, notes: 'Natação revitalizante' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-30'), location: 'Studio Fitness', notes: 'Treino completo' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2024-12-31'), location: 'Casa', notes: 'Yoga de ano novo' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2025-01-02'), location: 'Bairro', distance: 4.5, notes: 'Primeira do ano' },
    { sportType: 'CYCLING', duration: 60, intensity: 'MODERATE', date: new Date('2025-01-03'), location: 'Ciclovia', distance: 18.0, notes: 'Bike matinal' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2025-01-04'), location: 'Casa', notes: 'Resolução fitness' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-05'), location: 'Studio Fitness', notes: 'Treino de costas' }
  ];

  // Ricardo Martins (20 atividades)
  const ricardoActivities = [
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-02'), location: 'Ginasio', notes: 'Treino superior' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-05'), location: 'Bairro', distance: 5.0, notes: 'Corrida semanal' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-08'), location: 'Ginasio', notes: 'Treino inferior' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2024-12-10'), location: 'Campo', notes: 'Jogo com amigos' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-12'), location: 'Ginasio', notes: 'Treino completo' },
    { sportType: 'RUNNING', duration: 35, intensity: 'MODERATE', date: new Date('2024-12-15'), location: 'Parque', distance: 5.5, notes: 'Corrida de natal' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-18'), location: 'Ginasio', notes: 'Treino de peito' },
    { sportType: 'FOOTBALL', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-20'), location: 'Futsal', notes: 'Jogo festivo' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-22'), location: 'Ginasio', notes: 'Treino de costas' },
    { sportType: 'RUNNING', duration: 25, intensity: 'LOW', date: new Date('2024-12-25'), location: 'Casa', distance: 4.0, notes: 'Corrida natalina' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-27'), location: 'Ginasio', notes: 'Treino de braços' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2024-12-29'), location: 'Casa', notes: 'Ano novo fitness' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-31'), location: 'Ginasio', notes: 'Treino de ano novo' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2025-01-03'), location: 'Bairro', distance: 4.5, notes: 'Novo ano' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-05'), location: 'Ginasio', notes: 'Treino superior' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2025-01-07'), location: 'Campo', notes: 'Campeonato' },
    { sportType: 'GYM', duration: 60, intensity: 'MODERATE', date: new Date('2025-01-09'), location: 'Ginasio', notes: 'Treino completo' },
    { sportType: 'RUNNING', duration: 35, intensity: 'HIGH', date: new Date('2025-01-12'), location: 'Parque', distance: 5.5, notes: 'Corrida de ritmo' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-14'), location: 'Ginasio', notes: 'Treino de pernas' },
    { sportType: 'HIIT', duration: 25, intensity: 'HIGH', date: new Date('2025-01-16'), location: 'Casa', notes: 'Circuito rápido' }
  ];

  // Catarina Coelho (25 atividades)
  const catarinaActivities = [
    { sportType: 'RUNNING', duration: 35, intensity: 'MODERATE', date: new Date('2024-12-01'), location: 'Praia', distance: 5.5, notes: 'Corrida matinal' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2024-12-02'), location: 'Casa', notes: 'Yoga suave' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-04'), location: 'Fitness Studio', notes: 'Treino tonificação' },
    { sportType: 'CYCLING', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-05'), location: 'Percurso Plano', distance: 18.0, notes: 'Bike de lazer' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-07'), location: 'Parque', distance: 4.5, notes: 'Corrida leve' },
    { sportType: 'SWIMMING', duration: 40, intensity: 'MODERATE', date: new Date('2024-12-08'), location: 'Piscina', distance: 1.4, notes: 'Natação relax' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2024-12-10'), location: 'Casa', notes: 'Circuito cardio' },
    { sportType: 'YOGA', duration: 60, intensity: 'LOW', date: new Date('2024-12-12'), location: 'Estudio', notes: 'Yoga restaurativo' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-14'), location: 'Fitness Studio', notes: 'Treino de core' },
    { sportType: 'RUNNING', duration: 40, intensity: 'HIGH', date: new Date('2024-12-16'), location: 'Trilho', distance: 6.5, notes: 'Sessão de ritmo' },
    { sportType: 'CYCLING', duration: 45, intensity: 'LOW', date: new Date('2024-12-18'), location: 'Ciclovia', distance: 14.0, notes: 'Passeio de natal' },
    { sportType: 'WALKING', duration: 60, intensity: 'LOW', date: new Date('2024-12-20'), location: 'Centro Comercial', distance: 4.0, notes: 'Compras de natal' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2024-12-22'), location: 'Casa', notes: 'Yoga festivo' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-24'), location: 'Fitness Studio', notes: 'Treino de natal' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-26'), location: 'Praia', distance: 4.5, notes: 'Pós-natal' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2024-12-28'), location: 'Casa', notes: 'Ano novo HIIT' },
    { sportType: 'YOGA', duration: 60, intensity: 'LOW', date: new Date('2024-12-30'), location: 'Estudio', notes: 'Yoga de ano novo' },
    { sportType: 'RUNNING', duration: 35, intensity: 'MODERATE', date: new Date('2025-01-02'), location: 'Parque', distance: 5.0, notes: 'Primeira do ano' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-04'), location: 'Fitness Studio', notes: 'Treino completo' },
    { sportType: 'CYCLING', duration: 60, intensity: 'MODERATE', date: new Date('2025-01-06'), location: 'Marginal', distance: 20.0, notes: 'Bike matinal' },
    { sportType: 'SWIMMING', duration: 35, intensity: 'LOW', date: new Date('2025-01-08'), location: 'Piscina', distance: 1.2, notes: 'Natação leve' },
    { sportType: 'HIIT', duration: 30, intensity: 'HIGH', date: new Date('2025-01-10'), location: 'Casa', notes: 'Resolução fitness' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2025-01-12'), location: 'Casa', notes: 'Yoga restaurativo' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2025-01-14'), location: 'Bairro', distance: 4.5, notes: 'Corrida semanal' },
    { sportType: 'GYM', duration: 40, intensity: 'MODERATE', date: new Date('2025-01-16'), location: 'Fitness Studio', notes: 'Treino final' }
  ];

  // José Pereira (15 atividades)
  const joseActivities = [
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-03'), location: 'Ginasio', notes: 'Treino semanal' },
    { sportType: 'RUNNING', duration: 25, intensity: 'LOW', date: new Date('2024-12-06'), location: 'Bairro', distance: 4.0, notes: 'Corrida leve' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-10'), location: 'Ginasio', notes: 'Treino de peito' },
    { sportType: 'FOOTBALL', duration: 60, intensity: 'MODERATE', date: new Date('2024-12-14'), location: 'Campo', notes: 'Jogo de natal' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-17'), location: 'Ginasio', notes: 'Treino de costas' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-20'), location: 'Parque', distance: 4.5, notes: 'Corrida festiva' },
    { sportType: 'GYM', duration: 40, intensity: 'MODERATE', date: new Date('2024-12-23'), location: 'Ginasio', notes: 'Treino de natal' },
    { sportType: 'HIIT', duration: 25, intensity: 'HIGH', date: new Date('2024-12-27'), location: 'Casa', notes: 'Ano novo' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-30'), location: 'Ginasio', notes: 'Treino de ano' },
    { sportType: 'RUNNING', duration: 25, intensity: 'LOW', date: new Date('2025-01-03'), location: 'Bairro', distance: 4.0, notes: 'Novo ano' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-06'), location: 'Ginasio', notes: 'Retorno aos treinos' },
    { sportType: 'FOOTBALL', duration: 90, intensity: 'HIGH', date: new Date('2025-01-08'), location: 'Campo', notes: 'Campeonato' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-11'), location: 'Ginasio', notes: 'Treino completo' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2025-01-14'), location: 'Parque', distance: 4.5, notes: 'Corrida semanal' },
    { sportType: 'HIIT', duration: 25, intensity: 'HIGH', date: new Date('2025-01-17'), location: 'Casa', notes: 'Circuito final' }
  ];

  // Sofia Costa (18 atividades)
  const sofiaActivities = [
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-02'), location: 'Praia', distance: 4.5, notes: 'Corrida matinal' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2024-12-04'), location: 'Casa', notes: 'Yoga caseiro' },
    { sportType: 'GYM', duration: 40, intensity: 'MODERATE', date: new Date('2024-12-06'), location: 'Studio', notes: 'Treino leve' },
    { sportType: 'RUNNING', duration: 25, intensity: 'LOW', date: new Date('2024-12-09'), location: 'Parque', distance: 4.0, notes: 'Corrida relax' },
    { sportType: 'WALKING', duration: 45, intensity: 'LOW', date: new Date('2024-12-11'), location: 'Jardim', distance: 3.0, notes: 'Passeio' },
    { sportType: 'HIIT', duration: 25, intensity: 'HIGH', date: new Date('2024-12-13'), location: 'Casa', notes: 'Circuito rápido' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-15'), location: 'Praia', distance: 4.5, notes: 'Corrida de natal' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2024-12-17'), location: 'Casa', notes: 'Yoga festivo' },
    { sportType: 'GYM', duration: 35, intensity: 'LOW', date: new Date('2024-12-19'), location: 'Studio', notes: 'Treino natalino' },
    { sportType: 'RUNNING', duration: 25, intensity: 'LOW', date: new Date('2024-12-22'), location: 'Bairro', distance: 4.0, notes: 'Corrida pré-natal' },
    { sportType: 'HIIT', duration: 20, intensity: 'MODERATE', date: new Date('2024-12-25'), location: 'Casa', notes: 'Natal ativo' },
    { sportType: 'YOGA', duration: 40, intensity: 'LOW', date: new Date('2024-12-28'), location: 'Casa', notes: 'Yoga ano novo' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2024-12-30'), location: 'Parque', distance: 4.5, notes: 'Corrida de ano' },
    { sportType: 'GYM', duration: 40, intensity: 'MODERATE', date: new Date('2025-01-02'), location: 'Studio', notes: 'Primeiro treino' },
    { sportType: 'HIIT', duration: 25, intensity: 'HIGH', date: new Date('2025-01-05'), location: 'Casa', notes: 'Resolução' },
    { sportType: 'RUNNING', duration: 30, intensity: 'MODERATE', date: new Date('2025-01-08'), location: 'Praia', distance: 4.5, notes: 'Corrida semanal' },
    { sportType: 'YOGA', duration: 45, intensity: 'LOW', date: new Date('2025-01-12'), location: 'Casa', notes: 'Yoga relax' },
    { sportType: 'GYM', duration: 40, intensity: 'MODERATE', date: new Date('2025-01-15'), location: 'Studio', notes: 'Treino final' }
  ];

  // André Rodrigues (12 atividades)
  const andreActivities = [
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-05'), location: 'Ginasio', notes: 'Primeiro treino' },
    { sportType: 'RUNNING', duration: 20, intensity: 'LOW', date: new Date('2024-12-08'), location: 'Bairro', distance: 3.0, notes: 'Corrida inicial' },
    { sportType: 'GYM', duration: 40, intensity: 'MODERATE', date: new Date('2024-12-12'), location: 'Ginasio', notes: 'Segundo treino' },
    { sportType: 'HIIT', duration: 20, intensity: 'MODERATE', date: new Date('2024-12-15'), location: 'Casa', notes: 'Circuito basico' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2024-12-18'), location: 'Ginasio', notes: 'Treino de natal' },
    { sportType: 'RUNNING', duration: 25, intensity: 'MODERATE', date: new Date('2024-12-21'), location: 'Parque', distance: 3.5, notes: 'Corrida festiva' },
    { sportType: 'HIIT', duration: 20, intensity: 'HIGH', date: new Date('2024-12-24'), location: 'Casa', notes: 'Natal ativo' },
    { sportType: 'GYM', duration: 40, intensity: 'MODERATE', date: new Date('2024-12-27'), location: 'Ginasio', notes: 'Retorno' },
    { sportType: 'RUNNING', duration: 20, intensity: 'LOW', date: new Date('2024-12-30'), location: 'Bairro', distance: 3.0, notes: 'Ano novo' },
    { sportType: 'GYM', duration: 45, intensity: 'MODERATE', date: new Date('2025-01-03'), location: 'Ginasio', notes: 'Novo ano' },
    { sportType: 'HIIT', duration: 25, intensity: 'HIGH', date: new Date('2025-01-07'), location: 'Casa', notes: 'Resolução' },
    { sportType: 'RUNNING', duration: 25, intensity: 'MODERATE', date: new Date('2025-01-12'), location: 'Parque', distance: 3.5, notes: 'Corrida semanal' }
  ];

  // Inês Teixeira (8 atividades)
  const inesActivities = [
    { sportType: 'RUNNING', duration: 20, intensity: 'LOW', date: new Date('2024-12-10'), location: 'Parque', distance: 3.0, notes: 'Primeira corrida' },
    { sportType: 'WALKING', duration: 30, intensity: 'LOW', date: new Date('2024-12-14'), location: 'Shopping', distance: 2.0, notes: 'Compras ativas' },
    { sportType: 'RUNNING', duration: 25, intensity: 'LOW', date: new Date('2024-12-18'), location: 'Bairro', distance: 3.5, notes: 'Segunda corrida' },
    { sportType: 'HIIT', duration: 15, intensity: 'MODERATE', date: new Date('2024-12-22'), location: 'Casa', notes: 'Primeiro HIIT' },
    { sportType: 'RUNNING', duration: 20, intensity: 'LOW', date: new Date('2024-12-26'), location: 'Parque', distance: 3.0, notes: 'Pós-natal' },
    { sportType: 'WALKING', duration: 45, intensity: 'LOW', date: new Date('2024-12-29'), location: 'Feira', distance: 3.0, notes: 'Passeio ano novo' },
    { sportType: 'RUNNING', duration: 25, intensity: 'MODERATE', date: new Date('2025-01-04'), location: 'Bairro', distance: 3.5, notes: 'Novo ano' },
    { sportType: 'HIIT', duration: 20, intensity: 'MODERATE', date: new Date('2025-01-10'), location: 'Casa', notes: 'Resolução fitness' }
  ];

  // Criar atividades para cada utilizador
  const userActivities = [
    { user: users[0], activities: carlosActivities },
    { user: users[1], activities: mariaActivities },
    { user: users[2], activities: pedroActivities },
    { user: users[3], activities: anaActivities },
    { user: users[4], activities: ricardoActivities },
    { user: users[5], activities: catarinaActivities },
    { user: users[6], activities: joseActivities },
    { user: users[7], activities: sofiaActivities },
    { user: users[8], activities: andreActivities },
    { user: users[9], activities: inesActivities }
  ];

  let totalActivities = 0;
  for (const { user, activities } of userActivities) {
    for (const activity of activities) {
      const score = calculateScore({
        duration: activity.duration,
        intensity: activity.intensity,
        sportType: activity.sportType
      });

      await prisma.activity.create({
        data: {
          userId: user.id,
          sportType: activity.sportType,
          duration: activity.duration,
          intensity: activity.intensity,
          date: activity.date,
          location: activity.location,
          distance: activity.distance || null,
          notes: activity.notes || null,
          score
        }
      });
      totalActivities++;
    }
  }

  console.log(`🏃 Criadas ${totalActivities} atividades desportivas`);
  console.log('----------------------------------------\n');

  // Criar favoritos para alguns utilizadores
  console.log('⭐ A criar favoritos...');
  
  // Primeiro,收集 todas as atividades criadas para poder obter os IDs corretos
  const allActivities = [];
  for (const { user, activities } of userActivities) {
    const userActivitiesDb = await prisma.activity.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'asc' },
      select: { id: true, userId: true }
    });
    allActivities.push({ userId: user.id, activities: userActivitiesDb });
  }

  const favorites = [
    { userId: users[0].id, activityIdx: 0 },
    { userId: users[0].id, activityIdx: 5 },
    { userId: users[1].id, activityIdx: 2 },
    { userId: users[1].id, activityIdx: 10 },
    { userId: users[2].id, activityIdx: 1 },
    { userId: users[3].id, activityIdx: 0 },
    { userId: users[3].id, activityIdx: 8 },
    { userId: users[4].id, activityIdx: 0 },
    { userId: users[5].id, activityIdx: 3 },
    { userId: users[7].id, activityIdx: 1 }
  ];

  let totalFavorites = 0;
  for (const fav of favorites) {
    const userActs = allActivities.find(a => a.userId === fav.userId);
    if (userActs && userActs.activities[fav.activityIdx]) {
      await prisma.favorite.create({
        data: {
          userId: fav.userId,
          activityId: userActs.activities[fav.activityIdx].id
        }
      });
      totalFavorites++;
    }
  }

  console.log(`✅ Criados ${totalFavorites} favoritos\n`);

  // Criar notificações para os utilizadores
  console.log('🔔 A criar notificações...');
  const notifications = [
    {
      user: users[0],
      type: 'ACHIEVEMENT',
      message: '🎉 Parabéns! Alcançaste o nível 85!',
      isRead: false
    },
    {
      user: users[0],
      type: 'MILESTONE',
      message: '🏆 Completaste 50 atividades este mês!',
      isRead: false
    },
    {
      user: users[0],
      type: 'REMINDER',
      message: '💪 Não te esqueças do teu treino hoje!',
      isRead: true
    },
    {
      user: users[1],
      type: 'ACHIEVEMENT',
      message: '🎉 Parabéns! Alcançaste o nível 72!',
      isRead: false
    },
    {
      user: users[1],
      type: 'STREAK',
      message: '🔥 28 dias consecutivos! Continue assim!',
      isRead: false
    },
    {
      user: users[2],
      type: 'ACHIEVEMENT',
      message: '🎉 Parabéns! Alcançaste o nível 61!',
      isRead: true
    },
    {
      user: users[3],
      type: 'ACHIEVEMENT',
      message: '🎉 Parabéns! Alcançaste o nível 58!',
      isRead: false
    },
    {
      user: users[4],
      type: 'REMINDER',
      message: '💪 Tens um jogo de futebol amanhã!',
      isRead: true
    },
    {
      user: users[5],
      type: 'ACHIEVEMENT',
      message: '🎉 Parabéns! Alcançaste o nível 38!',
      isRead: false
    },
    {
      user: users[6],
      type: 'MILESTONE',
      message: '🏆 Completaste 15 atividades!',
      isRead: false
    },
    {
      user: users[7],
      type: 'REMINDER',
      message: '💪 A tua semana está a começar bem!',
      isRead: true
    },
    {
      user: users[8],
      type: 'ACHIEVEMENT',
      message: '🎉 Parabéns! Completaste a tua primeira semana!',
      isRead: false
    },
    {
      user: users[9],
      type: 'ENCOURAGEMENT',
      message: '🌟 Fantástico! Estás no caminho certo!',
      isRead: true
    }
  ];

  for (const notif of notifications) {
    await prisma.notification.create({
      data: {
        userId: notif.user.id,
        type: notif.type,
        message: notif.message,
        isRead: notif.isRead
      }
    });
  }

  console.log(`✅ Criadas ${notifications.length} notificações\n`);
  console.log('==========================================');
  console.log('✅ Seed da base de dados completado com sucesso!\n');
  console.log('📝 Contas de teste disponíveis:\n');
  console.log('   Email                  | Password      | Nome');
  console.log('   ---------------------- | ------------- | ------------------');
  console.log('   carlos.silva@email.com | password123   | Carlos Silva');
  console.log('   maria.santos@email.com | password123   | Maria Santos');
  console.log('   pedro.ferreira@email.com | password123   | Pedro Ferreira');
  console.log('   ana.oliveira@email.com | password123   | Ana Oliveira');
  console.log('   ricardo.martins@email.com | password123   | Ricardo Martins');
  console.log('   catarina.coelho@email.com | password123   | Catarina Coelho');
  console.log('   jose.pereira@email.com | password123   | José Pereira');
  console.log('   sofia.costa@email.com | password123   | Sofia Costa');
  console.log('   andre.rodrigues@email.com | password123   | André Rodrigues');
  console.log('   ines.teixeira@email.com | password123   | Inês Teixeira');
  console.log('\n📊 Resumo dos dados:\n');
  console.log(`   • ${users.length} utilizadores`);
  console.log(`   • ${totalActivities} atividades desportivas`);
  console.log(`   • ${totalFavorites} favoritos`);
  console.log(`   • ${notifications.length} notificações`);
  console.log('\n🌟 O ranking está ativo com todos os utilizadores!');
}

// Executar o seed
main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
