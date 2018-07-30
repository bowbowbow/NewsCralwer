const Crawler = require('./libs/crawler');
const logger = require('./libs/logger');
const siteConfig = require('./config/site.config');

async function main() {
  console.log('main is running');

  const site = siteConfig['Reuters'];
  const crawler = new Crawler(site);
  const $ = await crawler.getDocument('http://UK.reuters.com/article/emerging-markets-latam/emerging-markets-latam-currencies-up-as-rising-china-shares-foster-risk-appetite-idUKL1N1U90XV');
  // 컨텐츠가 없을 땐 null을 리턴하기 때문에
  if (!site.getContent$($)) {
    console.log('There is no contents.');
    return;
  }
  logger.info(JSON.stringify(crawler.getData(), null, 4));
  
  console.log('main is finished');
}

main().then();