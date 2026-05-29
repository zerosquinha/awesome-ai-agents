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

  forward: {
    enabled: bool(process.env.ENABLE_FORWARD_QUESTIONS, true),
    toEmail: process.env.FORWARD_TO_EMAIL || 'ze.rosquinha3@gmail.com',
    onlyWhenMentionedInGroups: bool(process.env.FORWARD_ONLY_WHEN_MENTIONED_IN_GROUPS, true),
    cooldownHours: num(process.env.FORWARD_COOLDOWN_HOURS, 1),
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: num(process.env.SMTP_PORT, 465),
    secure: bool(process.env.SMTP_SECURE, true),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || process.env.SMTP_USER || '',
  },
};

module.exports = config;
