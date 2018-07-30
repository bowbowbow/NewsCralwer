const superagent = require('superagent');
const moment = require('moment');

const logger = require('../libs/logger');
const Crawler = require('../libs/crawler');

const db = require('../libs/db');
const schedule = require('../libs/schedule');
const models = require('../models');
const siteConfig = require('../config/site.config');

async function getReuterLink(siteName) {
  let cursor = await models.article.cursor.findOne({
    siteName,
  });
  
  let date = null;
  if (cursor) date = cursor.after;
  else date = moment().subtract(1, 'days').format('YYYY-MM-DD');
  
  const crawler = new Crawler();
  const url = `https://uk.reuters.com/resources/archive/uk/${date.split('-').join('')}.html`;
  const $ = await crawler.getDocument(url);
  
  const elist = $('.primaryContent .module .headlineMed a');
  const links = [];
  elist.each((key, value) => {
    links.push(value.attribs.href);
  });
  
  let insertCnt = 0;
  for (let i = 0; i < links.length; i++) {
    console.log(`getArticleList progress ${i + 1}/${links.length}`);
    const link = links[i];
    const articlePost = await models.article.post.findOne({ link });
    if (articlePost) {
      logger.info('There is a post with the same ID.');
      continue;
    }
    if (link.indexOf('/video') >= 0) {
      logger.info('This link is video article');
      continue;
    }
    
    insertCnt++;
    await models.article.post.create({
      link,
      siteName,
    });
  }
  
  await models.article.cursor.update({
      siteName,
    }, {
      siteName,
      after: moment(date).subtract(1, 'days').format('YYYY-MM-DD'),
    },
    {
      upsert: true,
    },
  );
  logger.info(`getReuterLink(${siteName}) is finished, insertCnt: ${insertCnt}`);
}

db.connect(async () => {
  schedule.register({
    hour: '*',
    minute: '*/30',
  }, async () => {
    await getReuterLink(siteConfig.siteName.Reuters);
  });
  
  // await getReuterLink(siteConfig.siteName.Reuters);
});