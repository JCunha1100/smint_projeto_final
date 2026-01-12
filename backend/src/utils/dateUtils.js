/**
 * Utilitários de Data
 * 
 * Handles todas as operações relacionadas com datas:
 * - Formatação de datas
 * - Cálculo de períodos (semana, mês, ano)
 * - Agrupamento de atividades por período
 */

/**
 * Formatar data para string ISO sem componente de tempo
 * @param {Date} date - Data a formatar
 * @returns {string} String de data (YYYY-MM-DD)
 */
export function formatDateOnly(date) {
  return new Date(date).toISOString().split('T')[0];
}

/**
 * Obter início da semana para uma data
 * @param {Date} date - Data de referência
 * @param {number} weekStartDay - Dia de início da semana (0=Domingo, 1=Segunda)
 * @returns {Date} Início da semana
 */
export function getStartOfWeek(date = new Date(), weekStartDay = 1) {
  const d = new Date(date);
  const day = d.getDay();
  // Calcular diferença para o dia de início da semana
  const diff = d.getDate() - day + (day === 0 ? -6 : 0) - (day < weekStartDay ? 7 : 0) + weekStartDay;
  return new Date(d.setDate(diff));
}

/**
 * Obter fim da semana para uma data
 * @param {Date} date - Data de referência
 * @param {number} weekStartDay - Dia de início da semana
 * @returns {Date} Fim da semana
 */
export function getEndOfWeek(date = new Date(), weekStartDay = 1) {
  const start = getStartOfWeek(date, weekStartDay);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return end;
}

/**
 * Obter início do mês para uma data
 * @param {Date} date - Data de referência
 * @returns {Date} Início do mês
 */
export function getStartOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

/**
 * Obter fim do mês para uma data
 * @param {Date} date - Data de referência
 * @returns {Date} Fim do mês
 */
export function getEndOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

/**
 * Obter início do ano para uma data
 * @param {Date} date - Data de referência
 * @returns {Date} Início do ano
 */
export function getStartOfYear(date = new Date()) {
  return new Date(date.getFullYear(), 0, 1);
}

/**
 * Obter intervalo de datas para períodos comuns
 * @param {string} period - 'today', 'week', 'month', 'year'
 * @returns {Object} Objeto com startDate e endDate
 */
export function getDateRange(period) {
  const now = new Date();
  
  switch (period) {
    case 'today':
      return {
        startDate: new Date(now.setHours(0, 0, 0, 0)),
        endDate: new Date(now.setHours(23, 59, 59, 999))
      };
    case 'week':
      return {
        startDate: getStartOfWeek(now),
        endDate: getEndOfWeek(now)
      };
    case 'month':
      return {
        startDate: getStartOfMonth(now),
        endDate: getEndOfMonth(now)
      };
    case 'year':
      return {
        startDate: getStartOfYear(now),
        endDate: new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999)
      };
    default:
      return {
        startDate: null,
        endDate: null
      };
  }
}

/**
 * Formatar duração de minutos para string legível
 * @param {number} minutes - Duração em minutos
 * @returns {string} String formatada (ex: "1h 30m" ou "45 min")
 */
export function formatDuration(minutes) {
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (mins === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${mins}m`;
}

/**
 * Calcular dias entre duas datas
 * @param {Date} date1 - Primeira data
 * @param {Date} date2 - Segunda data
 * @returns {number} Número de dias entre as datas
 */
export function daysBetween(date1, date2) {
  const oneDay = 24 * 60 * 60 * 1000;
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  return Math.round(Math.abs((d1 - d2) / oneDay));
}

/**
 * Verificar se uma data está dentro dos últimos N dias
 * @param {Date} date - Data a verificar
 * @param {number} days - Número de dias
 * @returns {boolean} True se estiver dentro do intervalo
 */
export function isWithinDays(date, days) {
  const targetDate = new Date(date);
  const now = new Date();
  const diffDays = Math.floor((now - targetDate) / (1000 * 60 * 60 * 24));
  return diffDays >= 0 && diffDays <= days;
}

/**
 * Agrupar atividades por período de tempo
 * @param {Array} activities - Array de atividades
 * @param {string} period - 'day', 'week', 'month'
 * @returns {Object} Atividades agrupadas por período
 */
export function groupByPeriod(activities, period = 'month') {
  return activities.reduce((groups, activity) => {
    const date = new Date(activity.date);
    let key;
    
    switch (period) {
      case 'day':
        key = formatDateOnly(date);
        break;
      case 'week':
        const weekStart = getStartOfWeek(date);
        key = formatDateOnly(weekStart);
        break;
      case 'month':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        break;
      default:
        key = formatDateOnly(date);
    }
    
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(activity);
    
    return groups;
  }, {});
}

/**
 * Obter últimos N períodos como array
 * @param {string} period - 'day', 'week', 'month'
 * @param {number} count - Número de períodos a retornar
 * @returns {Array} Array de chaves de período
 */
export function getLastPeriods(period, count = 12) {
  const periods = [];
  const now = new Date();
  
  for (let i = count - 1; i >= 0; i--) {
    let date = new Date(now);
    
    switch (period) {
      case 'day':
        date.setDate(date.getDate() - i);
        periods.push(formatDateOnly(date));
        break;
      case 'week':
        date = getStartOfWeek(date);
        date.setDate(date.getDate() - (i * 7));
        periods.push(formatDateOnly(date));
        break;
      case 'month':
        date.setMonth(date.getMonth() - i);
        periods.push(`${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`);
        break;
    }
  }
  
  return periods;
}
