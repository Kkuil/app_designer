<template>
  <div class="user-auth">
    <el-card>
      <template #header>
        <span>用户认证管理</span>
      </template>

      <el-tabs v-model="activeTab">
        <!-- 登录认证配置 -->
        <el-tab-pane label="登录认证配置" name="auth">
          <el-form :model="authConfig" label-width="180px">
            <el-divider content-position="left">基础认证设置</el-divider>
            
            <el-form-item label="启用用户注册">
              <el-switch v-model="authConfig.enableRegister" />
              <span class="form-tip">关闭后用户无法自主注册账号</span>
            </el-form-item>

            <el-form-item label="注册审核">
              <el-switch v-model="authConfig.requireApproval" :disabled="!authConfig.enableRegister" />
              <span class="form-tip">开启后新用户注册需要管理员审核</span>
            </el-form-item>

            <el-form-item label="启用验证码">
              <el-switch v-model="authConfig.enableCaptcha" />
              <span class="form-tip">登录时需要输入验证码</span>
            </el-form-item>

            <el-form-item label="验证码类型" v-if="authConfig.enableCaptcha">
              <el-radio-group v-model="authConfig.captchaType">
                <el-radio value="text">文字验证码</el-radio>
                <el-radio value="slide">滑块验证码</el-radio>
                <el-radio value="image">图片验证码</el-radio>
              </el-radio-group>
            </el-form-item>

            <el-divider content-position="left">密码策略</el-divider>

            <el-form-item label="密码最小长度">
              <el-input-number v-model="authConfig.passwordMinLength" :min="6" :max="20" />
              <span class="form-tip">位</span>
            </el-form-item>

            <el-form-item label="密码复杂度要求">
              <el-checkbox-group v-model="authConfig.passwordComplexity">
                <el-checkbox value="uppercase">包含大写字母</el-checkbox>
                <el-checkbox value="lowercase">包含小写字母</el-checkbox>
                <el-checkbox value="number">包含数字</el-checkbox>
                <el-checkbox value="special">包含特殊字符</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item label="密码有效期">
              <el-input-number v-model="authConfig.passwordExpireDays" :min="0" :max="365" />
              <span class="form-tip">天（0表示永不过期）</span>
            </el-form-item>

            <el-form-item label="密码历史记录">
              <el-input-number v-model="authConfig.passwordHistory" :min="0" :max="10" />
              <span class="form-tip">新密码不能与最近N次使用过的密码相同</span>
            </el-form-item>

            <el-divider content-position="left">登录安全</el-divider>

            <el-form-item label="最大登录失败次数">
              <el-input-number v-model="authConfig.maxLoginAttempts" :min="3" :max="10" />
              <span class="form-tip">次</span>
            </el-form-item>

            <el-form-item label="账号锁定时长">
              <el-input-number v-model="authConfig.lockDuration" :min="5" :max="1440" />
              <span class="form-tip">分钟</span>
            </el-form-item>

            <el-form-item label="会话超时时间">
              <el-input-number v-model="authConfig.sessionTimeout" :min="30" :max="1440" />
              <span class="form-tip">分钟（无操作自动退出）</span>
            </el-form-item>

            <el-form-item label="强制定期修改密码">
              <el-switch v-model="authConfig.forcePasswordChange" />
            </el-form-item>

            <el-form-item label="首次登录修改密码">
              <el-switch v-model="authConfig.firstLoginChangePassword" />
            </el-form-item>

            <el-divider content-position="left">多因素认证</el-divider>

            <el-form-item label="启用多因素认证">
              <el-switch v-model="authConfig.enableMFA" />
              <span class="form-tip">增强账号安全性</span>
            </el-form-item>

            <el-form-item label="认证方式" v-if="authConfig.enableMFA">
              <el-checkbox-group v-model="authConfig.mfaMethods">
                <el-checkbox value="sms">短信验证码</el-checkbox>
                <el-checkbox value="email">邮箱验证码</el-checkbox>
                <el-checkbox value="totp">动态口令(TOTP)</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-divider content-position="left">单点登录</el-divider>

            <el-form-item label="启用SSO">
              <el-switch v-model="authConfig.enableSSO" />
              <span class="form-tip">允许通过第三方平台登录</span>
            </el-form-item>

            <el-form-item label="SSO平台" v-if="authConfig.enableSSO">
              <el-checkbox-group v-model="authConfig.ssoProviders">
                <el-checkbox value="wechat">微信</el-checkbox>
                <el-checkbox value="dingtalk">钉钉</el-checkbox>
                <el-checkbox value="feishu">飞书</el-checkbox>
                <el-checkbox value="ldap">LDAP</el-checkbox>
                <el-checkbox value="cas">CAS</el-checkbox>
              </el-checkbox-group>
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="saveAuthConfig">保存配置</el-button>
              <el-button @click="resetAuthConfig">重置</el-button>
            </el-form-item>
          </el-form>
        </el-tab-pane>

        <!-- 在线用户 -->
        <el-tab-pane label="在线用户" name="online">
          <el-form :inline="true" :model="onlineSearchForm" style="margin-bottom: 20px">
            <el-form-item label="用户名">
              <el-input v-model="onlineSearchForm.username" placeholder="请输入用户名" clearable />
            </el-form-item>
            <el-form-item label="部门">
              <el-select v-model="onlineSearchForm.deptId" placeholder="请选择部门" clearable>
                <el-option label="全部" value="" />
                <el-option label="生物工程系" value="1" />
                <el-option label="化学系" value="2" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="searchOnlineUsers">查询</el-button>
              <el-button @click="refreshOnlineUsers">刷新</el-button>
            </el-form-item>
          </el-form>

          <el-table :data="onlineUsers" border>
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="realName" label="姓名" />
            <el-table-column prop="deptName" label="部门" />
            <el-table-column prop="ipAddress" label="IP地址" width="140" />
            <el-table-column prop="browser" label="浏览器" />
            <el-table-column prop="os" label="操作系统" />
            <el-table-column prop="loginTime" label="登录时间" width="160" />
            <el-table-column prop="lastActiveTime" label="最后活动" width="160" />
            <el-table-column label="操作" width="120">
              <template #default="{ row }">
                <el-button link type="danger" size="small" @click="forceLogout(row)">
                  强制下线
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="onlinePage.current"
            v-model:page-size="onlinePage.size"
            :total="onlinePage.total"
            layout="total, sizes, prev, pager, next"
            @size-change="handleOnlineSizeChange"
            @current-change="handleOnlineCurrentChange"
            style="margin-top: 20px; justify-content: flex-end"
          />
        </el-tab-pane>

        <!-- 待审核用户 -->
        <el-tab-pane label="待审核用户" name="pending">
          <el-table :data="pendingUsers" border>
            <el-table-column prop="username" label="用户名" />
            <el-table-column prop="realName" label="姓名" />
            <el-table-column prop="phone" label="手机号" />
            <el-table-column prop="email" label="邮箱" />
            <el-table-column prop="deptName" label="申请部门" />
            <el-table-column prop="registerTime" label="注册时间" width="160" />
            <el-table-column label="操作" width="180">
              <template #default="{ row }">
                <el-button link type="success" size="small" @click="approveUser(row)">
                  通过
                </el-button>
                <el-button link type="danger" size="small" @click="rejectUser(row)">
                  拒绝
                </el-button>
                <el-button link type="primary" size="small" @click="viewUserDetail(row)">
                  详情
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <el-pagination
            v-model:current-page="pendingPage.current"
            v-model:page-size="pendingPage.size"
            :total="pendingPage.total"
            layout="total, sizes, prev, pager, next"
            @size-change="handlePendingSizeChange"
            @current-change="handlePendingCurrentChange"
            style="margin-top: 20px; justify-content: flex-end"
          />
        </el-tab-pane>
      </el-tabs>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const activeTab = ref('auth')

