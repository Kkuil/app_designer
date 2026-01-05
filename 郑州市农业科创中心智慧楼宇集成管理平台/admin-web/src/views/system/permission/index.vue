<template>
  <div class="permission-container">
    <el-row :gutter="16">
      <el-col :span="10">
        <div class="panel">
          <div class="panel-header">
            <span>菜单权限树</span>
            <div class="header-actions">
              <el-button type="primary" size="small" @click="handleAddMenu"><el-icon><Plus /></el-icon>新增菜单</el-button>
              <el-button size="small" @click="handleExpandAll"><el-icon><FolderOpened /></el-icon>展开全部</el-button>
            </div>
          </div>
          <div class="tree-wrapper">
            <el-tree ref="treeRef" :data="menuTree" node-key="id" default-expand-all highlight-current :props="{ label: 'name', children: 'children' }" @node-click="handleNodeClick">
              <template #default="{ node, data }">
                <div class="tree-node">
                  <el-icon :size="16"><component :is="data.icon || Folder" /></el-icon>
                  <span class="node-label">{{ node.label }}</span>
                  <el-tag :type="data.type === 'menu' ? 'primary' : data.type === 'button' ? 'success' : 'info'" size="small">{{ data.type === 'menu' ? '菜单' : data.type === 'button' ? '按钮' : '目录' }}</el-tag>
                </div>
              </template>
            </el-tree>
          </div>
        </div>
      </el-col>

      <el-col :span="14">
        <div class="panel" v-if="selectedNode">
          <div class="panel-header">
            <span>权限详情</span>
            <div class="header-actions">
              <el-button type="primary" size="small" @click="handleEdit"><el-icon><Edit /></el-icon>编辑</el-button>
              <el-button type="danger" size="small" @click="handleDelete"><el-icon><Delete /></el-icon>删除</el-button>
            </div>
          </div>
          <div class="detail-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="权限名称">{{ selectedNode.name }}</el-descriptions-item>
              <el-descriptions-item label="权限编码">{{ selectedNode.code }}</el-descriptions-item>
              <el-descriptions-item label="类型"><el-tag :type="selectedNode.type === 'menu' ? 'primary' : selectedNode.type === 'button' ? 'success' : 'info'" size="small">{{ selectedNode.type === 'menu' ? '菜单' : selectedNode.type === 'button' ? '按钮' : '目录' }}</el-tag></el-descriptions-item>
              <el-descriptions-item label="排序">{{ selectedNode.sort }}</el-descriptions-item>
              <el-descriptions-item label="路由地址">{{ selectedNode.path || '-' }}</el-descriptions-item>
              <el-descriptions-item label="组件路径">{{ selectedNode.component || '-' }}</el-descriptions-item>
              <el-descriptions-item label="图标"><el-icon :size="16"><component :is="selectedNode.icon || Folder" /></el-icon> {{ selectedNode.iconName || '-' }}</el-descriptions-item>
              <el-descriptions-item label="状态"><el-tag :type="selectedNode.status === 'enabled' ? 'success' : 'info'" size="small">{{ selectedNode.status === 'enabled' ? '启用' : '禁用' }}</el-tag></el-descriptions-item>
              <el-descriptions-item label="是否缓存"><el-tag :type="selectedNode.keepAlive ? 'success' : 'info'" size="small">{{ selectedNode.keepAlive ? '是' : '否' }}</el-tag></el-descriptions-item>
              <el-descriptions-item label="是否显示"><el-tag :type="selectedNode.visible ? 'success' : 'info'" size="small">{{ selectedNode.visible ? '显示' : '隐藏' }}</el-tag></el-descriptions-item>
            </el-descriptions>

            <div class="sub-section" v-if="selectedNode.children?.length">
              <div class="section-title">子权限列表</div>
              <el-table :data="selectedNode.children" height="200">
                <el-table-column prop="name" label="名称" width="140" />
                <el-table-column prop="code" label="编码" width="160" />
                <el-table-column prop="type" label="类型" width="80">
                  <template #default="{ row }"><el-tag :type="row.type === 'menu' ? 'primary' : row.type === 'button' ? 'success' : 'info'" size="small">{{ row.type === 'menu' ? '菜单' : row.type === 'button' ? '按钮' : '目录' }}</el-tag></template>
                </el-table-column>
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }"><el-tag :type="row.status === 'enabled' ? 'success' : 'info'" size="small">{{ row.status === 'enabled' ? '启用' : '禁用' }}</el-tag></template>
                </el-table-column>
              </el-table>
            </div>
          </div>
        </div>
        <div class="panel empty-panel" v-else>
          <el-empty description="请选择一个菜单查看详情" />
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="formData.id ? '编辑权限' : '新增权限'" width="600px">
      <el-form :model="formData" label-width="100px">
        <el-form-item label="上级菜单"><el-tree-select v-model="formData.parentId" :data="menuTree" check-strictly :props="{ label: 'name', value: 'id' }" placeholder="选择上级菜单" style="width:100%" /></el-form-item>
        <el-form-item label="权限类型">
          <el-radio-group v-model="formData.type">
            <el-radio-button label="directory">目录</el-radio-button>
            <el-radio-button label="menu">菜单</el-radio-button>
            <el-radio-button label="button">按钮</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限名称"><el-input v-model="formData.name" placeholder="请输入权限名称" /></el-form-item>
        <el-form-item label="权限编码"><el-input v-model="formData.code" placeholder="请输入权限编码" /></el-form-item>
        <el-form-item label="路由地址" v-if="formData.type !== 'button'"><el-input v-model="formData.path" placeholder="请输入路由地址" /></el-form-item>
        <el-form-item label="组件路径" v-if="formData.type === 'menu'"><el-input v-model="formData.component" placeholder="请输入组件路径" /></el-form-item>
        <el-form-item label="图标" v-if="formData.type !== 'button'"><el-input v-model="formData.iconName" placeholder="请输入图标名称" /></el-form-item>
        <el-form-item label="排序"><el-input-number v-model="formData.sort" :min="0" :max="999" /></el-form-item>
        <el-row :gutter="24">
          <el-col :span="8"><el-form-item label="状态"><el-switch v-model="formData.enabled" /></el-form-item></el-col>
          <el-col :span="8" v-if="formData.type === 'menu'"><el-form-item label="缓存"><el-switch v-model="formData.keepAlive" /></el-form-item></el-col>
          <el-col :span="8" v-if="formData.type !== 'button'"><el-form-item label="显示"><el-switch v-model="formData.visible" /></el-form-item></el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete, FolderOpened, Folder, Setting, Monitor, Document, Bell, DataAnalysis, Connection, House } from '@element-plus/icons-vue'

