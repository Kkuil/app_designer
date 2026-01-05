<template>
  <div class="reagent-detail-page">
    <el-page-header @back="handleBack" title="返回" content="试剂信息详情" />
    <div class="detail-content">
      <el-row :gutter="20">
        <el-col :span="16">
          <el-card>
            <template #header><div class="card-header"><span>基本信息</span><el-button type="primary" @click="handleEdit">编辑</el-button></div></template>
            <el-descriptions :column="2" border>
              <el-descriptions-item label="试剂编码">{{ detail.code }}</el-descriptions-item>
              <el-descriptions-item label="试剂名称">{{ detail.name }}</el-descriptions-item>
              <el-descriptions-item label="英文名称">{{ detail.nameEn }}</el-descriptions-item>
              <el-descriptions-item label="CAS号">{{ detail.cas }}</el-descriptions-item>
              <el-descriptions-item label="分子式">{{ detail.formula }}</el-descriptions-item>
              <el-descriptions-item label="分子量">{{ detail.molecularWeight }}</el-descriptions-item>
              <el-descriptions-item label="试剂分类">{{ detail.categoryName }}</el-descriptions-item>
              <el-descriptions-item label="危险等级"><el-tag :type="getDangerType(detail.dangerLevel)" size="small">{{ detail.dangerLevelName }}</el-tag></el-descriptions-item>
              <el-descriptions-item label="规格">{{ detail.spec }}</el-descriptions-item>
              <el-descriptions-item label="单位">{{ detail.unit }}</el-descriptions-item>
              <el-descriptions-item label="纯度/等级">{{ detail.purity }}</el-descriptions-item>
              <el-descriptions-item label="品牌">{{ detail.brand }}</el-descriptions-item>
              <el-descriptions-item label="生产厂家">{{ detail.manufacturer }}</el-descriptions-item>
              <el-descriptions-item label="供应商">{{ detail.supplier }}</el-descriptions-item>
              <el-descriptions-item label="单价(元)">{{ detail.price }}</el-descriptions-item>
              <el-descriptions-item label="存放条件">{{ detail.storageCondition }}</el-descriptions-item>
              <el-descriptions-item label="存放位置" :span="2">{{ detail.location }}</el-descriptions-item>
              <el-descriptions-item label="用途说明" :span="2">{{ detail.purpose }}</el-descriptions-item>
              <el-descriptions-item label="注意事项" :span="2"><span style="color: #F56C6C">{{ detail.precautions }}</span></el-descriptions-item>
            </el-descriptions>
          </el-card>
          <el-card style="margin-top: 20px">
            <template #header><span>库存信息</span></template>
            <el-descriptions :column="3" border>
              <el-descriptions-item label="当前库存"><span :style="{ color: detail.stock <= detail.safeStock ? '#F56C6C' : '#67C23A', fontWeight: 'bold' }">{{ detail.stock }} {{ detail.unit }}</span></el-descriptions-item>
              <el-descriptions-item label="安全库存">{{ detail.safeStock }} {{ detail.unit }}</el-descriptions-item>
              <el-descriptions-item label="库存状态"><el-tag :type="getStockStatusType()" size="small">{{ getStockStatusName() }}</el-tag></el-descriptions-item>
              <el-descriptions-item label="批次号">{{ detail.batchNo }}</el-descriptions-item>
              <el-descriptions-item label="生产日期">{{ detail.productionDate }}</el-descriptions-item>
              <el-descriptions-item label="有效期至"><span :style="{ color: isExpiringSoon() ? '#F56C6C' : '' }">{{ detail.expiryDate }}</span></el-descriptions-item>
              <el-descriptions-item label="库存总值">¥{{ (detail.stock * detail.price).toFixed(2) }}</el-descriptions-item>
              <el-descriptions-item label="上次入库">{{ detail.lastInbound }}</el-descriptions-item>
              <el-descriptions-item label="上次领用">{{ detail.lastOutbound }}</el-descriptions-item>
            </el-descriptions>
          </el-card>
          <el-card style="margin-top: 20px">
            <template #header><div class="card-header"><span>出入库记录</span><el-radio-group v-model="recordType" size="small"><el-radio-button value="all">全部</el-radio-button><el-radio-button value="in">入库</el-radio-button><el-radio-button value="out">领用</el-radio-button></el-radio-group></div></template>
            <el-table :data="filteredRecords" stripe border max-height="300">
              <el-table-column prop="time" label="时间" width="160" />
              <el-table-column prop="type" label="类型" width="80"><template #default="{ row }"><el-tag :type="row.type === '入库' ? 'success' : 'warning'" size="small">{{ row.type }}</el-tag></template></el-table-column>
              <el-table-column prop="quantity" label="数量" width="100"><template #default="{ row }"><span :style="{ color: row.type === '入库' ? '#67C23A' : '#E6A23C' }">{{ row.type === '入库' ? '+' : '-' }}{{ row.quantity }}</span></template></el-table-column>
              <el-table-column prop="operator" label="操作人" width="100" />
              <el-table-column prop="project" label="关联项目/订单" min-width="150" />
              <el-table-column prop="remark" label="备注" min-width="150" />
            </el-table>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card>
            <template #header><span>试剂图片</span></template>
            <div class="image-container"><el-image :src="detail.image" fit="contain" style="width: 100%; height: 200px"><template #error><div class="image-placeholder"><el-icon size="60"><Picture /></el-icon><span>暂无图片</span></div></template></el-image></div>
          </el-card>
          <el-card style="margin-top: 20px">
            <template #header><span>快捷操作</span></template>
            <div class="quick-actions">
              <el-button type="success" style="width: 100%; margin-bottom: 10px" @click="handleInbound">入库登记</el-button>
              <el-button type="warning" style="width: 100%; margin-bottom: 10px" @click="handleOutbound">领用申请</el-button>
              <el-button type="danger" style="width: 100%; margin-bottom: 10px" @click="handleDamage">报损登记</el-button>
              <el-button type="info" style="width: 100%" @click="handlePurchase">申购补充</el-button>
            </div>
          </el-card>
          <el-card style="margin-top: 20px">
            <template #header><span>安全数据表(MSDS)</span></template>
            <div v-if="detail.msdsFile" class="msds-info"><el-icon><Document /></el-icon><span style="margin-left: 10px">{{ detail.msdsFile }}</span><el-button type="primary" link @click="handleDownloadMsds">下载</el-button></div>
            <div v-else class="msds-empty"><el-icon size="40"><WarningFilled /></el-icon><p>暂无MSDS文件</p><el-button type="primary" size="small" @click="handleUploadMsds">上传MSDS</el-button></div>
          </el-card>
          <el-card style="margin-top: 20px">
            <template #header><span>相关试剂</span></template>
            <div v-for="item in relatedReagents" :key="item.code" class="related-item" @click="handleViewRelated(item)">
              <span>{{ item.name }}</span><el-tag size="small" type="info">{{ item.spec }}</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { ElMessage } from 'element-plus'
