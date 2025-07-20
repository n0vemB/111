Page({
  data: {
    userInfo: null,
    phoneError: '',
    phoneNumber: ''
  },

  onLoad(options) {
    if (options.userInfo) {
      this.setData({
        userInfo: JSON.parse(options.userInfo)
      });
    }
  },

  onGetPhoneNumber(e) {
    console.log('获取手机号结果:', e.detail);
    
    if (e.detail.errMsg === 'getPhoneNumber:ok') {
      // 需要发送到后端解密获取真实手机号
      wx.showLoading({
        title: '获取中...'
      });
      
      wx.request({
        url: 'https://bk-lilac.vercel.app/api/decrypt-phone',
        method: 'POST',
        data: {
          encryptedData: e.detail.encryptedData,
          iv: e.detail.iv,
          sessionKey: wx.getStorageSync('session_key') // 需要先获取session_key
        },
        success: (res) => {
          wx.hideLoading();
          if (res.data.success) {
            this.setData({
              phoneNumber: res.data.phoneNumber
            });
            wx.showToast({
              title: '获取成功',
              icon: 'success'
            });
          } else {
            wx.showToast({
              title: '获取失败，请手动输入',
              icon: 'none'
            });
          }
        },
        fail: () => {
          wx.hideLoading();
          wx.showToast({
            title: '获取失败，请手动输入',
            icon: 'none'
          });
        }
      });
    } else {
      wx.showToast({
        title: '需要授权手机号',
        icon: 'none'
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
      phoneNumber: phone,
      phoneError
    });
  },

  handleSubmit(e) {
    const formData = e.detail.value;
    
    // 使用页面数据中的手机号
    const phone = this.data.phoneNumber || formData.phone;
    
    // 验证必填字段
    if (!formData.referrer || !formData.dingName || !phone) {
      wx.showToast({
        title: '请填写完整信息',
        icon: 'none'
      });
      return;
    }

    // 验证手机号格式
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      wx.showToast({
        title: '请输入正确的手机号码',
        icon: 'none'
      });
      return;
    }

    // 获取 openid
    const openid = wx.getStorageSync('stable_openid');
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
      phone: phone, // 使用获取到的手机号
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
