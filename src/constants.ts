export const DEFAULT_CHALLENGE_ID = 'nossa-meta-20k';
export const DEFAULT_GOAL = 20000;
export const TOTAL_NUMBERS = 200;

/**
 * Retorna o valor em reais correspondente a cada número do desafio.
 * Nota especial da regra do desafio:
 * A soma aritmética de 1 até 200 resulta em R$ 20.100.
 * Para que a meta total feche em exatamente R$ 20.000, o número 200 tem valor
 * ajustado de R$ 100 (desconto de R$ 100), totalizando precisamente R$ 20.000.
 */
export function getNumberAmount(num: number): number {
  if (num === 200) {
    return 100;
  }
  return num;
}

export function isAdjustedNumber(num: number): boolean {
  return num === 200;
}

export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return dateStr;
    const date = new Date(Number(year), Number(month) - 1, Number(day));
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return dateStr;
  }
}

export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const MOTIVATIONAL_MESSAGES = [
  { minPercent: 0, maxPercent: 10, message: "Cada depósito nos aproxima do nosso sonho. Um passo de cada vez!" },
  { minPercent: 10, maxPercent: 25, message: "O começo é a parte mais importante. Estamos construindo algo incrível juntos!" },
  { minPercent: 25, maxPercent: 50, message: "Já passamos de 1/4 do caminho! Nossa disciplina está fazendo a diferença." },
  { minPercent: 50, maxPercent: 75, message: "Passamos da metade! Nosso objetivo de R$ 20.000 está cada dia mais real." },
  { minPercent: 75, maxPercent: 90, message: "Reta final! A nossa parceria e cumplicidade nos trouxeram até aqui." },
  { minPercent: 90, maxPercent: 99.9, message: "Falta muito pouco! Estamos prestes a conquistar a nossa grande meta juntos." },
  { minPercent: 100, maxPercent: 100, message: "Parabéns, casal! Meta de R$ 20.000 conquistada com muito amor e esforço!" },
];

export function getMotivationalMessage(percent: number): string {
  const found = MOTIVATIONAL_MESSAGES.find(
    (item) => percent >= item.minPercent && percent <= item.maxPercent
  );
  return found?.message || "Cada depósito nos aproxima do nosso sonho.";
}
