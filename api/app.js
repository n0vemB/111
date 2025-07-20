App({
  onLaunch() {
    console.log('小程序启动');
    
    // 获取用户信息
    wx.getSetting({
      success: res => {
        if (res.authSetting['scope.userInfo']) {
          wx.getUserInfo({
            success: res => {
              this.globalData.userInfo = res.userInfo;
            }
          });
        }
      }
    });
  },

  onShow() {
    console.log('小程序显示');
  },

  onHide() {
    console.log('小程序隐藏');
  },

  globalData: {
    userInfo: null,
    apiBase: 'https://bk-lilac.vercel.app'
  }
});
