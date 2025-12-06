// app.js
App({
  onLaunch() {
    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 初始化网络状态监听
    this.listenNetworkStatus();

    // 从本地存储加载待同步数据
    this.globalData.pendingSyncData = wx.getStorageSync('pendingSyncData') || [];
    this.globalData.lastSyncTime = wx.getStorageSync('lastSyncTime') || 0;

    // 使用自定义登录函数
    this.login().then(res => {
      console.log('登录成功', res);
      // 获取儿童信息 (登录成功时已经获取并保存了)
      // this.getChildInfo(); // 登录函数中已处理，此处不再需要
      // 检查是否有小孩信息，决定启动页面
      this.checkChildInfoAndNavigate();
      // 尝试同步数据
      this.syncToServer();
    }).catch(err => {
      console.error('登录失败', err);
      // 即使登录失败，也检查导航
      this.checkChildInfoAndNavigate();
    });
  },

  // 检查是否有小孩信息并导航到相应页面
  checkChildInfoAndNavigate() {
    // 从 globalData 获取 childInfo，因为登录成功后会更新 globalData
    const childInfo = this.globalData.childInfo || [];

    // 获取当前页面路径
    const pages = getCurrentPages()
    const currentPage = pages.length > 0 ? pages[pages.length - 1].route : ''

    // 如果已有小孩信息，直接导航到home页面
    if (childInfo.length > 0) {
      // 避免重复导航到home页面
      if (currentPage !== 'pages/home/home') {
        wx.switchTab({
          url: '/pages/home/home'
        })
      }
    } else {
      // 如果没有小孩信息，导航到index页面
      if (currentPage !== 'pages/index/index') {
        wx.reLaunch({
          url: '/pages/index/index'
        })
      }
    }
  },

  // 用户登录函数
  syncAppointments() {
    const { API } = require('./utils/api.js');
    return API.appointment.getAppointments()
      .then(res => {
        console.log('后端返回的预约数据', res); // 打印后端返回内容
        if (res && Array.isArray(res)) {
          wx.setStorageSync('appointmentInfo', res);
          this.globalData.appointmentInfo = res;
          console.log('存储到本地的预约数据', wx.getStorageSync('appointmentInfo'));
        } else if (res && res.appointments && Array.isArray(res.appointments)) {
          wx.setStorageSync('appointmentInfo', res.appointments);
          this.globalData.appointmentInfo = res.appointments;
          console.log('存储到本地的预约数据', wx.getStorageSync('appointmentInfo'));
        }
      })
      .catch(err => {
        console.error('同步预约信息失败:', err);
      });
  },

  // 修改login函数，在登录成功后同步预约信息
  login() {
    return new Promise((resolve, reject) => {
      // 引入API模块
      const { API } = require('./utils/api.js');

      // 调用微信登录接口获取临时登录凭证code
      wx.login({
        success: loginRes => {
          if (loginRes.code) {
            // 使用统一的API接口进行登录
            API.auth.login(loginRes.code)
              .then(res => {
                // 登录成功，保存用户信息
                this.globalData.userInfo = res.userinfo;
                this.globalData.role = res.role;

                // 保存openid和session_key到本地存储
                if (res.openid) {
                  wx.setStorageSync('openid', res.openid);
                }

                if (res.session_key) {
                  wx.setStorageSync('session_key', res.session_key);
                }

                // 保存childInfo到本地存储并更新全局变量
                // 确保从后端获取的 childInfo 包含 growthRecords 字段
                const childInfo = res.childinfo || [];
                wx.setStorageSync('childInfo', childInfo);
                this.globalData.childInfo = childInfo; // 更新全局变量

                // 保存token到本地存储（如果有）
                if (res.token) {
                  wx.setStorageSync('token', res.token);
                }

                // 根据是否有childInfo决定导航
                // this.checkChildInfoAndNavigate(); // 在then/catch中调用

                resolve({
                  userInfo: res.userinfo,
                  childInfo: childInfo
                });
              })
              .catch(err => {
                console.error('登录请求失败:', err);
                reject(err);
              });
          } else {
            wx.hideLoading();
            reject(new Error('获取用户登录态失败：' + loginRes.errMsg));
          }
        },
        fail: (err) => {
          wx.hideLoading();
          console.error('微信登录失败:', err);
          reject(new Error('微信登录失败，请重试'));
        }
      });
    });
  },
  // 获取儿童信息
  getChildInfo() {
    // 直接从 globalData 获取，globalData 在登录时或 saveChildInfo 时已更新
    // 如果 globalData.childInfo 为 null，则尝试从本地缓存获取
    let childInfo = this.globalData.childInfo;

    if (!childInfo) {
      childInfo = wx.getStorageSync('childInfo') || [];
      this.globalData.childInfo = childInfo; // 更新 globalData
    }

    // 注意：这里的 getChildInfo 主要用于在其他页面获取当前 childInfo
    // 首次加载和同步逻辑主要在 login 和 syncToServer 中处理

    return childInfo;
  },

  // 保存儿童信息（本地优先，然后尝试同步到服务器）
  saveChildInfo(childInfo) {
    // 保存到本地缓存
    wx.setStorageSync('childInfo', childInfo);
    // 更新全局变量
    this.globalData.childInfo = childInfo;

    // 添加到待同步队列
    // 这里直接将完整的 childInfo 结构添加到队列
    this.addToSyncQueue({
      type: 'childInfo',
      data: childInfo, // 包含 growthRecords 的完整 childInfo 数组
      timestamp: Date.now()
    });

    // 尝试同步到服务器
    this.syncToServer();

    return childInfo;
  },

  // 添加到同步队列
  addToSyncQueue(item) {
    console.log('[addToSyncQueue] 加入队列:', item);
    // 获取当前队列
    let queue = this.globalData.pendingSyncData || [];

    // 添加新项目
    queue.push(item);

    // 更新全局变量
    this.globalData.pendingSyncData = queue;

    // 保存到本地存储
    wx.setStorageSync('pendingSyncData', queue);
  },

  // 同步数据到服务器
  syncToServer() {
    // 如果已经在同步中或没有网络连接，则退出
    if (this.globalData.isDataSyncing || !this.globalData.networkStatus) {
      return;
    }

    // 获取待同步队列
    let queue = this.globalData.pendingSyncData || [];
    // 过滤掉过期或无效的预约同步项
    queue = queue.filter(item => {
      if (item.type === 'appointmentInfo' && item.data && item.data.appointmentDate) {
        const now = new Date();
        const date = new Date(item.data.appointmentDate);
        // 只同步未来的预约
        return date > now;
      }
      return true;
    });
    if (queue.length === 0) {
      return;
    }

    // 设置同步状态
    this.globalData.isDataSyncing = true;

    // 获取用户的 token
    const token = wx.getStorageSync('token');
    if (!token) {
      this.globalData.isDataSyncing = false;
      return;
    }

    // 引入API模块
    const { API } = require('./utils/api.js');

    // 处理队列中的每个项目
    const syncPromises = [];

    queue.forEach(item => {
      switch (item.type) {
        case 'childInfo':
          // 使用现有的儿童信息相关API
          if (item.data && Array.isArray(item.data)) {
            item.data.forEach(child => {
              if (child.id) {
                // 如果有生长记录，逐个添加
                if (child.growthRecords && child.growthRecords.length > 0) {
                  child.growthRecords.forEach(record => {
                    syncPromises.push(
                      API.child.addGrowthRecord({
                        childId: child.id,
                        date: record.date,
                        ageInMonths: record.ageInMonths,
                        ageInWeeks: record.ageInWeeks,
                        height: record.height,
                        weight: record.weight,
                        headCircumference: record.headCircumference
                      })
                    );
                  });
                }
              } else {
                // 新增儿童
                syncPromises.push(
                  API.child.addChild({
                    name: child.name,
                    birthDate: child.birthDate,
                    gender: child.gender,
                    gestationalAge: child.gestationalAge
                  })
                );
              }
            });
          }
          break;

        case 'appointmentInfo':
          // 使用预约API
          if (item.data && item.childId) {
            // 确保childId是数字类型
            const childId = parseInt(item.childId);
            if (isNaN(childId)) {
              console.error('childId不是有效的数字:', item.childId);
              break;
            }

            // 验证必需字段
            if (!item.data.hospitalName || !item.data.department || !item.data.appointmentDate) {
              console.error('预约信息缺少必需字段:', item.data);
              break;
            }

            syncPromises.push(
              API.appointment.addAppointment({
                childId: childId,
                hospitalName: item.data.hospitalName,
                department: item.data.department,
                appointmentDate: item.data.appointmentDate,
                reminderDays: parseInt(item.data.reminderDays) || 1,
                notes: item.data.notes || ''
              })
            );
          }
          break;

        case 'chatHistory':
          // 聊天历史通过sendMessage API已经自动同步，这里可以跳过
          // 或者可以实现批量同步逻辑
          break;

        case 'deleteAppointmentInfo':
          // 如果后端有删除预约的API，在这里调用
          // 目前API文档中没有删除接口，可能需要后端添加
          break;

        case 'onlineClassView':
          // 浏览记录可能不需要同步到服务器，或者可以忽略
          break;
      }
    });

    // 执行所有同步操作
    Promise.allSettled(syncPromises)
      .then(results => {
        // 检查结果，只移除成功同步的项目
        const successfulIndices = [];
        results.forEach((result, index) => {
          if (result.status === 'fulfilled') {
            successfulIndices.push(index);
          } else {
            console.error('同步失败:', result.reason);
          }
        });

        // 移除成功同步的项目
        if (successfulIndices.length > 0) {
          const newQueue = queue.filter((item, index) => !successfulIndices.includes(index));
          this.globalData.pendingSyncData = newQueue;
          wx.setStorageSync('pendingSyncData', newQueue);

          // 更新最后同步时间
          this.globalData.lastSyncTime = Date.now();
          wx.setStorageSync('lastSyncTime', this.globalData.lastSyncTime);

          console.log('数据同步完成，成功:', successfulIndices.length, '失败:', results.length - successfulIndices.length);
        }
      })
      .catch(err => {
        console.error('同步过程出错:', err);
      })
      .finally(() => {
        // 重置同步状态
        this.globalData.isDataSyncing = false;
      });
  },
  // 监听网络状态变化
  listenNetworkStatus() {
    wx.onNetworkStatusChange((res) => {
      this.globalData.networkStatus = res.isConnected;

      // 如果网络恢复，尝试同步数据
      if (res.isConnected) {
        this.syncToServer();
      }
    });
  },


  // 获取复诊信息
  getAppointmentInfo(childId) {
    // 先尝试从 globalData 获取
    let appointmentInfo = this.globalData.appointmentInfo ? this.globalData.appointmentInfo[childId] : null;

    // 如果 globalData 中没有，再尝试从本地缓存获取
    if (!appointmentInfo) {
      const storageKey = `appointment_${childId}`;
      appointmentInfo = wx.getStorageSync(storageKey) || null;
      // 如果从本地缓存获取到了，更新 globalData
      if (appointmentInfo) {
        if (!this.globalData.appointmentInfo) {
          this.globalData.appointmentInfo = {};
        }
        this.globalData.appointmentInfo[childId] = appointmentInfo;
      }
    }


    // 如果本地和 globalData 都没有，且网络可用，则从服务器获取
    if (!appointmentInfo && this.globalData.networkStatus) {
      // 获取用户的 openid
      const openid = wx.getStorageSync('openid');
      const token = wx.getStorageSync('token'); // 获取 token
      if (openid && token) {
        // 显示加载提示
        wx.showLoading({
          title: '获取复诊信息...',
        });

        // 引入API模块
        const { API } = require('./utils/api.js');

        // 从服务器获取预约信息
        API.appointment.getAppointments({ childId: childId })
          .then(res => {
            appointmentInfo = res.appointments || null;
            // 保存到本地缓存
            if (appointmentInfo) {
              const storageKey = `appointment_${childId}`;
              wx.setStorageSync(storageKey, appointmentInfo);
            }
            // 更新全局变量
            if (!this.globalData.appointmentInfo) {
              this.globalData.appointmentInfo = {};
            }
            this.globalData.appointmentInfo[childId] = appointmentInfo;
          })
          .catch(err => {
            console.error('获取预约信息失败:', err);
          })
          .finally(() => {
            wx.hideLoading();
          });
      }
    }

    // 返回当前获取到的 appointmentInfo (可能是本地缓存的，也可能是刚从服务器获取的，或者为 null)
    return appointmentInfo;
  },

  // 保存复诊信息（本地优先，然后尝试同步到服务器）
  saveAppointmentInfo(childId, appointmentInfo) {
    console.log('[saveAppointmentInfo] childId:', childId, 'appointmentInfo:', appointmentInfo);
    // 保存到本地缓存
    const storageKey = `appointment_${childId}`;
    wx.setStorageSync(storageKey, appointmentInfo);

    // 更新全局变量
    if (!this.globalData.appointmentInfo) {
      this.globalData.appointmentInfo = {};
    }
    this.globalData.appointmentInfo[childId] = appointmentInfo;

    // 添加到待同步队列
    this.addToSyncQueue({
      type: 'appointmentInfo',
      childId: childId,
      data: appointmentInfo,
      timestamp: Date.now()
    });

    // 尝试同步到服务器
    this.syncToServer();

    return appointmentInfo;
  },

  // 删除复诊信息
  deleteAppointmentInfo(childId) {
    // 从本地缓存删除
    const storageKey = `appointment_${childId}`;
    wx.removeStorageSync(storageKey);

    // 更新全局变量
    if (this.globalData.appointmentInfo) {
      delete this.globalData.appointmentInfo[childId];
    }

    // 添加到待同步队列
    this.addToSyncQueue({
      type: 'deleteAppointmentInfo',
      childId: childId,
      timestamp: Date.now()
    });

    // 尝试同步到服务器
    this.syncToServer();
  },

  // 添加以下方法到App对象中


  // 在globalData中添加appointmentInfo全局变量
  globalData: {
    userInfo: null,
    role: null, // 'user' or 'doctor',
    childInfo: null, // 当前使用的儿童信息，修改为数组，包含 growthRecords
    appointmentInfo: {}, // 添加复诊信息全局变量
    chatHistory: {}, // 添加聊天历史全局变量
    // 同步相关状态
    isDataSyncing: false, // 是否正在同步
    lastSyncTime: 0,      // 最后同步时间戳
    pendingSyncData: [],  // 待同步到服务器的数据
    networkStatus: true,   // 网络状态

  },

})

