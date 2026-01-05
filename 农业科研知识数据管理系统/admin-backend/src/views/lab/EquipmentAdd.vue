<template>
  <div class="equipment-add-page">
    <el-card>
      <template #header><span>设备入库登记</span></template>
      <el-form :model="form" label-width="120px" style="max-width: 900px">
        <el-divider content-position="left">基本信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="设备编号"><el-input v-model="form.code" placeholder="自动生成或手动输入"><template #prepend>EQ</template></el-input></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="设备名称"><el-input v-model="form.name" placeholder="请输入设备名称" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="设备类型"><el-select v-model="form.type" placeholder="请选择" style="width: 100%"><el-option label="分析仪器" value="analysis" /><el-option label="光学仪器" value="optical" /><el-option label="电子仪器" value="electronic" /><el-option label="物理仪器" value="physical" /><el-option label="生物仪器" value="biology" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="规格型号"><el-input v-model="form.model" placeholder="请输入规格型号" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="品牌"><el-input v-model="form.brand" placeholder="请输入品牌" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="生产厂家"><el-input v-model="form.manufacturer" placeholder="请输入生产厂家" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="出厂日期"><el-date-picker v-model="form.manufactureDate" type="date" placeholder="请选择" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="出厂编号"><el-input v-model="form.serialNumber" placeholder="请输入出厂编号" /></el-form-item></el-col>
        </el-row>
        <el-divider content-position="left">采购信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="采购日期"><el-date-picker v-model="form.purchaseDate" type="date" placeholder="请选择" style="width: 100%" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="采购金额"><el-input-number v-model="form.price" :min="0" :precision="2" :controls="false" style="width: 100%" /><span style="margin-left: 8px">元</span></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="供应商"><el-input v-model="form.supplier" placeholder="请输入供应商名称" /></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="采购人"><el-input v-model="form.purchaser" placeholder="请输入采购人" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="保修期限"><el-input-number v-model="form.warrantyPeriod" :min="0" style="width: 100%" /><span style="margin-left: 8px">个月</span></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="资产来源"><el-select v-model="form.assetSource" placeholder="请选择" style="width: 100%"><el-option label="自购" value="purchase" /><el-option label="捐赠" value="donation" /><el-option label="调拨" value="transfer" /><el-option label="租赁" value="lease" /></el-select></el-form-item></el-col>
        </el-row>
        <el-divider content-position="left">存放信息</el-divider>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="存放实验室"><el-select v-model="form.lab" placeholder="请选择" style="width: 100%"><el-option label="实验室A" value="labA" /><el-option label="实验室B" value="labB" /><el-option label="实验室C" value="labC" /><el-option label="仪器室" value="instrument" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="具体位置"><el-input v-model="form.location" placeholder="如：A栋305室" /></el-form-item></el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12"><el-form-item label="设备负责人"><el-select v-model="form.manager" placeholder="请选择" style="width: 100%"><el-option label="张三" value="zhangsan" /><el-option label="李四" value="lisi" /><el-option label="王五" value="wangwu" /></el-select></el-form-item></el-col>
          <el-col :span="12"><el-form-item label="联系电话"><el-input v-model="form.phone" placeholder="请输入联系电话" /></el-form-item></el-col>
        </el-row>
        <el-divider content-position="left">其他信息</el-divider>
        <el-form-item label="设备用途"><el-input v-model="form.purpose" type="textarea" rows="2" placeholder="请输入设备主要用途" /></el-form-item>
        <el-form-item label="技术参数"><el-input v-model="form.techParams" type="textarea" rows="3" placeholder="请输入主要技术参数" /></el-form-item>
        <el-form-item label="设备图片"><el-upload action="#" list-type="picture-card" :limit="5" :on-exceed="handleExceed" :before-upload="handleBeforeUpload"><el-icon><Plus /></el-icon></el-upload></el-form-item>
        <el-form-item label="相关附件"><el-upload action="#" :limit="10" :before-upload="handleAttachUpload"><el-button type="primary"><el-icon><Upload /></el-icon>上传附件</el-button><template #tip><div class="el-upload__tip">可上传说明书、合同等文件，单个文件不超过50MB</div></template></el-upload></el-form-item>
        <el-form-item label="备注"><el-input v-model="form.remark" type="textarea" rows="2" placeholder="请输入备注信息" /></el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit"><el-icon><Check /></el-icon>提交入库</el-button>
          <el-button type="success" @click="handleSaveDraft"><el-icon><Document /></el-icon>保存草稿</el-button>
          <el-button @click="handleReset"><el-icon><Refresh /></el-icon>重置</el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
<script setup lang="ts">
import { reactive } from 'vue'
import { ElMessage } from 'element-plus'
const form = reactive({ code: '', name: '', type: '', model: '', brand: '', manufacturer: '', manufactureDate: '', serialNumber: '', purchaseDate: '', price: 0, supplier: '', purchaser: '', warrantyPeriod: 12, assetSource: 'purchase', lab: '', location: '', manager: '', phone: '', purpose: '', techParams: '', remark: '' })
const handleExceed = () => ElMessage.warning('最多上传5张图片')
const handleBeforeUpload = () => { ElMessage.success('图片上传成功'); return false }
const handleAttachUpload = () => { ElMessage.success('附件上传成功'); return false }
const handleSubmit = () => ElMessage.success('设备入库成功')
const handleSaveDraft = () => ElMessage.success('草稿保存成功')
const handleReset = () => { Object.keys(form).forEach(key => { (form as any)[key] = typeof (form as any)[key] === 'number' ? 0 : '' }); form.warrantyPeriod = 12; form.assetSource = 'purchase'; ElMessage.info('已重置') }
</script>
<style scoped>.equipment-add-page { height: 100%; overflow-y: auto; }</style>
