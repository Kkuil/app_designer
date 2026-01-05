import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useUserStore } from '@/stores/user'

// 布局组件
import Layout from '@/layout/index.vue'

// 路由配置
const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login/index.vue'),
    meta: { title: '登录', hidden: true }
  },
  {
    path: '',
    component: Layout,
    redirect: '/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('@/views/dashboard/index.vue'),
        meta: { title: '工作台', icon: 'Monitor' }
      }
    ]
  },
  // 基础功能
  {
    path: '/system',
    component: Layout,
    redirect: '/system/user',
    meta: { title: '系统管理', icon: 'Setting' },
    children: [
      {
        path: 'user',
        name: 'UserManagement',
        component: () => import('@/views/system/user/index.vue'),
        meta: { title: '用户管理', icon: 'User' }
      },
      {
        path: 'role',
        name: 'RoleManagement',
        component: () => import('@/views/system/role/index.vue'),
        meta: { title: '角色管理', icon: 'UserFilled' }
      },
      {
        path: 'permission',
        name: 'PermissionManagement',
        component: () => import('@/views/system/permission/index.vue'),
        meta: { title: '权限管理', icon: 'Lock' }
      },
      {
        path: 'config',
        name: 'SystemConfig',
        component: () => import('@/views/system/config/index.vue'),
        meta: { title: '系统配置', icon: 'Tools' }
      },
      {
        path: 'log',
        name: 'SystemLog',
        component: () => import('@/views/system/log/index.vue'),
        meta: { title: '运行日志', icon: 'Document' }
      }
    ]
  },
  // 报警管理
  {
    path: '/alarm',
    component: Layout,
    redirect: '/alarm/realtime',
    meta: { title: '报警管理', icon: 'Bell' },
    children: [
      {
        path: 'realtime',
        name: 'RealtimeAlarm',
        component: () => import('@/views/alarm/realtime/index.vue'),
        meta: { title: '实时报警', icon: 'AlarmClock' }
      },
      {
        path: 'history',
        name: 'HistoryAlarm',
        component: () => import('@/views/alarm/history/index.vue'),
        meta: { title: '历史报警', icon: 'Clock' }
      },
      {
        path: 'config',
        name: 'AlarmConfig',
        component: () => import('@/views/alarm/config/index.vue'),
        meta: { title: '报警配置', icon: 'Setting' }
      },
      {
        path: 'linkage',
        name: 'AlarmLinkage',
        component: () => import('@/views/alarm/linkage/index.vue'),
        meta: { title: '报警联动', icon: 'Connection' }
      }
    ]
  },
  // 能源管理
  {
    path: '/energy',
    component: Layout,
    redirect: '/energy/monitor',
    meta: { title: '能源管理', icon: 'Lightning' },
    children: [
      {
        path: 'monitor',
        name: 'EnergyMonitor',
        component: () => import('@/views/energy/monitor/index.vue'),
        meta: { title: '能耗监测', icon: 'DataLine' }
      },
      {
        path: 'environment',
        name: 'EnvironmentMonitor',
        component: () => import('@/views/energy/environment/index.vue'),
        meta: { title: '环境监测', icon: 'Sunny' }
      },
      {
        path: 'analysis',
        name: 'EnergyAnalysis',
        component: () => import('@/views/energy/analysis/index.vue'),
        meta: { title: '用能分析', icon: 'TrendCharts' }
      },
      {
        path: 'saving',
        name: 'EnergySaving',
        component: () => import('@/views/energy/saving/index.vue'),
        meta: { title: '节能管理', icon: 'Aim' }
      },
      {
        path: 'config',
        name: 'EnergyConfig',
        component: () => import('@/views/energy/config/index.vue'),
        meta: { title: '能耗配置', icon: 'Setting' }
      }
    ]
  },
  // 运维管理
  {
    path: '/operation',
    component: Layout,
    redirect: '/operation/device',
    meta: { title: '运维管理', icon: 'Operation' },
    children: [
      {
        path: 'device',
        name: 'DeviceManagement',
        component: () => import('@/views/operation/device/index.vue'),
        meta: { title: '设备台账', icon: 'Cpu' }
      },
      {
        path: 'online-inspection',
        name: 'OnlineInspection',
        component: () => import('@/views/operation/online-inspection/index.vue'),
        meta: { title: '线上巡检', icon: 'VideoCamera' }
      },
      {
        path: 'field-inspection',
        name: 'FieldInspection',
        component: () => import('@/views/operation/field-inspection/index.vue'),
        meta: { title: '现场巡检', icon: 'CircleCheck' }
      },
      {
        path: 'maintenance',
        name: 'DeviceMaintenance',
        component: () => import('@/views/operation/maintenance/index.vue'),
        meta: { title: '设备保养', icon: 'FirstAidKit' }
      },
      {
        path: 'workorder',
        name: 'WorkOrderManagement',
        component: () => import('@/views/operation/workorder/index.vue'),
        meta: { title: '工单管理', icon: 'Tickets' }
      }
    ]
  },
  // 三维可视化
  {
    path: '/visualization',
    component: Layout,
    redirect: '/visualization/overview',
    meta: { title: '三维可视化', icon: 'View' },
    children: [
      {
        path: 'overview',
        name: 'VisualizationOverview',
        component: () => import('@/views/visualization/overview/index.vue'),
        meta: { title: '态势总览', icon: 'DataBoard' }
      },
      {
        path: 'security',
        name: 'SecurityVisualization',
        component: () => import('@/views/visualization/security/index.vue'),
        meta: { title: '安防可视化', icon: 'Lock' }
      },
      {
        path: 'fire',
        name: 'FireVisualization',
        component: () => import('@/views/visualization/fire/index.vue'),
        meta: { title: '消防可视化', icon: 'WarnTriangleFilled' }
      },
      {
        path: 'device',
        name: 'DeviceVisualization',
        component: () => import('@/views/visualization/device/index.vue'),
        meta: { title: '设备可视化', icon: 'Cpu' }
      },
      {
        path: 'energy',
        name: 'EnergyVisualization',
        component: () => import('@/views/visualization/energy/index.vue'),
        meta: { title: '能源可视化', icon: 'Lightning' }
      },
      {
        path: 'space',
        name: 'SpaceVisualization',
        component: () => import('@/views/visualization/space/index.vue'),
        meta: { title: '空间可视化', icon: 'Grid' }
      },
      {
        path: 'environment',
        name: 'EnvironmentVisualization',
        component: () => import('@/views/visualization/environment/index.vue'),
        meta: { title: '环境可视化', icon: 'Sunny' }
      }
    ]
  },
  // 集成监控
  {
    path: '/integration',
    component: Layout,
    redirect: '/integration/building',
    meta: { title: '集成监控', icon: 'Monitor' },
    children: [
      {
        path: 'building',
        name: 'BuildingAutomation',
        component: () => import('@/views/integration/building/index.vue'),
        meta: { title: '楼宇自控', icon: 'OfficeBuilding' }
      },
      {
        path: 'power',
        name: 'PowerDistribution',
        component: () => import('@/views/integration/power/index.vue'),
        meta: { title: '供配电系统', icon: 'Lightning' }
      },
      {
        path: 'lighting',
        name: 'LightingSystem',
        component: () => import('@/views/integration/lighting/index.vue'),
        meta: { title: '照明系统', icon: 'Sunny' }
      },
      {
        path: 'elevator',
        name: 'ElevatorSystem',
        component: () => import('@/views/integration/elevator/index.vue'),
        meta: { title: '电梯系统', icon: 'Upload' }
      },
      {
        path: 'meter',
        name: 'SmartMeter',
        component: () => import('@/views/integration/meter/index.vue'),
        meta: { title: '智能抄表', icon: 'Odometer' }
      },
      {
        path: 'video',
        name: 'VideoSurveillance',
        component: () => import('@/views/integration/video/index.vue'),
        meta: { title: '视频监控', icon: 'VideoCamera' }
      },
      {
        path: 'intrusion',
        name: 'IntrusionAlarm',
        component: () => import('@/views/integration/intrusion/index.vue'),
        meta: { title: '入侵报警', icon: 'Bell' }
      },
      {
        path: 'patrol',
        name: 'ElectronicPatrol',
        component: () => import('@/views/integration/patrol/index.vue'),
        meta: { title: '电子巡查', icon: 'MapLocation' }
      },
      {
        path: 'access',
        name: 'AccessControl',
        component: () => import('@/views/integration/access/index.vue'),
        meta: { title: '出入口控制', icon: 'Key' }
      },
      {
        path: 'visitor',
        name: 'VisitorSystem',
        component: () => import('@/views/integration/visitor/index.vue'),
        meta: { title: '访客系统', icon: 'Avatar' }
      },
      {
        path: 'parking',
        name: 'ParkingSystem',
        component: () => import('@/views/integration/parking/index.vue'),
        meta: { title: '停车场管理', icon: 'Van' }
      },
      {
        path: 'fire',
        name: 'FireAlarm',
        component: () => import('@/views/integration/fire/index.vue'),
        meta: { title: '火灾报警', icon: 'WarnTriangleFilled' }
      },
      {
        path: 'broadcast',
        name: 'PublicBroadcast',
        component: () => import('@/views/integration/broadcast/index.vue'),
        meta: { title: '公共广播', icon: 'Microphone' }
      },
      {
        path: 'meeting',
        name: 'MeetingSystem',
        component: () => import('@/views/integration/meeting/index.vue'),
        meta: { title: '会议管理', icon: 'Calendar' }
      },
      {
        path: 'info-release',
        name: 'InfoRelease',
        component: () => import('@/views/integration/info-release/index.vue'),
        meta: { title: '信息发布', icon: 'ChatDotRound' }
      }
    ]
  },
  // 报表管理
  {
    path: '/report',
    component: Layout,
    redirect: '/report/device',
    meta: { title: '报表管理', icon: 'DataAnalysis' },
    children: [
      {
        path: 'device',
        name: 'DeviceReport',
        component: () => import('@/views/report/device/index.vue'),
        meta: { title: '设备报表', icon: 'Document' }
      },
      {
        path: 'energy',
        name: 'EnergyReport',
        component: () => import('@/views/report/energy/index.vue'),
        meta: { title: '能耗报表', icon: 'DocumentCopy' }
      },
      {
        path: 'alarm',
        name: 'AlarmReport',
        component: () => import('@/views/report/alarm/index.vue'),
        meta: { title: '报警报表', icon: 'Notebook' }
      }
    ]
  },
  // 智能联动
  {
    path: '/linkage',
    component: Layout,
    redirect: '/linkage/config',
    meta: { title: '智能联动', icon: 'Connection' },
    children: [
      {
        path: 'config',
        name: 'LinkageConfig',
        component: () => import('@/views/linkage/config/index.vue'),
        meta: { title: '联动配置', icon: 'Setting' }
      },
      {
        path: 'action',
        name: 'ActionLinkage',
        component: () => import('@/views/linkage/action/index.vue'),
        meta: { title: '动作联动', icon: 'Pointer' }
      },
      {
        path: 'video',
        name: 'VideoLinkage',
        component: () => import('@/views/linkage/video/index.vue'),
        meta: { title: '视频联动', icon: 'VideoCamera' }
      },
      {
        path: 'mode',
        name: 'ModeControl',
        component: () => import('@/views/linkage/mode/index.vue'),
        meta: { title: '模式控制', icon: 'Grid' }
      }
    ]
  },
  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/error/404.vue'),
    meta: { title: '404', hidden: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// 路由守卫
router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  
  // 设置页面标题
  document.title = `${to.meta.title || ''} - 郑州市农业科创中心智慧楼宇集成管理平台`
  
//   // 白名单
//   const whiteList = ['/login']
  
//   if (userStore.token) {
//     if (to.path === '/login') {
//       next({ path: '/' })
//     } else {
//       next()
//     }
//   } else {
//     if (whiteList.includes(to.path)) {
//       next()
//     } else {
//       next('/login')
//     }
//   }
next()
})

export default router
