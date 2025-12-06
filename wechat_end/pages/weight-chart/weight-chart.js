
const app = getApp();

import * as echarts from '../../ec-canvas/echarts';

Page({
  data: {
    childId: '',
    childInfo: {},
    canvasWidth: 0,
    canvasHeight: 0,
    // 直接初始化示例数据
    ec: {
      onInit: function (canvas, width, weight, dpr) {
        // 将 initChart 方法移到这里
        if (!canvas) {
          console.error('canvas 上下文获取失败');
          return null;
        }

        const chart = echarts.init(canvas, null, {
          width: width,
          weight: weight,
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
    // 直接初始化示例数据
    boyWeightDataWho: [
      { age: 0, l: 0.3487, m: 3.3464, s: 0.14602, p3: 2.5, p15: 2.9, p50: 3.3, p85: 3.9, p97: 4.3, type: 'WHO标准' },
      { age: 1, l: 0.2297, m: 4.4709, s: 0.13395, p3: 3.4, p15: 3.9, p50: 4.5, p85: 5.1, p97: 5.7, type: 'WHO标准' },
      { age: 2, l: 0.197, m: 5.5675, s: 0.12385, p3: 4.4, p15: 4.9, p50: 5.6, p85: 6.3, p97: 7.0, type: 'WHO标准' },
      { age: 3, l: 0.1738, m: 6.3762, s: 0.11727, p3: 5.1, p15: 5.6, p50: 6.4, p85: 7.2, p97: 7.9, type: 'WHO标准' },
      { age: 4, l: 0.1553, m: 7.0023, s: 0.11316, p3: 5.6, p15: 6.2, p50: 7.0, p85: 7.9, p97: 8.6, type: 'WHO标准' },
      { age: 5, l: 0.1395, m: 7.5105, s: 0.1108, p3: 6.1, p15: 6.7, p50: 7.5, p85: 8.4, p97: 9.2, type: 'WHO标准' },
      { age: 6, l: 0.1257, m: 7.934, s: 0.10958, p3: 6.4, p15: 7.1, p50: 7.9, p85: 8.9, p97: 9.7, type: 'WHO标准' },
      { age: 7, l: 0.1134, m: 8.297, s: 0.10902, p3: 6.7, p15: 7.4, p50: 8.3, p85: 9.3, p97: 10.2, type: 'WHO标准' },
      { age: 8, l: 0.1021, m: 8.6151, s: 0.10882, p3: 7.0, p15: 7.7, p50: 8.6, p85: 9.6, p97: 10.5, type: 'WHO标准' },
      { age: 9, l: 0.0917, m: 8.9014, s: 0.10881, p3: 7.2, p15: 7.9, p50: 8.9, p85: 10.0, p97: 10.9, type: 'WHO标准' },
      { age: 10, l: 0.082, m: 9.1649, s: 0.10891, p3: 7.5, p15: 8.2, p50: 9.2, p85: 10.3, p97: 11.2, type: 'WHO标准' },
      { age: 11, l: 0.073, m: 9.4122, s: 0.10906, p3: 7.7, p15: 8.4, p50: 9.4, p85: 10.5, p97: 11.5, type: 'WHO标准' },
      { age: 12, l: 0.0644, m: 9.6479, s: 0.10925, p3: 7.8, p15: 8.6, p50: 9.6, p85: 10.8, p97: 11.8, type: 'WHO标准' },
      { age: 13, l: 0.0563, m: 9.8749, s: 0.10949, p3: 8.0, p15: 8.8, p50: 9.9, p85: 11.1, p97: 12.1, type: 'WHO标准' },
      { age: 14, l: 0.0487, m: 10.0953, s: 0.10976, p3: 8.2, p15: 9.0, p50: 10.1, p85: 11.3, p97: 12.4, type: 'WHO标准' },
      { age: 15, l: 0.0413, m: 10.3108, s: 0.11007, p3: 8.4, p15: 9.2, p50: 10.3, p85: 11.6, p97: 12.7, type: 'WHO标准' },
      { age: 16, l: 0.0343, m: 10.5228, s: 0.11041, p3: 8.5, p15: 9.4, p50: 10.5, p85: 11.8, p97: 12.9, type: 'WHO标准' },
      { age: 17, l: 0.0275, m: 10.7319, s: 0.11079, p3: 8.7, p15: 9.6, p50: 10.7, p85: 12.0, p97: 13.2, type: 'WHO标准' },
      { age: 18, l: 0.0211, m: 10.9385, s: 0.11119, p3: 8.9, p15: 9.7, p50: 10.9, p85: 12.3, p97: 13.5, type: 'WHO标准' },
      { age: 19, l: 0.0148, m: 11.143, s: 0.11164, p3: 9.0, p15: 9.9, p50: 11.1, p85: 12.5, p97: 13.7, type: 'WHO标准' },
      { age: 20, l: 0.0087, m: 11.3462, s: 0.11211, p3: 9.2, p15: 10.1, p50: 11.3, p85: 12.7, p97: 14.0, type: 'WHO标准' },
      { age: 21, l: 0.0029, m: 11.5486, s: 0.11261, p3: 9.3, p15: 10.3, p50: 11.5, p85: 13.0, p97: 14.3, type: 'WHO标准' },
      { age: 22, l: -0.0028, m: 11.7504, s: 0.11314, p3: 9.5, p15: 10.5, p50: 11.8, p85: 13.2, p97: 14.5, type: 'WHO标准' },
      { age: 23, l: -0.0083, m: 11.9514, s: 0.11369, p3: 9.7, p15: 10.6, p50: 12.0, p85: 13.4, p97: 14.8, type: 'WHO标准' },
      { age: 24, l: -0.0137, m: 12.1515, s: 0.11426, p3: 9.8, p15: 10.8, p50: 12.2, p85: 13.7, p97: 15.1, type: 'WHO标准' },
      { age: 25, l: -0.0189, m: 12.3502, s: 0.11485, p3: 10.0, p15: 11.0, p50: 12.4, p85: 13.9, p97: 15.3, type: 'WHO标准' },
      { age: 26, l: -0.024, m: 12.5466, s: 0.11544, p3: 10.1, p15: 11.1, p50: 12.5, p85: 14.1, p97: 15.6, type: 'WHO标准' },
      { age: 27, l: -0.0289, m: 12.7401, s: 0.11604, p3: 10.2, p15: 11.3, p50: 12.7, p85: 14.4, p97: 15.9, type: 'WHO标准' },
      { age: 28, l: -0.0337, m: 12.9303, s: 0.11664, p3: 10.4, p15: 11.5, p50: 12.9, p85: 14.6, p97: 16.1, type: 'WHO标准' },
      { age: 29, l: -0.0385, m: 13.1169, s: 0.11723, p3: 10.5, p15: 11.6, p50: 13.1, p85: 14.8, p97: 16.4, type: 'WHO标准' },
      { age: 30, l: -0.0431, m: 13.3, s: 0.11781, p3: 10.7, p15: 11.8, p50: 13.3, p85: 15.0, p97: 16.6, type: 'WHO标准' },
      { age: 31, l: -0.0476, m: 13.4798, s: 0.11839, p3: 10.8, p15: 11.9, p50: 13.5, p85: 15.2, p97: 16.9, type: 'WHO标准' },
      { age: 32, l: -0.052, m: 13.6567, s: 0.11896, p3: 10.9, p15: 12.1, p50: 13.7, p85: 15.5, p97: 17.1, type: 'WHO标准' },
      { age: 33, l: -0.0564, m: 13.8309, s: 0.11953, p3: 11.1, p15: 12.2, p50: 13.8, p85: 15.7, p97: 17.3, type: 'WHO标准' },
      { age: 34, l: -0.0606, m: 14.0031, s: 0.12008, p3: 11.2, p15: 12.4, p50: 14.0, p85: 15.9, p97: 17.6, type: 'WHO标准' },
      { age: 35, l: -0.0648, m: 14.1736, s: 0.12062, p3: 11.3, p15: 12.5, p50: 14.2, p85: 16.1, p97: 17.8, type: 'WHO标准' },
      { age: 36, l: -0.0689, m: 14.3429, s: 0.12116, p3: 11.4, p15: 12.7, p50: 14.3, p85: 16.3, p97: 18.0, type: 'WHO标准' },
      { age: 37, l: -0.0729, m: 14.5113, s: 0.12168, p3: 11.6, p15: 12.8, p50: 14.5, p85: 16.5, p97: 18.3, type: 'WHO标准' },
      { age: 38, l: -0.0769, m: 14.6791, s: 0.1222, p3: 11.7, p15: 12.9, p50: 14.7, p85: 16.7, p97: 18.5, type: 'WHO标准' },
      { age: 39, l: -0.0808, m: 14.8466, s: 0.12271, p3: 11.8, p15: 13.1, p50: 14.8, p85: 16.9, p97: 18.7, type: 'WHO标准' },
      { age: 40, l: -0.0846, m: 15.014, s: 0.12322, p3: 11.9, p15: 13.2, p50: 15.0, p85: 17.1, p97: 19.0, type: 'WHO标准' },
      { age: 41, l: -0.0883, m: 15.1813, s: 0.12373, p3: 12.1, p15: 13.4, p50: 15.2, p85: 17.3, p97: 19.2, type: 'WHO标准' },
      { age: 42, l: -0.092, m: 15.3486, s: 0.12425, p3: 12.2, p15: 13.5, p50: 15.3, p85: 17.5, p97: 19.4, type: 'WHO标准' },
      { age: 43, l: -0.0957, m: 15.5158, s: 0.12478, p3: 12.3, p15: 13.6, p50: 15.5, p85: 17.7, p97: 19.7, type: 'WHO标准' },
      { age: 44, l: -0.0993, m: 15.6828, s: 0.12531, p3: 12.4, p15: 13.8, p50: 15.7, p85: 17.9, p97: 19.9, type: 'WHO标准' },
      { age: 45, l: -0.1028, m: 15.8497, s: 0.12586, p3: 12.5, p15: 13.9, p50: 15.8, p85: 18.1, p97: 20.1, type: 'WHO标准' },
      { age: 46, l: -0.1063, m: 16.0163, s: 0.12643, p3: 12.7, p15: 14.1, p50: 16.0, p85: 18.3, p97: 20.4, type: 'WHO标准' },
      { age: 47, l: -0.1097, m: 16.1827, s: 0.127, p3: 12.8, p15: 14.2, p50: 16.2, p85: 18.5, p97: 20.6, type: 'WHO标准' },
      { age: 48, l: -0.1131, m: 16.3489, s: 0.12759, p3: 12.9, p15: 14.3, p50: 16.3, p85: 18.7, p97: 20.9, type: 'WHO标准' },
      { age: 49, l: -0.1165, m: 16.515, s: 0.12819, p3: 13.0, p15: 14.5, p50: 16.5, p85: 18.9, p97: 21.1, type: 'WHO标准' },
      { age: 50, l: -0.1198, m: 16.6811, s: 0.1288, p3: 13.1, p15: 14.6, p50: 16.7, p85: 19.1, p97: 21.3, type: 'WHO标准' },
      { age: 51, l: -0.123, m: 16.8471, s: 0.12943, p3: 13.3, p15: 14.7, p50: 16.8, p85: 19.3, p97: 21.6, type: 'WHO标准' },
      { age: 52, l: -0.1262, m: 17.0132, s: 0.13005, p3: 13.4, p15: 14.9, p50: 17.0, p85: 19.5, p97: 21.8, type: 'WHO标准' },
      { age: 53, l: -0.1294, m: 17.1792, s: 0.13069, p3: 13.5, p15: 15.0, p50: 17.2, p85: 19.7, p97: 22.1, type: 'WHO标准' },
      { age: 54, l: -0.1325, m: 17.3452, s: 0.13133, p3: 13.6, p15: 15.2, p50: 17.3, p85: 19.9, p97: 22.3, type: 'WHO标准' },
      { age: 55, l: -0.1356, m: 17.5111, s: 0.13197, p3: 13.7, p15: 15.3, p50: 17.5, p85: 20.1, p97: 22.5, type: 'WHO标准' },
      { age: 56, l: -0.1387, m: 17.6768, s: 0.13261, p3: 13.8, p15: 15.4, p50: 17.7, p85: 20.3, p97: 22.8, type: 'WHO标准' },
      { age: 57, l: -0.1417, m: 17.8422, s: 0.13325, p3: 13.9, p15: 15.6, p50: 17.8, p85: 20.5, p97: 23.0, type: 'WHO标准' },
      { age: 58, l: -0.1447, m: 18.0073, s: 0.13389, p3: 14.1, p15: 15.7, p50: 18.0, p85: 20.7, p97: 23.3, type: 'WHO标准' },
      { age: 59, l: -0.1477, m: 18.1722, s: 0.13453, p3: 14.2, p15: 15.8, p50: 18.2, p85: 20.9, p97: 23.5, type: 'WHO标准' },
      { age: 60, l: -0.1506, m: 18.3366, s: 0.13517, p3: 14.3, p15: 16.0, p50: 18.3, p85: 21.1, p97: 23.8, type: 'WHO标准' }
    ],
    girlWeightDataWho: [
      { "age": 0, "l": 0.3809, "m": 3.2322, "s": 0.14171, "p3": 2.4, "p15": 2.8, "p50": 3.2, "p85": 3.7, "p97": 4.2, "type": "WHO标准" },
      { "age": 1, "l": 0.1714, "m": 4.1873, "s": 0.13724, "p3": 3.2, "p15": 3.6, "p50": 4.2, "p85": 4.8, "p97": 5.4, "type": "WHO标准" },
      { "age": 2, "l": 0.0962, "m": 5.1282, "s": 0.13, "p3": 4.0, "p15": 4.5, "p50": 5.1, "p85": 5.9, "p97": 6.5, "type": "WHO标准" },
      { "age": 3, "l": 0.0402, "m": 5.8458, "s": 0.12619, "p3": 4.6, "p15": 5.1, "p50": 5.8, "p85": 6.7, "p97": 7.4, "type": "WHO标准" },
      { "age": 4, "l": -0.005, "m": 6.4237, "s": 0.12402, "p3": 5.1, "p15": 5.6, "p50": 6.4, "p85": 7.3, "p97": 8.1, "type": "WHO标准" },
      { "age": 5, "l": -0.043, "m": 6.8985, "s": 0.12274, "p3": 5.5, "p15": 6.1, "p50": 6.9, "p85": 7.8, "p97": 8.7, "type": "WHO标准" },
      { "age": 6, "l": -0.0756, "m": 7.297, "s": 0.12204, "p3": 5.8, "p15": 6.4, "p50": 7.3, "p85": 8.3, "p97": 9.2, "type": "WHO标准" },
      { "age": 7, "l": -0.1039, "m": 7.6422, "s": 0.12178, "p3": 6.1, "p15": 6.7, "p50": 7.6, "p85": 8.7, "p97": 9.6, "type": "WHO标准" },
      { "age": 8, "l": -0.1288, "m": 7.9487, "s": 0.12181, "p3": 6.3, "p15": 7.0, "p50": 7.9, "p85": 9.0, "p97": 10.0, "type": "WHO标准" },
      { "age": 9, "l": -0.1507, "m": 8.2254, "s": 0.12199, "p3": 6.6, "p15": 7.3, "p50": 8.2, "p85": 9.3, "p97": 10.4, "type": "WHO标准" },
      { "age": 10, "l": -0.17, "m": 8.48, "s": 0.12223, "p3": 6.8, "p15": 7.5, "p50": 8.5, "p85": 9.6, "p97": 10.7, "type": "WHO标准" },
      { "age": 11, "l": -0.1872, "m": 8.7192, "s": 0.12247, "p3": 7.0, "p15": 7.7, "p50": 8.7, "p85": 9.9, "p97": 11.0, "type": "WHO标准" },
      { "age": 12, "l": -0.2024, "m": 8.9481, "s": 0.12268, "p3": 7.1, "p15": 7.9, "p50": 8.9, "p85": 10.2, "p97": 11.3, "type": "WHO标准" },
      { "age": 13, "l": -0.2158, "m": 9.1699, "s": 0.12283, "p3": 7.3, "p15": 8.1, "p50": 9.2, "p85": 10.4, "p97": 11.6, "type": "WHO标准" },
      { "age": 14, "l": -0.2278, "m": 9.387, "s": 0.12294, "p3": 7.5, "p15": 8.3, "p50": 9.4, "p85": 10.7, "p97": 11.9, "type": "WHO标准" },
      { "age": 15, "l": -0.2384, "m": 9.6008, "s": 0.12299, "p3": 7.7, "p15": 8.5, "p50": 9.6, "p85": 10.9, "p97": 12.2, "type": "WHO标准" },
      { "age": 16, "l": -0.2478, "m": 9.8124, "s": 0.12303, "p3": 7.8, "p15": 8.7, "p50": 9.8, "p85": 11.2, "p97": 12.5, "type": "WHO标准" },
      { "age": 17, "l": -0.2562, "m": 10.0226, "s": 0.12306, "p3": 8.0, "p15": 8.8, "p50": 10.0, "p85": 11.4, "p97": 12.7, "type": "WHO标准" },
      { "age": 18, "l": -0.2637, "m": 10.2315, "s": 0.12309, "p3": 8.2, "p15": 9.0, "p50": 10.2, "p85": 11.6, "p97": 13.0, "type": "WHO标准" },
      { "age": 19, "l": -0.2703, "m": 10.4393, "s": 0.12315, "p3": 8.3, "p15": 9.2, "p50": 10.4, "p85": 11.9, "p97": 13.3, "type": "WHO标准" },
      { "age": 20, "l": -0.2762, "m": 10.6464, "s": 0.12323, "p3": 8.5, "p15": 9.4, "p50": 10.6, "p85": 12.1, "p97": 13.5, "type": "WHO标准" },
      { "age": 21, "l": -0.2815, "m": 10.8534, "s": 0.12335, "p3": 8.7, "p15": 9.6, "p50": 10.9, "p85": 12.3, "p97": 13.8, "type": "WHO标准" },
      { "age": 22, "l": -0.2862, "m": 11.0608, "s": 0.1235, "p3": 8.8, "p15": 9.8, "p50": 11.1, "p85": 12.5, "p97": 14.0, "type": "WHO标准" },
      { "age": 23, "l": -0.2903, "m": 11.2688, "s": 0.12369, "p3": 9.0, "p15": 9.9, "p50": 11.3, "p85": 12.8, "p97": 14.3, "type": "WHO标准" },
      { "age": 24, "l": -0.2941, "m": 11.4775, "s": 0.1239, "p3": 9.2, "p15": 10.1, "p50": 11.5, "p85": 13.0, "p97": 14.5, "type": "WHO标准" },
      { "age": 25, "l": -0.2975, "m": 11.6864, "s": 0.12414, "p3": 9.3, "p15": 10.3, "p50": 11.7, "p85": 13.2, "p97": 14.8, "type": "WHO标准" },
      { "age": 26, "l": -0.3005, "m": 11.8947, "s": 0.12441, "p3": 9.5, "p15": 10.5, "p50": 11.9, "p85": 13.4, "p97": 15.0, "type": "WHO标准" },
      { "age": 27, "l": -0.3032, "m": 12.1015, "s": 0.12472, "p3": 9.6, "p15": 10.7, "p50": 12.1, "p85": 13.7, "p97": 15.3, "type": "WHO标准" },
      { "age": 28, "l": -0.3057, "m": 12.3059, "s": 0.12506, "p3": 9.8, "p15": 10.9, "p50": 12.3, "p85": 13.9, "p97": 15.5, "type": "WHO标准" },
      { "age": 29, "l": -0.308, "m": 12.5073, "s": 0.12545, "p3": 10.0, "p15": 11.0, "p50": 12.5, "p85": 14.1, "p97": 15.8, "type": "WHO标准" },
      { "age": 30, "l": -0.3101, "m": 12.7055, "s": 0.12587, "p3": 10.1, "p15": 11.2, "p50": 12.7, "p85": 14.3, "p97": 16.0, "type": "WHO标准" },
      { "age": 31, "l": -0.312, "m": 12.9006, "s": 0.12633, "p3": 10.3, "p15": 11.3, "p50": 12.9, "p85": 14.6, "p97": 16.5, "type": "WHO标准" },
      { "age": 32, "l": -0.3138, "m": 13.093, "s": 0.12683, "p3": 10.4, "p15": 11.5, "p50": 13.1, "p85": 14.8, "p97": 16.8, "type": "WHO标准" },
      { "age": 33, "l": -0.3155, "m": 13.2837, "s": 0.12737, "p3": 10.5, "p15": 11.7, "p50": 13.3, "p85": 15.0, "p97": 17.0, "type": "WHO标准" },
      { "age": 34, "l": -0.3171, "m": 13.4731, "s": 0.12794, "p3": 10.7, "p15": 11.8, "p50": 13.5, "p85": 15.2, "p97": 17.3, "type": "WHO标准" },
      { "age": 35, "l": -0.3186, "m": 13.6618, "s": 0.12855, "p3": 10.8, "p15": 12.0, "p50": 13.7, "p85": 15.4, "p97": 17.6, "type": "WHO标准" },
      { "age": 36, "l": -0.3201, "m": 13.8503, "s": 0.12919, "p3": 10.9, "p15": 12.1, "p50": 13.9, "p85": 15.7, "p97": 17.8, "type": "WHO标准" },
      { "age": 37, "l": -0.3216, "m": 14.0385, "s": 0.12988, "p3": 11.0, "p15": 12.3, "p50": 14.0, "p85": 15.9, "p97": 18.1, "type": "WHO标准" },
      { "age": 38, "l": -0.323, "m": 14.2265, "s": 0.13059, "p3": 11.1, "p15": 12.4, "p50": 14.2, "p85": 16.1, "p97": 18.4, "type": "WHO标准" },
      { "age": 39, "l": -0.3243, "m": 14.414, "s": 0.13135, "p3": 11.3, "p15": 12.6, "p50": 14.4, "p85": 16.4, "p97": 18.7, "type": "WHO标准" },
      { "age": 40, "l": -0.3257, "m": 14.601, "s": 0.13213, "p3": 11.4, "p15": 12.7, "p50": 14.6, "p85": 16.6, "p97": 19.0, "type": "WHO标准" },
      { "age": 41, "l": -0.327, "m": 14.7873, "s": 0.13293, "p3": 11.5, "p15": 12.9, "p50": 14.8, "p85": 16.8, "p97": 19.3, "type": "WHO标准" },
      { "age": 42, "l": -0.3283, "m": 14.9727, "s": 0.13376, "p3": 11.6, "p15": 13.0, "p50": 15.0, "p85": 17.1, "p97": 19.5, "type": "WHO标准" },
      { "age": 43, "l": -0.3296, "m": 15.1573, "s": 0.1346, "p3": 11.7, "p15": 13.2, "p50": 15.2, "p85": 17.3, "p97": 19.8, "type": "WHO标准" },
      { "age": 44, "l": -0.3309, "m": 15.341, "s": 0.13545, "p3": 11.8, "p15": 13.3, "p50": 15.3, "p85": 17.5, "p97": 20.1, "type": "WHO标准" },
      { "age": 45, "l": -0.3322, "m": 15.524, "s": 0.1363, "p3": 11.9, "p15": 13.5, "p50": 15.5, "p85": 17.8, "p97": 20.4, "type": "WHO标准" },
      { "age": 46, "l": -0.3335, "m": 15.7064, "s": 0.13716, "p3": 12.0, "p15": 13.6, "p50": 15.7, "p85": 18.0, "p97": 20.6, "type": "WHO标准" },
      { "age": 47, "l": -0.3348, "m": 15.8882, "s": 0.138, "p3": 12.1, "p15": 13.8, "p50": 15.9, "p85": 18.2, "p97": 20.9, "type": "WHO标准" },
      { "age": 48, "l": -0.3361, "m": 16.0697, "s": 0.13884, "p3": 12.2, "p15": 13.9, "p50": 16.1, "p85": 18.5, "p97": 21.1, "type": "WHO标准" },
      { "age": 49, "l": -0.3374, "m": 16.2511, "s": 0.13968, "p3": 12.3, "p15": 14.0, "p50": 16.3, "p85": 18.7, "p97": 21.4, "type": "WHO标准" },
      { "age": 50, "l": -0.3387, "m": 16.4322, "s": 0.14051, "p3": 12.4, "p15": 14.2, "p50": 16.4, "p85": 18.9, "p97": 21.7, "type": "WHO标准" },
      { "age": 51, "l": -0.34, "m": 16.6133, "s": 0.14132, "p3": 12.5, "p15": 14.3, "p50": 16.6, "p85": 19.2, "p97": 22.0, "type": "WHO标准" },
      { "age": 52, "l": -0.3414, "m": 16.7942, "s": 0.14213, "p3": 12.6, "p15": 14.5, "p50": 16.8, "p85": 19.4, "p97": 22.2, "type": "WHO标准" },
      { "age": 53, "l": -0.3427, "m": 16.9748, "s": 0.14293, "p3": 12.7, "p15": 14.6, "p50": 17.0, "p85": 19.6, "p97": 22.5, "type": "WHO标准" },
      { "age": 54, "l": -0.344, "m": 17.1551, "s": 0.14371, "p3": 12.8, "p15": 14.7, "p50": 17.2, "p85": 19.9, "p97": 22.8, "type": "WHO标准" },
      { "age": 55, "l": -0.3453, "m": 17.3347, "s": 0.14448, "p3": 12.9, "p15": 14.9, "p50": 17.3, "p85": 20.1, "p97": 23.0, "type": "WHO标准" },
      { "age": 56, "l": -0.3466, "m": 17.5136, "s": 0.14525, "p3": 13.0, "p15": 15.0, "p50": 17.5, "p85": 20.3, "p97": 23.3, "type": "WHO标准" },
      { "age": 57, "l": -0.3479, "m": 17.6916, "s": 0.146, "p3": 13.1, "p15": 15.2, "p50": 17.7, "p85": 20.6, "p97": 23.6, "type": "WHO标准" },
      { "age": 58, "l": -0.3492, "m": 17.8686, "s": 0.14675, "p3": 13.2, "p15": 15.3, "p50": 17.9, "p85": 20.8, "p97": 23.9, "type": "WHO标准" },
      { "age": 59, "l": -0.3505, "m": 18.0445, "s": 0.14748, "p3": 13.3, "p15": 15.4, "p50": 18.0, "p85": 21.1, "p97": 24.2, "type": "WHO标准" },
      { "age": 60, "l": -0.3518, "m": 18.2193, "s": 0.14821, "p3": 13.4, "p15": 15.6, "p50": 18.2, "p85": 21.3, "p97": 24.4, "type": "WHO标准" }
    ],
    boyWeightDataFenton: [
      { age: 22, p3: 0.45, p10: 0.55, p50: 0.65, p90: 0.75, p97: 0.85, type: 'Fenton标准' },
      { age: 24, p3: 0.60, p10: 0.70, p50: 0.85, p90: 1.00, p97: 1.10, type: 'Fenton标准' },
      { age: 26, p3: 0.80, p10: 0.90, p50: 1.15, p90: 1.30, p97: 1.45, type: 'Fenton标准' },
      { age: 28, p3: 1.05, p10: 1.20, p50: 1.45, p90: 1.70, p97: 1.90, type: 'Fenton标准' },
      { age: 30, p3: 1.35, p10: 1.55, p50: 1.85, p90: 2.15, p97: 2.40, type: 'Fenton标准' },
      { age: 32, p3: 1.75, p10: 2.00, p50: 2.40, p90: 2.70, p97: 3.00, type: 'Fenton标准' },
      { age: 34, p3: 2.25, p10: 2.55, p50: 3.00, p90: 3.40, p97: 3.75, type: 'Fenton标准' },
      { age: 36, p3: 2.80, p10: 3.10, p50: 3.50, p90: 4.00, p97: 4.40, type: 'Fenton标准' },
      { age: 38, p3: 3.30, p10: 3.60, p50: 3.90, p90: 4.50, p97: 5.00, type: 'Fenton标准' },
      { age: 40, p3: 3.60, p10: 3.90, p50: 4.20, p90: 4.80, p97: 5.30, type: 'Fenton标准' }
    ],
    girlWeightDataFenton: [
      { age: 22, p3: 0.37, p10: 0.40, p50: 0.45, p90: 0.52, p97: 0.55, type: 'Fenton标准' },
      { age: 24, p3: 0.48, p10: 0.52, p50: 0.58, p90: 0.66, p97: 0.70, type: 'Fenton标准' },
      { age: 26, p3: 0.62, p10: 0.68, p50: 0.76, p90: 0.85, p97: 0.90, type: 'Fenton标准' },
      { age: 28, p3: 0.83, p10: 0.90, p50: 1.01, p90: 1.12, p97: 1.20, type: 'Fenton标准' },
      { age: 30, p3: 1.10, p10: 1.18, p50: 1.30, p90: 1.44, p97: 1.52, type: 'Fenton标准' },
      { age: 32, p3: 1.40, p10: 1.50, p50: 1.65, p90: 1.82, p97: 1.90, type: 'Fenton标准' },
      { age: 34, p3: 1.75, p10: 1.85, p50: 2.05, p90: 2.25, p97: 2.35, type: 'Fenton标准' },
      { age: 36, p3: 2.15, p10: 2.25, p50: 2.45, p90: 2.70, p97: 2.85, type: 'Fenton标准' },
      { age: 38, p3: 2.55, p10: 2.65, p50: 2.85, p90: 3.15, p97: 3.30, type: 'Fenton标准' },
      { age: 40, p3: 2.95, p10: 3.05, p50: 3.25, p90: 3.55, p97: 3.75, type: 'Fenton标准' }
    ],
    // 示例生长记录数据

    growthRecords: [], // 生长记录数据
    newRecord: {
      date: '',
      weight: ''  // 修改属性名
    },
    showAddForm: false
  },

  onLoad: function (options) {
    console.log('身高图表页面加载中...');
    const systemInfo = wx.getSystemInfoSync();
    this.setData({
      canvasWidth: systemInfo.windowWidth,
      canvasHeight: systemInfo.windowHeight * 0.8
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
      chartData = currentGender === 'boy' ? this.data.boyWeightDataWho : this.data.girlWeightDataWho;
    } else {
      chartData = currentGender === 'boy' ? this.data.boyWeightDataFenton : this.data.girlWeightDataFenton;
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
        if (record.weight === undefined || record.weight === null || record.weight === '') {
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
        const weight = record.weight;
        return [age, weight];
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
        symbolSize: 1,
        itemStyle: {
          color: '#FF0000' // 用户数据点颜色，例如红色
        }
      };
      series.push(userSeries); // 将用户数据系列添加到标准曲线系列之后
    }

    // 声明并配置 option 对象
    const option = {
      title: {
        text: `体重生长曲线（${currentStandard}标准）`, // 动态标题
        left: 'center',
        textStyle: {
          fontSize: 10
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
              tooltipContent += `${item.seriesName}: ${item.value[1]} kg (年龄: ${item.value[0]}${currentStandard === 'WHO' ? '月' : '周'})`;
            } else {
              tooltipContent += `${item.seriesName}: ${item.value[1]} kg (年龄: ${item.value[0]}${currentStandard === 'WHO' ? '月' : '周'})`;
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
        nameGap: 30,
        min: currentStandard === 'WHO' ? 0 : 0, // <-- **请确保这里根据标准动态设置了最小值**
        max: currentStandard === 'WHO' ? 60 : 40, // <-- **请确保这里根据标准动态设置了最大值**
        interval: currentStandard === 'WHO' ? 6 :2, // <-- **请确保这里根据标准动态设置了间隔**
        nameTextStyle: {
          fontSize: 12
        },
        axisLabel: {
          fontSize: 10
        }
      },
      yAxis: {
        type: 'value',
        name: '体重（kg）',
        nameGap: 50,
        min: currentStandard === 'WHO' ? 0 : 0, // WHO标准最小2，Fenton最小0
        max: currentStandard === 'WHO' ? 30 : 3, // WHO标准最大25，Fenton最大6
        interval: currentStandard === 'WHO' ?6 : 0.5, // 两个标准间隔都是1
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








