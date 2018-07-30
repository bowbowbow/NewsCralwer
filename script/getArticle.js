const superagent = require('superagent');
const lodash = require('lodash');

const logger = require('../libs/logger');

const db = require('../libs/db');
const schedule = require('../libs/schedule');
const Crawler = require('../libs/crawler');
const telegram = require('../libs/telegram');
const models = require('../models');
const siteConfig = require('../config/site.config');

async function getArticle(siteName) {
  const post = await models.article.post.findOne({
    siteName,
    status: 'wait',
  });
  try {
    if (!post) {
      telegram.send(`${siteName}에서 크롤링할 포스팅이 없습니다.`);
      return;
    }
    post.status = 'locked';
    await post.save();

    const site = siteConfig[siteName];
    const crawler = new Crawler(site);
    const $ = await crawler.getDocument(post.link);

    // 컨텐츠가 없을 땐 null을 리턴하기 때문에
    if (!site.getContent$($)) {
      console.log('There is no contents.');
      return;
    }

    const data = crawler.getData();

    if (!data.contentHtml || !data.contentText) {
      telegram.send(
          `getArticle 크롤링 실패, content가 비었습니다. 셀렉터 점검이 필요합니다. siteName:${siteName}, link:${post.link}`);
      return;
    }

    await models.article.post.update({
      _id: post._id,
    }, {
      ...data,
      status: 'completed',
    });

    logger.info(`getArticle(${siteName}) is finished(${post.link})`);
  } catch (err) {
    logger.error(err);
    telegram.send(
        `getArticle 크롤링 실패, throw 에러 발생. siteName:${siteName}, link:${post.link}, error:${err.message}`);
  }
}

async function getArticleBatch(siteName) {
  const batchSize = 100000;
  for (let i = 0; i < batchSize; i++) {
    console.log(`progress ${i + 1}/${batchSize}`);
    await getArticle(siteName);
  }
}

db.connect(async () => {
  // schedule.register({
  //   hour: '*',
  //   minute: '*',
  //   second: '*/10',
  // }, async () => {
  //   await getArticle(siteConfig.siteName.Reuters);
  // });

  await getArticleBatch(siteConfig.siteName.Reuters);
});