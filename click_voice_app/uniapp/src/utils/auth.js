export const setUser = (data) => {
  try {
    return uni.setStorageSync('user', data)
  } catch (e) {
    uni.showToast({
      title: e,
      icon: "error"
    })
  }
}

export const getUser = () => {
  try {
    return uni.getStorageSync('user')
  } catch (e) {
    uni.showToast({
      title: e,
      icon: "error"
    })
  }
}


export const setToken = (data) => {
  try {
    return uni.setStorageSync('token', data)
  } catch (e) {
    uni.showToast({
      title: e,
      icon: "error"
    })
  }
}

export const getToken = () => {
  try {
    return uni.getStorageSync('token')
  } catch (e) {
    uni.showToast({
      title: e,
      icon: "error"
    })
  }
}

export function getIp() {
  return new Promise((resolve, reject) => {
    uni.request({
      method: "GET",
      url: "https://api64.ipify.org?format=json",
      success: async (res) => {
        resolve(res.data.ip);
      },
      fail: (err) => reject(err),
    });
  });
}
