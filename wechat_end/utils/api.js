// API配置文件
const API_CONFIG = {
  // 基础配置
  BASE_URL: 'https://backend.pinf.top',
  BASE_PATH: '/api',
  TIMEOUT: 10000,

  // 获取完整的API URL
  getApiUrl(endpoint) {
    return `${this.BASE_URL}${this.BASE_PATH}${endpoint}`;
  },

  // 获取请求头
  getHeaders(includeAuth = true) {
    const headers = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = wx.getStorageSync('token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }
};

// API请求封装函数
const apiRequest = {
  // 通用请求方法
  request(options) {

    return new Promise((resolve, reject) => {
      const {
        url,
        method = 'GET',
        data = {},
        needAuth = true,
        showLoading = false,
        loadingText = '请求中...'
      } = options;

      if (showLoading) {
        wx.showLoading({ title: loadingText });
      }
      // 在apiRequest.request方法中添加
      console.log('请求URL:', API_CONFIG.getApiUrl(url));
      console.log('请求方法:', method);
      console.log('请求数据:', JSON.stringify(data));
      console.log('请求头:', API_CONFIG.getHeaders(needAuth));
      wx.request({
        url: API_CONFIG.getApiUrl(url),
        method,
        data,
        header: API_CONFIG.getHeaders(needAuth),
        timeout: API_CONFIG.TIMEOUT,
        success: (res) => {
          if (showLoading) {
            wx.hideLoading();
          }

          if (res.statusCode === 200) {
            if (res.data.success) {
              resolve(res.data);
            } else {
              console.error('后端业务错误:', res.data);
              reject(new Error(res.data.message || '请求失败'));
            }
          } else if (res.statusCode === 401) {
            // Token过期或无效，清除本地存储并跳转到登录
            wx.removeStorageSync('token');
            wx.removeStorageSync('openid');
            wx.removeStorageSync('session_key');
            wx.reLaunch({
              url: '/pages/index/index'
            });
            reject(new Error('登录已过期，请重新登录'));
          } else {
            // 新增：打印后端返回的详细错误信息
            console.error('后端返回错误:', res.statusCode, res.data);
            reject(new Error(`请求失败，状态码：${res.statusCode}`));
          }
        },
        fail: (err) => {
          if (showLoading) {
            wx.hideLoading();
          }
          // 新增：打印请求失败的详细信息
          console.error('API请求失败:', err.message || err);
          reject(new Error('网络请求失败，请检查网络连接'));
        }
      });
    });
  },

  // GET请求
  get(url, data = {}, options = {}) {
    // GET请求应该将参数放在URL中，而不是body中
    const queryString = Object.keys(data).length > 0 ?
      '?' + Object.keys(data).map(key => `${encodeURIComponent(key)}=${encodeURIComponent(data[key])}`).join('&') : '';

    return this.request({
      url: url + queryString,
      method: 'GET',
      data: {}, // GET请求不应该有body
      ...options
    });
  },

  // POST请求
  post(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'POST',
      data,
      ...options
    });
  },

  // PUT请求
  put(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'PUT',
      data,
      ...options
    });
  },

  // DELETE请求
  delete(url, data = {}, options = {}) {
    return this.request({
      url,
      method: 'DELETE',
      data,
      ...options
    });
  }
};

// 具体的API接口封装
const API = {
  // 用户认证模块
  auth: {
    // 微信登录
    login(code) {
      return apiRequest.post('/login', { code }, { needAuth: false, showLoading: true, loadingText: '登录中...' });
    },

    // 测试登录
    testLogin(openid) {
      return apiRequest.post('/test-login', { openid }, { needAuth: false });
    }
  },

  // 儿童管理模块
  child: {
    // 获取儿童信息
    getChildInfo() {
      return apiRequest.get('/getChildInfo');
    },

    // 添加儿童信息
    addChild(childData) {
      return apiRequest.post('/addChild', childData, { showLoading: true, loadingText: '添加中...' });
    },

    // 添加生长记录
    addGrowthRecord(recordData) {
      return apiRequest.post('/addGrowthRecord', recordData, { showLoading: true, loadingText: '保存中...' });
    }
  },

  // 内容管理模块
  content: {
    // 获取视频列表
    getVideos(params = {}) {
      return apiRequest.get('/getVideos', params);
    },

    // 获取视频详情
    getVideoDetail(videoId) {
      return apiRequest.get(`/getVideoDetail/${videoId}`);
    },

    // 获取文章列表
    getArticles(params = {}) {
      return apiRequest.get('/getArticles', params);
    },

    // 获取文章详情
    getArticleDetail(articleId) {
      return apiRequest.get(`/getArticleDetail/${articleId}`);
    },

    // 搜索内容
    searchContent(params) {
      return apiRequest.get('/searchContent', params);
    }
  },

  // 预约管理模块
  appointment: {
    // 获取预约列表
    getAppointments(params = {}) {
      return apiRequest.get('/getAppointments', params, { showLoading: true, loadingText: '同步预约信息...' });
    },

    // 添加预约
    addAppointment(appointmentData) {
      return apiRequest.post('/addAppointment', appointmentData, { showLoading: true, loadingText: '创建预约中...' });
    }
  },

  // 聊天管理模块
  chat: {
    // 发送消息
    sendMessage(messageData) {
      return apiRequest.post('/sendMessage', messageData);
    },

    // 获取聊天历史
    // getChatHistory(params = {}) {
    //   return apiRequest.get('/getChatHistory', params);
    // },

    // 清空聊天历史
    clearChatHistory() {
      return apiRequest.delete('/clearChatHistory');
    }
  },

  // 健康检查
  health() {
    return apiRequest.get('/health', {}, { needAuth: false });
  }
};

module.exports = {
  API_CONFIG,
  apiRequest,
  API
};
