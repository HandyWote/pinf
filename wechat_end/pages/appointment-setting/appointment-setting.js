// pages/appointment-setting/appointment-setting.js
Page({
  data: {
    childId: '',
    isEdit: false,
    appointmentInfo: {
      hospitalName: '',
      department: '',
      appointmentDate: '',
      reminderDays: 3,
      notes: ''
    },
    minDate: '',
    reminderDaysOptions: ['提前1天', '提前2天', '提前3天', '提前5天', '提前7天'],
    reminderDaysValues: [1, 2, 3, 5, 7],
    reminderDaysIndex: 2 // 默认选择提前3天
  },

  onLoad: function (options) {
    // 设置最小日期为明天，默认日期为明天（用 getDate()+1，确保跨天无误）
    const today = new Date();
    const tomorrow = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1); // 明天0点
    const tYear = tomorrow.getFullYear();
    const tMonth = tomorrow.getMonth() + 1;
    const tDay = tomorrow.getDate();
    const minDate = `${tYear}-${tMonth < 10 ? '0' + tMonth : tMonth}-${tDay < 10 ? '0' + tDay : tDay}`;
    const defaultDate = minDate;

    // 获取传递的childId参数
    const childId = options.childId || '';
    const isEdit = options.edit === 'true';

    this.setData({
      childId,
      isEdit,
      minDate,
      'appointmentInfo.appointmentDate': defaultDate // 默认日期为明天
    });

    // 如果是编辑模式，加载现有的复诊信息
    if (isEdit && childId) {
      this.loadAppointmentInfo(childId);
    }
  },

  // 加载复诊信息
  loadAppointmentInfo: function (childId) {
    const storageKey = `appointment_${childId}`;
    const appointmentInfo = wx.getStorageSync(storageKey);

    if (appointmentInfo) {
      // 找到对应的reminderDaysIndex
      const reminderDays = appointmentInfo.reminderDays;
      const reminderDaysIndex = this.data.reminderDaysValues.indexOf(reminderDays);

      this.setData({
        appointmentInfo,
        reminderDaysIndex: reminderDaysIndex !== -1 ? reminderDaysIndex : 2
      });
    }
  },

  // 医院名称输入事件
  onHospitalNameInput: function (e) {
    this.setData({
      'appointmentInfo.hospitalName': e.detail.value
    });
  },

  // 科室输入事件
  onDepartmentInput: function (e) {
    this.setData({
      'appointmentInfo.department': e.detail.value
    });
  },

  // 日期选择事件
  onDateChange: function (e) {
    this.setData({
      'appointmentInfo.appointmentDate': e.detail.value
    });
  },

  // 提醒天数选择事件
  onReminderDaysChange: function (e) {
    const index = parseInt(e.detail.value);
    this.setData({
      reminderDaysIndex: index,
      'appointmentInfo.reminderDays': this.data.reminderDaysValues[index]
    });
  },

  // 备注输入事件
  onNotesInput: function (e) {
    this.setData({
      'appointmentInfo.notes': e.detail.value
    });
  },

  // 返回上一页
  navigateBack: function () {
    wx.navigateBack();
  },

  // 保存复诊提醒
  saveAppointment: function () {
    const appointmentInfo = this.data.appointmentInfo;
    const childId = this.data.childId;

    // 验证必填字段
    if (!appointmentInfo.hospitalName) {
      wx.showToast({
        title: '请输入医院名称',
        icon: 'none'
      });
      return;
    }

    if (!appointmentInfo.department) {
      wx.showToast({
        title: '请输入科室名称',
        icon: 'none'
      });
      return;
    }

    if (!appointmentInfo.appointmentDate) {
      wx.showToast({
        title: '请选择复诊日期',
        icon: 'none'
      });
      return;
    }

    // 生成唯一ID
    if (!appointmentInfo.id) {
      appointmentInfo.id = Date.now().toString();
    }

    // 设置状态为待提醒
    appointmentInfo.status = 'pending';

    // 使用全局方法保存复诊信息
    const app = getApp();
    app.saveAppointmentInfo(childId, appointmentInfo);

    // 新增：保存成功后立即同步预约数据
    app.syncAppointments().then(() => {
      wx.showToast({
        title: '保存成功',
        icon: 'success',
        success: () => {
          // 延迟返回，让用户看到提示
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    }).catch(() => {
      // 同步失败也提示保存成功，但建议提示用户稍后刷新
      wx.showToast({
        title: '保存成功，稍后同步',
        icon: 'success',
        success: () => {
          setTimeout(() => {
            wx.navigateBack();
          }, 1500);
        }
      });
    });
  }
});