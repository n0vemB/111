Page({
  data: {
    userInfo: null,
    phoneError: ''
  },

  onLoad(options) {
    if (options.userInfo) {
      this.setData({
        userInfo: JSON.parse(options.userInfo)
      });
    }
  },

  onPhoneInput(e) {
    const phone = e.detail.value;
    let phoneError = '';
    
    if (phone && !/^1[3-9]\d{9}$/.test(phone)) {
      phoneError = '请输入正确的手机号码';
    }
    
    this.setData({
      phoneError
    });
  },

  handleSubmit(e) {
    const formData = e.detail.value;
    
    // 验证必填字段
    if (!formData.referrer || !formData.dingName || !formData.phone) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(formData.phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      });
      return;
    }

    // 获取 openid
    const openid = wx.getStorageSync('openid');
    if (!openid) {
      wx.showToast({
        title: '用户信息异常，请重新进入',
        icon: 'none'
      });
      return;
    }

    // 显示加载状态
    wx.showLoading({
      title: '提交中...'
    });

    const submitData = {
      ...formData,
      userInfo: this.data.userInfo,
      openid: openid,
      createTime: new Date().toISOString()
    };

    console.log('提交数据:', submitData);

    wx.request({
      url: 'https://bk-lilac.vercel.app/api/submit',
      method: 'POST',
      data: submitData,
      success: (res) => {
        wx.hideLoading();
        console.log('提交结果:', res);
        
        if (res.data.success) {
          wx.redirectTo({
            url: '/pages/success/success'
          });
        } else {
          wx.showToast({
            title: res.data.message || '提交失败',
            icon: 'none'
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('提交失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  }
});
