import { request } from '@/utils/request'
import type { LoginParams, UserInfo, UserListItem, UserQueryParams, CreateUserParams, UpdateUserParams } from '@/types/user'

// 登录
export const login = (data: LoginParams) => {
  return request.post<{ data: { token: string } }>('/auth/login', data)
}

// 退出登录
export const logout = () => {
  return request.post('/auth/logout')
}

// 获取用户信息
export const getUserInfo = () => {
  return request.get<{ data: UserInfo }>('/user/info')
}

// 获取用户列表
export const getUserList = (params: UserQueryParams) => {
  return request.get<{ data: { list: UserListItem[]; total: number } }>('/user/list', { params })
}

// 创建用户
export const createUser = (data: CreateUserParams) => {
  return request.post('/user/create', data)
}

// 更新用户
export const updateUser = (data: UpdateUserParams) => {
  return request.put(`/user/${data.id}`, data)
}

// 删除用户
export const deleteUser = (id: number) => {
  return request.delete(`/user/${id}`)
}

// 重置密码
export const resetPassword = (id: number, password: string) => {
  return request.put(`/user/${id}/password`, { password })
}

// 更新用户状态
export const updateUserStatus = (id: number, status: number) => {
  return request.put(`/user/${id}/status`, { status })
}

// 获取验证码
export const getCaptcha = () => {
  return request.get<{ data: { key: string; image: string } }>('/auth/captcha')
}
