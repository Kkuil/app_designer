<template>
  <div class="energy-config-container">
    <!-- 配置导航标签 -->
    <el-tabs v-model="activeTab" type="border-card">
      <!-- 能源定价配置 -->
      <el-tab-pane label="能源定价配置" name="pricing">
        <div class="config-section">
          <div class="section-header">
            <span class="section-title">电价配置</span>
            <el-button type="primary" size="small" @click="handleAddPricing('electric')">
              <el-icon><Plus /></el-icon>
              新增电价
            </el-button>
          </div>
          <el-table :data="electricPricing" border stripe style="width: 100%">
            <el-table-column prop="id" label="编号" width="100" />
            <el-table-column prop="name" label="价格名称" width="150" />
            <el-table-column prop="type" label="计价类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getPricingTypeTag(row.type)" size="small">{{ row.typeName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价(元/kWh)" width="130" />
            <el-table-column prop="timeRange" label="时段范围" min-width="150" />
            <el-table-column prop="effectiveDate" label="生效日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" size="small" @change="handlePricingStatusChange(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditPricing(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeletePricing(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="config-section">
          <div class="section-header">
            <span class="section-title">水价配置</span>
            <el-button type="primary" size="small" @click="handleAddPricing('water')">
              <el-icon><Plus /></el-icon>
              新增水价
            </el-button>
          </div>
          <el-table :data="waterPricing" border stripe style="width: 100%">
            <el-table-column prop="id" label="编号" width="100" />
            <el-table-column prop="name" label="价格名称" width="150" />
            <el-table-column prop="type" label="计价类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getPricingTypeTag(row.type)" size="small">{{ row.typeName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价(元/m³)" width="130" />
            <el-table-column prop="ladder" label="阶梯范围" min-width="150" />
            <el-table-column prop="effectiveDate" label="生效日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" size="small" @change="handlePricingStatusChange(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditPricing(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeletePricing(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>

        <div class="config-section">
          <div class="section-header">
            <span class="section-title">燃气价格配置</span>
            <el-button type="primary" size="small" @click="handleAddPricing('gas')">
              <el-icon><Plus /></el-icon>
              新增气价
            </el-button>
          </div>
          <el-table :data="gasPricing" border stripe style="width: 100%">
            <el-table-column prop="id" label="编号" width="100" />
            <el-table-column prop="name" label="价格名称" width="150" />
            <el-table-column prop="type" label="计价类型" width="120">
              <template #default="{ row }">
                <el-tag :type="getPricingTypeTag(row.type)" size="small">{{ row.typeName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="price" label="单价(元/m³)" width="130" />
            <el-table-column prop="effectiveDate" label="生效日期" width="120" />
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" size="small" @change="handlePricingStatusChange(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditPricing(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeletePricing(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 计量设备配置 -->
      <el-tab-pane label="计量设备配置" name="meter">
        <div class="filter-section">
          <el-form inline>
            <el-form-item label="设备类型">
              <el-select v-model="meterFilter.type" placeholder="请选择类型" clearable style="width: 140px">
                <el-option label="电表" value="electric" />
                <el-option label="水表" value="water" />
                <el-option label="气表" value="gas" />
              </el-select>
            </el-form-item>
            <el-form-item label="所属区域">
              <el-select v-model="meterFilter.area" placeholder="请选择区域" clearable style="width: 160px">
                <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="状态">
              <el-select v-model="meterFilter.status" placeholder="请选择状态" clearable style="width: 120px">
                <el-option label="在线" value="online" />
                <el-option label="离线" value="offline" />
                <el-option label="故障" value="fault" />
              </el-select>
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleMeterSearch">查询</el-button>
              <el-button @click="handleMeterReset">重置</el-button>
              <el-button type="primary" @click="handleAddMeter">
                <el-icon><Plus /></el-icon>
                新增设备
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <el-table :data="meterData" border stripe style="width: 100%">
          <el-table-column prop="id" label="设备编号" width="120" />
          <el-table-column prop="name" label="设备名称" min-width="150" />
          <el-table-column prop="type" label="设备类型" width="100">
            <template #default="{ row }">
              <el-tag :type="getMeterTypeTag(row.type)" size="small">{{ row.typeName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="model" label="设备型号" width="120" />
          <el-table-column prop="area" label="所属区域" width="120" />
          <el-table-column prop="location" label="安装位置" min-width="150" />
          <el-table-column prop="ratio" label="变比/倍率" width="100" />
          <el-table-column prop="precision" label="精度等级" width="100" />
          <el-table-column prop="protocol" label="通讯协议" width="120" />
          <el-table-column prop="status" label="状态" width="100">
            <template #default="{ row }">
              <el-tag :type="getMeterStatusTag(row.status)" size="small">{{ row.statusName }}</el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="installDate" label="安装日期" width="120" />
          <el-table-column label="操作" width="180" fixed="right">
            <template #default="{ row }">
              <el-button type="primary" link size="small" @click="handleEditMeter(row)">编辑</el-button>
              <el-button type="primary" link size="small" @click="handleViewMeterData(row)">数据</el-button>
              <el-button type="danger" link size="small" @click="handleDeleteMeter(row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        
        <div class="pagination-wrapper">
          <el-pagination
            v-model:current-page="meterPagination.currentPage"
            v-model:page-size="meterPagination.pageSize"
            :page-sizes="[10, 20, 50, 100]"
            :total="meterPagination.total"
            layout="total, sizes, prev, pager, next, jumper"
          />
        </div>
      </el-tab-pane>

      <!-- 能耗分项配置 -->
      <el-tab-pane label="能耗分项配置" name="category">
        <div class="category-container">
          <el-row :gutter="20">
            <el-col :span="8">
              <el-card class="category-card" shadow="never">
                <template #header>
                  <div class="card-header">
                    <span class="title">分项类别</span>
                    <el-button type="primary" size="small" @click="handleAddCategory">
                      <el-icon><Plus /></el-icon>
                      新增
                    </el-button>
                  </div>
                </template>
                <el-tree
                  :data="categoryTree"
                  :props="{ label: 'name', children: 'children' }"
                  node-key="id"
                  default-expand-all
                  highlight-current
                  @node-click="handleCategoryClick"
                >
                  <template #default="{ node, data }">
                    <div class="tree-node">
                      <span>{{ node.label }}</span>
                      <span class="tree-actions">
                        <el-icon @click.stop="handleEditCategory(data)"><Edit /></el-icon>
                        <el-icon @click.stop="handleDeleteCategory(data)"><Delete /></el-icon>
                      </span>
                    </div>
                  </template>
                </el-tree>
              </el-card>
            </el-col>
            <el-col :span="16">
              <el-card class="category-detail-card" shadow="never">
                <template #header>
                  <div class="card-header">
                    <span class="title">分项详情 - {{ currentCategory?.name || '请选择分项' }}</span>
                  </div>
                </template>
                <div v-if="currentCategory" class="category-form">
                  <el-form :model="currentCategory" label-width="120px">
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="分项编码">
                          <el-input v-model="currentCategory.code" disabled />
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="分项名称">
                          <el-input v-model="currentCategory.name" />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="能源类型">
                          <el-select v-model="currentCategory.energyType" style="width: 100%">
                            <el-option label="电" value="electric" />
                            <el-option label="水" value="water" />
                            <el-option label="燃气" value="gas" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="计量单位">
                          <el-input v-model="currentCategory.unit" />
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-row :gutter="20">
                      <el-col :span="12">
                        <el-form-item label="所属区域">
                          <el-select v-model="currentCategory.area" style="width: 100%">
                            <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
                          </el-select>
                        </el-form-item>
                      </el-col>
                      <el-col :span="12">
                        <el-form-item label="关联设备">
                          <el-input v-model="currentCategory.meterCount" disabled>
                            <template #append>台</template>
                          </el-input>
                        </el-form-item>
                      </el-col>
                    </el-row>
                    <el-form-item label="分项描述">
                      <el-input v-model="currentCategory.description" type="textarea" :rows="3" />
                    </el-form-item>
                    <el-form-item label="启用状态">
                      <el-switch v-model="currentCategory.enabled" />
                    </el-form-item>
                    <el-form-item>
                      <el-button type="primary" @click="handleSaveCategory">保存配置</el-button>
                      <el-button @click="handleResetCategory">重置</el-button>
                    </el-form-item>
                  </el-form>
                </div>
                <el-empty v-else description="请选择左侧分项类别" />
              </el-card>

              <!-- 关联设备列表 -->
              <el-card v-if="currentCategory" class="related-meters-card" shadow="never">
                <template #header>
                  <div class="card-header">
                    <span class="title">关联计量设备</span>
                    <el-button type="primary" size="small" @click="handleAddRelatedMeter">
                      <el-icon><Plus /></el-icon>
                      关联设备
                    </el-button>
                  </div>
                </template>
                <el-table :data="relatedMeters" border stripe size="small">
                  <el-table-column prop="id" label="设备编号" width="120" />
                  <el-table-column prop="name" label="设备名称" min-width="150" />
                  <el-table-column prop="type" label="设备类型" width="100">
                    <template #default="{ row }">
                      <el-tag size="small">{{ row.typeName }}</el-tag>
                    </template>
                  </el-table-column>
                  <el-table-column prop="coefficient" label="分摊系数" width="100" />
                  <el-table-column label="操作" width="120">
                    <template #default="{ row }">
                      <el-button type="primary" link size="small" @click="handleEditCoefficient(row)">编辑</el-button>
                      <el-button type="danger" link size="small" @click="handleRemoveRelatedMeter(row)">移除</el-button>
                    </template>
                  </el-table-column>
                </el-table>
              </el-card>
            </el-col>
          </el-row>
        </div>
      </el-tab-pane>

      <!-- 报警规则配置 -->
      <el-tab-pane label="报警规则配置" name="alarm">
        <div class="alarm-config-section">
          <div class="section-header">
            <span class="section-title">能耗报警规则</span>
            <el-button type="primary" size="small" @click="handleAddAlarmRule">
              <el-icon><Plus /></el-icon>
              新增规则
            </el-button>
          </div>
          <el-table :data="alarmRules" border stripe style="width: 100%">
            <el-table-column prop="id" label="规则编号" width="100" />
            <el-table-column prop="name" label="规则名称" min-width="150" />
            <el-table-column prop="type" label="监测类型" width="120">
              <template #default="{ row }">
                <el-tag size="small">{{ row.typeName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="condition" label="触发条件" min-width="200" />
            <el-table-column prop="threshold" label="阈值" width="100" />
            <el-table-column prop="level" label="报警级别" width="100">
              <template #default="{ row }">
                <el-tag :type="getAlarmLevelTag(row.level)" size="small">{{ row.levelName }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="notifyMethod" label="通知方式" width="150">
              <template #default="{ row }">
                <el-tag v-for="method in row.notifyMethods" :key="method" size="small" style="margin-right: 4px">{{ method }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="100">
              <template #default="{ row }">
                <el-switch v-model="row.enabled" size="small" @change="handleAlarmRuleStatusChange(row)" />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="150" fixed="right">
              <template #default="{ row }">
                <el-button type="primary" link size="small" @click="handleEditAlarmRule(row)">编辑</el-button>
                <el-button type="danger" link size="small" @click="handleDeleteAlarmRule(row)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-tab-pane>

      <!-- 系统参数配置 -->
      <el-tab-pane label="系统参数配置" name="system">
        <el-form :model="systemConfig" label-width="180px" class="system-config-form">
          <el-card class="config-card" shadow="never">
            <template #header>
              <span class="card-title">数据采集配置</span>
            </template>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="数据采集间隔">
                  <el-select v-model="systemConfig.collectInterval" style="width: 100%">
                    <el-option label="1分钟" :value="1" />
                    <el-option label="5分钟" :value="5" />
                    <el-option label="10分钟" :value="10" />
                    <el-option label="15分钟" :value="15" />
                    <el-option label="30分钟" :value="30" />
                    <el-option label="60分钟" :value="60" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="数据存储周期">
                  <el-select v-model="systemConfig.storePeriod" style="width: 100%">
                    <el-option label="1个月" :value="1" />
                    <el-option label="3个月" :value="3" />
                    <el-option label="6个月" :value="6" />
                    <el-option label="12个月" :value="12" />
                    <el-option label="24个月" :value="24" />
                    <el-option label="永久保存" :value="0" />
                  </el-select>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="通讯超时时间(秒)">
                  <el-input-number v-model="systemConfig.timeout" :min="5" :max="60" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="失败重试次数">
                  <el-input-number v-model="systemConfig.retryCount" :min="1" :max="10" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <el-card class="config-card" shadow="never">
            <template #header>
              <span class="card-title">报表配置</span>
            </template>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="日报生成时间">
                  <el-time-picker v-model="systemConfig.dailyReportTime" format="HH:mm" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="月报生成日期">
                  <el-input-number v-model="systemConfig.monthlyReportDay" :min="1" :max="28" style="width: 100%">
                    <template #append>日</template>
                  </el-input-number>
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="自动发送报表">
                  <el-switch v-model="systemConfig.autoSendReport" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="报表接收邮箱">
                  <el-input v-model="systemConfig.reportEmail" placeholder="多个邮箱用逗号分隔" />
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <el-card class="config-card" shadow="never">
            <template #header>
              <span class="card-title">其他配置</span>
            </template>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="碳排放系数(kg/kWh)">
                  <el-input-number v-model="systemConfig.carbonFactor" :precision="4" :step="0.0001" style="width: 100%" />
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="标准煤系数(kg/kWh)">
                  <el-input-number v-model="systemConfig.coalFactor" :precision="4" :step="0.0001" style="width: 100%" />
                </el-form-item>
              </el-col>
            </el-row>
            <el-row :gutter="20">
              <el-col :span="12">
                <el-form-item label="工作日设置">
                  <el-checkbox-group v-model="systemConfig.workdays">
                    <el-checkbox label="周一" />
                    <el-checkbox label="周二" />
                    <el-checkbox label="周三" />
                    <el-checkbox label="周四" />
                    <el-checkbox label="周五" />
                    <el-checkbox label="周六" />
                    <el-checkbox label="周日" />
                  </el-checkbox-group>
                </el-form-item>
              </el-col>
            </el-row>
          </el-card>

          <div class="form-actions">
            <el-button type="primary" @click="handleSaveSystemConfig">保存配置</el-button>
            <el-button @click="handleResetSystemConfig">重置</el-button>
          </div>
        </el-form>
      </el-tab-pane>
    </el-tabs>

    <!-- 定价编辑弹窗 -->
    <el-dialog v-model="pricingDialogVisible" :title="pricingDialogTitle" width="600px">
      <el-form :model="pricingForm" label-width="120px">
        <el-form-item label="价格名称" required>
          <el-input v-model="pricingForm.name" placeholder="请输入价格名称" />
        </el-form-item>
        <el-form-item label="计价类型" required>
          <el-radio-group v-model="pricingForm.type">
            <el-radio label="peak">峰时</el-radio>
            <el-radio label="flat">平时</el-radio>
            <el-radio label="valley">谷时</el-radio>
            <el-radio label="normal">标准</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="单价" required>
          <el-input-number v-model="pricingForm.price" :precision="4" :step="0.01" :min="0" style="width: 200px" />
          <span class="unit-text">元/{{ pricingForm.energyType === 'electric' ? 'kWh' : 'm³' }}</span>
        </el-form-item>
        <el-form-item label="时段范围" v-if="pricingForm.type !== 'normal'">
          <el-time-picker
            v-model="pricingForm.timeRange"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="HH:mm"
          />
        </el-form-item>
        <el-form-item label="生效日期" required>
          <el-date-picker v-model="pricingForm.effectiveDate" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="pricingForm.remark" type="textarea" :rows="2" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="pricingDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSavePricing">保存</el-button>
      </template>
    </el-dialog>

    <!-- 设备编辑弹窗 -->
    <el-dialog v-model="meterDialogVisible" :title="meterDialogTitle" width="700px">
      <el-form :model="meterForm" label-width="120px">
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备编号" required>
              <el-input v-model="meterForm.id" placeholder="请输入设备编号" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备名称" required>
              <el-input v-model="meterForm.name" placeholder="请输入设备名称" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="设备类型" required>
              <el-select v-model="meterForm.type" style="width: 100%">
                <el-option label="电表" value="electric" />
                <el-option label="水表" value="water" />
                <el-option label="气表" value="gas" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="设备型号">
              <el-input v-model="meterForm.model" placeholder="请输入设备型号" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="所属区域" required>
              <el-select v-model="meterForm.area" style="width: 100%">
                <el-option v-for="item in areaOptions" :key="item.value" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="安装位置">
              <el-input v-model="meterForm.location" placeholder="请输入安装位置" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="变比/倍率">
              <el-input-number v-model="meterForm.ratio" :min="1" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="精度等级">
              <el-select v-model="meterForm.precision" style="width: 100%">
                <el-option label="0.2级" value="0.2" />
                <el-option label="0.5级" value="0.5" />
                <el-option label="1.0级" value="1.0" />
                <el-option label="2.0级" value="2.0" />
              </el-select>
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-form-item label="通讯协议">
              <el-select v-model="meterForm.protocol" style="width: 100%">
                <el-option label="Modbus-RTU" value="modbus-rtu" />
                <el-option label="Modbus-TCP" value="modbus-tcp" />
                <el-option label="DL/T645" value="dlt645" />
                <el-option label="M-Bus" value="mbus" />
              </el-select>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="通讯地址">
              <el-input v-model="meterForm.address" placeholder="请输入通讯地址" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="安装日期">
          <el-date-picker v-model="meterForm.installDate" type="date" placeholder="选择日期" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="meterDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveMeter">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Plus, Edit, Delete } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox } from 'element-plus'

// 当前标签
const activeTab = ref('pricing')

// 区域选项
const areaOptions = [
  { label: '1号实验楼', value: 'lab1' },
  { label: '2号实验楼', value: 'lab2' },
  { label: '温室大棚A区', value: 'greenhouse_a' },
  { label: '温室大棚B区', value: 'greenhouse_b' },
  { label: '办公楼', value: 'office' },
  { label: '仓储中心', value: 'warehouse' }
]

// ===== 能源定价配置 =====
const electricPricing = ref([
  { id: 'EP-001', name: '峰时电价', type: 'peak', typeName: '峰时', price: 1.2568, timeRange: '08:00-11:00, 18:00-21:00', effectiveDate: '2025-01-01', enabled: true },
  { id: 'EP-002', name: '平时电价', type: 'flat', typeName: '平时', price: 0.7856, timeRange: '07:00-08:00, 11:00-18:00, 21:00-23:00', effectiveDate: '2025-01-01', enabled: true },
  { id: 'EP-003', name: '谷时电价', type: 'valley', typeName: '谷时', price: 0.3528, timeRange: '23:00-07:00', effectiveDate: '2025-01-01', enabled: true }
])

const waterPricing = ref([
  { id: 'WP-001', name: '第一阶梯水价', type: 'normal', typeName: '阶梯', price: 4.50, ladder: '0-100 m³/月', effectiveDate: '2025-01-01', enabled: true },
  { id: 'WP-002', name: '第二阶梯水价', type: 'normal', typeName: '阶梯', price: 6.00, ladder: '100-200 m³/月', effectiveDate: '2025-01-01', enabled: true },
  { id: 'WP-003', name: '第三阶梯水价', type: 'normal', typeName: '阶梯', price: 8.00, ladder: '200 m³以上/月', effectiveDate: '2025-01-01', enabled: true }
])

const gasPricing = ref([
  { id: 'GP-001', name: '标准气价', type: 'normal', typeName: '标准', price: 3.28, effectiveDate: '2025-01-01', enabled: true }
])

// ===== 计量设备配置 =====
const meterFilter = ref({
  type: '',
  area: '',
  status: ''
})

const meterData = ref([
  { id: 'ELE-001', name: '1号楼总电表', type: 'electric', typeName: '电表', model: 'DTSD341', area: '1号实验楼', location: '配电室', ratio: 80, precision: '0.5', protocol: 'Modbus-RTU', status: 'online', statusName: '在线', installDate: '2023-05-15' },
  { id: 'ELE-002', name: '2号楼总电表', type: 'electric', typeName: '电表', model: 'DTSD341', area: '2号实验楼', location: '配电室', ratio: 80, precision: '0.5', protocol: 'Modbus-RTU', status: 'online', statusName: '在线', installDate: '2023-05-15' },
  { id: 'WAT-001', name: '园区总水表', type: 'water', typeName: '水表', model: 'WS-200', area: '温室大棚A区', location: '水泵房', ratio: 1, precision: '1.0', protocol: 'M-Bus', status: 'online', statusName: '在线', installDate: '2023-06-20' },
  { id: 'WAT-002', name: '灌溉系统水表', type: 'water', typeName: '水表', model: 'WS-100', area: '温室大棚B区', location: '灌溉设备间', ratio: 1, precision: '1.0', protocol: 'M-Bus', status: 'online', statusName: '在线', installDate: '2023-06-20' },
  { id: 'GAS-001', name: '实验室燃气表', type: 'gas', typeName: '气表', model: 'GM-25', area: '1号实验楼', location: '燃气间', ratio: 1, precision: '1.0', protocol: 'Modbus-RTU', status: 'online', statusName: '在线', installDate: '2023-07-10' },
  { id: 'ELE-003', name: '温室电表A', type: 'electric', typeName: '电表', model: 'DTSD341', area: '温室大棚A区', location: '配电箱', ratio: 40, precision: '0.5', protocol: 'Modbus-RTU', status: 'online', statusName: '在线', installDate: '2023-08-05' },
  { id: 'ELE-004', name: '温室电表B', type: 'electric', typeName: '电表', model: 'DTSD341', area: '温室大棚B区', location: '配电箱', ratio: 40, precision: '0.5', protocol: 'Modbus-RTU', status: 'offline', statusName: '离线', installDate: '2023-08-05' },
  { id: 'WAT-003', name: '办公楼水表', type: 'water', typeName: '水表', model: 'WS-50', area: '办公楼', location: '地下室', ratio: 1, precision: '1.0', protocol: 'M-Bus', status: 'online', statusName: '在线', installDate: '2023-09-12' }
])

const meterPagination = ref({
  currentPage: 1,
  pageSize: 10,
  total: 28
})

// ===== 能耗分项配置 =====
const categoryTree = ref([
  {
    id: 1,
    name: '照明插座',
    code: 'C01',
    energyType: 'electric',
    unit: 'kWh',
    area: 'lab1',
    meterCount: 12,
    description: '照明及插座用电',
    enabled: true,
    children: [
      { id: 11, name: '照明用电', code: 'C0101', energyType: 'electric', unit: 'kWh', area: 'lab1', meterCount: 6, description: '照明系统用电', enabled: true },
      { id: 12, name: '插座用电', code: 'C0102', energyType: 'electric', unit: 'kWh', area: 'lab1', meterCount: 6, description: '插座设备用电', enabled: true }
    ]
  },
  {
    id: 2,
    name: '空调系统',
    code: 'C02',
    energyType: 'electric',
    unit: 'kWh',
    area: 'office',
    meterCount: 8,
    description: '空调制冷制热用电',
    enabled: true,
    children: [
      { id: 21, name: '中央空调', code: 'C0201', energyType: 'electric', unit: 'kWh', area: 'office', meterCount: 4, description: '中央空调系统', enabled: true },
      { id: 22, name: '分体空调', code: 'C0202', energyType: 'electric', unit: 'kWh', area: 'office', meterCount: 4, description: '分体空调设备', enabled: true }
    ]
  },
  {
    id: 3,
    name: '动力设备',
    code: 'C03',
    energyType: 'electric',
    unit: 'kWh',
    area: 'warehouse',
    meterCount: 5,
    description: '动力设备用电',
    enabled: true
  },
  {
    id: 4,
    name: '特殊设备',
    code: 'C04',
    energyType: 'electric',
    unit: 'kWh',
    area: 'lab1',
    meterCount: 10,
    description: '实验室特殊设备用电',
    enabled: true
  },
  {
    id: 5,
    name: '生活用水',
    code: 'C05',
    energyType: 'water',
    unit: 'm³',
    area: 'office',
    meterCount: 6,
    description: '生活用水',
    enabled: true
  },
  {
    id: 6,
    name: '灌溉用水',
    code: 'C06',
    energyType: 'water',
    unit: 'm³',
    area: 'greenhouse_a',
    meterCount: 4,
    description: '温室灌溉用水',
    enabled: true
  }
])

const currentCategory = ref<any>(null)

const relatedMeters = ref([
  { id: 'ELE-001', name: '1号楼总电表', type: 'electric', typeName: '电表', coefficient: 1.0 },
  { id: 'ELE-006', name: '1号楼分电表-1F', type: 'electric', typeName: '电表', coefficient: 0.25 },
  { id: 'ELE-007', name: '1号楼分电表-2F', type: 'electric', typeName: '电表', coefficient: 0.25 }
])

// ===== 报警规则配置 =====
const alarmRules = ref([
  { id: 'AR-001', name: '用电量超标报警', type: 'electric', typeName: '用电量', condition: '日用电量超过设定值', threshold: '5000 kWh', level: 'high', levelName: '高', notifyMethods: ['短信', '邮件'], enabled: true },
  { id: 'AR-002', name: '用电功率过载报警', type: 'power', typeName: '功率', condition: '实时功率超过额定值', threshold: '1000 kW', level: 'critical', levelName: '严重', notifyMethods: ['短信', '邮件', '语音'], enabled: true },
  { id: 'AR-003', name: '用水量异常报警', type: 'water', typeName: '用水量', condition: '日用水量超过设定值', threshold: '500 m³', level: 'medium', levelName: '中', notifyMethods: ['邮件'], enabled: true },
  { id: 'AR-004', name: '设备离线报警', type: 'device', typeName: '设备状态', condition: '计量设备离线超过30分钟', threshold: '30分钟', level: 'high', levelName: '高', notifyMethods: ['短信', '邮件'], enabled: true },
  { id: 'AR-005', name: '夜间异常用能报警', type: 'pattern', typeName: '用能模式', condition: '夜间时段(23:00-06:00)能耗异常升高', threshold: '超均值200%', level: 'medium', levelName: '中', notifyMethods: ['邮件'], enabled: true }
])

// ===== 系统参数配置 =====
const systemConfig = ref({
  collectInterval: 15,
  storePeriod: 12,
  timeout: 30,
  retryCount: 3,
  dailyReportTime: new Date('2025-01-01 08:00'),
  monthlyReportDay: 1,
  autoSendReport: true,
  reportEmail: 'admin@example.com',
  carbonFactor: 0.5839,
  coalFactor: 0.1229,
  workdays: ['周一', '周二', '周三', '周四', '周五']
})

// ===== 弹窗相关 =====
const pricingDialogVisible = ref(false)
const pricingDialogTitle = ref('新增价格')
const pricingForm = ref({
  name: '',
  type: 'normal',
  price: 0,
  timeRange: null,
  effectiveDate: '',
  remark: '',
  energyType: 'electric'
})

const meterDialogVisible = ref(false)
const meterDialogTitle = ref('新增设备')
const meterForm = ref({
  id: '',
  name: '',
  type: '',
  model: '',
  area: '',
  location: '',
  ratio: 1,
  precision: '1.0',
  protocol: '',
  address: '',
  installDate: ''
})

// ===== 工具方法 =====
const getPricingTypeTag = (type: string) => {
  const types: { [key: string]: string } = {
    peak: 'danger',
    flat: '',
    valley: 'success',
    normal: 'info'
  }
  return types[type] || ''
}

const getMeterTypeTag = (type: string) => {
  const types: { [key: string]: string } = {
    electric: '',
    water: 'success',
    gas: 'warning'
  }
  return types[type] || ''
}

const getMeterStatusTag = (status: string) => {
  const types: { [key: string]: string } = {
    online: 'success',
    offline: 'info',
    fault: 'danger'
  }
  return types[status] || ''
}

const getAlarmLevelTag = (level: string) => {
  const types: { [key: string]: string } = {
    critical: 'danger',
    high: 'warning',
    medium: '',
    low: 'info'
  }
  return types[level] || ''
}

// ===== 操作方法 =====
const handleAddPricing = (energyType: string) => {
  pricingDialogTitle.value = '新增价格'
  pricingForm.value = {
    name: '',
    type: 'normal',
    price: 0,
    timeRange: null,
    effectiveDate: '',
    remark: '',
    energyType
  }
  pricingDialogVisible.value = true
}

const handleEditPricing = (row: any) => {
  pricingDialogTitle.value = '编辑价格'
  pricingForm.value = { ...row }
  pricingDialogVisible.value = true
}

const handleDeletePricing = (row: any) => {
  ElMessageBox.confirm(`确认删除价格配置 ${row.name}?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSavePricing = () => {
  pricingDialogVisible.value = false
  ElMessage.success('保存成功')
}

const handlePricingStatusChange = (row: any) => {
  ElMessage.success(`${row.name} 已${row.enabled ? '启用' : '禁用'}`)
}

// 设备相关
const handleMeterSearch = () => {
  ElMessage.success('查询成功')
}

const handleMeterReset = () => {
  meterFilter.value = { type: '', area: '', status: '' }
}

const handleAddMeter = () => {
  meterDialogTitle.value = '新增设备'
  meterForm.value = {
    id: '',
    name: '',
    type: '',
    model: '',
    area: '',
    location: '',
    ratio: 1,
    precision: '1.0',
    protocol: '',
    address: '',
    installDate: ''
  }
  meterDialogVisible.value = true
}

const handleEditMeter = (row: any) => {
  meterDialogTitle.value = '编辑设备'
  meterForm.value = { ...row }
  meterDialogVisible.value = true
}

const handleViewMeterData = (row: any) => {
  ElMessage.info(`查看 ${row.name} 的采集数据`)
}

const handleDeleteMeter = (row: any) => {
  ElMessageBox.confirm(`确认删除设备 ${row.name}?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSaveMeter = () => {
  meterDialogVisible.value = false
  ElMessage.success('保存成功')
}

// 分项相关
const handleCategoryClick = (data: any) => {
  currentCategory.value = { ...data }
}

const handleAddCategory = () => {
  ElMessage.info('新增分项类别')
}

const handleEditCategory = (data: any) => {
  ElMessage.info(`编辑 ${data.name}`)
}

const handleDeleteCategory = (data: any) => {
  ElMessageBox.confirm(`确认删除分项 ${data.name}?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleSaveCategory = () => {
  ElMessage.success('分项配置已保存')
}

const handleResetCategory = () => {
  ElMessage.info('已重置')
}

const handleAddRelatedMeter = () => {
  ElMessage.info('关联计量设备')
}

const handleEditCoefficient = (row: any) => {
  ElMessage.info(`编辑 ${row.name} 的分摊系数`)
}

const handleRemoveRelatedMeter = (row: any) => {
  ElMessageBox.confirm(`确认移除设备 ${row.name}?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('移除成功')
  }).catch(() => {})
}

// 报警规则相关
const handleAddAlarmRule = () => {
  ElMessage.info('新增报警规则')
}

const handleEditAlarmRule = (row: any) => {
  ElMessage.info(`编辑规则 ${row.name}`)
}

const handleDeleteAlarmRule = (row: any) => {
  ElMessageBox.confirm(`确认删除规则 ${row.name}?`, '提示', {
    confirmButtonText: '确认',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const handleAlarmRuleStatusChange = (row: any) => {
  ElMessage.success(`${row.name} 已${row.enabled ? '启用' : '禁用'}`)
}

// 系统配置相关
const handleSaveSystemConfig = () => {
  ElMessage.success('系统配置已保存')
}

const handleResetSystemConfig = () => {
  ElMessage.info('配置已重置')
}
</script>

<style lang="scss" scoped>
.energy-config-container {
  padding: 0;
  
  :deep(.el-tabs--border-card) {
    border-radius: 8px;
    
    .el-tabs__header {
      background: #f5f7fa;
    }
  }
  
  .config-section {
    margin-bottom: 30px;
    
    &:last-child {
      margin-bottom: 0;
    }
    
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid #eee;
      
      .section-title {
        font-size: 15px;
        font-weight: 600;
        color: #303133;
      }
    }
  }
  
  .filter-section {
    margin-bottom: 16px;
    padding-bottom: 16px;
    border-bottom: 1px solid #eee;
  }
  
  .pagination-wrapper {
    display: flex;
    justify-content: flex-end;
    margin-top: 20px;
  }
  
  .category-container {
    .category-card {
      height: 100%;
      
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .title {
          font-size: 15px;
          font-weight: 600;
        }
      }
      
      .tree-node {
        flex: 1;
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-right: 8px;
        
        .tree-actions {
          display: none;
          gap: 8px;
          color: #409EFF;
          cursor: pointer;
          
          .el-icon:hover {
            color: #66b1ff;
          }
        }
        
        &:hover .tree-actions {
          display: flex;
        }
      }
    }
    
    .category-detail-card {
      margin-bottom: 20px;
      
      .card-header {
        .title {
          font-size: 15px;
          font-weight: 600;
        }
      }
      
      .category-form {
        max-width: 800px;
      }
    }
    
    .related-meters-card {
      .card-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        
        .title {
          font-size: 15px;
          font-weight: 600;
        }
      }
    }
  }
  
  .alarm-config-section {
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 16px;
      
      .section-title {
        font-size: 16px;
        font-weight: 600;
      }
    }
  }
  
  .system-config-form {
    max-width: 1000px;
    
    .config-card {
      margin-bottom: 20px;
      
      .card-title {
        font-size: 15px;
        font-weight: 600;
      }
    }
    
    .form-actions {
      padding-top: 20px;
      border-top: 1px solid #eee;
    }
  }
  
  .unit-text {
    margin-left: 8px;
    color: #909399;
  }
}
</style>
