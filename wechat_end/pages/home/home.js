// pages/home/home.js
const app = getApp(); // 获取全局应用实例

// 检查全局应用实例
console.log('全局应用实例:', app);

Page({
	data: {
		userName: '家长',
		currentDate: '',
		hasChild: false,
		childInfo: [],
		currentChildIndex: 0,
		currentChild: {},
		childAge: 0,
		ageTypeIndex: 0,
		correctedAge: 0, // 矫正胎龄（月）
		actualAge: 0, // 实际月龄（月）
		growthRecords: [], // 生长记录数据
		newRecord: {
			date: '',
			height: '',
			weight: '',
			ageInMonths: '',
			ageInWeeks: '',
			headCircumference: ''
		},
		showAddForm: false,
		showDeleteModal: false, // 删除宝宝确认对话框
		// 复诊提醒相关数据
		hasAppointment: false, // 是否有复诊提醒
		appointmentCountdown: 0, // 复诊倒计时天数
		appointmentInfo: {}, // 复诊信息
		appointmentMonth: '', // 复诊月份（用于日历显示）
		appointmentDay: '', // 复诊日期（用于日历显示）
		hasSubscribed: false, // 是否已订阅消息
		showDeleteAppointmentModal: false, // 删除复诊提醒确认对话框
		appointmentList: [], // 新增：当前宝宝的预约列表
		deleteAppointmentIndex: null,
	},

	onLoad: function (options) {
		console.log('页面加载中...');

		// 设置当前日期
		this.setCurrentDate();
		// 从本地缓存获取宝宝信息
		this.loadChildInfo();
		// 加载复诊提醒信息
		this.loadAppointmentInfo();
		this.loadAppointmentList();
	},

	onShow: function () {
		console.log('页面显示中...');
		// 每次页面显示时同步预约数据
		const app = getApp();
		app.syncAppointments().then(() => {
			this.loadAppointmentList();
		}).catch(() => {
			this.loadAppointmentList();
		});
		// 每次页面显示时重新加载儿童信息，以便在添加儿童后更新页面
		this.loadChildInfo();

		// 设置底部导航栏选中状态
		if (typeof this.getTabBar === 'function' && this.getTabBar()) {
			this.getTabBar().setData({
				active: 0
			});
		}

		// 重新加载生长记录数据
		if (this.data.currentChild && this.data.currentChild.name) {
			const currentChild = this.data.currentChild;
			const storageKey = currentChild.id ? `growthRecords_${currentChild.id}` : `growthRecords_${currentChild.name}`;
			const growthRecords = wx.getStorageSync(storageKey) || [];

			this.setData({
				growthRecords
			});
		}

		// 重新加载复诊提醒信息
		this.loadAppointmentInfo();
		this.loadAppointmentList();
	},

	// 设置当前日期
	setCurrentDate: function () {
		const now = new Date();
		const year = now.getFullYear();
		const month = now.getMonth() + 1;
		const day = now.getDate();
		const weekdays = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
		const weekday = weekdays[now.getDay()];

		this.setData({
			currentDate: `${year}年${month}月${day}日 ${weekday}`
		});
	},

	// 加载儿童信息
	// 加载儿童信息
	loadChildInfo: function () {
		let childInfo = wx.getStorageSync('childInfo') || [];
		
		// 为现有的儿童信息添加 ID 字段（兼容性处理）
		let needUpdate = false;
		childInfo = childInfo.map(child => {
			if (!child.id) {
				child.id = Date.now() + Math.floor(Math.random() * 1000);
				needUpdate = true;
			}
			return child;
		});
		
		// 如果有更新，保存回本地存储
		if (needUpdate) {
			wx.setStorageSync('childInfo', childInfo);
			console.log('已为现有儿童信息添加ID字段');
		}

		if (childInfo.length > 0) {
			// 获取当前选中的宝宝信息
			const currentChild = childInfo[this.data.currentChildIndex];

			// 计算实际月龄和矫正月龄，传入周龄参数
			const ages = this.calculateAges(
				currentChild.birthDate,
				currentChild.expectedDate,
				currentChild.gestationalWeeks
			);

			this.setData({
				childInfo,
				hasChild: true,
				currentChild,
				actualAgeString: ages.actualAgeString,
				correctedAgeString: ages.correctedAgeString
			});

			// 加载生长记录
		this.loadGrowthRecords(currentChild.id, currentChild.name);
		} else {
			this.setData({
				hasChild: false,
				childInfo: []
			});
		}
	},

	// 计算实际月龄和矫正胎龄
	calculateAges: function (birthDateStr, expectedDateStr, gestationalWeeks) {
		const birthDate = new Date(birthDateStr);
		const today = new Date();

		// 计算实际月龄的详细信息
		const actualAgeString = this.formatAgeString(birthDate, today);

		let correctedAgeString = '';
		if (expectedDateStr) {
			const expectedDate = new Date(expectedDateStr);

			// 如果有周龄信息，可以更精确地计算矫正月龄
			// 足月通常为40周，如果早于40周出生，需要进行矫正
			if (gestationalWeeks && gestationalWeeks < 40) {
				// 计算需要矫正的周数
				const weeksToCorrect = 40 - gestationalWeeks;
				// 将出生日期调整为矫正后的日期（向后推迟相应的周数）
				const correctedBirthDate = new Date(birthDate);
				correctedBirthDate.setDate(correctedBirthDate.getDate() + (weeksToCorrect * 7));

				// 使用矫正后的出生日期计算矫正月龄
				correctedAgeString = this.formatAgeString(correctedBirthDate, today);
			} else {
				// 如果没有周龄信息或已足月，使用预产期计算
				correctedAgeString = this.formatAgeString(expectedDate, today);
			}
		} else {
			// 如果没有预产期信息，则矫正月龄与实际月龄相同
			correctedAgeString = actualAgeString;
		}

		return { actualAgeString, correctedAgeString };
	},

	// 格式化月龄字符串
	formatAgeString: function (startDate, endDate) {
		let start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
		let end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());

		if (start > end) {
			// 如果开始日期在结束日期之后，例如预产期在今天之后
			let diffTime = start.getTime() - end.getTime();
			let diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			return `距离预产期 ${diffDays} 天`; // 或者其他您希望的提示
		}

		let years = end.getFullYear() - start.getFullYear();
		let months = end.getMonth() - start.getMonth();
		let days = end.getDate() - start.getDate();

		if (days < 0) {
			months--;
			// 获取上个月的天数
			end.setMonth(end.getMonth() - 1);
			days += new Date(end.getFullYear(), end.getMonth() + 1, 0).getDate();
		}

		if (months < 0) {
			years--;
			months += 12;
		}

		let result = '';
		if (years > 0) {
			result += `${years}年`;
		}
		if (months > 0) {
			result += `${months}月`;
		}
		if (days > 0) {
			result += `${days}天`;
		}

		if (result === '') {
			// 如果年月日都为0，说明是同一天
			return '0天'; // 或者 '当天'
		}
		// 如果只有年或月，但没有天，且总天数小于一个月，优先显示天数
		if ((years * 365 + months * 30 + days) < 30 && !(months > 0 || years > 0)) {
			let diffTime = Math.abs(endDate.getTime() - startDate.getTime());
			let totalDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
			if (totalDays === 0 && startDate.getDate() === endDate.getDate()) return '0天'; // 同一天
			return `${totalDays}天`;
		}

		if (result !== '' && (months > 0 || years > 0) && days === 0 && (years * 365 + months * 30 + days) >= 30) {
			// 如果有月或年，且天数为0，则不显示0天，除非总共就没几天
		} else if (result === '' && days > 0) {
			// 只有天数的情况
			return `${days}天`;
		} else if ((months === 0 && years === 0 && days > 0)) {
			return `${days}天`;
		}

		// 如果只有月和年，且天数为0，去掉最后的"0天"
		if (days === 0 && (months > 0 || years > 0)) {
			if (result.endsWith('0天')) { // 理论上不会进入这里因为上面days>0才加天
				result = result.substring(0, result.length - 2);
			}
		} else if (result === '' && days === 0 && months === 0 && years === 0) {
			return '0天';
		}

		return result;
	},


	// 计算年龄（月） - 此函数现在可以考虑移除或重构，因为主要逻辑在 calculateAges 和 formatAgeString 中
	calculateAge: function (birthDate) {
		const birth = new Date(birthDate);
		const today = new Date();

		// 计算月龄差
		const monthDiff = (today.getFullYear() - birth.getFullYear()) * 12 + today.getMonth() - birth.getMonth();
		const age = monthDiff + (today.getDate() >= birth.getDate() ? 0 : -1);

		return age; // 返回的是纯月份数字，如果还需要这个纯数字，可以保留
	},

	// 计算矫正年龄（月）- 此函数现在可以考虑移除或重构
	calculateCorrectedAge: function (birthDate, expectedDate) {
		if (!expectedDate) return this.calculateAge(birthDate);

		const birth = new Date(birthDate);
		const expected = new Date(expectedDate);

		// 计算实际月龄
		const actualAge = this.calculateAge(birthDate);

		// 计算预产期和出生日期之间的差值（月）
		const correctionMonths = (expected.getFullYear() - birth.getFullYear()) * 12 +
			expected.getMonth() - birth.getMonth() +
			(expected.getDate() >= birth.getDate() ? 0 : -1);

		// 矫正胎龄 = 实际月龄 - (预产期 - 出生日期)
		const correctedAge = actualAge - correctionMonths;

		return correctedAge > 0 ? correctedAge : 0; // 返回的是纯月份数字
	},

	// 切换图表标签 - 导航到对应的图表页面
	switchTab: function (e) {
		const tab = e.currentTarget.dataset.tab;
		console.log('切换到标签:', tab);

		// 获取当前选中的宝宝信息
		const childInfo = this.data.currentChild;
		const childId = childInfo.id || 'default';

		// 根据标签类型跳转到对应页面
		switch (tab) {
			case 'weight':
				wx.navigateTo({
					url: `/pages/weight-chart/weight-chart?childId=${childId}`
				});
				break;
			case 'height':
				wx.navigateTo({
					url: `/pages/height-chart/height-chart?childId=${childId}`
				});
				break;
			case 'headCircumference':
				wx.navigateTo({
					url: `/pages/head-chart/head-chart?childId=${childId}`
				});
				break;
			default:
				console.log('未知图表类型:', tab);
		}
	},

	// 切换当前儿童
	// 切换选中的宝宝
	switchChild: function (e) {
		const index = e.currentTarget.dataset.index;
		const currentChild = this.data.childInfo[index];

		// 计算实际月龄和矫正月龄
		const ages = this.calculateAges(currentChild.birthDate, currentChild.expectedDate);

		this.setData({
			currentChildIndex: index,
			currentChild,
			actualAgeString: ages.actualAgeString,
			correctedAgeString: ages.correctedAgeString
		});

		// 加载选中宝宝的生长记录
		this.loadGrowthRecords(currentChild.id, currentChild.name);
		this.loadAppointmentList();
	},

	// 显示删除宝宝确认对话框
	showDeleteChildModal: function () {
		this.setData({
			showDeleteModal: true
		});
	},

	// 隐藏删除宝宝确认对话框
	hideDeleteChildModal: function () {
		this.setData({
			showDeleteModal: false
		});
	},

	// 删除宝宝信息
	deleteChild: function () {
		const childInfo = this.data.childInfo;
		const index = this.data.currentChildIndex;
		const childName = childInfo[index].name;

		// 删除生长记录
		const storageKey = `growthRecords_${childName}`;
		wx.removeStorageSync(storageKey);

		// 删除复诊提醒信息
		const appointmentKey = `appointment_${childName}`;
		wx.removeStorageSync(appointmentKey);
		wx.removeStorageSync(`subscribed_${childName}`);

		// 从数组中删除该宝宝
		childInfo.splice(index, 1);

		// 更新存储
		wx.setStorageSync('childInfo', childInfo);

		// 更新页面数据
		if (childInfo.length > 0) {
			// 如果还有其他宝宝，选择第一个
			const newIndex = 0;
			const newChild = childInfo[newIndex];
			const ageData = this.calculateAges(newChild.birthDate, newChild.expectedDate);
			const newStorageKey = `growthRecords_${newChild.name}`;
			const newGrowthRecords = wx.getStorageSync(newStorageKey) || [];

			this.setData({
				childInfo,
				hasChild: true,
				currentChildIndex: newIndex,
				currentChild: newChild,
				actualAge: ageData.actualAge,
				correctedAge: ageData.correctedAge,
				growthRecords: newGrowthRecords,
				showDeleteModal: false
			});

			// 重新加载复诊提醒信息
			this.loadAppointmentInfo();
		} else {
			// 如果没有宝宝了
			this.setData({
				childInfo: [],
				hasChild: false,
				currentChildIndex: 0,
				currentChild: {},
				actualAge: 0,
				correctedAge: 0,
				growthRecords: [],
				showDeleteModal: false,
				hasAppointment: false,
				appointmentInfo: {},
				appointmentCountdown: 0,
				hasSubscribed: false
			});
		}

		wx.showToast({
			title: '删除成功',
			icon: 'success'
		});
	},
	// 切换添加表单显示状态
	toggleAddForm: function () {
		this.setData({
			showAddForm: !this.data.showAddForm
		});
	},

	// 日期选择器变化事件
	onDateChange: function (e) {
		this.setData({
			'newRecord.date': e.detail.value
		});
	},
	onAgeTypeChange: function (e) {
		const ageTypeIndex = parseInt(e.detail.value); // 转换为数字类型
		// 清空另一个类型的值
		const newRecord = this.data.newRecord;
		if (ageTypeIndex === 0) { // 切换到月龄
			newRecord.ageInWeeks = '';
		} else { // 切换到周龄
			newRecord.ageInMonths = '';
		}

		this.setData({
			ageTypeIndex: ageTypeIndex,
			newRecord: newRecord
		}, () => {
			console.log('ageTypeIndex after setData:', this.data.ageTypeIndex);
			console.log('newRecord after setData:', this.data.newRecord);
		});
	},


	// 周龄输入事件
	onAgeInWeeksInput: function (e) {
		this.setData({
			'newRecord.ageInWeeks': e.detail.value

		});
		console.log('ageTypeIndex:')
	},
	// 身高输入事件
	onHeightInput: function (e) {
		this.setData({
			'newRecord.height': e.detail.value
		});
	},

	// 体重输入事件
	onWeightInput: function (e) {
		this.setData({
			'newRecord.weight': e.detail.value
		});
	},

	// 头围输入事件
	onHeadCircumferenceInput: function (e) {
		this.setData({
			'newRecord.headCircumference': e.detail.value
		});
	},

	// 月龄输入事件
	onAgeInMonthsInput: function (e) {
		this.setData({
			'newRecord.ageInMonths': e.detail.value
		});
	},

	// 添加生长记录
	addGrowthRecord: function () {
		// 验证输入
		if (!this.data.newRecord.date) {
			wx.showToast({
				title: '请选择日期',
				icon: 'none'
			});
			return;
		}

		// 至少需要输入一项数据
		if (!this.data.newRecord.height && !this.data.newRecord.weight && !this.data.newRecord.headCircumference) {
			wx.showToast({
				title: '请至少输入一项数据',
				icon: 'none'
			});
			return;
		}


		// 创建新记录
		const newRecord = {
			date: this.data.newRecord.date,
			height: this.data.newRecord.height ? parseFloat(this.data.newRecord.height) : null,
			weight: this.data.newRecord.weight ? parseFloat(this.data.newRecord.weight) : null,
			headCircumference: this.data.newRecord.headCircumference ? parseFloat(this.data.newRecord.headCircumference) : null
		};
		// 根据选择的年龄类型保存对应的值
		if (this.data.ageTypeIndex === 0) {
			newRecord.ageInMonths = this.data.newRecord.ageInMonths ? parseFloat(this.data.newRecord.ageInMonths) : null;
			newRecord.ageInWeeks = null;
		} else {
			newRecord.ageInWeeks = this.data.newRecord.ageInWeeks ? parseFloat(this.data.newRecord.ageInWeeks) : null;
			newRecord.ageInMonths = null;
		}

		// 添加到记录列表
		const updatedRecords = [...this.data.growthRecords, newRecord];

		// 按日期排序
		updatedRecords.sort((a, b) => {
			return new Date(a.date) - new Date(b.date);
		});

		// 保存到本地存储
	if (this.data.currentChild && this.data.currentChild.name) {
		const currentChild = this.data.currentChild;
		const storageKey = currentChild.id ? `growthRecords_${currentChild.id}` : `growthRecords_${currentChild.name}`;
		wx.setStorageSync(storageKey, updatedRecords);
	}

		// 更新页面数据
		this.setData({
			growthRecords: updatedRecords,
			showAddForm: false,
			newRecord: {
				date: '',
				ageInMonths: '',
				ageInWeeks: '',
				height: '',
				weight: '',
				headCircumference: ''

			}
		}, () => {
			// 重新合并记录
			this.mergeGrowthRecords();

			// 提示成功
			wx.showToast({
				title: '记录已添加',
				icon: 'success'
			});
		});
	},

	// 加载生长记录方法
	loadGrowthRecords: function(childId, childName) {
		// 向后兼容：如果只传了一个参数，当作 childName 处理
		if (arguments.length === 1) {
			childName = childId;
			childId = null;
		}
		
		if (!childName && !childId) {
			console.warn('childId和childName都为空，无法加载生长记录');
			return;
		}

		// 优先使用 ID，如果没有 ID 则使用姓名（向后兼容）
		const storageKey = childId ? `growthRecords_${childId}` : `growthRecords_${childName}`;
		let growthRecords = wx.getStorageSync(storageKey) || [];
		
		// 如果使用 ID 没有找到数据，但有姓名，尝试从旧的姓名键迁移数据
		if (growthRecords.length === 0 && childId && childName) {
			const oldStorageKey = `growthRecords_${childName}`;
			const oldGrowthRecords = wx.getStorageSync(oldStorageKey) || [];
			if (oldGrowthRecords.length > 0) {
				// 迁移数据到新的 ID 键
				wx.setStorageSync(storageKey, oldGrowthRecords);
				// 删除旧的姓名键（可选）
				// wx.removeStorageSync(oldStorageKey);
				growthRecords = oldGrowthRecords;
				console.log('已迁移生长记录数据从姓名键到ID键');
			}
		}

		// 更新页面数据
		this.setData({
			growthRecords: growthRecords
		});

		// 合并同一天的记录
		this.mergeGrowthRecords();

		// 如果有网络连接，尝试从服务器获取最新数据
		const { API } = require('../../utils/api.js');
		API.child.getChildInfo()
			.then(res => {
				if (res.success && res.childinfo && res.childinfo.length > 0) {
					// 找到对应的儿童
					const targetChild = res.childinfo.find(child => child.name === childName);
					if (targetChild && targetChild.growthRecords) {
						// 更新本地缓存
						wx.setStorageSync(storageKey, targetChild.growthRecords);
						// 更新页面数据
						this.setData({
							growthRecords: targetChild.growthRecords
						});
						// 重新合并记录
						this.mergeGrowthRecords();
					}
				}
			})
			.catch(err => {
				console.error('从服务器获取生长记录失败:', err);
				// 网络错误时继续使用本地数据
			});
	},

	// 在获取生长记录数据后调用此方法合并同一天的记录
	mergeGrowthRecords: function () {
		const records = this.data.growthRecords;
		const mergedMap = {};

		records.forEach(record => {
			if (!mergedMap[record.date]) {
				mergedMap[record.date] = {};
			}

			// 合并同一天的数据
			if (record.height !== null && record.height !== undefined) {
				mergedMap[record.date].height = record.height;
			}
			if (record.weight !== null && record.weight !== undefined) {
				mergedMap[record.date].weight = record.weight;
			}
			if (record.headCircumference !== null && record.headCircumference !== undefined) {
				mergedMap[record.date].headCircumference = record.headCircumference;
			}
			if (record.ageInMonths !== null && record.ageInMonths !== undefined) {
				mergedMap[record.date].ageInMonths = record.ageInMonths;
			}
			if (record.ageInWeeks !== null && record.ageInWeeks !== undefined) {
				mergedMap[record.date].ageInWeeks = record.ageInWeeks;
			}

			mergedMap[record.date].date = record.date;
		});

		// 转换为数组并按日期排序
		const mergedRecords = Object.values(mergedMap).sort((a, b) => {
			return new Date(b.date) - new Date(a.date); // 降序排列，最新的在前面
		});

		this.setData({
			mergedRecords: mergedRecords
		});
	},
	// ... 现有代码 ...

	// 修改删除记录的方法，按日期删除
	deleteRecordByDate: function (e) {
		const date = e.currentTarget.dataset.date;
		const childName = this.data.currentChild.name;

		if (!childName) {
			wx.showToast({
				title: '无法删除记录',
				icon: 'none'
			});
			return;
		}

		wx.showModal({
			title: '确认删除',
			content: '确定要删除这条记录吗？',
			success: res => {
				if (res.confirm) {
					// 获取所有需要删除的记录索引
					const recordsToDelete = this.data.growthRecords.filter(record =>
						record.date === date
					);

					// 获取剩余的记录
					const remainingRecords = this.data.growthRecords.filter(record =>
						record.date !== date
					);

					// 更新本地存储
					const storageKey = `growthRecords_${childName}`;
					wx.setStorageSync(storageKey, remainingRecords);

					// 更新页面数据
					this.setData({
						growthRecords: remainingRecords
					}, () => {
						// 重新合并记录
						this.mergeGrowthRecords();

						wx.showToast({
							title: '删除成功',
							icon: 'success'
						});
					});
				}
			}
		});
	},

	// 导航到信息收集页面
	navigateToInfoCollection: function () {
		wx.navigateTo({
			url: '/pages/info-collection/info-collection?mode=add'
		});
	},

	// 复诊提醒相关方法
	// 加载复诊提醒信息
	loadAppointmentInfo: function () {
		const childId = this.data.currentChild.id || '';
		if (!childId) return;

		// 使用全局方法获取复诊信息
		const app = getApp();
		const appointmentInfo = app.getAppointmentInfo(childId);

		if (appointmentInfo) {
			// 计算倒计时天数
			const today = new Date();
			const appointmentDate = new Date(appointmentInfo.appointmentDate);
			const timeDiff = appointmentDate.getTime() - today.getTime();
			const dayDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

			// 提取月份和日期用于显示
			const month = appointmentDate.getMonth() + 1;
			const day = appointmentDate.getDate();

			this.setData({
				hasAppointment: true,
				appointmentInfo: appointmentInfo,
				appointmentCountdown: dayDiff,
				appointmentMonth: month,
				appointmentDay: day,
				hasSubscribed: wx.getStorageSync(`subscribed_${childId}`) || false
			});
		} else {
			this.setData({
				hasAppointment: false,
				appointmentInfo: {},
				appointmentCountdown: 0,
				hasSubscribed: false
			});
		}
	},

	// 导航到复诊提醒设置页面
	navigateToAppointmentSetting: function () {
		const childId = this.data.currentChild.id || '';
		if (!childId) {
			wx.showToast({
				title: '请先添加宝宝信息',
				icon: 'none'
			});
			return;
		}

		wx.navigateTo({
			url: `/pages/appointment-setting/appointment-setting?childId=${childId}`
		});
	},

	// 编辑复诊提醒
	editAppointment: function () {
		const childId = this.data.currentChild.id || '';
		if (!childId) return;

		wx.navigateTo({
			url: `/pages/appointment-setting/appointment-setting?childId=${childId}&edit=true`
		});
	},

	// 显示删除复诊提醒确认对话框
	showDeleteAppointmentModal: function () {
		this.setData({
			showDeleteAppointmentModal: true
		});
	},

	// 隐藏删除复诊提醒确认对话框
	hideDeleteAppointmentModal: function () {
		this.setData({
			showDeleteAppointmentModal: false,
			deleteAppointmentIndex: null
		});
	},

	// 删除复诊提醒
	deleteAppointment: function () {
		const childId = this.data.currentChild.id || '';
		if (!childId) return;

		// 删除本地存储的复诊信息
		const storageKey = `appointment_${childId}`;
		wx.removeStorageSync(storageKey);
		wx.removeStorageSync(`subscribed_${childId}`);

		this.setData({
			hasAppointment: false,
			appointmentInfo: {},
			appointmentCountdown: 0,
			hasSubscribed: false,
			showDeleteAppointmentModal: false
		});

		wx.showToast({
			title: '复诊提醒已删除',
			icon: 'success'
		});
	},

	// 请求订阅消息
	requestSubscription: function () {
		const that = this;
		const childId = this.data.currentChild.id || '';
		if (!childId) return;

		// 请求订阅消息权限
		// 注意：需要在微信公众平台申请模板ID
		wx.requestSubscribeMessage({
			tmplIds: ['这里替换为您申请的模板ID'], // 替换为实际的模板ID
			success(res) {
				console.log('订阅消息结果:', res);
				// 如果用户同意订阅
				if (res['这里替换为您申请的模板ID'] === 'accept') {
					// 记录用户已订阅
					wx.setStorageSync(`subscribed_${childId}`, true);
					that.setData({
						hasSubscribed: true
					});

					wx.showToast({
						title: '订阅成功，将在复诊前提醒您',
						icon: 'none'
					});
				}
			},
			fail(err) {
				console.error('订阅消息失败:', err);
				wx.showToast({
					title: '订阅失败，请稍后重试',
					icon: 'none'
				});
			}
		});
	},

	// 加载当前宝宝所有预约
	loadAppointmentList: function () {
		const childId = this.data.currentChild.id;
		if (!childId) {
			this.setData({ appointmentList: [], hasAppointment: false, appointmentInfo: {} });
			return;
		}
		const storage = wx.getStorageSync('appointmentInfo') || [];
		const allAppointments = Array.isArray(storage) ? storage : (storage.appointments || []);
		console.log('本地预约数据', allAppointments);
		const appointmentList = allAppointments.filter(item => item.childInfo && item.childInfo.id == childId);
		if (appointmentList.length > 0) {
			this.setData({
				appointmentList,
				hasAppointment: true,
				appointmentInfo: appointmentList[0]
			});
		} else {
			this.setData({ appointmentList: [], hasAppointment: false, appointmentInfo: {} });
		}
	},

	// 点击删除按钮，弹出确认弹窗
	onDeleteAppointment: function(e) {
		const index = e.currentTarget.dataset.index;
		this.setData({
			showDeleteAppointmentModal: true,
			deleteAppointmentIndex: index
		});
	},

	// 确认删除
	confirmDeleteAppointment: function() {
		const index = this.data.deleteAppointmentIndex;
		if (index === null) return;
		const appointment = this.data.appointmentList[index];
		const appointmentId = appointment.id;
		const app = getApp();
		const { apiRequest } = require('../../utils/api.js');
		// 调用后端接口删除
		apiRequest.delete('/deleteAppointment/' + appointmentId).then(() => {
			wx.showToast({ title: '删除成功', icon: 'success' });
			// 同步最新数据
			app.syncAppointments().then(() => {
				this.loadAppointmentList();
			});
		}).catch(() => {
			wx.showToast({ title: '删除失败', icon: 'none' });
		}).finally(() => {
			this.hideDeleteAppointmentModal();
		});
	},

	onSubscribeAppointment: function(e) {
		const index = e.currentTarget.dataset.index;
		const appointment = this.data.appointmentList[index];
		// TODO: 替换为你的实际订阅消息模板ID
		const tmplId = '请替换为你的模板ID';
		const openid = wx.getStorageSync('openid');
		// 计算提醒时间（如提前 reminderDays 天）
		const appointmentDate = new Date(appointment.appointmentDate);
		const remindTime = new Date(appointmentDate.getTime() - (appointment.reminderDays || 1) * 24 * 60 * 60 * 1000);
		// 格式化提醒时间为 'YYYY-MM-DD HH:mm:ss'
		const pad = n => n < 10 ? '0' + n : n;
		const remindTimeStr = `${remindTime.getFullYear()}-${pad(remindTime.getMonth() + 1)}-${pad(remindTime.getDate())} 09:00:00`;

		wx.requestSubscribeMessage({
			tmplIds: [tmplId],
			success: (res) => {
				if (res[tmplId] === 'accept') {
					// 订阅成功后，调用后端接口记录订阅
					const { apiRequest } = require('../../utils/api.js');
					apiRequest.post('/subscribeAppointment', {
						openid,
						appointmentId: appointment.id,
						tmplId,
						remindTime: remindTimeStr
					}).then(() => {
						wx.showToast({ title: '订阅成功', icon: 'success' });
					}).catch(() => {
						wx.showToast({ title: '订阅失败', icon: 'none' });
					});
				} else {
					wx.showToast({ title: '未订阅', icon: 'none' });
				}
			},
			fail: (err) => {
				wx.showToast({ title: '订阅失败', icon: 'none' });
			}
		});
	},
});