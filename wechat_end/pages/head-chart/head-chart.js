// pages/head-chart/head-chart.js

const app = getApp();

import * as echarts from '../../ec-canvas/echarts';
let chart;

Page({
  data: {
    childId: '',
    childInfo: {},
    canvasWidth: 0,
    canvasHeight: 0,
    // 直接初始化示例数据
    ec: {
      onInit: function (canvas, width, height, dpr) {
        // 将 initChart 方法移到这里
        if (!canvas) {
          console.error('canvas 上下文获取失败');
          return null;
        }

        const chart = echarts.init(canvas, null, {
          width: width,
          height: height,
          devicePixelRatio: dpr
        });
        canvas.setChart(chart);
        this.chart = chart;

        // 确保数据已经准备好再初始化图表
        this.updateChart();
        return chart;
      }
    },
    currentGender: 'boy',  // 默认显示男孩
    currentStandard: 'WHO',
    boyHeadCircumferenceDataWho: [
      { age: 0, l: 1, m: 34.4618, s: 0.03686, p3: 32.1, p15: 33.1, p50: 34.5, p85: 35.8, p97: 36.9, type: 'WHO标准' },
      { age: 1, l: 1, m: 37.2759, s: 0.03133, p3: 35.1, p15: 36.1, p50: 37.3, p85: 38.5, p97: 39.5, type: 'WHO标准' },
      { age: 2, l: 1, m: 39.1285, s: 0.02997, p3: 36.9, p15: 37.9, p50: 39.1, p85: 40.3, p97: 41.3, type: 'WHO标准' },
      { age: 3, l: 1, m: 40.5135, s: 0.02918, p3: 38.3, p15: 39.3, p50: 40.5, p85: 41.7, p97: 42.7, type: 'WHO标准' },
      { age: 4, l: 1, m: 41.6317, s: 0.02868, p3: 39.4, p15: 40.4, p50: 41.6, p85: 42.9, p97: 43.9, type: 'WHO标准' },
      { age: 5, l: 1, m: 42.5576, s: 0.02837, p3: 40.3, p15: 41.3, p50: 42.6, p85: 43.8, p97: 44.8, type: 'WHO标准' },
      { age: 6, l: 1, m: 43.3306, s: 0.02817, p3: 41.0, p15: 42.1, p50: 43.3, p85: 44.6, p97: 45.6, type: 'WHO标准' },
      { age: 7, l: 1, m: 43.9803, s: 0.02804, p3: 41.7, p15: 42.7, p50: 44.0, p85: 45.3, p97: 46.3, type: 'WHO标准' },
      { age: 8, l: 1, m: 44.53, s: 0.02796, p3: 42.2, p15: 43.2, p50: 44.5, p85: 45.8, p97: 46.9, type: 'WHO标准' },
      { age: 9, l: 1, m: 44.9998, s: 0.02792, p3: 42.6, p15: 43.7, p50: 45.0, p85: 46.3, p97: 47.4, type: 'WHO标准' },
      { age: 10, l: 1, m: 45.4051, s: 0.0279, p3: 43.0, p15: 44.1, p50: 45.4, p85: 46.7, p97: 47.8, type: 'WHO标准' },
      { age: 11, l: 1, m: 45.7573, s: 0.02789, p3: 43.4, p15: 44.4, p50: 45.8, p85: 47.1, p97: 48.2, type: 'WHO标准' },
      { age: 12, l: 1, m: 46.0661, s: 0.02789, p3: 43.6, p15: 44.7, p50: 46.1, p85: 47.4, p97: 48.5, type: 'WHO标准' },
      { age: 13, l: 1, m: 46.3395, s: 0.02789, p3: 43.9, p15: 45.0, p50: 46.3, p85: 47.7, p97: 48.8, type: 'WHO标准' },
      { age: 14, l: 1, m: 46.5844, s: 0.02791, p3: 44.1, p15: 45.2, p50: 46.6, p85: 47.9, p97: 49.0, type: 'WHO标准' },
      { age: 15, l: 1, m: 46.806, s: 0.02792, p3: 44.3, p15: 45.5, p50: 46.8, p85: 48.2, p97: 49.3, type: 'WHO标准' },
      { age: 16, l: 1, m: 47.0088, s: 0.02795, p3: 44.5, p15: 45.6, p50: 47.0, p85: 48.4, p97: 49.5, type: 'WHO标准' },
      { age: 17, l: 1, m: 47.1962, s: 0.02797, p3: 44.7, p15: 45.8, p50: 47.2, p85: 48.6, p97: 49.7, type: 'WHO标准' },
      { age: 18, l: 1, m: 47.3711, s: 0.028, p3: 44.9, p15: 46.0, p50: 47.4, p85: 48.7, p97: 49.9, type: 'WHO标准' },
      { age: 19, l: 1, m: 47.5357, s: 0.02803, p3: 45.0, p15: 46.2, p50: 47.5, p85: 48.9, p97: 50.0, type: 'WHO标准' },
      { age: 20, l: 1, m: 47.6919, s: 0.02806, p3: 45.2, p15: 46.3, p50: 47.7, p85: 49.1, p97: 50.2, type: 'WHO标准' },
      { age: 21, l: 1, m: 47.8408, s: 0.0281, p3: 45.3, p15: 46.4, p50: 47.8, p85: 49.2, p97: 50.4, type: 'WHO标准' },
      { age: 22, l: 1, m: 47.9833, s: 0.02813, p3: 45.4, p15: 46.6, p50: 48.0, p85: 49.4, p97: 50.5, type: 'WHO标准' },
      { age: 23, l: 1, m: 48.1201, s: 0.02817, p3: 45.6, p15: 46.7, p50: 48.1, p85: 49.5, p97: 50.7, type: 'WHO标准' },
      { age: 24, l: 1, m: 48.2515, s: 0.02821, p3: 45.7, p15: 46.8, p50: 48.3, p85: 49.7, p97: 50.8, type: 'WHO标准' },
      { age: 25, l: 1, m: 48.3777, s: 0.02825, p3: 45.8, p15: 47.0, p50: 48.4, p85: 49.8, p97: 50.9, type: 'WHO标准' },
      { age: 26, l: 1, m: 48.4989, s: 0.0283, p3: 45.9, p15: 47.1, p50: 48.5, p85: 49.9, p97: 51.1, type: 'WHO标准' },
      { age: 27, l: 1, m: 48.6151, s: 0.02834, p3: 46.0, p15: 47.2, p50: 48.6, p85: 50.0, p97: 51.2, type: 'WHO标准' },
      { age: 28, l: 1, m: 48.7264, s: 0.02838, p3: 46.1, p15: 47.3, p50: 48.7, p85: 50.2, p97: 51.3, type: 'WHO标准' },
      { age: 29, l: 1, m: 48.8331, s: 0.02842, p3: 46.2, p15: 47.4, p50: 48.8, p85: 50.3, p97: 51.4, type: 'WHO标准' },
      { age: 30, l: 1, m: 48.9351, s: 0.02847, p3: 46.3, p15: 47.5, p50: 48.9, p85: 50.4, p97: 51.6, type: 'WHO标准' },
      { age: 31, l: 1, m: 49.0327, s: 0.02851, p3: 46.4, p15: 47.6, p50: 49.0, p85: 50.5, p97: 51.7, type: 'WHO标准' },
      { age: 32, l: 1, m: 49.126, s: 0.02855, p3: 46.5, p15: 47.7, p50: 49.1, p85: 50.6, p97: 51.8, type: 'WHO标准' },
      { age: 33, l: 1, m: 49.2153, s: 0.02859, p3: 46.6, p15: 47.8, p50: 49.2, p85: 50.7, p97: 51.9, type: 'WHO标准' },
      { age: 34, l: 1, m: 49.3007, s: 0.02863, p3: 46.6, p15: 47.8, p50: 49.3, p85: 50.8, p97: 52.0, type: 'WHO标准' },
      { age: 35, l: 1, m: 49.3826, s: 0.02867, p3: 46.7, p15: 47.9, p50: 49.4, p85: 50.8, p97: 52.0, type: 'WHO标准' },
      { age: 36, l: 1, m: 49.4612, s: 0.02871, p3: 46.8, p15: 48.0, p50: 49.5, p85: 50.9, p97: 52.1, type: 'WHO标准' },
      { age: 37, l: 1, m: 49.5367, s: 0.02875, p3: 46.9, p15: 48.1, p50: 49.5, p85: 51.0, p97: 52.2, type: 'WHO标准' },
      { age: 38, l: 1, m: 49.6093, s: 0.02878, p3: 46.9, p15: 48.1, p50: 49.6, p85: 51.1, p97: 52.3, type: 'WHO标准' },
      { age: 39, l: 1, m: 49.6791, s: 0.02882, p3: 47.0, p15: 48.2, p50: 49.7, p85: 51.2, p97: 52.4, type: 'WHO标准' },
      { age: 40, l: 1, m: 49.7465, s: 0.02886, p3: 47.0, p15: 48.3, p50: 49.7, p85: 51.2, p97: 52.4, type: 'WHO标准' },
      { age: 41, l: 1, m: 49.8116, s: 0.02889, p3: 47.1, p15: 48.3, p50: 49.8, p85: 51.3, p97: 52.5, type: 'WHO标准' },
      { age: 42, l: 1, m: 49.8745, s: 0.02893, p3: 47.2, p15: 48.4, p50: 49.9, p85: 51.4, p97: 52.6, type: 'WHO标准' },
      { age: 43, l: 1, m: 49.9354, s: 0.02896, p3: 47.2, p15: 48.4, p50: 49.9, p85: 51.4, p97: 52.7, type: 'WHO标准' },
      { age: 44, l: 1, m: 49.9942, s: 0.02899, p3: 47.3, p15: 48.5, p50: 50.0, p85: 51.5, p97: 52.7, type: 'WHO标准' },
      { age: 45, l: 1, m: 50.0512, s: 0.02903, p3: 47.3, p15: 48.5, p50: 50.1, p85: 51.6, p97: 52.8, type: 'WHO标准' },
      { age: 46, l: 1, m: 50.1064, s: 0.02906, p3: 47.4, p15: 48.6, p50: 50.1, p85: 51.6, p97: 52.8, type: 'WHO标准' },
      { age: 47, l: 1, m: 50.1598, s: 0.02909, p3: 47.4, p15: 48.6, p50: 50.2, p85: 51.7, p97: 52.9, type: 'WHO标准' },
      { age: 48, l: 1, m: 50.2115, s: 0.02912, p3: 47.5, p15: 48.7, p50: 50.2, p85: 51.7, p97: 53.0, type: 'WHO标准' },
      { age: 49, l: 1, m: 50.2617, s: 0.02915, p3: 47.5, p15: 48.7, p50: 50.3, p85: 51.8, p97: 53.0, type: 'WHO标准' },
      { age: 50, l: 1, m: 50.3105, s: 0.02918, p3: 47.5, p15: 48.8, p50: 50.3, p85: 51.8, p97: 53.1, type: 'WHO标准' },
      { age: 51, l: 1, m: 50.3578, s: 0.02921, p3: 47.6, p15: 48.8, p50: 50.4, p85: 51.9, p97: 53.1, type: 'WHO标准' },
      { age: 52, l: 1, m: 50.4039, s: 0.02924, p3: 47.6, p15: 48.9, p50: 50.4, p85: 51.9, p97: 53.2, type: 'WHO标准' },
      { age: 53, l: 1, m: 50.4488, s: 0.02927, p3: 47.7, p15: 48.9, p50: 50.4, p85: 52.0, p97: 53.2, type: 'WHO标准' },
      { age: 54, l: 1, m: 50.4926, s: 0.02929, p3: 47.7, p15: 49.0, p50: 50.5, p85: 52.0, p97: 53.3, type: 'WHO标准' },
      { age: 55, l: 1, m: 50.5354, s: 0.02932, p3: 47.7, p15: 49.0, p50: 50.5, p85: 52.1, p97: 53.3, type: 'WHO标准' },
      { age: 56, l: 1, m: 50.5772, s: 0.02935, p3: 47.8, p15: 49.0, p50: 50.6, p85: 52.1, p97: 53.4, type: 'WHO标准' },
      { age: 57, l: 1, m: 50.6183, s: 0.02938, p3: 47.8, p15: 49.1, p50: 50.6, p85: 52.2, p97: 53.4, type: 'WHO标准' },
      { age: 58, l: 1, m: 50.6587, s: 0.0294, p3: 47.9, p15: 49.1, p50: 50.7, p85: 52.2, p97: 53.5, type: 'WHO标准' },
      { age: 59, l: 1, m: 50.6984, s: 0.02943, p3: 47.9, p15: 49.2, p50: 50.7, p85: 52.2, p97: 53.5, type: 'WHO标准' },
      { age: 60, l: 1, m: 50.7375, s: 0.02946, p3: 47.9, p15: 49.2, p50: 50.7, p85: 52.3, p97: 53.5, type: 'WHO标准' }
    ],
    girlHeadCircDataWho: [ // 注意这里的 W 是大写
      { age: 0, l: 1, m: 33.8787, s: 0.03496, p3: 31.7, p15: 32.7, p50: 33.9, p85: 35.1, p97: 36.1, type: 'WHO标准' },
      { age: 1, l: 1, m: 36.5463, s: 0.03053, p3: 34.4, p15: 35.4, p50: 36.5, p85: 37.7, p97: 38.7, type: 'WHO标准' },
      { age: 2, l: 1, m: 38.2521, s: 0.02955, p3: 36.1, p15: 37.1, p50: 38.3, p85: 39.5, p97: 40.5, type: 'WHO标准' },
      { age: 3, l: 1, m: 39.5328, s: 0.0314, p3: 37.2, p15: 38.2, p50: 39.5, p85: 40.8, p97: 41.9, type: 'WHO标准' },
      { age: 4, l: 1, m: 40.5817, s: 0.03119, p3: 38.2, p15: 39.3, p50: 40.6, p85: 41.9, p97: 43.0, type: 'WHO标准' },
      { age: 5, l: 1, m: 41.459, s: 0.03102, p3: 39.0, p15: 40.1, p50: 41.5, p85: 42.8, p97: 43.9, type: 'WHO标准' },
      { age: 6, l: 1, m: 42.1995, s: 0.03087, p3: 39.7, p15: 40.8, p50: 42.2, p85: 43.5, p97: 44.6, type: 'WHO标准' },
      { age: 7, l: 1, m: 42.829, s: 0.03075, p3: 40.4, p15: 41.5, p50: 42.8, p85: 44.2, p97: 45.3, type: 'WHO标准' },
      { age: 8, l: 1, m: 43.3671, s: 0.03063, p3: 40.9, p15: 42.0, p50: 43.4, p85: 44.7, p97: 45.9, type: 'WHO标准' },
      { age: 9, l: 1, m: 43.83, s: 0.03053, p3: 41.3, p15: 42.4, p50: 43.8, p85: 45.2, p97: 46.3, type: 'WHO标准' },
      { age: 10, l: 1, m: 44.2319, s: 0.03044, p3: 41.7, p15: 42.8, p50: 44.2, p85: 45.6, p97: 46.8, type: 'WHO标准' },
      { age: 11, l: 1, m: 44.5844, s: 0.03035, p3: 42.0, p15: 43.2, p50: 44.6, p85: 46.0, p97: 47.1, type: 'WHO标准' },
      { age: 12, l: 1, m: 44.8965, s: 0.03027, p3: 42.3, p15: 43.5, p50: 44.9, p85: 46.3, p97: 47.5, type: 'WHO标准' },
      { age: 13, l: 1, m: 45.1752, s: 0.03019, p3: 42.6, p15: 43.8, p50: 45.2, p85: 46.6, p97: 47.7, type: 'WHO标准' },
      { age: 14, l: 1, m: 45.4265, s: 0.03012, p3: 42.9, p15: 44.0, p50: 45.4, p85: 46.8, p97: 48.0, type: 'WHO标准' },
      { age: 15, l: 1, m: 45.6551, s: 0.03006, p3: 43.1, p15: 44.2, p50: 45.7, p85: 47.1, p97: 48.2, type: 'WHO标准' },
      { age: 16, l: 1, m: 45.865, s: 0.02999, p3: 43.3, p15: 44.4, p50: 45.9, p85: 47.3, p97: 48.5, type: 'WHO标准' },
      { age: 17, l: 1, m: 46.0598, s: 0.02993, p3: 43.5, p15: 44.6, p50: 46.1, p85: 47.5, p97: 48.7, type: 'WHO标准' },
      { age: 18, l: 1, m: 46.2424, s: 0.02987, p3: 43.6, p15: 44.8, p50: 46.2, p85: 47.7, p97: 48.8, type: 'WHO标准' },
      { age: 19, l: 1, m: 46.4152, s: 0.02982, p3: 43.8, p15: 45.0, p50: 46.4, p85: 47.8, p97: 49.0, type: 'WHO标准' },
      { age: 20, l: 1, m: 46.5801, s: 0.02977, p3: 44.0, p15: 45.1, p50: 46.6, p85: 48.0, p97: 49.2, type: 'WHO标准' },
      { age: 21, l: 1, m: 46.7384, s: 0.02972, p3: 44.1, p15: 45.3, p50: 46.7, p85: 48.2, p97: 49.4, type: 'WHO标准' },
      { age: 22, l: 1, m: 46.8913, s: 0.02967, p3: 44.3, p15: 45.4, p50: 46.9, p85: 48.3, p97: 49.5, type: 'WHO标准' },
      { age: 23, l: 1, m: 47.0391, s: 0.02962, p3: 44.4, p15: 45.6, p50: 47.0, p85: 48.5, p97: 49.7, type: 'WHO标准' },
      { age: 24, l: 1, m: 47.1822, s: 0.02957, p3: 44.6, p15: 45.7, p50: 47.2, p85: 48.6, p97: 49.8, type: 'WHO标准' },
      { age: 25, l: 1, m: 47.3204, s: 0.02953, p3: 44.7, p15: 45.9, p50: 47.3, p85: 48.8, p97: 49.9, type: 'WHO标准' },
      { age: 26, l: 1, m: 47.4536, s: 0.02949, p3: 44.8, p15: 46.0, p50: 47.5, p85: 48.9, p97: 50.1, type: 'WHO标准' },
      { age: 27, l: 1, m: 47.5817, s: 0.02945, p3: 44.9, p15: 46.1, p50: 47.6, p85: 49.0, p97: 50.2, type: 'WHO标准' },
      { age: 28, l: 1, m: 47.7045, s: 0.02941, p3: 45.1, p15: 46.3, p50: 47.7, p85: 49.2, p97: 50.3, type: 'WHO标准' },
      { age: 29, l: 1, m: 47.8219, s: 0.02937, p3: 45.2, p15: 46.4, p50: 47.8, p85: 49.3, p97: 50.5, type: 'WHO标准' },
      { age: 30, l: 1, m: 47.934, s: 0.02933, p3: 45.3, p15: 46.5, p50: 47.9, p85: 49.4, p97: 50.6, type: 'WHO标准' },
      { age: 31, l: 1, m: 48.041, s: 0.02929, p3: 45.4, p15: 46.6, p50: 48.0, p85: 49.5, p97: 50.7, type: 'WHO标准' },
      { age: 32, l: 1, m: 48.1432, s: 0.02926, p3: 45.5, p15: 46.7, p50: 48.1, p85: 49.6, p97: 50.8, type: 'WHO标准' },
      { age: 33, l: 1, m: 48.2408, s: 0.02922, p3: 45.6, p15: 46.8, p50: 48.2, p85: 49.7, p97: 50.9, type: 'WHO标准' },
      { age: 34, l: 1, m: 48.3343, s: 0.02919, p3: 45.7, p15: 46.9, p50: 48.3, p85: 49.8, p97: 51.0, type: 'WHO标准' },
      { age: 35, l: 1, m: 48.4239, s: 0.02915, p3: 45.8, p15: 47.0, p50: 48.4, p85: 49.9, p97: 51.1, type: 'WHO标准' },
      { age: 36, l: 1, m: 48.5099, s: 0.02912, p3: 45.9, p15: 47.0, p50: 48.5, p85: 50.0, p97: 51.2, type: 'WHO标准' },
      { age: 37, l: 1, m: 48.5926, s: 0.02909, p3: 45.9, p15: 47.1, p50: 48.6, p85: 50.1, p97: 51.3, type: 'WHO标准' },
      { age: 38, l: 1, m: 48.6722, s: 0.02906, p3: 46.0, p15: 47.2, p50: 48.7, p85: 50.1, p97: 51.3, type: 'WHO标准' },
      { age: 39, l: 1, m: 48.7489, s: 0.02903, p3: 46.1, p15: 47.3, p50: 48.7, p85: 50.2, p97: 51.4, type: 'WHO标准' },
      { age: 40, l: 1, m: 48.8228, s: 0.029, p3: 46.2, p15: 47.4, p50: 48.8, p85: 50.3, p97: 51.5, type: 'WHO标准' },
      { age: 41, l: 1, m: 48.8941, s: 0.02897, p3: 46.2, p15: 47.4, p50: 48.9, p85: 50.4, p97: 51.6, type: 'WHO标准' },
      { age: 42, l: 1, m: 48.9629, s: 0.02894, p3: 46.3, p15: 47.5, p50: 49.0, p85: 50.4, p97: 51.6, type: 'WHO标准' },
      { age: 43, l: 1, m: 49.0294, s: 0.02891, p3: 46.4, p15: 47.6, p50: 49.0, p85: 50.5, p97: 51.7, type: 'WHO标准' },
      { age: 44, l: 1, m: 49.0937, s: 0.02888, p3: 46.4, p15: 47.6, p50: 49.1, p85: 50.6, p97: 51.8, type: 'WHO标准' },
      { age: 45, l: 1, m: 49.156, s: 0.02886, p3: 46.5, p15: 47.7, p50: 49.2, p85: 50.6, p97: 51.8, type: 'WHO标准' },
      { age: 46, l: 1, m: 49.2164, s: 0.02883, p3: 46.5, p15: 47.7, p50: 49.2, p85: 50.7, p97: 51.9, type: 'WHO标准' },
      { age: 47, l: 1, m: 49.2751, s: 0.0288, p3: 46.6, p15: 47.8, p50: 49.3, p85: 50.7, p97: 51.9, type: 'WHO标准' },
      { age: 48, l: 1, m: 49.3321, s: 0.02878, p3: 46.7, p15: 47.9, p50: 49.3, p85: 50.8, p97: 52.0, type: 'WHO标准' },
      { age: 49, l: 1, m: 49.3877, s: 0.02875, p3: 46.7, p15: 47.9, p50: 49.4, p85: 50.9, p97: 52.1, type: 'WHO标准' },
      { age: 50, l: 1, m: 49.4419, s: 0.02873, p3: 46.8, p15: 48.0, p50: 49.4, p85: 50.9, p97: 52.1, type: 'WHO标准' },
      { age: 51, l: 1, m: 49.4947, s: 0.0287, p3: 46.8, p15: 48.0, p50: 49.5, p85: 51.0, p97: 52.2, type: 'WHO标准' },
      { age: 52, l: 1, m: 49.5464, s: 0.02868, p3: 46.9, p15: 48.1, p50: 49.5, p85: 51.0, p97: 52.2, type: 'WHO标准' },
      { age: 53, l: 1, m: 49.5969, s: 0.02865, p3: 46.9, p15: 48.1, p50: 49.6, p85: 51.1, p97: 52.3, type: 'WHO标准' },
      { age: 54, l: 1, m: 49.6464, s: 0.02863, p3: 47.0, p15: 48.2, p50: 49.6, p85: 51.1, p97: 52.3, type: 'WHO标准' },
      { age: 55, l: 1, m: 49.6947, s: 0.02861, p3: 47.0, p15: 48.2, p50: 49.7, p85: 51.2, p97: 52.4, type: 'WHO标准' },
      { age: 56, l: 1, m: 49.7421, s: 0.02859, p3: 47.1, p15: 48.3, p50: 49.7, p85: 51.2, p97: 52.4, type: 'WHO标准' },
      { age: 57, l: 1, m: 49.7885, s: 0.02856, p3: 47.1, p15: 48.3, p50: 49.8, p85: 51.3, p97: 52.5, type: 'WHO标准' },
      { age: 58, l: 1, m: 49.8341, s: 0.02854, p3: 47.2, p15: 48.4, p50: 49.8, p85: 51.3, p97: 52.5, type: 'WHO标准' },
      { age: 59, l: 1, m: 49.8789, s: 0.02852, p3: 47.2, p15: 48.4, p50: 49.9, p85: 51.4, p97: 52.6, type: 'WHO标准' },
      { age: 60, l: 1, m: 49.9229, s: 0.0285, p3: 47.2, p15: 48.4, p50: 49.9, p85: 51.4, p97: 52.6, type: 'WHO标准' }
    ],
    boyHeadCircDataFenton: [
      { age: 22, p3: 19, p10: 19.8, p50: 21.2, p90: 23, p97: 23.5, type: 'Fenton标准' },
      { age: 24, p3: 19.5, p10: 20.1, p50: 21.8, p90: 23.3, p97: 24, type: 'Fenton标准' },
      { age: 26, p3: 21, p10: 22, p50: 23.8, p90: 25.2, p97: 26, type: 'Fenton标准' },
      { age: 28, p3: 23, p10: 24, p50: 25.5, p90: 27.4, p97: 28, type: 'Fenton标准' },
      { age: 30, p3: 25, p10: 25.9, p50: 26.8, p90: 29.5, p97: 30.1, type: 'Fenton标准' },
      { age: 32, p3: 26.8, p10: 27.5, p50: 29.4, p90: 31.1, p97: 32, type: 'Fenton标准' },
      { age: 34, p3: 28.2, p10: 29, p50: 31, p90: 33, p97: 34, type: 'Fenton标准' },
      { age: 36, p3: 30, p10: 30.8, p50: 32.8, p90: 34.6, p97: 35.5, type: 'Fenton标准' },
      { age: 38, p3: 31, p10: 32, p50: 34, p90: 35.8, p97: 36.8, type: 'Fenton标准' },
      { age: 40, p3: 32.2, p10: 33.1, p50: 35, p90: 37, p97: 37.8, type: 'Fenton标准' },
      { age: 42, p3: 33.4, p10: 34.2, p50: 36, p90: 37.8, p97: 38.8, type: 'Fenton标准' },
      { age: 44, p3: 34.5, p10: 35.2, p50: 37, p90: 38.8, p97: 39.9, type: 'Fenton标准' },
      { age: 46, p3: 35.2, p10: 36.1, p50: 38, p90: 39.8, p97: 40.5, type: 'Fenton标准' },
      { age: 48, p3: 36.5, p10: 37, p50: 38.8, p90: 40.2, p97: 41, type: 'Fenton标准' },
      { age: 50, p3: 37, p10: 38, p50: 39.5, p90: 41, p97: 41.8, type: 'Fenton标准' }
    ],
    girlHeadCircDataFenton: [
      { age: 22, p3: 18.5, p10: 19.4, p50: 21, p90: 22.2, p97: 23, type: 'Fenton标准' },
      { age: 24, p3: 19, p10: 20, p50: 21.2, p90: 23, p97: 23.5, type: 'Fenton标准' },
      { age: 26, p3: 20.5, p10: 21.5, p50: 23, p90: 25, p97: 25.8, type: 'Fenton标准' },
      { age: 28, p3: 22.5, p10: 23, p50: 25, p90: 27, p97: 28, type: 'Fenton标准' },
      { age: 30, p3: 24, p10: 25, p50: 27, p90: 28.8, p97: 30, type: 'Fenton标准' },
      { age: 32, p3: 26, p10: 27, p50: 29, p90: 31, p97: 31.8, type: 'Fenton标准' },
      { age: 34, p3: 28, p10: 28.8, p50: 30.5, p90: 31.5, p97: 32.5, type: 'Fenton标准' },
      { age: 36, p3: 29.5, p10: 30.2, p50: 32.1, p90: 34, p97: 35, type: 'Fenton标准' },
      { age: 38, p3: 31, p10: 32, p50: 33.8, p90: 35.2, p97: 36.3, type: 'Fenton标准' },
      { age: 40, p3: 32, p10: 33, p50: 34.8, p90: 36.5, p97: 37.2, type: 'Fenton标准' },
      { age: 42, p3: 33, p10: 34, p50: 35.8, p90: 37.2, p97: 38, type: 'Fenton标准' },
      { age: 44, p3: 34, p10: 35, p50: 36.5, p90: 38, p97: 39, type: 'Fenton标准' },
      { age: 46, p3: 35, p10: 35.8, p50: 37.2, p90: 39, p97: 39.8, type: 'Fenton标准' },
      { age: 48, p3: 35.8, p10: 36.5, p50: 38, p90: 39.6, p97: 40.2, type: 'Fenton标准' },
      { age: 50, p3: 36.1, p10: 37, p50: 38.8, p90: 40, p97: 41, type: 'Fenton标准' }
    ],
    growthRecords: [], // 生长记录数据
    newRecord: {
      date: '',
      headCircumference: ''
    },
    showAddForm: false
  },
  onLoad: function (options) {
    console.log('头围图表页面加载中...');
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      canvasWidth: systemInfo.windowWidth,
      canvasHeight: systemInfo.windowHeight * 0.7
    });

    const childId = options.childId || 'default';
    this.setData({ childId });

    // Load child info and growth records
    const childInfo = wx.getStorageSync('childInfo') || [];
    let currentChild = {};

    if (childId !== 'default') {
      for (let child of childInfo) {
        if (child.id && child.id.toString() === childId) {
          currentChild = child;
          break;
        }
      }
    } else if (childInfo.length > 0) {
      currentChild = childInfo[0];
    }

    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

    let growthRecords = [];
    if (currentChild && (currentChild.id || currentChild.name)) {
      const storageKey = currentChild.id ? `growthRecords_${currentChild.id}` : `growthRecords_${currentChild.name}`;
      growthRecords = wx.getStorageSync(storageKey) || [];
      
      // 数据迁移：如果使用ID作为键但没有数据，尝试从旧的姓名键加载
      if (growthRecords.length === 0 && currentChild.id && currentChild.name) {
        const oldStorageKey = `growthRecords_${currentChild.name}`;
        const oldGrowthRecords = wx.getStorageSync(oldStorageKey) || [];
        if (oldGrowthRecords.length > 0) {
          wx.setStorageSync(storageKey, oldGrowthRecords);
          wx.removeStorageSync(oldStorageKey);
          growthRecords = oldGrowthRecords;
        }
      }
    }

    this.setData({
      currentGender: 'boy',
      currentStandard: 'WHO',
      childId: childId,
      childInfo: currentChild,
      growthRecords: growthRecords,
      'newRecord.date': dateStr
    }, () => {
      if (this.chart) {
        this.updateChart();
      }
    });
  },

  onReady() {
    this.setData({
      ec: {
        onInit: this.initChart.bind(this)
      }
    });
  },

  initChart(canvas, width, height, dpr) {
    if (!canvas) {
      console.error('canvas 上下文获取失败');
      return null;
    }

    const chart = echarts.init(canvas, null, {
      width: width,
      height: height,
      devicePixelRatio: dpr
    });

    canvas.setChart(chart);
    this.chart = chart;

    // 立即更新图表数据
    this.updateChart();

    return chart;
  },

  // 添加这个方法
  switchToBoyWHO() {
    this.setData({
      currentGender: 'boy',
    }, () => {
      this.updateChart();
    });
  },

  switchToGirlWHO() {
    this.setData({
      currentGender: 'girl',
    }, () => {
      console.log('切换到女孩WHO曲线');
      this.updateChart();
    });
  },
  switchToWHO() {
    // 保持当前性别不变，只切换标准
    this.setData({
      currentStandard: 'WHO'
    }, () => {
      console.log('切换到WHO曲线');

      this.updateChart();
    });
  },
  // 修改switchToFenton方法
  switchToFenton() {
    // 保持当前性别不变，只切换标准
    this.setData({
      currentStandard: 'Fenton'
    }, () => {
      console.log('切换到Fenton曲线');

      this.updateChart();
    });
  },

  updateChart() {
    // 确保图表实例存在
    if (!this.chart) {
      console.error('图表未初始化');
      return;
    }

    // 检查必要的数据是否已初始化
    if (!this.data.currentGender || !this.data.currentStandard) {
      console.log('等待数据初始化...');
      return;
    }

    const { currentGender, currentStandard, growthRecords } = this.data;
    let chartData;
    let xAxisLabel = '月龄（月）';
    const genderPrefix = currentGender === 'boy' ? '男孩' : '女孩';

    if (currentStandard === 'WHO') {
      chartData = currentGender === 'boy' ? this.data.boyHeadCircumferenceDataWho : this.data.girlHeadCircumferenceDataWho;
    } else {
      chartData = currentGender === 'boy' ? this.data.boyHeadCircDataFenton : this.data.girlHeadCircDataFenton;
      xAxisLabel = '孕周（周）';
    }

    // 确保数据存在
    if (!chartData || !Array.isArray(chartData)) {
      console.error('图表数据未正确初始化');
      return;
    }

    // Define legendData and legendSelected before using them
    let legendData, legendSelected = {};
    if (currentStandard === 'WHO') {
      legendData = [`${genderPrefix}P3`, `${genderPrefix}P15`, `${genderPrefix}P50`, `${genderPrefix}P85`, `${genderPrefix}P97`];
    } else {
      legendData = [`${genderPrefix}P3`, `${genderPrefix}P10`, `${genderPrefix}P50`, `${genderPrefix}P90`, `${genderPrefix}P97`];
    }
    legendData.forEach(name => legendSelected[name] = true);
    console.log('Current Standard:', currentStandard);
    console.log('Growth Records before filtering:', growthRecords);
    // 过滤并格式化用户生长记录数据
    const userGrowthData = growthRecords
      .filter(record => {
        // 确保记录包含头围数据且不为空
        if (record.headCircumference === undefined || record.headCircumference === null || record.headCircumference === '') {
          return false;
        }
        if (currentStandard === 'WHO') {
          // WHO标准只使用月龄数据，并且月龄必须大于等于0
          return record.ageInMonths !== undefined &&
            record.ageInMonths !== null &&
            record.ageInMonths >= 0 &&
            (record.ageInWeeks === undefined || record.ageInWeeks === null); // 确保不是周龄数据
        } else {
          // Fenton标准只使用周龄数据，并且周龄必须大于等于22
          return record.ageInWeeks !== undefined &&
            record.ageInWeeks !== null &&
            record.ageInWeeks >= 22 &&
            (record.ageInMonths === undefined || record.ageInMonths === null); // 确保不是月龄数据
        }
      })
      // 构建 series 数组，包含标准曲线和用户数据
      .map(record => {
        const age = currentStandard === 'WHO' ? record.ageInMonths : record.ageInWeeks;
        const headCircumference = record.headCircumference;
        return [age, headCircumference];
      });
    const series = [
      {
        name: `${genderPrefix}P3`, // 动态 series 名称
        type: 'line',
        smooth: true,
        data: chartData.map(item => [item.age, item.p3])
      },
      {
        name: `${genderPrefix}${currentStandard === 'WHO' ? 'P15' : 'P10'}`, // 动态 series 名称
        type: 'line',
        smooth: true,
        data: chartData.map(item => [item.age, currentStandard === 'WHO' ? item.p15 : item.p10])
      },
      {
        name: `${genderPrefix}P50`, // 动态 series 名称
        type: 'line',
        smooth: true,
        data: chartData.map(item => [item.age, item.p50])
      },
      {
        name: `${genderPrefix}${currentStandard === 'WHO' ? 'P85' : 'P90'}`, // 动态 series 名称
        type: 'line',
        smooth: true,
        data: chartData.map(item => [item.age, currentStandard === 'WHO' ? item.p85 : item.p90])
      },
      {
        name: `${genderPrefix}P97`, // 动态 series 名称
        type: 'line',
        smooth: true,
        data: chartData.map(item => [item.age, item.p97])
      }
    ];

    // 添加用户数据系列
    if (userGrowthData.length > 0) {
      const userSeriesName = '我的数据';
      legendData.push(userSeriesName);
      legendSelected[userSeriesName] = true;

      const userSeries = {
        name: userSeriesName,
        type: 'line',
        smooth: true, // 使用散点图表示用户数据点
        data: userGrowthData,
        symbolSize: 8,
        itemStyle: {
          color: '#FF0000' // 用户数据点颜色，例如红色
        }
      };
      series.push(userSeries); // 将用户数据系列添加到标准曲线系列之后
    }

    // 声明并配置 option 对象
    const option = {
      title: {
        text: `头围生长曲线（${currentStandard}标准）`, // 动态标题
        left: 'center',
        textStyle: {
          fontSize: 14
        }
      },
      tooltip: {
        trigger: 'axis',
        formatter: function (params) {
          let tooltipContent = '';
          params.forEach((item, index) => {
            if (index > 0) {
              tooltipContent += '\n'; // 每个数据项之前添加换行
            }
            if (item.seriesName === '我的数据') {
              tooltipContent += `${item.seriesName}: ${item.value[1]} cm (年龄: ${item.value[0]}${currentStandard === 'WHO' ? '月' : '周'})`;
            } else {
              tooltipContent += `${item.seriesName}: ${item.value[1]} cm (年龄: ${item.value[0]}${currentStandard === 'WHO' ? '月' : '周'})`;
            }
          });
          return tooltipContent;
        }
      },
      legend: {
        data: legendData, // 使用动态生成的 legend data
        top: 30,
        textStyle: {
          fontSize: 10
        },
        selected: legendSelected // 使用动态生成的 selected 状态
      },
      grid: {
        left: '10%',
        right: '4%',
        bottom: '10%',
        top: '25%',
        containLabel: true
      },
      dataZoom: [
        {
          type: 'inside', // 内置型数据区域缩放
          xAxisIndex: [0], // 作用于第一个 xAxis
          filterMode: 'weakFilter' // 过滤模式
        },
        {
          type: 'inside', // 内置型数据区域缩放
          yAxisIndex: [0], // 作用于第一个 yAxis
          filterMode: 'weakFilter' // 过滤模式
        }
      ],
      xAxis: {
        type: 'value',
        name: xAxisLabel,
        min: currentStandard === 'WHO' ? 0 : 0, // <-- **请确保这里根据标准动态设置了最小值**
        max: currentStandard === 'WHO' ? 60 : 40, // <-- **请确保这里根据标准动态设置了最大值**
        interval: currentStandard === 'WHO' ? 6 : 2, // <-- **请确保这里根据标准动态设置了间隔**
        nameTextStyle: {
          fontSize: 12
        },
        axisLabel: {
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        name: '头围（cm）',
        min: currentStandard === 'WHO' ? 0 : 0, // WHO标准最小30，Fenton最小20
        max: currentStandard === 'WHO' ? 55 : 45, // WHO标准最大55，Fenton最大45
        interval: currentStandard === 'WHO' ? 5 : 5, // 两个标准间隔都是5
        nameTextStyle: {
          fontSize: 12
        },
        axisLabel: {
          fontSize: 10
        }
      },
      series: series // 使用构建好的 series 数组
    };

    // 使用 this.chart 而不是 chart
    if (this.chart) {
     this.chart.setOption(option);
    }
  },
  // ... existing code ...

  navigateBack: function () {
    wx.navigateBack();
  }
});


// 返回上一页