const authConfig = reactive({
  enableRegister: true,
  requireApproval: true,
  enableCaptcha: true,
  captchaType: 'slide',
  passwordMinLength: 8,
  passwordComplexity: ['uppercase', 'lowercase', 'number'],
  passwordExpireDays: 90,
  passwordHistory: 3,
  maxLoginAttempts: 5,
  lockDuration: 30,
  sessionTimeout: 120,
  forcePasswordChange: false,
  firstLoginChangePassword: true,
  enableMFA: false,
  mfaMethods: ['sms', 'email'],
  enableSSO: false,
  ssoProviders: []
})

const onlineSearchForm = reactive({
  username: '',
  deptId: ''
})

const onlineUsers = ref([
  {
    id: 1,
    username: 'zhangsan',
    realName: '张三',
    deptName: '生物工程系',
    ipAddress: '192.168.1.100',
    browser: 'Chrome 120',
    os: 'Windows 11',
    loginTime: '2024-12-25 09:00:00',
    lastActiveTime: '2024-12-25 10:30:00'
  },
  {
    id: 2,
    username: 'lisi',
    realName: '李四',
    deptName: '化学系',
    ipAddress: '192.168.1.101',
    browser: 'Edge 120',
    os: 'Windows 10',
    loginTime: '2024-12-25 08:30:00',
    lastActiveTime: '2024-12-25 10:28:00'
  }
])

const onlinePage = reactive({
  current: 1,
  size: 10,
  total: 2
})

const pendingUsers = ref([
  {
    id: 1,
    username: 'wangwu',
    realName: '王五',
    phone: '13800138000',
    email: 'wangwu@example.com',
    deptName: '物理系',
    registerTime: '2024-12-25 09:30:00'
  },
  {
    id: 2,
    username: 'zhaoliu',
    realName: '赵六',
    phone: '13900139000',
    email: 'zhaoliu@example.com',
    deptName: '材料系',
    registerTime: '2024-12-25 10:00:00'
  }
])

const pendingPage = reactive({
  current: 1,
  size: 10,
  total: 2
})

const saveAuthConfig = () => {
  ElMessage.success('认证配置已保存')
}

const resetAuthConfig = () => {
  ElMessage.info('配置已重置')
}

const searchOnlineUsers = () => {
  console.log('搜索在线用户', onlineSearchForm)
}

const refreshOnlineUsers = () => {
  ElMessage.success('数据已刷新')
}

const forceLogout = (row: any) => {
  ElMessageBox.confirm(`确认强制用户 ${row.realName} 下线吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('用户已强制下线')
  })
}

const approveUser = (row: any) => {
  ElMessageBox.confirm(`确认通过用户 ${row.realName} 的注册申请吗？`, '提示', {
    type: 'warning'
  }).then(() => {
    ElMessage.success('审核通过')
  })
}

const rejectUser = (row: any) => {
  ElMessageBox.prompt('请输入拒绝原因', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /.+/,
    inputErrorMessage: '拒绝原因不能为空'
  }).then(() => {
    ElMessage.success('已拒绝')
  })
}

const viewUserDetail = (row: any) => {
  console.log('查看用户详情', row)
}

const handleOnlineSizeChange = (size: number) => {
  onlinePage.size = size
}

const handleOnlineCurrentChange = (current: number) => {
  onlinePage.current = current
}

const handlePendingSizeChange = (size: number) => {
  pendingPage.size = size
}

const handlePendingCurrentChange = (current: number) => {
  pendingPage.current = current
}
</script>

<style scoped>
.user-auth {
  padding: 20px;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 12px;
}
</style>
