import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { title: '登录' }
  },
  {
    path: '/',
    component: () => import('@/layouts/AdminLayout.vue'),
    redirect: '/dashboard',
    children: [
      // 仪表盘
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '控制台', icon: 'Odometer' }
      },
      // 平台管理
      {
        path: 'system',
        name: 'System',
        meta: { title: '平台管理', icon: 'Setting' },
        children: [
          { path: 'client', name: 'ClientManage', component: () => import('@/views/system/ClientManage.vue'), meta: { title: '客户端管理' } },
          { path: 'user', name: 'UserManage', component: () => import('@/views/system/UserManage.vue'), meta: { title: '用户管理' } },
          { path: 'dept', name: 'DeptManage', component: () => import('@/views/system/DeptManage.vue'), meta: { title: '部门管理' } },
          { path: 'post', name: 'PostManage', component: () => import('@/views/system/PostManage.vue'), meta: { title: '岗位管理' } },
          { path: 'menu', name: 'MenuManage', component: () => import('@/views/system/MenuManage.vue'), meta: { title: '菜单管理' } },
          { path: 'role', name: 'RoleManage', component: () => import('@/views/system/RoleManage.vue'), meta: { title: '角色管理' } },
          { path: 'dict', name: 'DictManage', component: () => import('@/views/system/DictManage.vue'), meta: { title: '字典管理' } },
          { path: 'param', name: 'ParamManage', component: () => import('@/views/system/ParamManage.vue'), meta: { title: '参数管理' } },
          { path: 'notice', name: 'NoticeManage', component: () => import('@/views/system/NoticeManage.vue'), meta: { title: '通知公告' } },
          { path: 'operlog', name: 'OperLog', component: () => import('@/views/system/OperLog.vue'), meta: { title: '操作日志' } },
          { path: 'loginlog', name: 'LoginLog', component: () => import('@/views/system/LoginLog.vue'), meta: { title: '登录日志' } },
          { path: 'file', name: 'FileManage', component: () => import('@/views/system/FileManage.vue'), meta: { title: '文件管理' } },
          { path: 'fileconfig', name: 'FileConfig', component: () => import('@/views/system/FileConfig.vue'), meta: { title: '文件配置' } },
          { path: 'online', name: 'OnlineUser', component: () => import('@/views/system/OnlineUser.vue'), meta: { title: '在线用户' } },
          { path: 'task', name: 'TaskManage', component: () => import('@/views/system/TaskManage.vue'), meta: { title: '定时任务' } }
        ]
      },
      // 基础功能
      {
        path: 'basic',
        name: 'Basic',
        meta: { title: '基础功能', icon: 'Grid' },
        children: [
          { path: 'auth', name: 'UserAuth', component: () => import('@/views/basic/UserAuth.vue'), meta: { title: '用户认证' } },
          { path: 'config', name: 'SystemConfig', component: () => import('@/views/basic/SystemConfig.vue'), meta: { title: '系统配置' } },
          { path: 'runlog', name: 'RunLog', component: () => import('@/views/basic/RunLog.vue'), meta: { title: '运行日志' } },
          { path: 'alarm', name: 'AlarmManage', component: () => import('@/views/basic/AlarmManage.vue'), meta: { title: '报警管理' } },
          { path: 'report', name: 'ReportQuery', component: () => import('@/views/basic/ReportQuery.vue'), meta: { title: '报表查询' } },
          { path: 'mode', name: 'ModeControl', component: () => import('@/views/basic/ModeControl.vue'), meta: { title: '模式控制' } },
          { path: 'credit', name: 'CreditScore', component: () => import('@/views/basic/CreditScore.vue'), meta: { title: '信用积分设置' } }
        ]
      },
      // 实验室设备预约
      {
        path: 'lab',
        name: 'Lab',
        meta: { title: '实验室设备', icon: 'Monitor' },
        children: [
          { path: 'workbench', name: 'PersonalWorkbench', component: () => import('@/views/lab/PersonalWorkbench.vue'), meta: { title: '个人工作台' } },
          { path: 'pi-workbench', name: 'PIWorkbench', component: () => import('@/views/lab/PIWorkbench.vue'), meta: { title: 'PI工作台' } },
          { path: 'usage-reservation', name: 'UsageReservation', component: () => import('@/views/lab/UsageReservation.vue'), meta: { title: '使用预约' } },
          { path: 'billing-manage', name: 'BillingManage', component: () => import('@/views/lab/BillingManage.vue'), meta: { title: '计费管理' } },
          { path: 'personnel-manage', name: 'PersonnelManage', component: () => import('@/views/lab/PersonnelManage.vue'), meta: { title: '人员管理' } },
          { path: 'blacklist', name: 'BlacklistManage', component: () => import('@/views/lab/BlacklistManage.vue'), meta: { title: '黑名单管理' } },
          { path: 'research-group', name: 'ResearchGroupManage', component: () => import('@/views/lab/ResearchGroupManage.vue'), meta: { title: '课题组管理' } },
          { path: 'knowledge', name: 'InstrumentKnowledge', component: () => import('@/views/lab/InstrumentKnowledge.vue'), meta: { title: '仪器知识库' } },
          { path: 'big-data', name: 'BigDataAnalysis', component: () => import('@/views/lab/BigDataAnalysis.vue'), meta: { title: '大数据分析' } },
          // 设备管理
          {
            path: 'equipment-manage',
            name: 'EquipmentManage',
            meta: { title: '设备管理' },
            children: [
              { path: 'list', name: 'EquipmentList', component: () => import('@/views/lab/EquipmentList.vue'), meta: { title: '设备台账' } },
              { path: 'add', name: 'EquipmentAdd', component: () => import('@/views/lab/EquipmentAdd.vue'), meta: { title: '新增设备' } },
              { path: 'params', name: 'EquipmentParams', component: () => import('@/views/lab/EquipmentParams.vue'), meta: { title: '设备技术参数' } },
              { path: 'scrap', name: 'EquipmentScrap', component: () => import('@/views/lab/EquipmentScrap.vue'), meta: { title: '确认及报废' } }
            ]
          },
          // 维护管理
          {
            path: 'maintenance-manage',
            name: 'MaintenanceManage',
            meta: { title: '维护管理' },
            children: [
              { path: 'overview', name: 'Maintenance', component: () => import('@/views/lab/Maintenance.vue'), meta: { title: '维护保养' } },
              { path: 'maintain', name: 'MaintenanceMaintain', component: () => import('@/views/lab/MaintenanceMaintain.vue'), meta: { title: '保养管理' } },
              { path: 'calibration', name: 'MaintenanceCalibration', component: () => import('@/views/lab/MaintenanceCalibration.vue'), meta: { title: '校准管理' } },
              { path: 'repair', name: 'MaintenanceRepair', component: () => import('@/views/lab/MaintenanceRepair.vue'), meta: { title: '维修管理' } }
            ]
          },
          // 预约管理
          {
            path: 'reservation-manage',
            name: 'ReservationManage',
            meta: { title: '预约管理' },
            children: [
              { path: 'overview', name: 'ReservationOverview', component: () => import('@/views/lab/ReservationOverview.vue'), meta: { title: '预约概况' } },
              { path: 'pending', name: 'PendingAudit', component: () => import('@/views/lab/PendingAudit.vue'), meta: { title: '等待审核' } },
              { path: 'all', name: 'AllReservation', component: () => import('@/views/lab/AllReservation.vue'), meta: { title: '全部预约' } }
            ]
          },
          // 仪器管理
          {
            path: 'instrument-manage',
            name: 'InstrumentManage',
            meta: { title: '仪器管理' },
            children: [
              { path: 'list', name: 'InstrumentList', component: () => import('@/views/lab/InstrumentList.vue'), meta: { title: '仪器列表' } },
              { path: 'follow', name: 'InstrumentFollow', component: () => import('@/views/lab/InstrumentFollow.vue'), meta: { title: '仪器关注' } }
            ]
          },
          // 统计报表
          {
            path: 'stats',
            name: 'LabStats',
            meta: { title: '统计报表' },
            children: [
              { path: 'reservation', name: 'ReservationStats', component: () => import('@/views/lab/ReservationStats.vue'), meta: { title: '预约统计' } },
              { path: 'report', name: 'LabReport', component: () => import('@/views/lab/LabReport.vue'), meta: { title: '统计报表' } }
            ]
          },
          // 规则设置
          {
            path: 'rules-setting',
            name: 'RulesSetting',
            meta: { title: '规则设置' },
            children: [
              { path: 'reservation', name: 'ReservationRules', component: () => import('@/views/lab/ReservationRules.vue'), meta: { title: '预约规则' } },
              { path: 'billing', name: 'BillingRules', component: () => import('@/views/lab/BillingRules.vue'), meta: { title: '计费规则' } },
              { path: 'billingCalculator', name: 'BillingCalculator', component: () => import('@/views/lab/BillingCalculator.vue'), meta: { title: '计费计算器' } },
              { path: 'billingRulesAdvance', name: 'BillingRulesAdvanced', component: () => import('@/views/lab/BillingRulesAdvanced.vue'), meta: { title: '计费规则管理' } },
              { path: 'penalty', name: 'PenaltyRules', component: () => import('@/views/lab/PenaltyRules.vue'), meta: { title: '违约计费' } },
              { path: 'period', name: 'BillingPeriod', component: () => import('@/views/lab/BillingPeriod.vue'), meta: { title: '账期设置' } },
              { path: 'auto-confirm', name: 'AutoConfirmSetting', component: () => import('@/views/lab/AutoConfirmSetting.vue'), meta: { title: '上机自动确认' } },
              { path: 'bill-generation', name: 'BillGeneration', component: () => import('@/views/lab/BillGeneration.vue'), meta: { title: '账单生成' } },
              { path: 'bill-auto-confirm', name: 'BillAutoConfirm', component: () => import('@/views/lab/BillAutoConfirm.vue'), meta: { title: '账单自动确认' } }
            ]
          }
        ]
      },
      // 试剂耗材
      {
        path: 'reagent',
        name: 'Reagent',
        meta: { title: '试剂耗材', icon: 'Box' },
        children: [
          { path: 'inventory', name: 'Inventory', component: () => import('@/views/reagent/Inventory.vue'), meta: { title: '库存管理' } },
          { path: 'history', name: 'History', component: () => import('@/views/reagent/History.vue'), meta: { title: '历史记录' } },
          { path: 'purchase', name: 'Purchase', component: () => import('@/views/reagent/Purchase.vue'), meta: { title: '申购管理' } },
          { path: 'detail/:id', name: 'ReagentDetail', component: () => import('@/views/reagent/ReagentDetail.vue'), meta: { title: '信息详情' } },
          { path: 'inbound', name: 'Inbound', component: () => import('@/views/reagent/Inbound.vue'), meta: { title: '入库管理' } },
          { path: 'outbound', name: 'Outbound', component: () => import('@/views/reagent/Outbound.vue'), meta: { title: '领用管理' } },
          { path: 'return', name: 'ReturnManage', component: () => import('@/views/reagent/ReturnManage.vue'), meta: { title: '归还管理' } },
          { path: 'damage', name: 'Damage', component: () => import('@/views/reagent/Damage.vue'), meta: { title: '报损管理' } },
          { path: 'warning', name: 'WarningManage', component: () => import('@/views/reagent/WarningManage.vue'), meta: { title: '预警管理' } },
          { path: 'stock-check', name: 'StockCheck', component: () => import('@/views/reagent/StockCheck.vue'), meta: { title: '盘库管理' } },
          { path: 'normal', name: 'NormalReagent', component: () => import('@/views/reagent/NormalReagent.vue'), meta: { title: '普通试剂' } },
          { path: 'hazardous', name: 'HazardousManage', component: () => import('@/views/reagent/HazardousManage.vue'), meta: { title: '危化品管理' } },
          { path: 'approval', name: 'ApprovalSetting', component: () => import('@/views/reagent/ApprovalSetting.vue'), meta: { title: '审批设置' } },
          { path: 'order', name: 'OrderManage', component: () => import('@/views/reagent/OrderManage.vue'), meta: { title: '采购订单' } },
          { path: 'stats', name: 'ReagentStats', component: () => import('@/views/reagent/ReagentStats.vue'), meta: { title: '统计分析' } }
        ]
      },
      // 项目管理
      {
        path: 'project',
        name: 'Project',
        meta: { title: '项目管理', icon: 'Folder' },
        children: [
          { path: 'apply', name: 'ProjectApply', component: () => import('@/views/project/ProjectApply.vue'), meta: { title: '项目申报' } },
          { path: 'review', name: 'ProjectReview', component: () => import('@/views/project/ProjectReview.vue'), meta: { title: '项目评审' } },
          { path: 'setup', name: 'ProjectSetup', component: () => import('@/views/project/ProjectSetup.vue'), meta: { title: '项目立项' } },
          { path: 'progress', name: 'ProjectProgress', component: () => import('@/views/project/ProjectProgress.vue'), meta: { title: '进度管理' } },
          { path: 'quality', name: 'ProjectQuality', component: () => import('@/views/project/ProjectQuality.vue'), meta: { title: '质量管理' } },
          { path: 'resource', name: 'ResourceManage', component: () => import('@/views/project/ResourceManage.vue'), meta: { title: '资源管理' } },
          { path: 'team', name: 'TeamManage', component: () => import('@/views/project/TeamManage.vue'), meta: { title: '团队协作' } },
          { path: 'achievement', name: 'Achievement', component: () => import('@/views/project/Achievement.vue'), meta: { title: '成果管理' } },
          { path: 'ledger', name: 'AchievementLedger', component: () => import('@/views/project/AchievementLedger.vue'), meta: { title: '成果台账' } },
          { path: 'award', name: 'AwardManage', component: () => import('@/views/project/AwardManage.vue'), meta: { title: '获奖荣誉' } },
          { path: 'paper-claim', name: 'PaperClaim', component: () => import('@/views/project/PaperClaim.vue'), meta: { title: '论文成果认领' } },
          { path: 'fund', name: 'FundManage', component: () => import('@/views/project/FundManage.vue'), meta: { title: '经费管理' } }
        ]
      },
      // 实验室自控硬件
      {
        path: 'hardware',
        name: 'Hardware',
        meta: { title: '自控硬件', icon: 'Platform' },
        children: [
          { path: 'temperature', name: 'TemperatureHumidity', component: () => import('@/views/hardware/TemperatureHumidity.vue'), meta: { title: '温湿度采集器' } },
          { path: 'power', name: 'PowerMonitor', component: () => import('@/views/hardware/PowerMonitor.vue'), meta: { title: '电气功率监测器' } },
          { path: 'smoke', name: 'SmokeDetector', component: () => import('@/views/hardware/SmokeDetector.vue'), meta: { title: '烟感监测器' } },
          { path: 'water', name: 'WaterDetector', component: () => import('@/views/hardware/WaterDetector.vue'), meta: { title: '浸水监测器' } },
          { path: 'gateway', name: 'SmartGateway', component: () => import('@/views/hardware/SmartGateway.vue'), meta: { title: '智能网关' } }
        ]
      } ]
      }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  document.title = `${to.meta.title || '后台管理'} - 农业科研知识数据管理系统`
  next()
})

export default router
