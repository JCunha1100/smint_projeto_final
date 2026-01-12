/**
 * Utilitários de Cálculo de Pontos e Gamificação
 * 
 * Handles todos os cálculos relacionados com o sistema de gamificação:
 * - Cálculo de score para atividades
 * - Estimativa de calorias
 * - Cálculo de níveis
 * - Sistema de conquistas
 */

import { config } from '../config/index.js';

/**
 * Calcular o score de uma atividade
 * 
 * Fórmula: Score = Pontos Base × (Duração/30) × Multiplicador de Intensidade
 * 
 * @param {Object} activityData - Dados da atividade
 * @param {number} activityData.duration - Duração em minutos
 * @param {string} activityData.intensity - Nível de intensidade
 * @param {string} activityData.sportType - Tipo de desporto
 * @returns {number} Score calculado (arredondado para inteiro)
 */
export function calculateScore({ duration, intensity, sportType }) {
  // Obter pontos base do desporto da configuração
  const basePoints = config.scoring.basePoints[sportType] || 50;
  // Obter multiplicador da intensidade da configuração
  const intensityMultiplier = config.scoring.intensityMultipliers[intensity] || 1.0;
  
  // Duração padrão para o cálculo
  const standardDuration = 30;
  const durationMultiplier = duration / standardDuration;
  
  // Calcular score: Pontos Base × (Duração/30) × Multiplicador de Intensidade
  const score = basePoints * durationMultiplier * intensityMultiplier;
  
  // Arredondar para inteiro
  return Math.round(score);
}

/**
 * Calcular calorias queimadas (estimativa)
 * 
 * Fórmula: Calorias = MET × peso (kg) × duração (horas)
 * Valores MET baseados no tipo de desporto e intensidade
 * 
 * @param {Object} activityData - Dados da atividade
 * @returns {number} Calorias estimadas queimadas
 */
export function calculateCalories({ sportType, intensity, duration, weight = 70 }) {
  // Valores MET (Metabolic Equivalent of Task) por desporto e intensidade
  const metValues = {
    RUNNING: { LOW: 6.0, MODERATE: 8.0, HIGH: 11.5, EXTREME: 14.0 },
    CYCLING: { LOW: 4.0, MODERATE: 6.0, HIGH: 8.0, EXTREME: 10.0 },
    GYM: { LOW: 3.0, MODERATE: 5.0, HIGH: 7.0, EXTREME: 9.0 },
    FOOTBALL: { LOW: 5.0, MODERATE: 7.0, HIGH: 9.0, EXTREME: 11.0 },
    SWIMMING: { LOW: 5.0, MODERATE: 7.0, HIGH: 9.0, EXTREME: 12.0 },
    YOGA: { LOW: 2.0, MODERATE: 3.0, HIGH: 4.0, EXTREME: 5.0 },
    HIIT: { LOW: 6.0, MODERATE: 10.0, HIGH: 14.0, EXTREME: 18.0 },
    WALKING: { LOW: 2.5, MODERATE: 3.5, HIGH: 4.5, EXTREME: 5.5 },
    TENNIS: { LOW: 4.0, MODERATE: 6.0, HIGH: 8.0, EXTREME: 10.0 },
    BASKETBALL: { LOW: 4.0, MODERATE: 6.0, HIGH: 8.0, EXTREME: 10.0 },
    HIKING: { LOW: 4.0, MODERATE: 6.0, HIGH: 8.0, EXTREME: 10.0 },
    DANCING: { LOW: 3.0, MODERATE: 5.0, HIGH: 7.0, EXTREME: 9.0 },
    BOXING: { LOW: 5.0, MODERATE: 8.0, HIGH: 11.0, EXTREME: 14.0 },
    OTHER: { LOW: 3.0, MODERATE: 5.0, HIGH: 7.0, EXTREME: 9.0 }
  };
  
  // Obter MET para a atividade
  const met = metValues[sportType]?.[intensity] || 5.0;
  // Converter duração para horas
  const durationHours = duration / 60;
  
  // Calorias = MET × peso (kg) × duração (horas)
  const calories = met * weight * durationHours;
  
  return Math.round(calories);
}

