const app = getApp();

Page({
  data: {
    canIUseGetUserProfile: false,
  },

  onLoad() {
    if (wx.getUserProfile) {
      this.setData({
        canIUseGetUserProfile: true
      });
    }
  },

  // 点击领取福利按钮
  claimGift() {
    // 先请求用户授权
    this.getUserProfile();
  },

  getUserProfile() {
    if (this.data.canIUseGetUserProfile) {
      // 使用新的授权方式
      wx.getUserProfile({
        desc: '用于完善会员资料',
        success: (res) => {
          console.log('获取用户信息成功:', res.userInfo);
          
          // 存储用户信息到本地
          wx.setStorageSync('userInfo', res.userInfo);
          
          // 授权成功后检查用户是否已存在
          this.checkUserExists(res.userInfo);
        },
        fail: (err) => {
          console.error('获取用户信息失败:', err);
          wx.showToast({
            title: '需要授权才能继续',
            icon: 'none'
          });
        }
      });
    } else {
      // 使用旧的授权方式 - 获取基础信息
      wx.login({
        success: (loginRes) => {
          console.log('登录成功:', loginRes);
          // 生成临时用户信息
          const tempUserInfo = {
            nickName: '微信用户',
            avatarUrl: '/images/default-avatar.png'
          };
          
          wx.setStorageSync('userInfo', tempUserInfo);
          this.checkUserExists(tempUserInfo);
        },
        fail: (err) => {
          console.error('登录失败:', err);
          wx.showToast({
            title: '登录失败，请重试',
            icon: 'none'
          });
        }
      });
    }
  },

  checkUserExists(userInfo) {
    // 生成或获取唯一标识
    let openid = wx.getStorageSync('openid');
    if (!openid) {
      openid = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      wx.setStorageSync('openid', openid);
    }
    
    wx.showLoading({
      title: '检查中...'
    });
    
    wx.request({
      url: `${app.globalData.apiBase}/api/check-user`,
      method: 'POST',
      data: { openid },
      success: (res) => {
        wx.hideLoading();
        console.log('检查用户结果:', res.data);
        
        if (res.data.exists) {
          wx.showModal({
            title: '提示',
            content: '您已经提交过信息了，不能重复领取',
            showCancel: false,
            confirmText: '知道了'
          });
        } else {
          wx.navigateTo({
            url: `/pages/form/form?userInfo=${encodeURIComponent(JSON.stringify(userInfo))}`
          });
        }
      },
      fail: (err) => {
        wx.hideLoading();
        console.error('检查用户失败:', err);
        wx.showToast({
          title: '网络错误，请重试',
          icon: 'none'
        });
      }
    });
  }
});
