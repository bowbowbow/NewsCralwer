const superagent = require('superagent');

const logger = require('../libs/logger');

const db = require('../libs/db');
const schedule = require('../libs/schedule');
const models = require('../models');
const siteConfig = require('../config/site.config');

async function getArticleList(siteName) {
  let cursor = await models.article.cursor.findOne({
    siteName,
  });
  
  const site = siteConfig[siteName];
  let url = `https://graph.facebook.com/v3.0/${site.pageId}/feed?limit=100&access_token=${site.accessToken}&fields=link,message`;
  if (cursor) url += `&after=${cursor.after}`;
  
  const rsp = await superagent.get(url)
  .ok(res => res.status < 500);
  
  if (rsp.status !== 200) {
    logger.error(rsp.text);
    return;
  }
  
  const body = JSON.parse(rsp.text);
  // logger.info(JSON.stringify(data, null, 4));
  
  let insertCnt = 0;
  for (let i = 0; i < body.data.length; i++) {
    const post = body.data[i];
    
    const message = post.message;
    const link = post.link;
    const id = post.id;
    
    // to exclude facebook video link
    if (!link || link.indexOf('facebook') >= 0) continue;
    
    const articlePost = await models.article.post.findOne({ link });
    if (articlePost) {
      logger.info('There is a post with the same ID.');
      continue;
    }
    
    insertCnt++;
    console.log('link :', link);
    await models.article.post.create({
      link,
      facebook: {
        id,
        message,
      },
      siteName,
    });
  }
  console.log('body :', body);
  const after = body['paging']['cursors']['after'];
  
  await models.article.cursor.update({
    siteName,
  }, {
    siteName,
    after,
  }, {
    upsert: true,
  });
  
  logger.info(`getArticleList(${siteName}) is finished, insertCnt: ${insertCnt}`);
}

db.connect(async () => {
  schedule.register({
    hour: '*',
    minute: '*/2',
  }, async () => {
    await getArticleList('CNN');
    await getArticleList('bbcnews');
    await getArticleList('Reuters');
    await getArticleList('CBSNews');
  });
});