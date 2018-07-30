const superagent = require('superagent');
const cheerio = require('cheerio');
const _ = require('lodash');
const urlHandler = require('url');
const iconv = require('iconv-lite');
const rp = require('request-promise');

const logger = require('../libs/logger');
const telegram = require('../libs/telegram');

const escapeJSON = function(json) {
  const escapable = /[\\\"\x00-\x1f\x7f-\x9f\u00ad\u0600-\u0604\u070f\u17b4\u17b5\u200c-\u200f\u2028-\u202f\u2060-\u206f\ufeff\ufff0-\uffff]/g;
  const meta = {    // table of character substitutions
    '\b': '\\b',
    '\t': '\\t',
    '\n': '\\n',
    '\f': '\\f',
    '\r': '\\r',
    '"' : '\\"',
    '\\': '\\\\'
  };

  escapable.lastIndex = 0;
  return escapable.test(json) ? '"' + json.replace(escapable, function (a) {
    const c = meta[a];
    return (typeof c === 'string') ? c
        : '\\u' + ('0000' + a.charCodeAt(0).toString(16)).slice(-4);
  }) + '"' : '"' + json + '"';
};

class Crawler {
  constructor(site) {
    this.site = site;
    this.ldJSON = {};
  }

  getDocument(url) {
    return new Promise((resolve, reject) => {
      rp({
        method: "GET",
        uri: encodeURI(url),
        headers: {
          'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_11_6) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.96 Safari/537.36',
          'Referer': 'https://facebook.com',
        },
        encoding: null,
      })
      .then((body) => {
        try {
          const str = new Buffer(body);
          let html = iconv.decode(str, 'utf-8').toString();
          if (html.search(`euc-kr`) > 0) {
            html = iconv.decode(str, 'EUC-KR').toString();
          }
          const $ = cheerio.load(html);
          this.$ = $;

          const ldJSONText = $('script[type="application/ld+json"]').html();
          this.ldJSON = JSON.parse(escapeJSON(ldJSONText));
          resolve($);
        } catch (err) {
          logger.error(err);
          reject(err);
        }
      })
      .catch((err) => {
        telegram.send(`Crawler 에러 발생: ${err.message}`);
        logger.error(err);
        reject(err);
      })
    });
  }

  getTitle() {
    let title = this.$('meta[property="og:title"]').attr('content');
    if (!title) this.$('meta[property="twitter:title"]').attr('content');
    if (!title) title = this.$('title').text();
    return _.trim(title);
  }

  getDescription() {
    let description = this.$('meta[property="og:description"]').attr('content');
    if (!description) description = this.$('meta[property="twitter:description"]').attr('content');
    if (!description) description = this.$('description').text();
    return _.trim(description);
  }

  getPubDate() {
    let pubDate = this.$('meta[property="og:pubdate"]').attr('content');
    if (!pubDate) pubDate = this.$('meta[name="pubDate"]').attr('content');
    if (!pubDate) pubDate = this.$('meta[property="article:published_time"]').attr('content');
    if (!pubDate && this.ldJSON && this.ldJSON['datePublished']) pubDate = this.ldJSON['datePublished'];
    if (!pubDate) pubDate = '';
    return _.trim(pubDate);
  }

  getAuthor() {
    let author = this.$('meta[name="author"]').attr('content');
    if (!author) author = this.$('meta[property="article:author"]').attr('content');
    if (!author) author = this.$('meta[property="author"]').attr('content');
    if (!author) author = this.$('meta[name="Author"]').attr('content');
    if (!author) author = '';
    return _.trim(author);
  }

  getCategory() {
    let category = this.$('meta[name="section"]').attr('content');
    if (!category) category = this.$('meta[property="article:section"]').attr('content');
    if (!category && this.ldJSON && this.ldJSON['articleSection']) category = this.ldJSON['articleSection'];
    if (!category) category = '';
    return _.trim(category);
  }

  getKeywords() {
    let keywords = this.$('meta[name="keywords"]').attr('content');
    if (!keywords) keywords = '';
    return _.trim(keywords);
  }

  getTrimmedHtml(selector) {
    this.$(`${selector} style`).remove();
    this.$(`${selector} noscript`).remove();
    this.$(`${selector} script`).remove();

    this.$(`${selector} *`).each((key, val) => {
      const attr = val.attribs;
      const newAttr = {};
      if (val.type === 'tag') {
        if (val.name === 'a') {
          newAttr.href = attr.href;
        } else if (val.name === 'img') {
          newAttr.src = attr.src;
        } else if (val.name === 'iframe') {
          newAttr.src = attr.src;
          newAttr.class = 'no-margin';
        }
      }
      val.attribs = newAttr;
    });
    return this.$(selector).html();
  }

  getData() {
    const content$ = this.site.getContent$(this.$);

    return {
      title: this.getTitle(),
      author: this.getAuthor(),
      description: this.getDescription(),
      pubDate: this.getPubDate(),
      category: this.getCategory(),
      keywords: this.getKeywords(),
      contentHtml: content$.html(),
      contentText: content$.text(),
    }
  }
}

// Module Exports...
module.exports = Crawler;
