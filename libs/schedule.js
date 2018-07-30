const schedule = require('node-schedule');

function register(time, callback) {
  const hour = time.hour ? time.hour : '*';
  const minute = time.minute ? time.minute : '*';
  const second = time.second ? time.second : '*';
  schedule.scheduleJob(`${second} ${minute} ${hour} * * *`, callback);
};

exports.register = register;