<template>
  <div class="dept-manage-page">
    <el-row :gutter="20">
      <!-- 部门树 -->
      <el-col :span="6">
        <el-card class="tree-card">
          <template #header>
            <div class="card-header">
              <span>组织架构</span>
              <el-button type="primary" link @click="handleAddRoot">添加根节点</el-button>
            </div>
          </template>
          <el-input v-model="filterText" placeholder="搜索部门" prefix-icon="Search" style="margin-bottom: 15px;" />
          <el-tree
            ref="treeRef"
            :data="deptTree"
            :props="{ label: 'name', children: 'children' }"
            :filter-node-method="filterNode"
            highlight-current
            default-expand-all
            @node-click="handleNodeClick"
          >
            <template #default="{ node, data }">
              <div class="tree-node">
                <span>{{ node.label }}</span>
                <span class="node-actions">
                  <el-icon @click.stop="handleAddChild(data)"><Plus /></el-icon>
                  <el-icon @click.stop="handleEditNode(data)"><Edit /></el-icon>
                  <el-icon @click.stop="handleDeleteNode(data)"><Delete /></el-icon>
                </span>
              </div>
            </template>
          </el-tree>
        </el-card>
      </el-col>

      <!-- 部门详情 -->
      <el-col :span="18">
        <el-card>
          <template #header>
            <span>部门信息</span>
          </template>
          <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" v-if="currentDept">
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="上级部门">
                  <el-tree-select v-model="form.parentId" :data="deptTree" placeholder="请选择" style="width: 100%" check-strictly />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="部门名称" prop="name">
                  <el-input v-model="form.name" placeholder="请输入部门名称" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="负责人" prop="leader">
                  <el-input v-model="form.leader" placeholder="请输入负责人" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="联系电话" prop="phone">
                  <el-input v-model="form.phone" placeholder="请输入联系电话" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="邮箱" prop="email">
                  <el-input v-model="form.email" placeholder="请输入邮箱" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="排序" prop="sort">
                  <el-input-number v-model="form.sort" :min="0" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="状态">
                  <el-radio-group v-model="form.status">
                    <el-radio :label="1">正常</el-radio>
                    <el-radio :label="0">停用</el-radio>
                  </el-radio-group>
                </el-form-item>
              </el-col>
            </el-row>
            <el-form-item>
              <el-button type="primary" @click="handleSave">保存</el-button>
              <el-button @click="handleCancel">取消</el-button>
            </el-form-item>
          </el-form>
          <el-empty v-else description="请选择左侧部门节点" />
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const filterText = ref('')
const treeRef = ref()
const currentDept = ref<any>(null)

const form = reactive({
  id: 0,
  parentId: '',
  name: '',
  leader: '',
  phone: '',
  email: '',
  sort: 0,
  status: 1
})

const rules = {
  name: [{ required: true, message: '请输入部门名称', trigger: 'blur' }]
}

const deptTree = ref([
  { id: 1, name: '农业科学研究院', value: '1', children: [
    { id: 2, name: '作物研究所', value: '2', children: [
      { id: 5, name: '水稻研究室', value: '5' },
      { id: 6, name: '小麦研究室', value: '6' }
    ]},
    { id: 3, name: '植物保护所', value: '3' },
    { id: 4, name: '土壤肥料所', value: '4' }
  ]},
  { id: 10, name: '畜牧兽医研究院', value: '10', children: [
    { id: 11, name: '动物营养所', value: '11' },
    { id: 12, name: '遗传育种所', value: '12' }
  ]}
])

watch(filterText, (val) => {
  treeRef.value?.filter(val)
})

const filterNode = (value: string, data: any) => {
  if (!value) return true
  return data.name.includes(value)
}

const handleNodeClick = (data: any) => {
  currentDept.value = data
  Object.assign(form, {
    id: data.id,
    parentId: '',
    name: data.name,
    leader: '张主任',
    phone: '010-12345678',
    email: 'dept@example.com',
    sort: 1,
    status: 1
  })
}

const handleAddRoot = () => {
  currentDept.value = {}
  Object.assign(form, { id: 0, parentId: '', name: '', leader: '', phone: '', email: '', sort: 0, status: 1 })
  ElMessage.info('添加根节点部门')
}

const handleAddChild = (data: any) => {
  currentDept.value = {}
  Object.assign(form, { id: 0, parentId: data.value, name: '', leader: '', phone: '', email: '', sort: 0, status: 1 })
  ElMessage.info(`在"${data.name}"下添加子部门`)
}

const handleEditNode = (data: any) => {
  handleNodeClick(data)
  ElMessage.info(`编辑部门: ${data.name}`)
}

const handleDeleteNode = (data: any) => {
  ElMessageBox.confirm(`确定删除"${data.name}"及其子部门吗？`, '提示', { type: 'warning' })
    .then(() => ElMessage.success('删除成功'))
    .catch(() => {})
}

const handleSave = () => ElMessage.success('保存成功')
const handleCancel = () => { currentDept.value = null; ElMessage.info('已取消') }
</script>

<style scoped>
.dept-manage-page { height: 100%; }
.tree-card { height: 100%; }
.card-header { display: flex; justify-content: space-between; align-items: center; }
.tree-node { display: flex; justify-content: space-between; align-items: center; width: 100%; }
.node-actions { display: none; gap: 8px; color: #409eff; }
.tree-node:hover .node-actions { display: flex; }
.node-actions .el-icon { cursor: pointer; }
.node-actions .el-icon:last-child { color: #f56c6c; }
</style>
