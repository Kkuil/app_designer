<template>
    <div class="equipment-params-page">
        <div class="search-bar">
            <el-form :inline="true">
                <el-form-item label="设备名称">
                    <el-input v-model="searchForm.equipmentName" placeholder="请输入" clearable />
                </el-form-item>
                <el-form-item label="设备编号">
                    <el-input v-model="searchForm.equipmentCode" placeholder="请输入" clearable />
                </el-form-item>
                <el-form-item label="参数类型">
                    <el-select v-model="searchForm.paramType" placeholder="全部" clearable>
                        <el-option label="电气参数" value="electrical" />
                        <el-option label="性能参数" value="performance" />
                        <el-option label="环境参数" value="environment" />
                        <el-option label="功能参数" value="function" />
                    </el-select>
                </el-form-item>
                <el-form-item>
                    <el-button type="primary" @click="handleSearch"><el-icon>
                            <Search />
                        </el-icon>搜索</el-button>
                    <el-button @click="handleReset"><el-icon>
                            <Refresh />
                        </el-icon>重置</el-button>
                </el-form-item>
            </el-form>
        </div>
        <div class="table-container">
            <div class="action-bar">
                <el-button type="primary" @click="handleAdd"><el-icon>
                        <Plus />
                    </el-icon>新增参数</el-button>
                <el-button type="success" @click="handleExport"><el-icon>
                        <Download />
                    </el-icon>导出</el-button>
            </div>
            <el-table :data="tableData" stripe border>
                <el-table-column prop="id" label="ID" width="60" />
                <el-table-column prop="equipmentName" label="设备名称" min-width="150" />
                <el-table-column prop="equipmentCode" label="设备编号" width="120" />
                <el-table-column prop="paramName" label="参数名称" min-width="140" />
                <el-table-column prop="paramValue" label="参数值" width="150" />
                <el-table-column prop="unit" label="单位" width="100" />
                <el-table-column prop="paramType" label="参数类型" width="100">
                    <template #default="{ row }">
                        <el-tag :type="getParamTypeTag(row.paramType)" size="small">{{ row.paramTypeName }}</el-tag>
                    </template>
                </el-table-column>
                <el-table-column prop="remark" label="备注" min-width="150" show-overflow-tooltip />
                <el-table-column label="操作" width="180" fixed="right">
                    <template #default="{ row }">
                        <el-button type="primary" link size="small" @click="handleEdit(row)">编辑</el-button>
                        <el-button type="danger" link size="small" @click="handleDelete(row)">删除</el-button>
                    </template>
                </el-table-column>
            </el-table>
            <div class="pagination-container">
                <el-pagination v-model:current-page="currentPage" v-model:page-size="pageSize"
                    :page-sizes="[10, 20, 50]" :total="total" layout="total, sizes, prev, pager, next"
                    @size-change="handleSizeChange" @current-change="handleCurrentChange" />
            </div>
        </div>
        <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑参数' : '新增参数'" width="600px">
            <el-form :model="form" label-width="100px">
                <el-form-item label="选择设备">
                    <el-select v-model="form.equipmentId" placeholder="请选择设备" style="width: 100%" filterable>
                        <el-option label="高效液相色谱仪 (EQ20240001)" value="1" />
                        <el-option label="气相色谱质谱联用仪 (EQ20240002)" value="2" />
                        <el-option label="紫外可见分光光度计 (EQ20240003)" value="3" />
                        <el-option label="原子吸收光谱仪 (EQ20240004)" value="4" />
                    </el-select>
                </el-form-item>
                <el-form-item label="参数名称">
                    <el-input v-model="form.paramName" placeholder="如：工作温度范围" />
                </el-form-item>
                <el-form-item label="参数值">
                    <el-input v-model="form.paramValue" placeholder="如：-5~45" />
                </el-form-item>
                <el-row :gutter="20">
                    <el-col :span="12">
                        <el-form-item label="单位">
                            <el-input v-model="form.unit" placeholder="如：℃" />
                        </el-form-item>
                    </el-col>
                </el-row>
                <el-col :span="12">
                    <el-form-item label="参数类型">
                        <el-select v-model="form.paramType" placeholder="请选择" style="width: 100%">
                            <el-option label="电气参数" value="electrical" />
                            <el-option label="性能参数" value="performance" />
                            <el-option label="环境参数" value="environment" />
                            <el-option label="功能参数" value="function" />
                        </el-select>
                    </el-form-item>
                </el-col>
                <el-form-item label="备注">
                    <el-input v-model="form.remark" type="textarea" rows="3" placeholder="请输入备注信息" />
                </el-form-item>
            </el-form>
            <template #footer>
                <el-button @click="dialogVisible = false">取消</el-button>
                <el-button type="primary" @click="handleSubmit">确定</el-button>
            </template>
        </el-dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(30)
