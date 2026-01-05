// API基础配置
const BASE_URL = 'http://localhost:8080/api'

interface RequestOptions {
  url: string
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE'
  data?: any
  header?: Record<string, string>
  showLoading?: boolean
  showError?: boolean
}

interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 请求封装
export const request = <T = any>(options: RequestOptions): Promise<ApiResponse<T>> => {
  const { url, method = 'GET', data, header = {}, showLoading = true, showError = true } = options
  
  return new Promise((resolve, reject) => {
    // 显示加载
    if (showLoading) {
      uni.showLoading({ title: '加载中...' })
    }
    
    // 获取token
    const token = uni.getStorageSync('token')
    
    uni.request({
      url: BASE_URL + url,
      method,
      data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        ...header
      },
      success: (res: any) => {
        uni.hideLoading()
        
        if (res.statusCode === 200) {
          const result = res.data as ApiResponse<T>
          
          if (result.code === 200 || result.code === 0) {
            resolve(result)
          } else if (result.code === 401) {
            // Token过期
            uni.removeStorageSync('token')
            uni.reLaunch({ url: '/pages/login/index' })
            reject(new Error('登录已过期，请重新登录'))
          } else {
            if (showError) {
              uni.showToast({
                title: result.message || '请求失败',
                icon: 'none'
              })
            }
            reject(new Error(result.message))
          }
        } else {
          if (showError) {
            uni.showToast({
              title: '网络请求失败',
              icon: 'none'
            })
          }
          reject(new Error('网络请求失败'))
        }
      },
      fail: (err) => {
        uni.hideLoading()
        if (showError) {
          uni.showToast({
            title: '网络连接失败',
            icon: 'none'
          })
        }
        reject(err)
      }
    })
  })
}

// GET请求
export const get = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
  return request<T>({ url, method: 'GET', data, ...options })
}

// POST请求
export const post = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
  return request<T>({ url, method: 'POST', data, ...options })
}

// PUT请求
export const put = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
  return request<T>({ url, method: 'PUT', data, ...options })
}

// DELETE请求
export const del = <T = any>(url: string, data?: any, options?: Partial<RequestOptions>) => {
  return request<T>({ url, method: 'DELETE', data, ...options })
}

export default {
  request,
  get,
  post,
  put,
  del
}
