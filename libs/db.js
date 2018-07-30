// binding mongoose module
const mongoose = require('mongoose');

const config = require('../config');
const logger = require('./logger');

const dbConfig = config.dbConfig;

// exports connect function to app.js
exports.connect = (callback) => {
  // get the database connection pool
  mongoose.connect(`mongodb://${dbConfig.host}:${dbConfig.port}/${dbConfig.dbname}`, {
    user: dbConfig.user,
    pass: dbConfig.pass,
    useNewUrlParser: true,
  }).then(() => {
    callback();
  }, (err) => {
    logger.error('[mongodb] connection err :', err);
  });
  
  // Use native promises
  mongoose.Promise = require('bluebird');
  
  // DB Connection Events
  // Succeed to connect database
  mongoose.connection.on('connected', () => {
    logger.info('[mongodb] succeed to get connection pool');
  });
  
  // Failed to connect database
  mongoose.connection.on('error', (err) => {
    logger.error('Failed to get connection in mongoose, err is ', err);
  });
  
  // When the connection has disconnected
  mongoose.connection.on('disconnected', () => {
    logger.info('Database connection has disconnected.');
  });
  
  // If the Node.js process is going down, close database connection pool
  process.on('SIGINT', () => {
    mongoose.connection.close(() => {
      logger.info('Application process is going down, disconnect database connection...');
      process.exit(0);
    });
  });
};
