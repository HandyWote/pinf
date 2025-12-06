// pages/ai-qa/ai-qa.js
const app = getApp(); // 获取全局应用实例
// 移除marked和towxml引入

Page({

  /**
   * 页面的初始数据
   */
  data: {
    userId: '',
    inputValue: '',
    messageList: [],
    loading: false,
    scrollToView: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    // 获取用户ID
    const userId = wx.getStorageSync('openid') || '';

    this.setData({
      userId
    });

    // 加载本地历史消息
    const history = wx.getStorageSync('qa_message_history') || [];
    if (history.length > 0) {
      this.setData({ messageList: history });
    } else {
      // 默认欢迎消息
      this.setData({
        messageList: [
          { type: 'zhinen', content: '您好，我是智能小护，有什么育儿问题可以随时问我哦~' }
        ]
      });
    }
  },

  /**
   * 输入框内容变化处理
   */
  onInputChange(e) {
    this.setData({ inputValue: e.detail.value });
  },

  /**
   * 发送消息
   */
  sendMessage() {
    const content = this.data.inputValue.trim();
    if (!content) return;
    const newList = this.data.messageList.concat([{ type: 'user', content }]);
    this.setData({
      messageList: newList,
      inputValue: '',
      loading: true
    }, () => {
      this.setData({ scrollToView: 'msg' + (newList.length - 1) });
    });
    wx.setStorageSync('qa_message_history', newList);

    wx.request({
      url: 'https://flow.pinf.top/v1/chat-messages',
      method: 'POST',
      header: {
        'Authorization': 'Bearer app-WynlMqF7dnDHP5AmIvJtx4Vs',
        'Content-Type': 'application/json'
      },
      data: {
        inputs: {},
        query: content,
        response_mode: 'blocking',
        user: this.data.userId || 'test-user-qa'
      },
      success: (res) => {
        const answer = res.data && res.data.answer ? res.data.answer : '抱歉，未能获取到答案。';
        const updatedList = this.data.messageList.concat([{ type: 'zhinen', content: answer }]);
        this.setData({
          messageList: updatedList,
          loading: false
        }, () => {
          this.setData({ scrollToView: 'msg' + (updatedList.length - 1) });
        });
        wx.setStorageSync('qa_message_history', updatedList);
      },
      fail: (err) => {
        const updatedList = this.data.messageList.concat([{ type: 'zhinen', content: '网络异常，请稍后再试。' }]);
        this.setData({
          messageList: updatedList,
          loading: false
        }, () => {
          this.setData({ scrollToView: 'msg' + (updatedList.length - 1) });
        });
        wx.setStorageSync('qa_message_history', updatedList);
      }
    });
  },

  /**
   * 请求AI回复
   */
  requestAIResponse(question) {
    // 引入API模块
    const { API } = require('../../utils/api.js');
    
    // 生成消息ID
    const messageId = Date.now().toString();
    
    // 调用后端聊天API
    API.chat.sendMessage({
      content: question,
      messageId: messageId
    })
      .then(res => {
        if (res.success && res.aiMessage) {
          // 处理AI回复
          this.handleAIResponse(res.aiMessage.content);
        } else {
          console.error('AI回复格式错误:', res);
          this.handleRequestFail(new Error('AI回复格式错误'));
        }
      })
      .catch(err => {
        console.error('AI回复请求失败:', err);
        this.handleRequestFail(err);
      });
  },

  /**
   * 处理AI回复
   */
  handleAIResponse(answer) {
    const { messageList, userId } = this.data;

    // 添加AI回复到消息列表
    const aiMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: answer,
      time: new Date().getTime(),
      status: 'sent'
    };

    const newMessageList = [...messageList, aiMessage];

    this.setData({
      messageList: newMessageList,
      loading: false
    });

    // 保存消息到全局
    if (userId) {
      app.saveChatMessage(userId, aiMessage);
    }

    // 滚动到底部
    this.scrollToBottom();
  },

  /**
   * 处理请求失败
   */
  handleRequestFail(err) {
    wx.showToast({
      title: '网络请求失败，请稍后再试',
      icon: 'none',
      duration: 2000
    });

    this.setData({ loading: false });
  },

  /**
   * 获取模拟回复
   */
  getSimulatedResponse(question) {
    // 简单的模拟回复逻辑
    if (question.includes('喂养') || question.includes('奶粉')) {
      return '宝宝的喂养应当根据月龄来调整。0-6个月的宝宝建议纯母乳喂养，6个月后可以添加辅食。如果使用奶粉，请选择适合宝宝月龄的配方奶粉，并按照说明准备。';
    } else if (question.includes('睡眠')) {
      return '新生儿每天需要16-17小时的睡眠，3-6个月的宝宝需要14-15小时，6-12个月的宝宝需要约14小时。建立规律的睡眠习惯对宝宝的发育非常重要。';
    } else if (question.includes('发烧') || question.includes('生病')) {
      return '宝宝发烧是常见的症状，如果体温超过38℃，建议及时就医。同时保持宝宝充分休息和补充水分。请注意，这只是一般建议，具体情况请咨询专业医生。';
    } else {
      return '感谢您的提问！作为AI助手，我会尽力为您提供育儿方面的建议和信息。如果您有更具体的问题，请随时告诉我，我会尽可能详细地回答。';
    }
  },

  /**
   * 滚动到底部
   */
  scrollToBottom() {
    // 使用nextTick确保在DOM更新后滚动
    wx.nextTick(() => {
      const query = wx.createSelectorQuery().in(this);
      query.select('.message-list').boundingClientRect();
      query.exec((res) => {
        if (res && res[0]) {
          wx.pageScrollTo({
            scrollTop: res[0].height,
            duration: 300
          });
        }
      });
    });
  },

  /**
   * 清空聊天历史
   */
  clearHistory() {
    const { userId } = this.data;

    if (!userId) return;

    wx.showModal({
      title: '确认清空',
      content: '确定要清空所有聊天记录吗？',
      success: (res) => {
        if (res.confirm) {
          // 清空聊天历史
          const result = app.clearChatHistory(userId);

          if (result.success) {
            this.setData({
              messageList: []
            });
            wx.showToast({
              title: '已清空聊天记录',
              icon: 'success'
            });
          }
        }
      }
    });
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 可以在这里处理页面显示逻辑
  }
})
