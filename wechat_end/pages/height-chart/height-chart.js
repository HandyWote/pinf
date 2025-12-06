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
    boyHeightDataWho: [
        // 0-24 months data from the first file
        { age: 0, l: 1, m: 49.8842, s: 0.03795, p3: 46.3, p15: 47.9, p50: 49.9, p85: 51.8, p97: 53.4, type: 'WHO标准' },
        { age: 1, l: 1, m: 54.7244, s: 0.03557, p3: 51.1, p15: 52.7, p50: 54.7, p85: 56.7, p97: 58.4, type: 'WHO标准' },
        { age: 2, l: 1, m: 58.4249, s: 0.03424, p3: 54.7, p15: 56.4, p50: 58.4, p85: 60.5, p97: 62.2, type: 'WHO标准' },
        { age: 3, l: 1, m: 61.4292, s: 0.03328, p3: 57.6, p15: 59.3, p50: 61.4, p85: 63.5, p97: 65.3, type: 'WHO标准' },
        { age: 4, l: 1, m: 63.886, s: 0.03257, p3: 60.0, p15: 61.7, p50: 63.9, p85: 66.0, p97: 67.8, type: 'WHO标准' },
        { age: 5, l: 1, m: 65.9026, s: 0.03204, p3: 61.9, p15: 63.7, p50: 65.9, p85: 68.1, p97: 69.9, type: 'WHO标准' },
        { age: 6, l: 1, m: 67.6236, s: 0.03165, p3: 63.6, p15: 65.4, p50: 67.6, p85: 69.8, p97: 71.6, type: 'WHO标准' },
        { age: 7, l: 1, m: 69.1645, s: 0.03139, p3: 65.1, p15: 66.9, p50: 69.2, p85: 71.4, p97: 73.2, type: 'WHO标准' },
        { age: 8, l: 1, m: 70.5994, s: 0.03124, p3: 66.5, p15: 68.3, p50: 70.6, p85: 72.9, p97: 74.7, type: 'WHO标准' },
        { age: 9, l: 1, m: 71.9687, s: 0.03117, p3: 67.7, p15: 69.6, p50: 72.0, p85: 74.3, p97: 76.2, type: 'WHO标准' },
        { age: 10, l: 1, m: 73.2812, s: 0.03118, p3: 69.0, p15: 70.9, p50: 73.3, p85: 75.6, p97: 77.6, type: 'WHO标准' },
        { age: 11, l: 1, m: 74.5388, s: 0.03125, p3: 70.2, p15: 72.1, p50: 74.5, p85: 77.0, p97: 78.9, type: 'WHO标准' },
        { age: 12, l: 1, m: 75.7488, s: 0.03137, p3: 71.3, p15: 73.3, p50: 75.7, p85: 78.2, p97: 80.2, type: 'WHO标准' },
        { age: 13, l: 1, m: 76.9186, s: 0.03154, p3: 72.4, p15: 74.4, p50: 76.9, p85: 79.4, p97: 81.5, type: 'WHO标准' },
        { age: 14, l: 1, m: 78.0497, s: 0.03174, p3: 73.4, p15: 75.5, p50: 78.0, p85: 80.6, p97: 82.7, type: 'WHO标准' },
        { age: 15, l: 1, m: 79.1458, s: 0.03197, p3: 74.4, p15: 76.5, p50: 79.1, p85: 81.8, p97: 83.9, type: 'WHO标准' },
        { age: 16, l: 1, m: 80.2113, s: 0.03222, p3: 75.4, p15: 77.5, p50: 80.2, p85: 82.9, p97: 85.1, type: 'WHO标准' },
        { age: 17, l: 1, m: 81.2487, s: 0.0325, p3: 76.3, p15: 78.5, p50: 81.2, p85: 84.0, p97: 86.2, type: 'WHO标准' },
        { age: 18, l: 1, m: 82.2587, s: 0.03279, p3: 77.2, p15: 79.5, p50: 82.3, p85: 85.1, p97: 87.3, type: 'WHO标准' },
        { age: 19, l: 1, m: 83.2418, s: 0.0331, p3: 78.1, p15: 80.4, p50: 83.2, p85: 86.1, p97: 88.4, type: 'WHO标准' },
        { age: 20, l: 1, m: 84.1996, s: 0.03342, p3: 78.9, p15: 81.3, p50: 84.2, p85: 87.1, p97: 89.5, type: 'WHO标准' },
        { age: 21, l: 1, m: 85.1348, s: 0.03376, p3: 79.7, p15: 82.2, p50: 85.1, p85: 88.1, p97: 90.5, type: 'WHO标准' },
        { age: 22, l: 1, m: 86.0477, s: 0.0341, p3: 80.5, p15: 83.0, p50: 86.0, p85: 89.1, p97: 91.6, type: 'WHO标准' },
        { age: 23, l: 1, m: 86.941, s: 0.03445, p3: 81.3, p15: 83.8, p50: 86.9, p85: 90.0, p97: 92.6, type: 'WHO标准' },
        { age: 24, l: 1, m: 87.8161, s: 0.03479, p3: 82.1, p15: 84.6, p50: 87.8, p85: 91.0, p97: 93.6, type: 'WHO标准' },
  
        // 24-60 months data from the second file
        { age: 25, l: 1, m: 87.972, s: 0.03542, p3: 82.1, p15: 84.7, p50: 88.0, p85: 91.2, p97: 93.8, type: 'WHO标准' },
        { age: 26, l: 1, m: 88.8065, s: 0.03576, p3: 82.8, p15: 85.5, p50: 88.8, p85: 92.1, p97: 94.8, type: 'WHO标准' },
        { age: 27, l: 1, m: 89.6197, s: 0.0361, p3: 83.5, p15: 86.3, p50: 89.6, p85: 93.0, p97: 95.7, type: 'WHO标准' },
        { age: 28, l: 1, m: 90.412, s: 0.03642, p3: 84.2, p15: 87.0, p50: 90.4, p85: 93.8, p97: 96.6, type: 'WHO标准' },
        { age: 29, l: 1, m: 91.1828, s: 0.03674, p3: 84.9, p15: 87.7, p50: 91.2, p85: 94.7, p97: 97.5, type: 'WHO标准' },
        { age: 30, l: 1, m: 91.9327, s: 0.03704, p3: 85.5, p15: 88.4, p50: 91.9, p85: 95.5, p97: 98.3, type: 'WHO标准' },
        { age: 31, l: 1, m: 92.6631, s: 0.03733, p3: 86.2, p15: 89.1, p50: 92.7, p85: 96.2, p97: 99.2, type: 'WHO标准' },
        { age: 32, l: 1, m: 93.3753, s: 0.03761, p3: 86.8, p15: 89.7, p50: 93.4, p85: 97.0, p97: 100.0, type: 'WHO标准' },
        { age: 33, l: 1, m: 94.0711, s: 0.03787, p3: 87.4, p15: 90.4, p50: 94.1, p85: 97.8, p97: 100.8, type: 'WHO标准' },
        { age: 34, l: 1, m: 94.7532, s: 0.03812, p3: 88.0, p15: 91.0, p50: 94.8, p85: 98.5, p97: 101.5, type: 'WHO标准' },
        { age: 35, l: 1, m: 95.4236, s: 0.03836, p3: 88.5, p15: 91.6, p50: 95.4, p85: 99.2, p97: 102.3, type: 'WHO标准' },
        { age: 36, l: 1, m: 96.0835, s: 0.03858, p3: 89.1, p15: 92.2, p50: 96.1, p85: 99.9, p97: 103.1, type: 'WHO标准' },
        { age: 37, l: 1, m: 96.7337, s: 0.03879, p3: 89.7, p15: 92.8, p50: 96.7, p85: 100.6, p97: 103.8, type: 'WHO标准' },
        { age: 38, l: 1, m: 97.3749, s: 0.039, p3: 90.2, p15: 93.4, p50: 97.4, p85: 101.3, p97: 104.5, type: 'WHO标准' },
        { age: 39, l: 1, m: 98.0073, s: 0.03919, p3: 90.8, p15: 94.0, p50: 98.0, p85: 102.0, p97: 105.2, type: 'WHO标准' },
        { age: 40, l: 1, m: 98.631, s: 0.03937, p3: 91.3, p15: 94.6, p50: 98.6, p85: 102.7, p97: 105.9, type: 'WHO标准' },
        { age: 41, l: 1, m: 99.2459, s: 0.03954, p3: 91.9, p15: 95.2, p50: 99.2, p85: 103.3, p97: 106.6, type: 'WHO标准' },
        { age: 42, l: 1, m: 99.8515, s: 0.03971, p3: 92.4, p15: 95.7, p50: 99.9, p85: 104.0, p97: 107.3, type: 'WHO标准' },
        { age: 43, l: 1, m: 100.4485, s: 0.03986, p3: 92.9, p15: 96.3, p50: 100.4, p85: 104.6, p97: 108.0, type: 'WHO标准' },
        { age: 44, l: 1, m: 101.0374, s: 0.04002, p3: 93.4, p15: 96.8, p50: 101.0, p85: 105.2, p97: 108.6, type: 'WHO标准' },
        { age: 45, l: 1, m: 101.6186, s: 0.04016, p3: 93.9, p15: 97.4, p50: 101.6, p85: 105.8, p97: 109.3, type: 'WHO标准' },
        { age: 46, l: 1, m: 102.1933, s: 0.04031, p3: 94.4, p15: 97.9, p50: 102.2, p85: 106.5, p97: 109.9, type: 'WHO标准' },
        { age: 47, l: 1, m: 102.7625, s: 0.04045, p3: 94.9, p15: 98.5, p50: 102.8, p85: 107.1, p97: 110.6, type: 'WHO标准' },
        { age: 48, l: 1, m: 103.3273, s: 0.04059, p3: 95.4, p15: 99.0, p50: 103.3, p85: 107.7, p97: 111.2, type: 'WHO标准' },
        { age: 49, l: 1, m: 103.8886, s: 0.04073, p3: 95.9, p15: 99.5, p50: 103.9, p85: 108.3, p97: 111.8, type: 'WHO标准' },
        { age: 50, l: 1, m: 104.4473, s: 0.04086, p3: 96.4, p15: 100.0, p50: 104.4, p85: 108.9, p97: 112.5, type: 'WHO标准' },
        { age: 51, l: 1, m: 105.0041, s: 0.041, p3: 96.9, p15: 100.5, p50: 105.0, p85: 109.5, p97: 113.1, type: 'WHO标准' },
        { age: 52, l: 1, m: 105.5596, s: 0.04113, p3: 97.4, p15: 101.1, p50: 105.6, p85: 110.1, p97: 113.7, type: 'WHO标准' },
        { age: 53, l: 1, m: 106.1138, s: 0.04126, p3: 97.9, p15: 101.6, p50: 106.1, p85: 110.7, p97: 114.3, type: 'WHO标准' },
        { age: 54, l: 1, m: 106.6668, s: 0.04139, p3: 98.4, p15: 102.1, p50: 106.7, p85: 111.2, p97: 115.0, type: 'WHO标准' },
        { age: 55, l: 1, m: 107.2188, s: 0.04152, p3: 98.8, p15: 102.6, p50: 107.2, p85: 111.8, p97: 115.6, type: 'WHO标准' },
        { age: 56, l: 1, m: 107.7697, s: 0.04165, p3: 99.3, p15: 103.1, p50: 107.8, p85: 112.4, p97: 116.2, type: 'WHO标准' },
        { age: 57, l: 1, m: 108.3198, s: 0.04177, p3: 99.8, p15: 103.6, p50: 108.3, p85: 113.0, p97: 116.8, type: 'WHO标准' },
        { age: 58, l: 1, m: 108.8689, s: 0.0419, p3: 100.3, p15: 104.1, p50: 108.9, p85: 113.6, p97: 117.4, type: 'WHO标准' },
        { age: 59, l: 1, m: 109.417, s: 0.04202, p3: 100.8, p15: 104.7, p50: 109.4, p85: 114.2, p97: 118.1, type: 'WHO标准' },
        { age: 60, l: 1, m: 109.9638, s: 0.04214, p3: 101.2, p15: 105.2, p50: 110.0, p85: 114.8, p97: 118.7, type: 'WHO标准' }
      ],
     girlHeightDataWho : [
        // 0-24个月数据（来自"女孩表 - 年龄别身长：出生至 2 岁"）
        { age: 0, l: 1, m: 49.1477, s: 0.0379, p3: 45.6, p15: 47.2, p50: 49.1, p85: 51.1, p97: 52.7, type: 'WHO标准' },
        { age: 1, l: 1, m: 53.6872, s: 0.0364, p3: 50.0, p15: 51.7, p50: 53.7, p85: 55.7, p97: 57.4, type: 'WHO标准' },
        { age: 2, l: 1, m: 57.0673, s: 0.03568, p3: 53.2, p15: 55.0, p50: 57.1, p85: 59.2, p97: 60.9, type: 'WHO标准' },
        { age: 3, l: 1, m: 59.8029, s: 0.0352, p3: 55.8, p15: 57.6, p50: 59.8, p85: 62.0, p97: 63.8, type: 'WHO标准' },
        { age: 4, l: 1, m: 62.0899, s: 0.03486, p3: 58.0, p15: 59.8, p50: 62.1, p85: 64.3, p97: 66.2, type: 'WHO标准' },
        { age: 5, l: 1, m: 64.0301, s: 0.03463, p3: 59.9, p15: 61.7, p50: 64.0, p85: 66.3, p97: 68.2, type: 'WHO标准' },
        { age: 6, l: 1, m: 65.7311, s: 0.03448, p3: 61.5, p15: 63.4, p50: 65.7, p85: 68.1, p97: 70.0, type: 'WHO标准' },
        { age: 7, l: 1, m: 67.2873, s: 0.03441, p3: 62.9, p15: 64.9, p50: 67.3, p85: 69.7, p97: 71.6, type: 'WHO标准' },
        { age: 8, l: 1, m: 68.7498, s: 0.0344, p3: 64.3, p15: 66.3, p50: 68.7, p85: 71.2, p97: 73.2, type: 'WHO标准' },
        { age: 9, l: 1, m: 70.1435, s: 0.03444, p3: 65.6, p15: 67.6, p50: 70.1, p85: 72.6, p97: 74.7, type: 'WHO标准' },
        { age: 10, l: 1, m: 71.4818, s: 0.03452, p3: 66.8, p15: 68.9, p50: 71.5, p85: 74.0, p97: 76.1, type: 'WHO标准' },
        { age: 11, l: 1, m: 72.7710, s: 0.03464, p3: 68.0, p15: 70.2, p50: 72.8, p85: 75.4, p97: 77.5, type: 'WHO标准' },
        { age: 12, l: 1, m: 74.0150, s: 0.03479, p3: 69.2, p15: 71.3, p50: 74.0, p85: 76.7, p97: 78.9, type: 'WHO标准' },
        { age: 13, l: 1, m: 75.2176, s: 0.03496, p3: 70.3, p15: 72.5, p50: 75.2, p85: 77.9, p97: 80.2, type: 'WHO标准' },
        { age: 14, l: 1, m: 76.3817, s: 0.03514, p3: 71.3, p15: 73.6, p50: 76.4, p85: 79.2, p97: 81.4, type: 'WHO标准' },
        { age: 15, l: 1, m: 77.5099, s: 0.03534, p3: 72.4, p15: 74.7, p50: 77.5, p85: 80.3, p97: 82.7, type: 'WHO标准' },
        { age: 16, l: 1, m: 78.6055, s: 0.03555, p3: 73.3, p15: 75.7, p50: 78.6, p85: 81.5, p97: 83.9, type: 'WHO标准' },
        { age: 17, l: 1, m: 79.6710, s: 0.03576, p3: 74.3, p15: 76.7, p50: 79.7, p85: 82.6, p97: 85.0, type: 'WHO标准' },
        { age: 18, l: 1, m: 80.7079, s: 0.03598, p3: 75.2, p15: 77.7, p50: 80.7, p85: 83.7, p97: 86.2, type: 'WHO标准' },
        { age: 19, l: 1, m: 81.7182, s: 0.0362, p3: 76.2, p15: 78.7, p50: 81.7, p85: 84.8, p97: 87.3, type: 'WHO标准' },
        { age: 20, l: 1, m: 82.7036, s: 0.03643, p3: 77.0, p15: 79.6, p50: 82.7, p85: 85.8, p97: 88.4, type: 'WHO标准' },
        { age: 21, l: 1, m: 83.6654, s: 0.03666, p3: 77.9, p15: 80.5, p50: 83.7, p85: 86.8, p97: 89.4, type: 'WHO标准' },
        { age: 22, l: 1, m: 84.6040, s: 0.03688, p3: 78.7, p15: 81.4, p50: 84.6, p85: 87.8, p97: 90.5, type: 'WHO标准' },
        { age: 23, l: 1, m: 85.5202, s: 0.03711, p3: 79.6, p15: 82.2, p50: 85.5, p85: 88.8, p97: 91.5, type: 'WHO标准' },
        { age: 24, l: 1, m: 86.4153, s: 0.03734, p3: 80.3, p15: 83.1, p50: 86.4, p85: 89.8, p97: 92.5, type: 'WHO标准' },
      
        // 25-60个月数据（来自"女孩表 - 年龄别身高：2 至 5 岁"）
        { age: 25, l: 1, m: 86.5904, s: 0.03786, p3: 80.4, p15: 83.2, p50: 86.6, p85: 90.0, p97: 92.8, type: 'WHO标准' },
        { age: 26, l: 1, m: 87.4462, s: 0.03808, p3: 81.2, p15: 84.0, p50: 87.4, p85: 90.9, p97: 93.7, type: 'WHO标准' },
        { age: 27, l: 1, m: 88.2830, s: 0.0383, p3: 81.9, p15: 84.8, p50: 88.3, p85: 91.8, p97: 94.6, type: 'WHO标准' },
        { age: 28, l: 1, m: 89.1004, s: 0.03851, p3: 82.6, p15: 85.5, p50: 89.1, p85: 92.7, p97: 95.6, type: 'WHO标准' },
        { age: 29, l: 1, m: 89.8991, s: 0.03872, p3: 83.4, p15: 86.3, p50: 89.9, p85: 93.5, p97: 96.4, type: 'WHO标准' },
        { age: 30, l: 1, m: 90.6797, s: 0.03893, p3: 84.0, p15: 87.0, p50: 90.7, p85: 94.3, p97: 97.3, type: 'WHO标准' },
        { age: 31, l: 1, m: 91.4430, s: 0.03913, p3: 84.7, p15: 87.7, p50: 91.4, p85: 95.2, p97: 98.2, type: 'WHO标准' },
        { age: 32, l: 1, m: 92.1906, s: 0.03933, p3: 85.4, p15: 88.4, p50: 92.2, p85: 95.9, p97: 99.0, type: 'WHO标准' },
        { age: 33, l: 1, m: 92.9239, s: 0.03952, p3: 86.0, p15: 89.1, p50: 92.9, p85: 96.7, p97: 99.8, type: 'WHO标准' },
        { age: 34, l: 1, m: 93.6444, s: 0.03971, p3: 86.7, p15: 89.8, p50: 93.6, p85: 97.5, p97: 100.6, type: 'WHO标准' },
        { age: 35, l: 1, m: 94.3533, s: 0.03989, p3: 87.3, p15: 90.5, p50: 94.4, p85: 98.3, p97: 101.4, type: 'WHO标准' },
        { age: 36, l: 1, m: 95.0515, s: 0.04006, p3: 87.9, p15: 91.1, p50: 95.1, p85: 99.0, p97: 102.2, type: 'WHO标准' },
        { age: 37, l: 1, m: 95.7399, s: 0.04024, p3: 88.5, p15: 91.7, p50: 95.7, p85: 99.7, p97: 103.0, type: 'WHO标准' },
        { age: 38, l: 1, m: 96.4187, s: 0.04041, p3: 89.1, p15: 92.4, p50: 96.4, p85: 100.5, p97: 103.7, type: 'WHO标准' },
        { age: 39, l: 1, m: 97.0885, s: 0.04057, p3: 89.7, p15: 93.0, p50: 97.1, p85: 101.2, p97: 104.5, type: 'WHO标准' },
        { age: 40, l: 1, m: 97.7493, s: 0.04073, p3: 90.3, p15: 93.6, p50: 97.7, p85: 101.9, p97: 105.2, type: 'WHO标准' },
        { age: 41, l: 1, m: 98.4015, s: 0.04089, p3: 90.8, p15: 94.2, p50: 98.4, p85: 102.6, p97: 106.0, type: 'WHO标准' },
        { age: 42, l: 1, m: 99.0448, s: 0.04105, p3: 91.4, p15: 94.8, p50: 99.0, p85: 103.3, p97: 106.7, type: 'WHO标准' },
        { age: 43, l: 1, m: 99.6795, s: 0.0412, p3: 92.0, p15: 95.4, p50: 99.7, p85: 103.9, p97: 107.4, type: 'WHO标准' },
        { age: 44, l: 1, m: 100.3058, s: 0.04135, p3: 92.5, p15: 96.0, p50: 100.3, p85: 104.6, p97: 108.1, type: 'WHO标准' },
        { age: 45, l: 1, m: 100.9238, s: 0.0415, p3: 93.0, p15: 96.6, p50: 100.9, p85: 105.3, p97: 108.8, type: 'WHO标准' },
        { age: 46, l: 1, m: 101.5337, s: 0.04164, p3: 93.6, p15: 97.2, p50: 101.5, p85: 105.9, p97: 109.5, type: 'WHO标准' },
        { age: 47, l: 1, m: 102.1360, s: 0.04179, p3: 94.1, p15: 97.7, p50: 102.1, p85: 106.6, p97: 110.2, type: 'WHO标准' },
        { age: 48, l: 1, m: 102.7312, s: 0.04193, p3: 94.6, p15: 98.3, p50: 102.7, p85: 107.2, p97: 110.8, type: 'WHO标准' },
        { age: 49, l: 1, m: 103.3197, s: 0.04206, p3: 95.1, p15: 98.8, p50: 103.3, p85: 107.8, p97: 111.5, type: 'WHO标准' },
        { age: 50, l: 1, m: 103.9021, s: 0.0422, p3: 95.7, p15: 99.4, p50: 103.9, p85: 108.4, p97: 112.1, type: 'WHO标准' },
        { age: 51, l: 1, m: 104.4786, s: 0.04233, p3: 96.2, p15: 99.9, p50: 104.5, p85: 109.1, p97: 112.8, type: 'WHO标准' },
        { age: 52, l: 1, m: 105.0494, s: 0.04246, p3: 96.7, p15: 100.4, p50: 105.0, p85: 109.7, p97: 113.4, type: 'WHO标准' },
        { age: 53, l: 1, m: 105.6148, s: 0.04259, p3: 97.2, p15: 101.0, p50: 105.6, p85: 110.3, p97: 114.1, type: 'WHO标准' },
        { age: 54, l: 1, m: 106.1748, s: 0.04272, p3: 97.6, p15: 101.5, p50: 106.2, p85: 110.9, p97: 114.7, type: 'WHO标准' },
        { age: 55, l: 1, m: 106.7295, s: 0.04285, p3: 98.1, p15: 102.0, p50: 106.7, p85: 111.5, p97: 115.3, type: 'WHO标准' },
        { age: 56, l: 1, m: 107.2788, s: 0.04298, p3: 98.6, p15: 102.5, p50: 107.3, p85: 112.1, p97: 116.0, type: 'WHO标准' },
        { age: 57, l: 1, m: 107.8227, s: 0.0431, p3: 99.1, p15: 103.0, p50: 107.8, p85: 112.6, p97: 116.6, type: 'WHO标准' },
        { age: 58, l: 1, m: 108.3613, s: 0.04322, p3: 99.6, p15: 103.5, p50: 108.4, p85: 113.2, p97: 117.2, type: 'WHO标准' },
        { age: 59, l: 1, m: 108.8948, s: 0.04334, p3: 100.0, p15: 104.0, p50: 108.9, p85: 113.8, p97: 117.8, type: 'WHO标准' },
        { age: 60, l: 1, m: 109.4233, s: 0.04347, p3: 100.5, p15: 104.5, p50: 109.4, p85: 114.4, p97: 118.4, type: 'WHO标准' }
      ],
      boyHeightDataFenton: [
        { age: 22, p3: 26.5, p10: 28, p50: 30.2, p90: 32.5, p97: 34, type: 'Fenton标准' },
        { age: 24, p3: 27, p10: 28.5, p50: 31, p90: 33.5, p97: 34.6, type: 'Fenton标准' },
        { age: 26, p3: 29.4, p10: 31, p50: 33.8, p90: 36.5, p97: 38, type: 'Fenton标准' },
        { age: 28, p3: 32, p10: 33.2, p50: 36.5, p90: 39.5, p97: 41, type: 'Fenton标准' },
        { age: 30, p3: 34.5, p10: 36, p50: 39, p90: 42.5, p97: 44, type: 'Fenton标准' },
        { age: 32, p3: 37, p10: 39, p50: 42, p90: 45, p97: 47, type: 'Fenton标准' },
        { age: 34, p3: 40, p10: 41.5, p50: 45, p90: 47, p97: 49.5, type: 'Fenton标准' },
        { age: 36, p3: 42.5, p10: 44, p50: 47, p90: 50.5, p97: 52, type: 'Fenton标准' },
        { age: 38, p3: 45, p10: 46.4, p50: 49.4, p90: 52, p97: 54, type: 'Fenton标准' },
        { age: 40, p3: 47, p10: 48.3, p50: 51, p90: 54, p97: 55.4, type: 'Fenton标准' },
        { age: 42, p3: 49, p10: 50.3, p50: 53, p90: 56, p97: 57, type: 'Fenton标准' },
        { age: 44, p3: 51, p10: 52, p50: 54.8, p90: 57.3, p97: 58.5, type: 'Fenton标准' },
        { age: 46, p3: 52.5, p10: 54, p50: 56.5, p90: 59, p97: 60, type: 'Fenton标准' },
        { age: 48, p3: 54, p10: 55.5, p50: 58, p90: 60, p97: 60, type: 'Fenton标准' },
        { age: 50, p3: 55.5, p10: 57, p50: 59.6, p90: 60, p97: 60, type: 'Fenton标准' }
      ],
      girlHeightDataFenton: [
        { age: 22, p3: 26.1, p10: 27.1, p50: 29.5, p90: 32, p97: 33, type: 'Fenton标准' },
        { age: 24, p3: 26, p10: 27, p50: 30, p90: 33, p97: 34, type: 'Fenton标准' },
        { age: 26, p3: 29, p10: 30, p50: 33, p90: 35.2, p97: 37, type: 'Fenton标准' },
        { age: 28, p3: 31, p10: 33, p50: 35.5, p90: 38.5, p97: 40, type: 'Fenton标准' },
        { age: 30, p3: 33.5, p10: 35, p50: 38.5, p90: 41, p97: 43, type: 'Fenton标准' },
        { age: 32, p3: 36, p10: 38, p50: 41, p90: 44.5, p97: 46, type: 'Fenton标准' },
        { age: 34, p3: 39, p10: 40.5, p50: 44, p90: 47, p97: 49, type: 'Fenton标准' },
        { age: 36, p3: 42.5, p10: 43, p50: 46.5, p90: 50, p97: 51, type: 'Fenton标准' },
        { age: 38, p3: 44, p10: 45.2, p50: 48.5, p90: 51.4, p97: 53, type: 'Fenton标准' },
        { age: 40, p3: 46, p10: 47.5, p50: 50.5, p90: 53.2, p97: 55, type: 'Fenton标准' },
        { age: 42, p3: 48, p10: 49.2, p50: 52, p90: 55, p97: 56, type: 'Fenton标准' },
        { age: 44, p3: 50, p10: 51, p50: 53.8, p90: 56, p97: 57.5, type: 'Fenton标准' },
        { age: 46, p3: 51.2, p10: 52.5, p50: 55, p90: 58, p97: 60, type: 'Fenton标准' },
        { age: 48, p3: 53, p10: 54, p50: 56.5, p90: 59, p97: 60, type: 'Fenton标准' },
        { age: 50, p3: 54, p10: 55, p50: 58, p90: 60, p97: 60, type: 'Fenton标准' }
      ],
    growthRecords: [], // 生长记录数据
    newRecord: {
      date: '',
      height: ''
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
      const storageKey = currentChild.id ? `growthRecords_${currentChild.id}` : `growthRecords_${currentChild.name}`;;
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
      chartData = currentGender === 'boy' ? this.data.boyHeightDataWho : this.data.girlHeightDataWho;
    } else {
      chartData = currentGender === 'boy' ? this.data.boyHeightDataFenton : this.data.girlHeightDataFenton;
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
        if (record.height === undefined || record.height === null || record.height === '') {
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
        const height = record.height;
        return [age, height];
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
        text: `身高生长曲线（${currentStandard}标准）`, // 动态标题
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
        max: currentStandard === 'WHO' ? 120 : 60, // WHO标准最大55，Fenton最大45
        interval: currentStandard === 'WHO' ? 15 : 8, // 两个标准间隔都是5
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








