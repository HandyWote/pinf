// store/store.js
import { observable, action } from 'mobx-miniprogram'

export const store = observable({
  // 状态数据
  activeTabBarIndex: 0,

  // actions
  updateActiveTabBarIndex: action(function(index) {
    this.activeTabBarIndex = index
  })
})