const dialogVisible = ref(false)
const treeRef = ref()

const menuTree = ref([
  { id: 1, name: '首页', code: 'dashboard', type: 'menu', icon: House, iconName: 'House', path: '/dashboard', component: 'dashboard/index', sort: 1, status: 'enabled', keepAlive: true, visible: true },
  { id: 2, name: '系统管理', code: 'system', type: 'directory', icon: Setting, iconName: 'Setting', path: '/system', sort: 2, status: 'enabled', visible: true, children: [
    { id: 21, name: '用户管理', code: 'system:user', type: 'menu', path: '/system/user', component: 'system/user/index', sort: 1, status: 'enabled', keepAlive: true, visible: true, children: [
      { id: 211, name: '新增用户', code: 'system:user:add', type: 'button', status: 'enabled' },
      { id: 212, name: '编辑用户', code: 'system:user:edit', type: 'button', status: 'enabled' },
      { id: 213, name: '删除用户', code: 'system:user:delete', type: 'button', status: 'enabled' }
    ]},
    { id: 22, name: '角色管理', code: 'system:role', type: 'menu', path: '/system/role', component: 'system/role/index', sort: 2, status: 'enabled', keepAlive: true, visible: true },
    { id: 23, name: '权限管理', code: 'system:permission', type: 'menu', path: '/system/permission', component: 'system/permission/index', sort: 3, status: 'enabled', keepAlive: true, visible: true }
  ]},
  { id: 3, name: '设备管理', code: 'device', type: 'directory', icon: Monitor, iconName: 'Monitor', path: '/device', sort: 3, status: 'enabled', visible: true, children: [
    { id: 31, name: '设备列表', code: 'device:list', type: 'menu', path: '/device/list', component: 'device/list/index', sort: 1, status: 'enabled', keepAlive: true, visible: true }
  ]},
  { id: 4, name: '告警管理', code: 'alarm', type: 'directory', icon: Bell, iconName: 'Bell', path: '/alarm', sort: 4, status: 'enabled', visible: true },
  { id: 5, name: '报表管理', code: 'report', type: 'directory', icon: DataAnalysis, iconName: 'DataAnalysis', path: '/report', sort: 5, status: 'enabled', visible: true }
])

const selectedNode = ref<any>(null)

const formData = reactive({ id: 0, parentId: null, name: '', code: '', type: 'menu', path: '', component: '', iconName: '', sort: 0, enabled: true, keepAlive: true, visible: true })

const handleNodeClick = (node: any) => { selectedNode.value = node }
const handleExpandAll = () => { /* 展开所有节点 */ }
const handleAddMenu = () => { Object.assign(formData, { id: 0, parentId: null, name: '', code: '', type: 'menu', path: '', component: '', iconName: '', sort: 0, enabled: true, keepAlive: true, visible: true }); dialogVisible.value = true }
const handleEdit = () => { if (selectedNode.value) { Object.assign(formData, selectedNode.value, { enabled: selectedNode.value.status === 'enabled' }); dialogVisible.value = true } }
const handleDelete = () => { ElMessage.warning(`删除权限: ${selectedNode.value?.name}`) }
const handleSave = () => { dialogVisible.value = false; ElMessage.success('保存成功') }
</script>

<style lang="scss" scoped>
.permission-container { display: flex; flex-direction: column; gap: 12px; }

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 14px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; .header-actions { display: flex; gap: 8px; } } }

.tree-wrapper { padding: 12px; max-height: 600px; overflow: auto; }

.tree-node { display: flex; align-items: center; gap: 8px; padding: 4px 0; .node-label { flex: 1; } }

.detail-content { padding: 16px; }

.sub-section { margin-top: 20px; .section-title { font-size: 14px; font-weight: 600; margin-bottom: 12px; padding-left: 10px; border-left: 3px solid #409EFF; } }

.empty-panel { min-height: 400px; display: flex; align-items: center; justify-content: center; }
</style>
