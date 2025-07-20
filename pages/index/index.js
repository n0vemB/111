Page({
  handleClaim() {
    wx.getUserProfile({
      desc: '用于完善会员资料',
      success: (res) => {
        const userInfo = res.userInfo;
        
        this.checkUserExists(userInfo).then(exists => {
          if (exists) {
            wx.showToast({
              title: '您已领取过了',
              icon: 'none'
            });
          } else {
            wx.navigateTo({
              url: `/pages/form/form?userInfo=${JSON.stringify(userInfo)}`
            });
          }
        });
      },
      fail: () => {
        wx.showToast({
          title: '需要授权才能领取',
          icon: 'none'
        });
      }
    });
  },

  checkUserExists(userInfo) {
    return new Promise((resolve) => {
      wx.request({
        url: 'https://bk-lilac.vercel.app/api/check-user',
        method: 'POST',
        data: {
          openid: wx.getStorageSync('openid') || 'test-openid-' + Date.now(),
          nickName: userInfo.nickName
        },
        success: (res) => {
          resolve(res.data.exists);
        },
        fail: (err) => {
          console.error('请求失败:', err);
          resolve(false);
        }
      });
    });
  }
});
