<template>
  <el-container class="admin-layout">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '220px'" class="sidebar">
      <div class="logo">
        <span v-show="!isCollapse">农业科研知识数据管理系统</span>
      </div>
      <el-scrollbar>
        <el-menu :default-active="activeMenu" :collapse="isCollapse" :unique-opened="true" router
          background-color="#001529" text-color="rgba(255, 255, 255, 0.65)" active-text-color="#ffffff">
          <el-menu-item index="/dashboard">
            <el-icon>
              <Odometer />
            </el-icon>
            <template #title>控制台</template>
          </el-menu-item>

          <!-- 平台管理 -->
          <el-sub-menu index="/system">
            <template #title>
              <el-icon>
                <Setting />
              </el-icon>
              <span>平台管理</span>
            </template>
            <el-menu-item index="/system/client">客户端管理</el-menu-item>
            <el-menu-item index="/system/user">用户管理</el-menu-item>
            <el-menu-item index="/system/dept">部门管理</el-menu-item>
            <el-menu-item index="/system/post">岗位管理</el-menu-item>
            <el-menu-item index="/system/menu">菜单管理</el-menu-item>
            <el-menu-item index="/system/role">角色管理</el-menu-item>
            <el-menu-item index="/system/dict">字典管理</el-menu-item>
            <el-menu-item index="/system/param">参数管理</el-menu-item>
            <el-menu-item index="/system/notice">通知公告</el-menu-item>
            <el-menu-item index="/system/operlog">操作日志</el-menu-item>
            <el-menu-item index="/system/loginlog">登录日志</el-menu-item>
            <el-menu-item index="/system/file">文件管理</el-menu-item>
            <el-menu-item index="/system/fileconfig">文件配置</el-menu-item>
            <el-menu-item index="/system/online">在线用户</el-menu-item>
            <el-menu-item index="/system/task">定时任务</el-menu-item>
          </el-sub-menu>

          <!-- 基础功能 -->
          <el-sub-menu index="/basic">
            <template #title>
              <el-icon>
                <Grid />
              </el-icon>
              <span>基础功能</span>
            </template>
            <el-menu-item index="/basic/config">系统配置</el-menu-item>
            <el-menu-item index="/basic/runlog">运行日志</el-menu-item>
            <el-menu-item index="/basic/alarm">报警管理</el-menu-item>
            <el-menu-item index="/basic/report">报表查询</el-menu-item>
            <el-menu-item index="/basic/mode">模式控制</el-menu-item>
            <el-menu-item index="/basic/credit">信用积分设置</el-menu-item>
          </el-sub-menu>

          <!-- 实验室设备 -->
          <el-sub-menu index="/lab">
            <template #title>
              <el-icon>
                <Monitor />
              </el-icon>
              <span>实验室设备</span>
            </template>
            <el-menu-item index="/lab/workbench">个人工作台</el-menu-item>
            <el-menu-item index="/lab/pi-workbench">PI工作台</el-menu-item>
            <el-menu-item index="/lab/usage-reservation">使用预约</el-menu-item>
            <!-- 设备管理 -->
            <el-sub-menu index="/lab/equipment-manage">
              <template #title>设备管理</template>
              <el-menu-item index="/lab/equipment-manage/list">设备台账</el-menu-item>
              <el-menu-item index="/lab/equipment-manage/add">新增设备</el-menu-item>
              <el-menu-item index="/lab/equipment-manage/params">设备技术参数</el-menu-item>
              <el-menu-item index="/lab/equipment-manage/scrap">确认及报废</el-menu-item>
            </el-sub-menu>
            <!-- 维护管理 -->
            <el-sub-menu index="/lab/maintenance-manage">
              <template #title>维护管理</template>
              <el-menu-item index="/lab/maintenance-manage/overview">维护保养</el-menu-item>
              <el-menu-item index="/lab/maintenance-manage/maintain">保养管理</el-menu-item>
              <el-menu-item index="/lab/maintenance-manage/calibration">校准管理</el-menu-item>
              <el-menu-item index="/lab/maintenance-manage/repair">维修管理</el-menu-item>
            </el-sub-menu>
            <!-- 预约管理 -->
            <el-sub-menu index="/lab/reservation-manage">
              <template #title>预约管理</template>
              <el-menu-item index="/lab/reservation-manage/overview">预约概况</el-menu-item>
              <el-menu-item index="/lab/reservation-manage/pending">等待审核</el-menu-item>
              <el-menu-item index="/lab/reservation-manage/all">全部预约</el-menu-item>
            </el-sub-menu>
            <!-- 仪器管理 -->
            <el-sub-menu index="/lab/instrument-manage">
              <template #title>仪器管理</template>
              <el-menu-item index="/lab/instrument-manage/list">仪器列表</el-menu-item>
              <el-menu-item index="/lab/instrument-manage/follow">仪器关注</el-menu-item>
            </el-sub-menu>
            <!-- 计费管理 -->
            <el-menu-item index="/lab/billing-manage">计费管理</el-menu-item>
            <!-- 人员管理 -->
            <el-menu-item index="/lab/personnel-manage">人员管理</el-menu-item>
            <!-- 课题组管理 -->
            <el-menu-item index="/lab/research-group">课题组管理</el-menu-item>
            <!-- 黑名单管理 -->
            <el-menu-item index="/lab/blacklist">黑名单管理</el-menu-item>
            <!-- 仪器知识库 -->
            <el-menu-item index="/lab/knowledge">仪器知识库</el-menu-item>
            <!-- 大数据分析 -->
            <el-menu-item index="/lab/big-data">大数据分析</el-menu-item>
            <!-- 统计报表 -->
            <el-sub-menu index="/lab/stats">
              <template #title>统计报表</template>
              <el-menu-item index="/lab/stats/reservation">预约统计</el-menu-item>
              <el-menu-item index="/lab/stats/report">统计报表</el-menu-item>
            </el-sub-menu>
            <!-- 规则设置 -->
            <el-sub-menu index="/lab/rules-setting">
              <template #title>规则设置</template>
              <el-menu-item index="/lab/rules-setting/reservation">预约规则</el-menu-item>
              <el-menu-item index="/lab/rules-setting/billing">计费规则</el-menu-item>
              <el-menu-item index="/lab/rules-setting/billingCalculator">计费计算器</el-menu-item>
              <el-menu-item index="/lab/rules-setting/billingRulesAdvance">计费规则管理</el-menu-item>
              <el-menu-item index="/lab/rules-setting/penalty">违约计费</el-menu-item>
              <el-menu-item index="/lab/rules-setting/period">账期设置</el-menu-item>
              <el-menu-item index="/lab/rules-setting/auto-confirm">上机自动确认</el-menu-item>
              <el-menu-item index="/lab/rules-setting/bill-generation">账单生成</el-menu-item>
              <el-menu-item index="/lab/rules-setting/bill-auto-confirm">账单自动确认</el-menu-item>
            </el-sub-menu>
          </el-sub-menu>

          <!-- 试剂耗材 -->
          <el-sub-menu index="/reagent">
            <template #title>
              <el-icon>
                <Box />
              </el-icon>
              <span>试剂耗材</span>
            </template>
            <el-menu-item index="/reagent/inventory">库存管理</el-menu-item>
            <el-menu-item index="/reagent/normal">普通试剂</el-menu-item>
            <el-menu-item index="/reagent/hazardous">危化品管理</el-menu-item>
            <el-menu-item index="/reagent/history">历史记录</el-menu-item>
            <el-menu-item index="/reagent/purchase">申购管理</el-menu-item>
            <el-menu-item index="/reagent/inbound">入库管理</el-menu-item>
            <el-menu-item index="/reagent/outbound">领用管理</el-menu-item>
            <el-menu-item index="/reagent/return">归还管理</el-menu-item>
            <el-menu-item index="/reagent/damage">报损管理</el-menu-item>
            <el-menu-item index="/reagent/warning">预警管理</el-menu-item>
            <el-menu-item index="/reagent/stock-check">盘库管理</el-menu-item>
            <el-menu-item index="/reagent/approval">审批设置</el-menu-item>
            <el-menu-item index="/reagent/order">采购订单</el-menu-item>
            <el-menu-item index="/reagent/stats">统计分析</el-menu-item>
          </el-sub-menu>

          <!-- 项目管理 -->
          <el-sub-menu index="/project">
            <template #title>
              <el-icon>
                <Folder />
              </el-icon>
              <span>项目管理</span>
            </template>
            <el-menu-item index="/project/apply">项目申报</el-menu-item>
            <el-menu-item index="/project/review">项目评审</el-menu-item>
            <el-menu-item index="/project/setup">项目立项</el-menu-item>
            <el-menu-item index="/project/progress">进度管理</el-menu-item>
            <el-menu-item index="/project/quality">质量管理</el-menu-item>
            <el-menu-item index="/project/resource">资源管理</el-menu-item>
            <el-menu-item index="/project/team">团队协作</el-menu-item>
            <el-menu-item index="/project/fund">经费管理</el-menu-item>
            <el-menu-item index="/project/achievement">成果管理</el-menu-item>
            <el-menu-item index="/project/ledger">成果台账</el-menu-item>
            <el-menu-item index="/project/award">获奖荣誉</el-menu-item>
            <el-menu-item index="/project/paper-claim">论文成果认领</el-menu-item>
          </el-sub-menu>
        </el-menu>
      </el-scrollbar>
    </el-aside>

    <el-container>
      <!-- 顶部导航 -->
      <el-header class="header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="toggleCollapse">
            <component :is="isCollapse ? 'Expand' : 'Fold'" />
          </el-icon>
          <el-breadcrumb separator="/">
            <el-breadcrumb-item :to="{ path: '/' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item v-for="item in breadcrumbs" :key="item.path">
              {{ item.title }}
            </el-breadcrumb-item>
          </el-breadcrumb>
        </div>
        <div class="header-right">
          <el-tooltip content="全屏" placement="bottom">
            <el-icon class="header-icon" @click="toggleFullscreen">
              <FullScreen />
            </el-icon>
          </el-tooltip>
          <el-tooltip content="消息" placement="bottom">
            <el-badge :value="5" class="header-badge">
              <el-icon class="header-icon" @click="showMessages">
                <Bell />
              </el-icon>
            </el-badge>
          </el-tooltip>
          <el-dropdown @command="handleCommand">
            <div class="user-info">
              <el-avatar :size="32">管</el-avatar>
              <span>管理员</span>
              <el-icon>
                <ArrowDown />
              </el-icon>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="profile">个人中心</el-dropdown-item>
                <el-dropdown-item command="password">修改密码</el-dropdown-item>
                <el-dropdown-item divided command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区 -->
      <el-main class="main-content">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'

