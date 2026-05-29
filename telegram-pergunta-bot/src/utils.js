'use strict';

// Heuristica simples para detectar se um texto e uma pergunta.
function isQuestion(text = '') {
  const t = String(text).trim().toLowerCase();
  if (!t) return false;
  if (t.includes('?')) return true;

  // Palavras interrogativas comuns em portugues (com e sem acento).
  const starters = [
    'o que', 'oque', 'qual', 'quais', 'quando', 'onde', 'aonde', 'como',
    'porque', 'por que', 'pq', 'quem', 'quanto', 'quanta', 'quantos',
    'quantas', 'sera', 'sera que', 'poderia', 'pode', 'voce pode',
    'consegue', 'tem como', 'da pra', 'da para', 'me ajuda',
  ];
  return starters.some((w) => t === w || t.startsWith(w + ' '));
}

// Controla cooldown por chat (em memoria). cada "namespace" tem seu mapa.
class Cooldown {
  constructor(hours) {
    this.ms = Math.max(0, Number(hours) || 0) * 60 * 60 * 1000;
    this.last = new Map();
  }

  // true se ja pode agir (passou o cooldown desde a ultima vez).
  ready(key) {
    const now = Date.now();
    const prev = this.last.get(key) || 0;
    return now - prev >= this.ms;
  }

  mark(key) {
    this.last.set(key, Date.now());
  }
}

module.exports = { isQuestion, Cooldown };
