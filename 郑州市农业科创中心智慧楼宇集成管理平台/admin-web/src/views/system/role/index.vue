<template>
  <div class="role-container">
    <el-row :gutter="16">
      <el-col :span="8">
        <div class="panel">
          <div class="panel-header">
            <span>角色列表</span>
            <el-button type="primary" size="small" @click="handleAddRole"><el-icon><Plus /></el-icon>新建</el-button>
          </div>
          <div class="role-list">
            <div v-for="role in roleList" :key="role.id" class="role-item" :class="{ active: selectedRole?.id === role.id }" @click="handleSelectRole(role)">
              <div class="info">
                <div class="name">{{ role.name }}</div>
                <div class="desc">{{ role.description }}</div>
              </div>
              <div class="actions">
                <el-tag :type="role.status === 'enabled' ? 'success' : 'info'" size="small">{{ role.status === 'enabled' ? '启用' : '禁用' }}</el-tag>
              </div>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :span="16">
        <div class="panel" v-if="selectedRole">
          <div class="panel-header">
            <span>角色详情 - {{ selectedRole.name }}</span>
            <div class="header-actions">
              <el-button type="primary" size="small" @click="handleEditRole"><el-icon><Edit /></el-icon>编辑</el-button>
              <el-button type="danger" size="small" @click="handleDeleteRole"><el-icon><Delete /></el-icon>删除</el-button>
            </div>
          </div>

          <el-tabs v-model="activeTab">
            <el-tab-pane label="基本信息" name="info">
              <el-descriptions :column="2" border>
                <el-descriptions-item label="角色名称">{{ selectedRole.name }}</el-descriptions-item>
                <el-descriptions-item label="角色编码">{{ selectedRole.code }}</el-descriptions-item>
                <el-descriptions-item label="描述" :span="2">{{ selectedRole.description }}</el-descriptions-item>
                <el-descriptions-item label="用户数">{{ selectedRole.userCount }}</el-descriptions-item>
                <el-descriptions-item label="状态"><el-tag :type="selectedRole.status === 'enabled' ? 'success' : 'info'" size="small">{{ selectedRole.status === 'enabled' ? '启用' : '禁用' }}</el-tag></el-descriptions-item>
                <el-descriptions-item label="创建时间">{{ selectedRole.createTime }}</el-descriptions-item>
                <el-descriptions-item label="更新时间">{{ selectedRole.updateTime }}</el-descriptions-item>
              </el-descriptions>
            </el-tab-pane>

            <el-tab-pane label="权限配置" name="permission">
              <el-tree ref="treeRef" :data="permissionTree" show-checkbox node-key="id" :default-checked-keys="selectedRole.permissions" :props="{ label: 'label', children: 'children' }">
                <template #default="{ node, data }">
                  <span class="tree-node">
                    <el-icon v-if="data.icon"><component :is="data.icon" /></el-icon>
                    <span>{{ node.label }}</span>
                  </span>
                </template>
              </el-tree>
              <div class="permission-actions">
                <el-button type="primary" @click="handleSavePermissions">保存权限</el-button>
              </div>
            </el-tab-pane>

            <el-tab-pane label="关联用户" name="users">
              <el-table :data="roleUsers" height="300">
                <el-table-column prop="username" label="用户名" width="120" />
                <el-table-column prop="realName" label="姓名" width="100" />
                <el-table-column prop="department" label="部门" width="140" />
                <el-table-column prop="phone" label="手机号" width="130" />
                <el-table-column prop="status" label="状态" width="80">
                  <template #default="{ row }"><el-tag :type="row.status === 'active' ? 'success' : 'info'" size="small">{{ row.status === 'active' ? '正常' : '禁用' }}</el-tag></template>
                </el-table-column>
                <el-table-column label="操作" width="80">
                  <template #default="{ row }"><el-button type="danger" link size="small" @click="handleRemoveUser(row)">移除</el-button></template>
                </el-table-column>
              </el-table>
            </el-tab-pane>
          </el-tabs>
        </div>
        <div class="panel empty-panel" v-else>
          <el-empty description="请选择一个角色查看详情" />
        </div>
      </el-col>
    </el-row>

    <el-dialog v-model="dialogVisible" :title="roleForm.id ? '编辑角色' : '新建角色'" width="500px">
      <el-form :model="roleForm" label-width="80px">
        <el-form-item label="角色名称"><el-input v-model="roleForm.name" placeholder="请输入角色名称" /></el-form-item>
        <el-form-item label="角色编码"><el-input v-model="roleForm.code" placeholder="请输入角色编码" /></el-form-item>
        <el-form-item label="描述"><el-input v-model="roleForm.description" type="textarea" :rows="3" placeholder="请输入描述" /></el-form-item>
        <el-form-item label="状态"><el-switch v-model="roleForm.enabled" active-text="启用" inactive-text="禁用" /></el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveRole">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { Plus, Edit, Delete, Setting, Monitor, Document, User } from '@element-plus/icons-vue'