/**
 * Calcular nível baseado no score total
 * 
 * O nível aumenta exponencialmente à medida que o score cresce
 * Cada nível requer mais pontos que o anterior
 * 
 * @param {number} totalScore - Score total do utilizador
 * @returns {Object} Info do nível atual
 *   - level: nível atual
 *   - currentExp: experiência ganha no nível atual
 *   - expForNextLevel: experiência necessária para o próximo nível
 *   - progress: percentagem de progresso para o próximo nível
 */
export function calculateLevel(totalScore) {
  // Configuração de progressão de níveis
  const baseExp = 100;        // Experiência base para nível 1
  const expMultiplier = 1.5;  // Multiplicador exponencial
  
  let currentLevel = 1;
  let expForCurrentLevel = 0;
  let expForNextLevel = baseExp;
  let totalExpRequired = 0;
  
  // Calcular nível atual
  while (totalExpRequired + expForNextLevel <= totalScore) {
    totalExpRequired += expForNextLevel;
    currentLevel++;
    expForNextLevel = Math.round(baseExp * Math.pow(expMultiplier, currentLevel - 1));
  }
  
  const currentLevelExp = totalScore - totalExpRequired;
  const progress = Math.round((currentLevelExp / expForNextLevel) * 100);
  
  return {
    level: currentLevel,
    currentExp: currentLevelExp,
    expForNextLevel,
    progress: Math.min(progress, 100)
  };
}

/**
 * Obter conquistas baseadas no histórico de atividades
 * 
 * Conquistas incluem:
 * - Número total de atividades (milestones)
 * - Sequências (streaks) de dias consecutivos
 * - Conquistas específicas por tipo de desporto
 * 
 * @param {Array} activities - Array de atividades do utilizador
 * @returns {Array} Lista de conquistas desbloqueadas
 */
export function getAchievements(activities) {
  const achievements = [];
  const totalActivities = activities.length;
  
  // Conquistas por número de atividades
  if (totalActivities >= 1) achievements.push({ id: 'first_workout', name: 'Primeiros Passos', description: 'Complete o seu primeiro treino' });
  if (totalActivities >= 10) achievements.push({ id: 'getting_started', name: 'Começou', description: 'Complete 10 treinos' });
  if (totalActivities >= 50) achievements.push({ id: 'dedicated', name: 'Atleta Dedicado', description: 'Complete 50 treinos' });
  if (totalActivities >= 100) achievements.push({ id: 'century', name: 'Clube dos 100', description: 'Complete 100 treinos' });
  if (totalActivities >= 365) achievements.push({ id: 'daily_athlete', name: 'Atleta Diário', description: 'Complete 365 treinos' });
  
  // Conquistas de sequência (streak)
  const today = new Date();
  // Extrair datas únicas das atividades
  const activityDates = [...new Set(activities.map(a => new Date(a.date).toDateString()))];
  let maxStreak = 0;
  let currentStreak = 0;
  
  // Calcular sequência atual
  activityDates.sort((a, b) => new Date(b) - new Date(a));
  for (let i = 0; i < activityDates.length; i++) {
    const date = new Date(activityDates[i]);
    const prevDate = new Date(today);
    prevDate.setDate(today.getDate() - i);
    
    if (date.toDateString() === prevDate.toDateString()) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      break;
    }
  }
  
  if (currentStreak >= 3) achievements.push({ id: 'streak_3', name: 'Em Fogo', description: 'Sequência de 3 dias' });
  if (currentStreak >= 7) achievements.push({ id: 'streak_7', name: 'Guerreiro Semanal', description: 'Sequência de 7 dias' });
  if (currentStreak >= 30) achievements.push({ id: 'streak_30', name: 'Mestre Mensal', description: 'Sequência de 30 dias' });
  
  // Conquistas específicas por tipo de desporto (10+ sessões)
  const sportCounts = activities.reduce((acc, a) => {
    acc[a.sportType] = (acc[a.sportType] || 0) + 1;
    return acc;
  }, {});
  
  Object.entries(sportCounts).forEach(([sport, count]) => {
    if (count >= 10) achievements.push({ id: `${sport.toLowerCase()}_expert`, name: `Especialista de ${sport}`, description: `Complete 10 sessões de ${sport.toLowerCase()}` });
  });
  
  return achievements;
}
