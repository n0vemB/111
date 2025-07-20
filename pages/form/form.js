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
    
    // 表单验证
    if (!formData.referrer || !formData.dingName || !formData.phone) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    // 提交数据
    wx.request({
      url: 'http://localhost:3000/submit', // 修改为本地地址
      method: 'POST',
      data: {
        ...formData,
        userInfo: this.data.userInfo,
        openid: wx.getStorageSync('openid') || 'test-openid-123',
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