const activeTab = ref('info')
const dialogVisible = ref(false)

const roleList = ref([
  { id: 1, name: '系统管理员', code: 'admin', description: '拥有全部权限', status: 'enabled', userCount: 3, createTime: '2025-01-01 00:00:00', updateTime: '2025-01-15 10:30:00', permissions: [1, 2, 3, 4, 5] },
  { id: 2, name: '运维人员', code: 'operator', description: '设备运维管理', status: 'enabled', userCount: 12, createTime: '2025-01-02 00:00:00', updateTime: '2025-01-10 14:20:00', permissions: [2, 3] },
  { id: 3, name: '安全管理员', code: 'security', description: '安防系统管理', status: 'enabled', userCount: 5, createTime: '2025-01-03 00:00:00', updateTime: '2025-01-12 09:15:00', permissions: [3, 4] },
  { id: 4, name: '访客角色', code: 'guest', description: '只读权限', status: 'disabled', userCount: 0, createTime: '2025-01-05 00:00:00', updateTime: '2025-01-05 00:00:00', permissions: [] }
])

const selectedRole = ref(roleList.value[0])

const permissionTree = ref([
  { id: 1, label: '系统管理', icon: Setting, children: [
    { id: 11, label: '用户管理' }, { id: 12, label: '角色管理' }, { id: 13, label: '权限配置' }, { id: 14, label: '日志管理' }
  ]},
  { id: 2, label: '设备管理', icon: Monitor, children: [
    { id: 21, label: '设备列表' }, { id: 22, label: '设备监控' }, { id: 23, label: '设备配置' }
  ]},
  { id: 3, label: '告警管理', icon: Document, children: [
    { id: 31, label: '实时告警' }, { id: 32, label: '告警历史' }, { id: 33, label: '告警配置' }
  ]},
  { id: 4, label: '报表管理', icon: Document, children: [
    { id: 41, label: '能耗报表' }, { id: 42, label: '设备报表' }, { id: 43, label: '告警报表' }
  ]}
])

const roleUsers = ref([
  { id: 1, username: 'admin', realName: '张三', department: '信息技术部', phone: '13800138001', status: 'active' },
  { id: 2, username: 'operator1', realName: '李四', department: '运维部', phone: '13800138002', status: 'active' }
])

const roleForm = reactive({ id: 0, name: '', code: '', description: '', enabled: true })

const handleSelectRole = (role: any) => { selectedRole.value = role; activeTab.value = 'info' }
const handleAddRole = () => { Object.assign(roleForm, { id: 0, name: '', code: '', description: '', enabled: true }); dialogVisible.value = true }
const handleEditRole = () => { if (selectedRole.value) { Object.assign(roleForm, selectedRole.value, { enabled: selectedRole.value.status === 'enabled' }); dialogVisible.value = true } }
const handleDeleteRole = () => { ElMessage.warning(`删除角色: ${selectedRole.value?.name}`) }
const handleSaveRole = () => { dialogVisible.value = false; ElMessage.success('保存成功') }
const handleSavePermissions = () => { ElMessage.success('权限保存成功') }
const handleRemoveUser = (row: any) => { ElMessage.warning(`移除用户: ${row.realName}`) }
</script>

<style lang="scss" scoped>
.role-container { display: flex; flex-direction: column; gap: 12px; }

.panel { background: #fff; border-radius: 8px; overflow: hidden; .panel-header { padding: 14px 16px; border-bottom: 1px solid #ebeef5; display: flex; justify-content: space-between; align-items: center; font-weight: 600; .header-actions { display: flex; gap: 8px; } } }

.role-list { padding: 8px; max-height: 600px; overflow: auto; .role-item { display: flex; justify-content: space-between; align-items: center; padding: 12px; border-radius: 8px; cursor: pointer; &:hover { background: #f5f7fa; } &.active { background: #ecf5ff; } .info { .name { font-weight: 600; margin-bottom: 4px; } .desc { font-size: 12px; color: #909399; } } } }

.empty-panel { min-height: 400px; display: flex; align-items: center; justify-content: center; }

.tree-node { display: flex; align-items: center; gap: 6px; }

.permission-actions { margin-top: 16px; padding-top: 16px; border-top: 1px solid #ebeef5; }

.el-tabs { padding: 16px; }
</style>