const dialogVisible = ref(false)
const isEdit = ref(false)

const searchForm = reactive({
    equipmentName: '',
    equipmentCode: '',
    paramType: ''
})

const form = reactive({
    id: 0,
    equipmentId: '',
    equipmentName: '',
    equipmentCode: '',
    paramName: '',
    paramValue: '',
    unit: '',
    paramType: '',
    remark: ''
})

const tableData = ref([
    { id: 1, equipmentName: '高效液相色谱仪', equipmentCode: 'EQ20240001', paramName: '工作温度范围', paramValue: '-5~45', unit: '℃', paramType: 'environment', paramTypeName: '环境参数', remark: '设备正常工作的温度范围' },
    { id: 2, equipmentName: '高效液相色谱仪', equipmentCode: 'EQ20240001', paramName: '相对湿度', paramValue: '30~85', unit: '%RH', paramType: 'environment', paramTypeName: '环境参数', remark: '相对湿度不结露' },
    { id: 3, equipmentName: '高效液相色谱仪', equipmentCode: 'EQ20240001', paramName: '流动相流速范围', paramValue: '0.1~3', unit: 'mL/min', paramType: 'performance', paramTypeName: '性能参数', remark: '标准流速为0.5-2.0' },
    { id: 4, equipmentName: '高效液相色谱仪', equipmentCode: 'EQ20240001', paramName: '柱温箱温度范围', paramValue: '5~65', unit: '℃', paramType: 'performance', paramTypeName: '性能参数', remark: '精度±0.1℃' },
    { id: 5, equipmentName: '气相色谱质谱联用仪', equipmentCode: 'EQ20240002', paramName: '工作温度', paramValue: '16~35', unit: '℃', paramType: 'environment', paramTypeName: '环境参数', remark: '最高35℃' },
    { id: 6, equipmentName: '气相色谱质谱联用仪', equipmentCode: 'EQ20240002', paramName: '真空度', paramValue: '<1×10-4', unit: 'Pa', paramType: 'performance', paramTypeName: '性能参数', remark: '质量分析器工作真空度' },
    { id: 7, equipmentName: '紫外可见分光光度计', equipmentCode: 'EQ20240003', paramName: '检测波长范围', paramValue: '190~1100', unit: 'nm', paramType: 'performance', paramTypeName: '性能参数', remark: '紫外与可见光范围' },
    { id: 8, equipmentName: '原子吸收光谱仪', equipmentCode: 'EQ20240004', paramName: '空气流量', paramValue: '10~15', unit: 'L/min', paramType: 'function', paramTypeName: '功能参数', remark: '燃烧器所需空气流量' }
])

const getParamTypeTag = (type: string) => {
    const map: Record<string, string> = {
        'electrical': 'info',
        'performance': 'primary',
        'environment': 'success',
        'function': 'warning'
    }
    return map[type] || 'info'
}

const handleSearch = () => ElMessage.success('搜索完成')
const handleReset = () => {
    Object.assign(searchForm, { equipmentName: '', equipmentCode: '', paramType: '' })
    ElMessage.info('已重置')
}

const handleAdd = () => {
    isEdit.value = false
    Object.assign(form, { id: 0, equipmentId: '', equipmentName: '', equipmentCode: '', paramName: '', paramValue: '', unit: '', paramType: '', remark: '' })
    dialogVisible.value = true
}

const handleEdit = (row: any) => {
    isEdit.value = true
    Object.assign(form, row)
    dialogVisible.value = true
}

const handleDelete = (row: any) => {
    ElMessageBox.confirm(`确定删除参数"${row.paramName}"吗？`, '提示', { type: 'warning' })
        .then(() => ElMessage.success('删除成功'))
        .catch(() => { })
}

const handleExport = () => ElMessage.success('导出成功')
const handleSubmit = () => {
    ElMessage.success(isEdit.value ? '修改成功' : '新增成功')
    dialogVisible.value = false
}

const handleSizeChange = () => ElMessage.info(`每页${pageSize.value}条`)
const handleCurrentChange = () => ElMessage.info(`第${currentPage.value}页`)
</script>

<style scoped>
.equipment-params-page {
    height: 100%;
}
</style>