// 添加以下方法到App对象中
// 添加以下方法到App对象中

// 获取聊天历史
// App.prototype.getChatHistory = function (userId) {
//   // 先尝试从 globalData 获取
//   let chatHistory = this.globalData.chatHistory ? this.globalData.chatHistory[userId] : null;

//   // 如果 globalData 中没有，再尝试从本地缓存获取
//   if (!chatHistory) {
//     const storageKey = `chat_history_${userId}`;
//     chatHistory = wx.getStorageSync(storageKey) || null;
//     // 如果从本地缓存获取到了，更新 globalData
//     if (chatHistory) {
//       if (!this.globalData.chatHistory) {
//         this.globalData.chatHistory = {};
//       }
//       this.globalData.chatHistory[userId] = chatHistory;
//     }
//   }


//   // 如果本地和 globalData 都没有，且网络可用，则从服务器获取
//   if (!chatHistory && this.globalData.networkStatus) {
//     // 获取用户的 openid
//     const openid = wx.getStorageSync('openid');
//     const token = wx.getStorageSync('token'); // 获取 token
//     if (openid && token) {
//       // 显示加载提示
//       wx.showLoading({
//         title: '获取聊天记录...',
//       });

//       // 引入API模块
//       const { API } = require('./utils/api.js');

//       // 从服务器获取聊天历史
//       API.chat.getChatHistory()
//         .then(res => {
//           if (res.success && res.messages) {
//             // 构造聊天历史对象
//             chatHistory = {
//               userId: userId,
//               messageList: res.messages,
//               lastUpdateTime: Date.now()
//             };
//             // 保存到本地缓存
//             const storageKey = `chat_history_${userId}`;
//             wx.setStorageSync(storageKey, chatHistory);
//             // 更新全局变量
//             if (!this.globalData.chatHistory) {
//               this.globalData.chatHistory = {};
//             }
//             this.globalData.chatHistory[userId] = chatHistory;
//           }
//         })
//         .catch(err => {
//           console.error('获取聊天历史失败:', err);
//         })
//         .finally(() => {
//           wx.hideLoading();
//         });
//     }
//   }

