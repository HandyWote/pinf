const app = getApp();

Page({
  data: {
    id: null,
    articleInfo: null,
    loading: true,
    error: false
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        id: options.id
      });
      this.fetchArticleDetail(options.id);
    } else {
      this.setData({
        error: true,
        loading: false
      });
      wx.showToast({
        title: '文章ID无效',
        icon: 'none'
      });
    }
  },

  onShow: function () {
    // 每次显示页面时检查缓存是否需要更新
    if (this.data.id) {
      this.checkAndUpdateCache(this.data.id);
    }
  },

  // 获取文章详情
  fetchArticleDetail: function (id) {
    // 引入API模块
    const { API } = require('../../utils/api.js');
    
    // 先尝试从缓存获取
    const cacheKey = `article_detail_${id}`;
    const cachedData = wx.getStorageSync(cacheKey);
    
    if (cachedData) {
      this.setData({
        articleInfo: cachedData,
        loading: false
      });
    }
    
    // 无论是否有缓存，都从服务器获取最新数据
    API.content.getArticleDetail(id)
      .then(res => {
        const articleData = res.article;
        
        // 更新缓存
        wx.setStorageSync(cacheKey, articleData);
        
        this.setData({
          articleInfo: articleData,
          loading: false
        });
      })
      .catch(err => {
        console.error('获取文章详情失败:', err);
        wx.showToast({
          title: err.message || '获取文章详情失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
  },

  // 检查并更新缓存
  checkAndUpdateCache: function (id) {
    const cacheKey = `article_detail_${id}`;
    const cachedData = wx.getStorageSync(cacheKey);
    const cacheTime = wx.getStorageSync(`${cacheKey}_time`) || 0;
    const currentTime = Date.now();
    
    // 如果缓存超过1小时或没有缓存，则更新
    if (!cachedData || (currentTime - cacheTime > 3600000)) {
      this.fetchArticleDetail(id);
    }
  }
})