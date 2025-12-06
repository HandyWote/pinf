const app = getApp();

Page({
  data: {
    searchText: '',
    // 初始数据，将在从后端获取数据后更新
    videoGroups: [
      { id: 1, title: '宝宝喂养技巧', coverUrl: '/images/onlineClass/bbwy.jpg' },
      { id: 2, title: '婴儿常见疾病预防', coverUrl: '/images/onlineClass/jbyf.jpg' },
      { id: 3, title: '新生儿护理指南', coverUrl: '/images/onlineClass/hlzn.jpg' }
    ],
    // 文章数据改为一维数组
    articleGroups: [
      { id: 1, title: '0-3岁宝宝成长关键期', coverUrl: '/images/onlineClass/cjgjq.jpg' },
      { id: 2, title: '如何应对宝宝挑食问题', coverUrl: '/images/onlineClass/tswt.jpg' },
      { id: 3, title: '婴儿湿疹的护理方法', coverUrl: '/images/onlineClass/szhl.jpg' }
    ],
    loading: true
  },
  
  onLoad: function () {
    this.fetchPageData();
  },
  
  onShow: function() {
    // 每次显示页面时检查缓存是否需要更新
    this.checkAndUpdateCache();
  },

  fetchPageData: function () {
    // 先尝试从缓存获取
    const videoCacheKey = 'videoGroups';
    const articleCacheKey = 'articleGroups';
    
    const cachedVideos = wx.getStorageSync(videoCacheKey);
    const cachedArticles = wx.getStorageSync(articleCacheKey);
    
    if (cachedVideos && cachedArticles) {
      this.setData({
        videoGroups: this.getTopItems(cachedVideos, 3),
        articleGroups: this.getTopItems(cachedArticles, 3),
        loading: false
      });
    }
    
    // 检查网络状态
    if (!app.globalData.networkStatus) {
      if (!cachedVideos || !cachedArticles) {
        wx.showToast({
          title: '网络连接不可用，无法获取最新数据',
          icon: 'none'
        });
      }
      this.setData({ loading: false });
      return;
    }
    
    // 获取用户的 openid 和 token
    const openid = wx.getStorageSync('openid');
    const token = wx.getStorageSync('token');
    
    if (!openid || !token) {
      if (!cachedVideos || !cachedArticles) {
        wx.showToast({
          title: '用户未登录，无法获取最新数据',
          icon: 'none'
        });
      }
      this.setData({ loading: false });
      return;
    }
    
    // 引入API模块
    const { API } = require('../../utils/api.js');
    
    // 并行获取视频和文章数据
    Promise.all([
      API.content.getVideos({ page: 1, per_page: 10 }),
      API.content.getArticles({ page: 1, per_page: 10 })
    ])
      .then(([videosRes, articlesRes]) => {
        const allVideos = videosRes.videos || [];
        const allArticles = articlesRes.articles || [];
        
        // 获取前3个视频和文章
        const topVideos = this.getTopItems(allVideos, 3);
        const topArticles = this.getTopItems(allArticles, 3);
        
        // 检查数据是否有变化
        const videosChanged = JSON.stringify(this.data.videoGroups) !== JSON.stringify(topVideos);
        const articlesChanged = JSON.stringify(this.data.articleGroups) !== JSON.stringify(topArticles);
        
        if (videosChanged || articlesChanged) {
          // 更新缓存（存储所有数据）
          wx.setStorageSync(videoCacheKey, allVideos);
          wx.setStorageSync(articleCacheKey, allArticles);
          wx.setStorageSync(`${videoCacheKey}_time`, Date.now());
          wx.setStorageSync(`${articleCacheKey}_time`, Date.now());
          
          // 更新页面数据（只显示前3个）
          this.setData({
            videoGroups: topVideos,
            articleGroups: topArticles
          });
          
          // 添加到同步队列
          app.addToSyncQueue({
            type: 'onlineClassView',
            data: {
              timestamp: Date.now()
            },
            timestamp: Date.now()
          });
          
          // 尝试同步到服务器
          app.syncToServer();
        }
      })
      .catch(err => {
        console.error('请求在线科普数据失败:', err);
        // 如果请求失败但有缓存数据，使用缓存数据
        if (!cachedVideos || !cachedArticles) {
          wx.showToast({
            title: err.message || '获取数据失败',
            icon: 'none'
          });
        }
      })
      .finally(() => {
        this.setData({
          loading: false
        });
      });
  },
  
  // 获取数组中的前N个元素
  getTopItems: function(array, count) {
    if (!array || !Array.isArray(array)) {
      return [];
    }
    return array.slice(0, count);
  },
  
  // 检查并更新缓存
  checkAndUpdateCache: function () {
    const videoCacheKey = 'videoGroups';
    const articleCacheKey = 'articleGroups';
    
    const videoCacheTime = wx.getStorageSync(`${videoCacheKey}_time`) || 0;
    const articleCacheTime = wx.getStorageSync(`${articleCacheKey}_time`) || 0;
    
    const currentTime = Date.now();
    
    // 如果缓存超过1小时，则更新
    if ((currentTime - videoCacheTime > 3600000) || (currentTime - articleCacheTime > 3600000)) {
      this.fetchPageData();
    }
  },

  onSearchInput: function (e) {
    this.setData({
      searchText: e.detail.value
    });
  },

  clearSearch: function () {
    this.setData({
      searchText: ''
    });
  },
  
  // 搜索功能
  searchContent: function () {
    const searchText = this.data.searchText.trim();
    if (!searchText) {
      return;
    }
    
    this.setData({ loading: true });
    
    // 引入API模块
    const { API } = require('../../utils/api.js');
    
    // 使用搜索API
    API.content.searchContent({
      keyword: searchText,
      type: 'all', // 搜索所有类型的内容
      page: 1,
      per_page: 10
    })
      .then(res => {
        // 根据API文档，搜索接口返回videos和articles字段
        const videos = res.videos || [];
        const articles = res.articles || [];
        
        this.setData({
          videoGroups: this.getTopItems(videos, 3),
          articleGroups: this.getTopItems(articles, 3),
          loading: false
        });
      })
      .catch(err => {
        console.error('搜索请求失败:', err);
        wx.showToast({
          title: err.message || '搜索失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
  },

  navigateToVideoDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/videoDetail/videoDetail?id=${id}`
    });
  },

  navigateToArticleDetail: function (e) {
    const id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/pages/articleDetail/articleDetail?id=${id}`
    });
  }
})