const route = useRoute()
const router = useRouter()

const isCollapse = ref(false)

const activeMenu = computed(() => route.path)

const breadcrumbs = computed(() => {
  const matched = route.matched.filter(item => item.meta?.title)
  return matched.slice(1).map(item => ({
    path: item.path,
    title: item.meta.title as string
  }))
})

watch(() => route.path, () => {
  // 路由变化时的处理
})

const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
    ElMessage.success('已进入全屏模式')
  } else {
    document.exitFullscreen()
    ElMessage.info('已退出全屏模式')
  }
}

const showMessages = () => {
  ElMessage.info('您有5条未读消息')
}

const handleCommand = (command: string) => {
  switch (command) {
    case 'profile':
      ElMessage.info('跳转到个人中心')
      break
    case 'password':
      ElMessage.info('打开修改密码对话框')
      break
    case 'logout':
      ElMessageBox.confirm('确定要退出登录吗？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        ElMessage.success('退出登录成功')
        router.push('/login')
      }).catch(() => { })
      break
  }
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}

.sidebar {
  background-color: #001529;
  transition: width 0.3s;
  overflow: hidden;
}

.logo {
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: white;
  font-size: 16px;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  white-space: nowrap;
  overflow: hidden;
}

.sidebar .el-menu {
  border-right: none;
}

.header {
  background: white;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  align-items: center;
  gap: 15px;
}

.collapse-btn {
  font-size: 20px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.collapse-btn:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.header-icon {
  font-size: 18px;
  cursor: pointer;
  color: #606266;
  transition: color 0.3s;
}

.header-icon:hover {
  color: #409eff;
}

.header-badge {
  cursor: pointer;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  color: #606266;
}

.user-info span {
  font-size: 14px;
}

.main-content {
  background-color: #f0f2f5;
  padding: 20px;
  overflow-y: auto;
}
</style>
