// 用户相关类型定义

export interface LoginParams {
  username: string
  password: string
  captcha?: string
  captchaKey?: string
}

export interface UserInfo {
  id: number
  username: string
  name: string
  avatar: string
  email: string
  phone: string
  department: string
  roles: string[]
  permissions: string[]
  createTime: string
  lastLoginTime: string
}

export interface UserListItem {
  id: number
  username: string
  name: string
  email: string
  phone: string
  department: string
  status: number
  roles: string[]
  createTime: string
}

export interface UserQueryParams {
  username?: string
  name?: string
  department?: string
  status?: number
  pageNum: number
  pageSize: number
}

export interface CreateUserParams {
  username: string
  password: string
  name: string
  email: string
  phone: string
  department: string
  roles: string[]
}

export interface UpdateUserParams extends Partial<CreateUserParams> {
  id: number
}

// 角色相关类型
export interface Role {
  id: number
  name: string
  code: string
  description: string
  status: number
  permissions: string[]
  createTime: string
}

// 权限相关类型
export interface Permission {
  id: number
  name: string
  code: string
  type: 'menu' | 'button' | 'api'
  parentId: number
  path?: string
  component?: string
  icon?: string
  sort: number
  status: number
  children?: Permission[]
}
