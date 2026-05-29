'use strict';

require('dotenv').config();

function bool(value, fallback = false) {
  if (value === undefined || value === null || value === '') return fallback;
  return ['1', 'true', 'yes', 'sim', 'on'].includes(String(value).trim().toLowerCase());
}

function num(value, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

const config = {
  ownerName: process.env.OWNER_NAME || 'eu',

  awayNotice: {
    enabled: bool(process.env.ENABLE_AWAY_NOTICE, true),
    skipOnWeekend: bool(process.env.SKIP_AWAY_ON_WEEKEND, true),
    cooldownHours: num(process.env.AWAY_COOLDOWN_HOURS, 12),
  },
};

module.exports = config;
