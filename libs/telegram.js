const superagent = require('superagent');
const Log = require('./logger');
const config = require('../config');

async function send(text) {
  try {
    const endPoint = `https://api.telegram.org/bot${config.telegramConfig.botToken}/sendMessage`;
    await superagent.get(endPoint).query({
      chat_id: config.telegramConfig.userId,
      text,
    }).send();
  } catch (e) {
    Log.error('telegram send error : ', e);
  }
}

exports.send = send;