const recordType = ref('all')
const detail = reactive({
  code: 'RG20240001', name: '无水乙醇', nameEn: 'Ethanol Absolute', cas: '64-17-5', formula: 'C₂H₅OH', molecularWeight: '46.07',
  category: 'organic', categoryName: '有机溶剂', dangerLevel: 'low', dangerLevelName: '低危', spec: '500mL', unit: '瓶',
  purity: '分析纯(AR)', brand: '国药集团', manufacturer: '国药集团化学试剂有限公司', supplier: '北京化学试剂公司', price: 35,
  storageCondition: '常温密封保存，远离火源', location: '常温库房-A区-3号货架-2层',
  purpose: '用于有机合成、萃取、清洗及色谱分析等',
  precautions: '易燃易挥发，操作时需远离火源，在通风良好处使用，避免吸入蒸气',
  stock: 50, safeStock: 20, batchNo: 'BN20240815', productionDate: '2024-08-15', expiryDate: '2025-12-31',
  lastInbound: '2024-12-10', lastOutbound: '2024-12-20', image: '', msdsFile: '无水乙醇-MSDS.pdf'
})
const records = ref([
  { time: '2024-12-20 14:30', type: '领用', quantity: 2, operator: '张研究员', project: '农药残留检测项目', remark: '样品前处理' },
  { time: '2024-12-15 09:20', type: '领用', quantity: 5, operator: '李博士', project: '土壤分析项目', remark: '萃取溶剂' },
  { time: '2024-12-10 10:00', type: '入库', quantity: 20, operator: '库管员', project: '采购订单PO20241201', remark: '常规补货' },
  { time: '2024-12-05 16:40', type: '领用', quantity: 3, operator: '王助理', project: '设备清洗', remark: '仪器清洗' },
  { time: '2024-11-28 11:15', type: '入库', quantity: 30, operator: '库管员', project: '采购订单PO20241115', remark: '批量采购' }
])
const relatedReagents = ref([
  { code: 'RG20240010', name: '甲醇', spec: '500mL' },
  { code: 'RG20240011', name: '乙醇(95%)', spec: '500mL' },
  { code: 'RG20240012', name: '异丙醇', spec: '500mL' }
])
const filteredRecords = computed(() => {
  if (recordType.value === 'all') return records.value
  return records.value.filter(r => recordType.value === 'in' ? r.type === '入库' : r.type === '领用')
})
const getDangerType = (level: string) => { const m: Record<string, string> = { low: 'success', medium: 'warning', high: 'danger' }; return m[level] || 'info' }
const getStockStatusType = () => detail.stock <= detail.safeStock ? 'danger' : 'success'
const getStockStatusName = () => detail.stock <= detail.safeStock ? '库存不足' : '库存充足'
const isExpiringSoon = () => { const d = new Date(detail.expiryDate); const now = new Date(); return (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24) < 90 }
const handleBack = () => ElMessage.info('返回列表')
const handleEdit = () => ElMessage.success('进入编辑模式')
const handleInbound = () => ElMessage.success('进入入库登记')
const handleOutbound = () => ElMessage.success('进入领用申请')
const handleDamage = () => ElMessage.success('进入报损登记')
const handlePurchase = () => ElMessage.success('进入申购页面')
const handleDownloadMsds = () => ElMessage.success('下载MSDS文件')
const handleUploadMsds = () => ElMessage.success('上传MSDS文件')
const handleViewRelated = (item: any) => ElMessage.success(`查看试剂：${item.name}`)
</script>
<style scoped>.reagent-detail-page { height: 100%; overflow-y: auto; padding: 10px; }.detail-content { margin-top: 20px; }.card-header { display: flex; justify-content: space-between; align-items: center; }.image-container { display: flex; justify-content: center; align-items: center; }.image-placeholder { display: flex; flex-direction: column; align-items: center; color: #909399; }.quick-actions { padding: 10px 0; }.msds-info { display: flex; align-items: center; }.msds-empty { text-align: center; color: #909399; padding: 20px; }.related-item { display: flex; justify-content: space-between; align-items: center; padding: 10px; border-bottom: 1px solid #ebeef5; cursor: pointer; }.related-item:hover { background: #f5f7fa; }.related-item:last-child { border-bottom: none; }</style>
