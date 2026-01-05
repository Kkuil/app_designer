<template>
  <div class="device-container">
    <el-row :gutter="20">
      <!-- 左侧设备分类树 -->
      <el-col :span="5">
        <div class="page-card tree-card">
          <div class="card-header">
            <span class="card-title">设备分类</span>
            <el-button type="primary" link @click="handleAddCategory">
              <el-icon><Plus /></el-icon>
            </el-button>
          </div>
          <el-input
            v-model="treeFilterText"
            placeholder="搜索分类"
            clearable
            class="tree-search"
          >
            <template #prefix>
              <el-icon><Search /></el-icon>
            </template>
          </el-input>
          <el-tree
            ref="treeRef"
            :data="categoryTree"
            :props="treeProps"
            node-key="id"
            default-expand-all
            highlight-current
            :filter-node-method="filterTreeNode"
            @node-click="handleTreeNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <el-icon v-if="data.children"><Folder /></el-icon>
                <el-icon v-else><Document /></el-icon>
                <span class="node-label">{{ node.label }}</span>
                <span class="node-count">({{ data.count || 0 }})</span>
              </div>
            </template>
          </el-tree>
        </div>
      </el-col>

      <!-- 右侧设备列表 -->
      <el-col :span="19">
        <div class="page-card">
          <!-- 搜索表单 -->
          <el-form :model="searchForm" inline class="search-form">
            <el-form-item label="设备名称">
              <el-input
                v-model="searchForm.name"
                placeholder="请输入设备名称"
                clearable
                style="width: 180px"
              />
            </el-form-item>
            <el-form-item label="设备编号">
              <el-input
                v-model="searchForm.code"
                placeholder="请输入设备编号"
                clearable
                style="width: 150px"
              />
            </el-form-item>
            <el-form-item label="设备状态">
              <el-select v-model="searchForm.status" placeholder="请选择" clearable style="width: 120px">
                <el-option label="在线" value="online" />
                <el-option label="离线" value="offline" />
                <el-option label="故障" value="fault" />
              </el-select>
            </el-form-item>
            <el-form-item label="安装位置">
              <el-input
                v-model="searchForm.location"
                placeholder="请输入位置"
                clearable
                style="width: 150px"
              />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleSearch">
                <el-icon><Search /></el-icon>
                搜索
              </el-button>
              <el-button @click="handleReset">
                <el-icon><Refresh /></el-icon>
                重置
              </el-button>
            </el-form-item>
          </el-form>

          <!-- 操作按钮 -->
          <div class="table-toolbar">
            <div class="toolbar-left">
              <el-button type="primary" @click="handleAdd">
                <el-icon><Plus /></el-icon>
                新增设备
              </el-button>
              <el-button type="success" @click="handleExport">
                <el-icon><Download /></el-icon>
                导出
              </el-button>
              <el-button type="warning" @click="handleImport">
                <el-icon><Upload /></el-icon>
                导入
              </el-button>
              <el-button type="danger" :disabled="!selectedRows.length" @click="handleBatchDelete">
                <el-icon><Delete /></el-icon>
                批量删除
              </el-button>
            </div>
            <div class="toolbar-right">
              <el-tooltip content="刷新">
                <el-button circle @click="fetchDeviceList">
                  <el-icon><Refresh /></el-icon>
                </el-button>
              </el-tooltip>
              <el-tooltip content="列设置">
                <el-button circle>
                  <el-icon><Setting /></el-icon>
                </el-button>
              </el-tooltip>
            </div>
          </div>

          <!-- 设备统计卡片 -->
          <el-row :gutter="16" class="stat-row">
            <el-col :span="6">
              <div class="mini-stat-card total">
                <div class="stat-icon">
                  <el-icon><Cpu /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ deviceStats.total }}</div>
                  <div class="stat-label">设备总数</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mini-stat-card online">
                <div class="stat-icon">
                  <el-icon><CircleCheck /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ deviceStats.online }}</div>
                  <div class="stat-label">在线设备</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mini-stat-card offline">
                <div class="stat-icon">
                  <el-icon><CircleClose /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ deviceStats.offline }}</div>
                  <div class="stat-label">离线设备</div>
                </div>
              </div>
            </el-col>
            <el-col :span="6">
              <div class="mini-stat-card fault">
                <div class="stat-icon">
                  <el-icon><Warning /></el-icon>
                </div>
                <div class="stat-info">
                  <div class="stat-value">{{ deviceStats.fault }}</div>
                  <div class="stat-label">故障设备</div>
                </div>
              </div>
            </el-col>
          </el-row>

          <!-- 数据表格 -->
          <el-table
            v-loading="loading"
            :data="deviceList"
            border
            stripe
            @selection-change="handleSelectionChange"
          >
            <el-table-column type="selection" width="50" align="center" />
            <el-table-column prop="code" label="设备编号" width="140" show-overflow-tooltip />
            <el-table-column prop="name" label="设备名称" min-width="150" show-overflow-tooltip />
            <el-table-column prop="category" label="设备类型" width="120" />
            <el-table-column prop="brand" label="品牌型号" width="140" show-overflow-tooltip />
            <el-table-column prop="location" label="安装位置" width="150" show-overflow-tooltip />
            <el-table-column prop="status" label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getStatusType(row.status)" effect="dark">
                  <span class="status-dot"></span>
                  {{ getStatusText(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="installDate" label="安装时间" width="120" />
            <el-table-column prop="lastMaintenance" label="最近保养" width="120" />
            <el-table-column prop="responsible" label="负责人" width="100" />
            <el-table-column label="操作" width="200" fixed="right" align="center">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleView(row)">
                  <el-icon><View /></el-icon>
                  详情
                </el-button>
                <el-button type="warning" link size="small" @click="handleEdit(row)">
                  <el-icon><Edit /></el-icon>
                  编辑
                </el-button>
                <el-button type="danger" link size="small" @click="handleDelete(row)">
                  <el-icon><Delete /></el-icon>
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <div class="pagination-wrapper">
            <el-pagination
              v-model:current-page="pagination.current"
              v-model:page-size="pagination.size"
              :page-sizes="[10, 20, 50, 100]"
              :total="pagination.total"
              layout="total, sizes, prev, pager, next, jumper"
              background
              @size-change="handleSizeChange"
              @current-change="handleCurrentChange"
            />
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 设备详情弹窗 -->
    <el-dialog
      v-model="detailVisible"
      title="设备详情"
      width="800px"
      destroy-on-close
    >
      <el-descriptions :column="2" border>
        <el-descriptions-item label="设备编号">{{ currentDevice.code }}</el-descriptions-item>
        <el-descriptions-item label="设备名称">{{ currentDevice.name }}</el-descriptions-item>
        <el-descriptions-item label="设备类型">{{ currentDevice.category }}</el-descriptions-item>
        <el-descriptions-item label="品牌型号">{{ currentDevice.brand }}</el-descriptions-item>
        <el-descriptions-item label="安装位置">{{ currentDevice.location }}</el-descriptions-item>
        <el-descriptions-item label="设备状态">
          <el-tag :type="getStatusType(currentDevice.status)" effect="dark">
            {{ getStatusText(currentDevice.status) }}
          </el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="安装时间">{{ currentDevice.installDate }}</el-descriptions-item>
        <el-descriptions-item label="质保期至">{{ currentDevice.warrantyDate }}</el-descriptions-item>
        <el-descriptions-item label="负责人">{{ currentDevice.responsible }}</el-descriptions-item>
        <el-descriptions-item label="联系电话">{{ currentDevice.phone }}</el-descriptions-item>
        <el-descriptions-item label="最近保养">{{ currentDevice.lastMaintenance }}</el-descriptions-item>
        <el-descriptions-item label="下次保养">{{ currentDevice.nextMaintenance }}</el-descriptions-item>
        <el-descriptions-item label="设备描述" :span="2">{{ currentDevice.description }}</el-descriptions-item>
      </el-descriptions>

      <el-divider content-position="left">运行参数</el-divider>
      <el-row :gutter="20">
        <el-col :span="8">
          <div class="param-card">
            <div class="param-label">运行时长</div>
            <div class="param-value">{{ currentDevice.runningHours || 0 }} 小时</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="param-card">
            <div class="param-label">故障次数</div>
            <div class="param-value">{{ currentDevice.faultCount || 0 }} 次</div>
          </div>
        </el-col>
        <el-col :span="8">
          <div class="param-card">
            <div class="param-label">保养次数</div>
            <div class="param-value">{{ currentDevice.maintenanceCount || 0 }} 次</div>
          </div>
        </el-col>
      </el-row>

      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button type="primary" @click="handleEdit(currentDevice)">编辑</el-button>
      </template>
    </el-dialog>

    <!-- 新增/编辑设备弹窗 -->
    <el-dialog
      v-model="formVisible"
      :title="isEdit ? '编辑设备' : '新增设备'"
      width="700px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="deviceForm"
        :rules="formRules"
        label-width="100px"
      >
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号" prop="code">
              <el-input v-model="deviceForm.code" placeholder="请输入设备编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" prop="name">
              <el-input v-model="deviceForm.name" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备类型" prop="category">
              <el-cascader
                v-model="deviceForm.categoryId"
                :options="categoryTree"
                :props="{ value: 'id', label: 'label', checkStrictly: true }"
                placeholder="请选择设备类型"
                clearable
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="品牌型号" prop="brand">
              <el-input v-model="deviceForm.brand" placeholder="请输入品牌型号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装位置" prop="location">
              <el-input v-model="deviceForm.location" placeholder="请输入安装位置" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备状态" prop="status">
              <el-select v-model="deviceForm.status" placeholder="请选择状态" style="width: 100%">
                <el-option label="在线" value="online" />
                <el-option label="离线" value="offline" />
                <el-option label="故障" value="fault" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装时间" prop="installDate">
              <el-date-picker
                v-model="deviceForm.installDate"
                type="date"
                placeholder="请选择安装时间"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="质保期至" prop="warrantyDate">
              <el-date-picker
                v-model="deviceForm.warrantyDate"
                type="date"
                placeholder="请选择质保期"
                value-format="YYYY-MM-DD"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="负责人" prop="responsible">
              <el-input v-model="deviceForm.responsible" placeholder="请输入负责人" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="联系电话" prop="phone">
              <el-input v-model="deviceForm.phone" placeholder="请输入联系电话" />
            </el-form-item>
          </el-col>
          <el-col :span="24">
            <el-form-item label="设备描述" prop="description">
              <el-input
                v-model="deviceForm.description"
                type="textarea"
                :rows="3"
                placeholder="请输入设备描述"
              />
            </el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="formVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSubmit">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, computed, onMounted } from 'vue'
import {
  Plus, Search, Refresh, Download, Upload, Delete, Setting,
  Cpu, CircleCheck, CircleClose, Warning, View, Edit, Folder, Document
} from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'

// 设备接口
interface Device {
  id: number
  code: string
  name: string
  category: string
  categoryId?: number[]
  brand: string
  location: string
  status: 'online' | 'offline' | 'fault'
  installDate: string
  warrantyDate: string
  lastMaintenance: string
  nextMaintenance: string
  responsible: string
  phone: string
  description: string
  runningHours?: number
  faultCount?: number
  maintenanceCount?: number
}

// 分类树接口
interface CategoryNode {
  id: number
  label: string
  count?: number
  children?: CategoryNode[]
}

// 搜索表单
const searchForm = reactive({
  name: '',
  code: '',
  status: '',
  location: ''
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 状态
const loading = ref(false)
const deviceList = ref<Device[]>([])
const selectedRows = ref<Device[]>([])
const detailVisible = ref(false)
const formVisible = ref(false)
const isEdit = ref(false)
const currentDevice = ref<Device>({} as Device)
const treeFilterText = ref('')
const treeRef = ref()
const formRef = ref<FormInstance>()

// 设备统计
const deviceStats = computed(() => ({
  total: 156,
  online: 128,
  offline: 18,
  fault: 10
}))

// 分类树配置
const treeProps = {
  children: 'children',
  label: 'label'
}

// 分类树数据
const categoryTree = ref<CategoryNode[]>([
  {
    id: 1,
    label: '暖通空调系统',
    count: 45,
    children: [
      { id: 11, label: '中央空调', count: 20 },
      { id: 12, label: '新风系统', count: 15 },
      { id: 13, label: '通风设备', count: 10 }
    ]
  },
  {
    id: 2,
    label: '给排水系统',
    count: 32,
    children: [
      { id: 21, label: '水泵', count: 12 },
      { id: 22, label: '水箱', count: 8 },
      { id: 23, label: '阀门', count: 12 }
    ]
  },
  {
    id: 3,
    label: '电气系统',
    count: 38,
    children: [
      { id: 31, label: '配电柜', count: 15 },
      { id: 32, label: '变压器', count: 8 },
      { id: 33, label: '发电机', count: 5 },
      { id: 34, label: 'UPS电源', count: 10 }
    ]
  },
  {
    id: 4,
    label: '消防系统',
    count: 25,
    children: [
      { id: 41, label: '消防泵', count: 8 },
      { id: 42, label: '喷淋系统', count: 10 },
      { id: 43, label: '烟感探测器', count: 7 }
    ]
  },
  {
    id: 5,
    label: '电梯系统',
    count: 16,
    children: [
      { id: 51, label: '客梯', count: 10 },
      { id: 52, label: '货梯', count: 4 },
      { id: 53, label: '扶梯', count: 2 }
    ]
  }
])

// 表单数据
const deviceForm = reactive<Partial<Device>>({
  code: '',
  name: '',
  category: '',
  categoryId: [],
  brand: '',
  location: '',
  status: 'online',
  installDate: '',
  warrantyDate: '',
  responsible: '',
  phone: '',
  description: ''
})

// 表单验证规则
const formRules: FormRules = {
  code: [{ required: true, message: '请输入设备编号', trigger: 'blur' }],
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  category: [{ required: true, message: '请选择设备类型', trigger: 'change' }],
  location: [{ required: true, message: '请输入安装位置', trigger: 'blur' }],
  status: [{ required: true, message: '请选择设备状态', trigger: 'change' }]
}

// 测试数据
const mockDeviceData: Device[] = [
  {
    id: 1,
    code: 'DEV-AC-001',
    name: '1号中央空调主机',
    category: '中央空调',
    brand: '大金 VRV-X',
    location: 'A栋地下室制冷机房',
    status: 'online',
    installDate: '2022-03-15',
    warrantyDate: '2025-03-15',
    lastMaintenance: '2025-12-01',
    nextMaintenance: '2025-03-01',
    responsible: '张伟',
    phone: '13800138001',
    description: '大金VRV-X系列中央空调主机，制冷量560kW',
    runningHours: 12580,
    faultCount: 2,
    maintenanceCount: 8
  },
  {
    id: 2,
    code: 'DEV-AC-002',
    name: '2号中央空调主机',
    category: '中央空调',
    brand: '格力 GMV6',
    location: 'B栋地下室制冷机房',
    status: 'online',
    installDate: '2022-03-15',
    warrantyDate: '2025-03-15',
    lastMaintenance: '2025-11-20',
    nextMaintenance: '2025-02-20',
    responsible: '张伟',
    phone: '13800138001',
    description: '格力GMV6系列中央空调主机，制冷量480kW',
    runningHours: 11200,
    faultCount: 1,
    maintenanceCount: 8
  },
  {
    id: 3,
    code: 'DEV-PUMP-001',
    name: '生活水泵1号',
    category: '水泵',
    brand: '格兰富 CR系列',
    location: 'A栋地下室水泵房',
    status: 'online',
    installDate: '2021-06-20',
    warrantyDate: '2025-06-20',
    lastMaintenance: '2025-12-10',
    nextMaintenance: '2025-03-10',
    responsible: '李明',
    phone: '13800138002',
    description: '格兰富立式多级离心泵，流量50m³/h',
    runningHours: 18500,
    faultCount: 3,
    maintenanceCount: 12
  },
  {
    id: 4,
    code: 'DEV-PUMP-002',
    name: '消防水泵主泵',
    category: '消防泵',
    brand: '上海连成',
    location: 'A栋地下室消防泵房',
    status: 'online',
    installDate: '2021-06-20',
    warrantyDate: '2025-06-20',
    lastMaintenance: '2025-12-05',
    nextMaintenance: '2025-03-05',
    responsible: '王强',
    phone: '13800138003',
    description: '消防专用水泵，流量80L/s，扬程100m',
    runningHours: 520,
    faultCount: 0,
    maintenanceCount: 12
  },
  {
    id: 5,
    code: 'DEV-ELEV-001',
    name: '1号客梯',
    category: '客梯',
    brand: '三菱电梯',
    location: 'A栋1单元',
    status: 'online',
    installDate: '2021-05-10',
    warrantyDate: '2026-05-10',
    lastMaintenance: '2025-12-15',
    nextMaintenance: '2025-01-15',
    responsible: '赵六',
    phone: '13800138004',
    description: '三菱NEXIEZ-MR型客梯，载重1000kg，速度2m/s',
    runningHours: 25600,
    faultCount: 5,
    maintenanceCount: 36
  },
  {
    id: 6,
    code: 'DEV-ELEV-002',
    name: '2号客梯',
    category: '客梯',
    brand: '日立电梯',
    location: 'A栋2单元',
    status: 'offline',
    installDate: '2021-05-10',
    warrantyDate: '2026-05-10',
    lastMaintenance: '2025-12-15',
    nextMaintenance: '2025-01-15',
    responsible: '赵六',
    phone: '13800138004',
    description: '日立HGE型客梯，载重1000kg，速度1.75m/s',
    runningHours: 24800,
    faultCount: 3,
    maintenanceCount: 36
  },
  {
    id: 7,
    code: 'DEV-ELEC-001',
    name: '1号配电柜',
    category: '配电柜',
    brand: '正泰电气',
    location: 'A栋地下室配电室',
    status: 'online',
    installDate: '2021-04-01',
    warrantyDate: '2025-04-01',
    lastMaintenance: '2025-11-01',
    nextMaintenance: '2025-05-01',
    responsible: '钱七',
    phone: '13800138005',
    description: '低压配电柜，额定电流3200A',
    runningHours: 32000,
    faultCount: 1,
    maintenanceCount: 8
  },
  {
    id: 8,
    code: 'DEV-ELEC-002',
    name: '应急发电机组',
    category: '发电机',
    brand: '康明斯',
    location: 'A栋地下室发电机房',
    status: 'online',
    installDate: '2021-04-01',
    warrantyDate: '2026-04-01',
    lastMaintenance: '2025-12-01',
    nextMaintenance: '2025-06-01',
    responsible: '钱七',
    phone: '13800138005',
    description: '柴油发电机组，功率800kW',
    runningHours: 280,
    faultCount: 0,
    maintenanceCount: 8
  },
  {
    id: 9,
    code: 'DEV-UPS-001',
    name: '数据中心UPS',
    category: 'UPS电源',
    brand: '施耐德 Galaxy',
    location: 'B栋3层数据中心',
    status: 'fault',
    installDate: '2022-01-15',
    warrantyDate: '2027-01-15',
    lastMaintenance: '2025-10-15',
    nextMaintenance: '2025-01-15',
    responsible: '孙八',
    phone: '13800138006',
    description: '施耐德Galaxy VM系列UPS，容量200kVA',
    runningHours: 26000,
    faultCount: 2,
    maintenanceCount: 6
  },
  {
    id: 10,
    code: 'DEV-VENT-001',
    name: 'A栋新风机组',
    category: '新风系统',
    brand: '开利',
    location: 'A栋屋顶设备层',
    status: 'online',
    installDate: '2022-03-20',
    warrantyDate: '2025-03-20',
    lastMaintenance: '2025-11-20',
    nextMaintenance: '2025-02-20',
    responsible: '张伟',
    phone: '13800138001',
    description: '开利组合式空调箱，风量30000m³/h',
    runningHours: 15800,
    faultCount: 1,
    maintenanceCount: 8
  },
  {
    id: 11,
    code: 'DEV-FIRE-001',
    name: '火灾报警控制器',
    category: '消防系统',
    brand: '海湾',
    location: 'A栋1层消防控制室',
    status: 'online',
    installDate: '2021-04-15',
    warrantyDate: '2026-04-15',
    lastMaintenance: '2025-12-01',
    nextMaintenance: '2025-06-01',
    responsible: '王强',
    phone: '13800138003',
    description: '海湾JB-QT-GST5000型火灾报警控制器',
    runningHours: 32000,
    faultCount: 0,
    maintenanceCount: 8
  },
  {
    id: 12,
    code: 'DEV-TRANS-001',
    name: '1号变压器',
    category: '变压器',
    brand: 'ABB',
    location: 'A栋地下室变配电室',
    status: 'online',
    installDate: '2021-03-01',
    warrantyDate: '2031-03-01',
    lastMaintenance: '2025-09-01',
    nextMaintenance: '2025-09-01',
    responsible: '钱七',
    phone: '13800138005',
    description: 'ABB干式变压器，容量2000kVA',
    runningHours: 33000,
    faultCount: 0,
    maintenanceCount: 4
  }
]

// 获取状态类型
const getStatusType = (status: string) => {
  const map: Record<string, string> = {
    online: 'success',
    offline: 'info',
    fault: 'danger'
  }
  return map[status] || 'info'
}

// 获取状态文本
const getStatusText = (status: string) => {
  const map: Record<string, string> = {
    online: '在线',
    offline: '离线',
    fault: '故障'
  }
  return map[status] || '未知'
}

// 过滤树节点
const filterTreeNode = (value: string, data: CategoryNode) => {
  if (!value) return true
  return data.label.includes(value)
}

// 监听搜索文本
watch(treeFilterText, (val) => {
  treeRef.value?.filter(val)
})

// 获取设备列表
const fetchDeviceList = () => {
  loading.value = true
  setTimeout(() => {
    deviceList.value = mockDeviceData
    pagination.total = mockDeviceData.length
    loading.value = false
  }, 500)
}

// 搜索
const handleSearch = () => {
  pagination.current = 1
  fetchDeviceList()
}

// 重置
const handleReset = () => {
  searchForm.name = ''
  searchForm.code = ''
  searchForm.status = ''
  searchForm.location = ''
  handleSearch()
}

// 选择变化
const handleSelectionChange = (rows: Device[]) => {
  selectedRows.value = rows
}

// 树节点点击
const handleTreeNodeClick = (data: CategoryNode) => {
  console.log('选中分类:', data.label)
  fetchDeviceList()
}

// 新增分类
const handleAddCategory = () => {
  ElMessage.info('新增分类功能开发中')
}

// 新增设备
const handleAdd = () => {
  isEdit.value = false
  Object.assign(deviceForm, {
    code: '',
    name: '',
    category: '',
    categoryId: [],
    brand: '',
    location: '',
    status: 'online',
    installDate: '',
    warrantyDate: '',
    responsible: '',
    phone: '',
    description: ''
  })
  formVisible.value = true
}

// 查看详情
const handleView = (row: Device) => {
  currentDevice.value = row
  detailVisible.value = true
}

// 编辑设备
const handleEdit = (row: Device) => {
  isEdit.value = true
  Object.assign(deviceForm, row)
  detailVisible.value = false
  formVisible.value = true
}

// 删除设备
const handleDelete = (row: Device) => {
  ElMessageBox.confirm(`确定要删除设备"${row.name}"吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchDeviceList()
  })
}

// 批量删除
const handleBatchDelete = () => {
  ElMessageBox.confirm(`确定要删除选中的${selectedRows.value.length}个设备吗？`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
    fetchDeviceList()
  })
}

// 导出
const handleExport = () => {
  ElMessage.success('正在导出...')
}

// 导入
const handleImport = () => {
  ElMessage.info('导入功能开发中')
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  await formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success(isEdit.value ? '编辑成功' : '新增成功')
      formVisible.value = false
      fetchDeviceList()
    }
  })
}

// 分页
const handleSizeChange = (size: number) => {
  pagination.size = size
  fetchDeviceList()
}

const handleCurrentChange = (current: number) => {
  pagination.current = current
  fetchDeviceList()
}

onMounted(() => {
  fetchDeviceList()
})
</script>

<style lang="scss" scoped>
.device-container {
  padding: 0;
}

.page-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.tree-card {
  height: calc(100vh - 140px);
  overflow: hidden;
  display: flex;
  flex-direction: column;

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;

    .card-title {
      font-size: 16px;
      font-weight: 600;
      color: #303133;
    }
  }

  .tree-search {
    margin-bottom: 12px;
  }

  .el-tree {
    flex: 1;
    overflow-y: auto;

    .tree-node {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 14px;

      .node-label {
        flex: 1;
      }

      .node-count {
        color: #909399;
        font-size: 12px;
      }
    }
  }
}

.search-form {
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #ebeef5;
}

.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  .toolbar-left {
    display: flex;
    gap: 10px;
  }

  .toolbar-right {
    display: flex;
    gap: 8px;
  }
}

.stat-row {
  margin-bottom: 16px;
}

.mini-stat-card {
  display: flex;
  align-items: center;
  padding: 16px;
  border-radius: 8px;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7ed 100%);

  .stat-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-right: 12px;
    font-size: 24px;
    color: #fff;
  }

  .stat-info {
    .stat-value {
      font-size: 24px;
      font-weight: 600;
      color: #303133;
    }

    .stat-label {
      font-size: 13px;
      color: #909399;
    }
  }

  &.total .stat-icon {
    background: linear-gradient(135deg, #409eff 0%, #66b1ff 100%);
  }

  &.online .stat-icon {
    background: linear-gradient(135deg, #67c23a 0%, #85ce61 100%);
  }

  &.offline .stat-icon {
    background: linear-gradient(135deg, #909399 0%, #a6a9ad 100%);
  }

  &.fault .stat-icon {
    background: linear-gradient(135deg, #f56c6c 0%, #f78989 100%);
  }
}

.status-dot {
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
  margin-right: 4px;
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #ebeef5;
}

.param-card {
  background: #f5f7fa;
  border-radius: 8px;
  padding: 16px;
  text-align: center;

  .param-label {
    font-size: 13px;
    color: #909399;
    margin-bottom: 8px;
  }

  .param-value {
    font-size: 20px;
    font-weight: 600;
    color: #303133;
  }
}

:deep(.el-table) {
  .el-button + .el-button {
    margin-left: 4px;
  }
}
</style>
