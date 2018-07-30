const superagent = require('superagent');
const lodash = require('lodash');
const fs = require('fs');

const logger = require('../libs/logger');

const db = require('../libs/db');
const schedule = require('../libs/schedule');
const Crawler = require('../libs/crawler');
const telegram = require('../libs/telegram');
const models = require('../models');
const siteConfig = require('../config/site.config');

async function getJSON() {
  const posts = await models.article.post.find({siteName: 'CBS', status: 'completed'}).limit(100)
  .select('title description author pubDate category keywords contentText siteName link');

  try {
    const result = [];

    console.log('size : ', posts.length);

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      result.push(post.toObject());
    }

    fs.writeFile('./Reuters100.json', JSON.stringify(result), 'utf8', () => {
      console.log('finish');
    });
  } catch (err) {
    logger.error(err);
  }
}

db.connect(async () => {
  await getJSON();
});