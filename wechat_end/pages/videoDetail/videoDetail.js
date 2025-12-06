const app = getApp();

Page({
  data: {
    id: null,
    videoInfo: null,
    loading: true,
    error: false
  },

  onLoad: function (options) {
    if (options.id) {
      this.setData({
        id: options.id
      });
      this.fetchVideoDetail(options.id);
    } else {
      this.setData({
        error: true,
        loading: false
      });
      wx.showToast({
        title: '视频ID无效',
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

  // 获取视频详情
  fetchVideoDetail: function (id) {
    // 引入API模块
    const { API } = require('../../utils/api.js');
    
    // 先尝试从缓存获取
    const cacheKey = `video_detail_${id}`;
    const cachedData = wx.getStorageSync(cacheKey);
    
    if (cachedData) {
      this.setData({
        videoInfo: cachedData,
        loading: false
      });
    }
    
    // 无论是否有缓存，都从服务器获取最新数据
    API.content.getVideoDetail(id)
      .then(res => {
        const videoData = res.video;
        
        // 更新缓存
        wx.setStorageSync(cacheKey, videoData);
        
        this.setData({
          videoInfo: videoData,
          loading: false
        });
      })
      .catch(err => {
        console.error('获取视频详情失败:', err);
        wx.showToast({
          title: err.message || '获取视频详情失败',
          icon: 'none'
        });
        this.setData({ loading: false });
      });
  },

  // 检查并更新缓存
  checkAndUpdateCache: function (id) {
    const cacheKey = `video_detail_${id}`;
    const cachedData = wx.getStorageSync(cacheKey);
    const cacheTime = wx.getStorageSync(`${cacheKey}_time`) || 0;
    const currentTime = Date.now();
    
    // 如果缓存超过1小时或没有缓存，则更新
    if (!cachedData || (currentTime - cacheTime > 3600000)) {
      this.fetchVideoDetail(id);
    }
  },

  // 视频播放错误处理
  videoErrorCallback: function (e) {
    console.error('视频播放错误:', e.detail.errMsg);
    wx.showToast({
      title: '视频播放失败，请稍后重试',
      icon: 'none'
    });
  }
})