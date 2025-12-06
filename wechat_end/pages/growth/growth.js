// pages/growth/index.js
import * as echarts from '../../ec-canvas/echarts';

function initChart(canvas, width, height, dpr) {
  const chart = echarts.init(canvas, null, {
    width: width,
    height: height,
    devicePixelRatio: dpr
  });
  canvas.setChart(chart);

  // 这里配置option
  var option = {
    title: {
      show: false
    },
    tooltip: {
      trigger: 'axis'
    },
    legend: {
      show: false
    },
    grid: {
      left: 40,
      right: 20,
      top: 30,
      bottom: 40
    },
    xAxis: {
      type: 'category',
      data: ['0', '1月', '2月', '3月', '4月', '5月', '6月'],
      name: '年龄'
    },
    yAxis: {
      type: 'value',
      name: '厘米(cm)',
      min: 45,
      max: 75
    },
    series: [
      {
        name: '97%',
        type: 'line',
        data: [48, 54, 60, 66, 69, 72, 75],
        lineStyle: { color: '#e57373' }
      },
      {
        name: '85%',
        type: 'line',
        data: [47, 53, 59, 64, 67, 70, 73],
        lineStyle: { color: '#ba68c8' }
      },
      {
        name: '50%',
        type: 'line',
        data: [46, 52, 58, 62, 65, 68, 71],
        lineStyle: { color: '#388e3c', width: 3 }
      },
      {
        name: '15%',
        type: 'line',
        data: [45, 51, 56, 60, 63, 66, 69],
        lineStyle: { color: '#4fc3f7' }
      },
      {
        name: '3%',
        type: 'line',
        data: [44, 50, 54, 58, 61, 64, 67],
        lineStyle: { color: '#ff8a65' }
      },
      {
        name: '当前',
        type: 'scatter',
        data: [[3, 60]], // 3月，60cm
        symbolSize: 10,
        itemStyle: { color: '#d32f' }
      }
    ]
  };

  chart.setOption(option);
  return chart;
}

Page({
  data: {
    ec: {
      onInit: null // 稍后初始化
    },
    inputMonth: '',
    inputHeight: '',
    userPoints: [[3, 60]] // 默认有一个点
  },
  onInputMonth(e) {
    this.setData({ inputMonth: e.detail.value });
  },
  onInputHeight(e) {
    this.setData({ inputHeight: e.detail.value });
  },
  onAddRecord() {
    const month = parseFloat(this.data.inputMonth);
    const height = parseFloat(this.data.inputHeight);
    if (isNaN(month) || isNaN(height)) {
      wx.showToast({ title: '请输入有效的月龄和身高', icon: 'none' });
      return;
    }
    const userPoints = this.data.userPoints.concat([[month, height]]);
    this.setData({ userPoints });
    if (this.chart) {
      this.updateChart();
    }
  },
  onReady() {
    this.initChart();
  },
  initChart() {
    const that = this;
    this.setData({
      ec: {
        onInit: function(canvas, width, height, dpr) {
          const chart = echarts.init(canvas, null, {
            width: width,
            height: height,
            devicePixelRatio: dpr
          });
          canvas.setChart(chart);
          that.chart = chart;
          that.updateChart();
          return chart;
        }
      }
    });
  },
  updateChart() {
    const userPoints = this.data.userPoints;
    const option = {
      title: { show: false },
      tooltip: { trigger: 'axis' },
      legend: {
        data: [
          { name: 'P97', icon: 'circle' },
          { name: 'P85', icon: 'circle' },
          { name: 'P50', icon: 'circle' },
          { name: 'P15', icon: 'circle' },
          { name: 'P3', icon: 'circle' },
          { name: '用户记录', icon: 'circle' }
        ],
        bottom: 0
      },
      grid: { left: 40, right: 20, top: 30, bottom: 60 },
      xAxis: {
        type: 'category',
        data: ['0月', '1月', '2月', '3月', '4月', '5月', '6月'],
        name: '年龄(月)'
      },
      yAxis: {
        type: 'value',
        name: '厘米 (cm)',
        min: 45,
        max: 75
      },
      series: [
        {
          name: 'P97',
          type: 'line',
          data: [53, 59, 63, 67, 70, 73, 76],
          lineStyle: { color: '#b71c1c' },
          symbol: 'circle',
          showSymbol: false
        },
        {
          name: 'P85',
          type: 'line',
          data: [52, 58, 62, 65, 68, 71, 74],
          lineStyle: { color: '#7cb342' },
          symbol: 'circle',
          showSymbol: false
        },
        {
          name: 'P50',
          type: 'line',
          data: [50, 56, 60, 63, 66, 69, 72],
          lineStyle: { color: '#ffd600' },
          symbol: 'circle',
          showSymbol: false
        },
        {
          name: 'P15',
          type: 'line',
          data: [48, 54, 58, 61, 64, 67, 70],
          lineStyle: { color: '#ff8a65' },
          symbol: 'circle',
          showSymbol: false
        },
        {
          name: 'P3',
          type: 'line',
          data: [47, 52, 56, 59, 62, 65, 68],
          lineStyle: { color: '#039be5' },
          symbol: 'circle',
          showSymbol: false
        },
        {
          name: '用户记录',
          type: 'scatter',
          data: userPoints,
          symbolSize: 16,
          itemStyle: { color: '#d32f2f' },
          z: 10
        }
      ]
    };
    this.chart.setOption(option);
  }
});