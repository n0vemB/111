Page({
  data: {
    userInfo: null
  },

  onLoad(options) {
    if (options.userInfo) {
      this.setData({
        userInfo: JSON.parse(options.userInfo)
      });
    }
  },

  handleSubmit(e) {
    const formData = e.detail.value;
    
    if (!formData.referrer || !formData.dingName || !formData.phone) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    wx.request({
      url: 'https://bk-lilac.vercel.app/api/submit',
      method: 'POST',
      data: {
        ...formData,
        userInfo: this.data.userInfo,
        openid: wx.getStorageSync('openid') || 'test-openid-' + Date.now(),
        createTime: new Date().toISOString()
      },
      success: () => {
        wx.redirectTo({
          url: '/pages/success/success'
        });
      },
      fail: (err) => {
        console.error('提交失败:', err);
        wx.showToast({
          title: '提交失败，请重试',
          icon: 'none'
        });
      }
    });
  }
});
