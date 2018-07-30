const siteConfig = {
  siteName: {
    CNN: 'CNN',
    BCC: 'bbcnews',
    Reuters: 'Reuters',
    CBS: 'CBSNews',
  },
  CNN: {
    name: 'CNN',
    pageId: 'CNN',
    getContent$: ($) => {
      const siteName = $('meta[property="og:site_name"]').attr('content');
      if (siteName === 'CNNMoney') {
        $('.storytimestamp').remove();
        return $('#storycontent');
      } else if (siteName === 'CNN Travel') {
        $('.RelatedArticle__component').remove();
        return $('.Article__body');
      }
      return $('#body-text > div.l-container');
    },
  },
  bbcnews: {
    name: 'bbcnews',
    pageId: 'bbcnews',
    getContent$: ($) => {
      $('.image-and-copyright-container').remove();
      return $('.story-body__inner');
    },
  },
  Reuters: {
    name: 'Reuters',
    pageId: 'Reuters',
    getContent$: ($) => {
      if ($('body').find('.body_1gnLA').length) {
        $('.body_1gnLA div').remove();
        return $('.body_1gnLA');
      } else {
        if (!$('.StandardArticleBody_body').find('p').length) {
          return null;
        }
        $('.StandardArticleBody_body div').remove();
        return $('.StandardArticleBody_body');
      }
    },
  },
  CBSNews: {
    name: 'CBSNews',
    pageId: 'CBSNews',
    getContent$: ($) => {
      return $('.entry');
    },
  },
};

module.exports = siteConfig;