//   // 更新全局变量 (如果之前没有获取到，这里确保 globalData 中有该 userId 的空对象)
//   if (!this.globalData.chatHistory) {
//     this.globalData.chatHistory = {};
//   }

//   // 如果没有聊天历史，创建一个空的并更新 globalData
//   if (!chatHistory) {
//     chatHistory = {
//       userId: userId,
//       messageList: [],
//       lastUpdateTime: Date.now()
//     };
//     this.globalData.chatHistory[userId] = chatHistory;
//   } else {
//     // 如果从本地或服务器获取到了，确保 globalData 是最新的
//     this.globalData.chatHistory[userId] = chatHistory;
//   }


//   return chatHistory;
// };

// 保存聊天消息
App.prototype.saveChatMessage = function (userId, message) {
  // 获取当前聊天历史，优先从 globalData 获取
  let chatHistory = this.globalData.chatHistory ? this.globalData.chatHistory[userId] : null;

  // 如果 globalData 中没有，尝试从本地缓存获取
  if (!chatHistory) {
    const storageKey = `chat_history_${userId}`;
    chatHistory = wx.getStorageSync(storageKey) || {
      userId: userId,
      messageList: [],
      lastUpdateTime: Date.now()
    };
    // 如果从本地缓存获取到了，更新 globalData
    if (!this.globalData.chatHistory) {
      this.globalData.chatHistory = {};
    }
    this.globalData.chatHistory[userId] = chatHistory;
  }


  // 添加新消息
  chatHistory.messageList.push(message);
  chatHistory.lastUpdateTime = Date.now();

  // 保存到本地缓存
  const storageKey = `chat_history_${userId}`;
  wx.setStorageSync(storageKey, chatHistory);

  // 更新全局变量 (已在上面处理)
  // if (!this.globalData.chatHistory) {
  //   this.globalData.chatHistory = {};
  // }
  // this.globalData.chatHistory[userId] = chatHistory;

  // 添加到待同步队列
  this.addToSyncQueue({
    type: 'chatHistory',
    userId: userId,
    data: chatHistory, // 传递完整的聊天历史对象
    timestamp: Date.now()
  });

  // 尝试同步到服务器
  this.syncToServer();

  return {
    success: true,
    chatHistory: chatHistory
  };
};

// 清空聊天历史
App.prototype.clearChatHistory = function (userId) {
  // 从本地缓存删除
  const storageKey = `chat_history_${userId}`;
  wx.removeStorageSync(storageKey);

  // 更新全局变量
  if (this.globalData.chatHistory) {
    this.globalData.chatHistory[userId] = {
      userId: userId,
      messageList: [],
      lastUpdateTime: Date.now()
    };
  } else {
    this.globalData.chatHistory = {};
    this.globalData.chatHistory[userId] = {
      userId: userId,
      messageList: [],
      lastUpdateTime: Date.now()
    };
  }

  // 调用后端API清空聊天历史
  const { API } = require('./utils/api.js');
  API.chat.clearChatHistory()
    .then(res => {
      if (res.success) {
        console.log('服务器聊天历史已清空');
      }
    })
    .catch(err => {
      console.error('清空服务器聊天历史失败:', err);
    });

  return {
    success: true,
    message: '聊天历史已清空'
  };
};
