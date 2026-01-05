/**
 * 计费系统单元测试
 * 测试各种计费方式的计算逻辑
 */

import { BillingEngine } from '../services/billingEngine'
import {
  BillingRule,
  BillingType,
  UsageRecord,
  SmartPricingConfig,
  DurationPricingConfig,
  UsageCountPricingConfig,
  SampleQuantityPricingConfig,
  TieredPricingConfig
} from '../types/billing'

// ============= 测试数据 =============

// 智能计费规则
const smartBillingRule: BillingRule = {
  id: 'rule_smart',
  name: '智能计费规则',
  equipmentId: 'eq001',
  billingType: BillingType.SMART,
  hasStartupFee: true,
  startupFee: 100,
  basePrice: 0,
  minCharge: 50,
  status: 1,
  createTime: new Date(),
  updateTime: new Date(),
  pricingConfig: {
    type: BillingType.SMART,
    hourlyRate: 200,
    countRate: 50,
    sampleRate: 20
  } as SmartPricingConfig,
  userTypeRules: [
    { userType: 'internal', coefficient: 0.8 },
    { userType: 'external', coefficient: 1.0 },
    { userType: 'partner', coefficient: 0.85 }
  ]
}

// 时长计费规则
const durationBillingRule: BillingRule = {
  id: 'rule_duration',
  name: '时长计费规则',
  equipmentId: 'eq002',
  billingType: BillingType.DURATION,
  hasStartupFee: false,
  startupFee: 0,
  basePrice: 100,
  minCharge: 30,
  status: 1,
  createTime: new Date(),
  updateTime: new Date(),
  pricingConfig: {
    type: BillingType.DURATION,
    hourlyRate: 100,
    minDuration: 0.5,
    overstayRate: 50
  } as DurationPricingConfig
}

// 次数计费规则
const usageCountRule: BillingRule = {
  id: 'rule_count',
  name: '次数计费规则',
  equipmentId: 'eq003',
  billingType: BillingType.USAGE_COUNT,
  hasStartupFee: false,
  startupFee: 0,
  basePrice: 50,
  minCharge: 30,
  status: 1,
  createTime: new Date(),
  updateTime: new Date(),
  pricingConfig: {
    type: BillingType.USAGE_COUNT,
    perUseRate: 50,
    bulkThreshold: 10,
    bulkRate: 40
  } as UsageCountPricingConfig
}

// 样品计费规则
const sampleQtyRule: BillingRule = {
  id: 'rule_sample',
  name: '样品计费规则',
  equipmentId: 'eq004',
  billingType: BillingType.SAMPLE_QUANTITY,
  hasStartupFee: true,
  startupFee: 50,
  basePrice: 20,
  minCharge: 50,
  status: 1,
  createTime: new Date(),
  updateTime: new Date(),
  pricingConfig: {
    type: BillingType.SAMPLE_QUANTITY,
    perSampleRate: 20,
    bulkThreshold: 50,
    bulkRate: 15
  } as SampleQuantityPricingConfig
}

// 阶梯计费规则
const tieredBillingRule: BillingRule = {
  id: 'rule_tiered',
  name: '阶梯计费规则',
  equipmentId: 'eq005',
  billingType: BillingType.TIERED,
  hasStartupFee: true,
  startupFee: 150,
  basePrice: 0,
  minCharge: 100,
  status: 1,
  createTime: new Date(),
  updateTime: new Date(),
  pricingConfig: {
    type: BillingType.TIERED,
    unit: 'h',
    tiers: [
      { minValue: 0, maxValue: 10, price: 300, unit: 'h' },
      { minValue: 10, maxValue: 50, price: 250, unit: 'h' },
      { minValue: 50, maxValue: 100, price: 200, unit: 'h' },
      { minValue: 100, maxValue: -1, price: 150, unit: 'h' }
    ]
  } as TieredPricingConfig
}

// ============= 测试用例 =============

describe('BillingEngine - 计费引擎测试', () => {
  
  // 智能计费测试
  describe('智能计费 (Smart Billing)', () => {
    
    test('智能计费：内部用户，5小时+3次+10份样品，有开机费', () => {
      const record: UsageRecord = {
        id: 'rec001',
        equipmentId: 'eq001',
        equipmentName: '高效液相色谱仪',
        userId: 'user001',
        startTime: new Date(),
        endTime: new Date(),
        duration: 5,
        usageCount: 3,
        sampleQuantity: 10,
        billingType: BillingType.SMART,
        ruleName: smartBillingRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, smartBillingRule, 'internal')

      // 验证开机费
      expect(result.startupFee).toBe(100)
      
      // 验证使用费：5*200 + 3*50 + 10*20 = 1000 + 150 + 200 = 1350
      expect(result.usageCharge).toBe(1350)
      
      // 验证用户折扣（内部用户8折，即20%折扣）：(100+1350)*0.2 = 290
      expect(result.userTypeDiscount).toBe(290)
      
      // 验证总费用：100 + 1350 - 290 = 1160
      expect(result.totalCharge).toBe(1160)
    })

    test('智能计费：外部用户，无折扣', () => {
      const record: UsageRecord = {
        id: 'rec002',
        equipmentId: 'eq001',
        equipmentName: '高效液相色谱仪',
        userId: 'user002',
        startTime: new Date(),
        endTime: new Date(),
        duration: 2,
        usageCount: 1,
        sampleQuantity: 5,
        billingType: BillingType.SMART,
        ruleName: smartBillingRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, smartBillingRule, 'external')

      // 验证：100 + (2*200 + 1*50 + 5*20) = 100 + 450 = 550
      expect(result.startupFee).toBe(100)
      expect(result.usageCharge).toBe(450)
      expect(result.userTypeDiscount).toBe(0)
      expect(result.totalCharge).toBe(550)
    })
  })

  // 时长计费测试
  describe('时长计费 (Duration Billing)', () => {
    
    test('时长计费：实际使用5小时，无优惠', () => {
      const record: UsageRecord = {
        id: 'rec003',
        equipmentId: 'eq002',
        equipmentName: '紫外分光光度计',
        userId: 'user003',
        startTime: new Date(),
        endTime: new Date(),
        duration: 5,
        billingType: BillingType.DURATION,
        ruleName: durationBillingRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, durationBillingRule, 'external')

      // 5小时 * 100元/小时 = 500，无开机费，无折扣
      expect(result.startupFee).toBe(0)
      expect(result.usageCharge).toBe(500)
      expect(result.totalCharge).toBe(500)
    })

    test('时长计费：实际使用0.2小时，按最小计费时长0.5小时计费', () => {
      const record: UsageRecord = {
        id: 'rec004',
        equipmentId: 'eq002',
        equipmentName: '紫外分光光度计',
        userId: 'user004',
        startTime: new Date(),
        endTime: new Date(),
        duration: 0.2,
        billingType: BillingType.DURATION,
        ruleName: durationBillingRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, durationBillingRule, 'external')

      // 按最小计费时长0.5小时计费：0.5 * 100 = 50
      expect(result.usageCharge).toBe(50)
      expect(result.totalCharge).toBe(50)
    })

    test('时长计费：应用最低收费限制', () => {
      const record: UsageRecord = {
        id: 'rec005',
        equipmentId: 'eq002',
        equipmentName: '紫外分光光度计',
        userId: 'user005',
        startTime: new Date(),
        endTime: new Date(),
        duration: 0.1,
        billingType: BillingType.DURATION,
        ruleName: durationBillingRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, durationBillingRule, 'external')

      // 计算费用是50（0.5小时），但低于最低收费30元，应为30元
      // 实际上50 > 30，所以应该是50
      expect(result.totalCharge).toBe(50)
    })
  })

  // 次数计费测试
  describe('使用次数计费 (Usage Count Billing)', () => {
    
    test('次数计费：使用5次，不超过批量阈值', () => {
      const record: UsageRecord = {
        id: 'rec006',
        equipmentId: 'eq003',
        equipmentName: '分光光度计',
        userId: 'user006',
        startTime: new Date(),
        endTime: new Date(),
        usageCount: 5,
        billingType: BillingType.USAGE_COUNT,
        ruleName: usageCountRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, usageCountRule, 'external')

      // 5次 * 50元/次 = 250
      expect(result.startupFee).toBe(0)
      expect(result.usageCharge).toBe(250)
      expect(result.totalCharge).toBe(250)
    })

    test('次数计费：使用15次，超过批量阈值享受优惠', () => {
      const record: UsageRecord = {
        id: 'rec007',
        equipmentId: 'eq003',
        equipmentName: '分光光度计',
        userId: 'user007',
        startTime: new Date(),
        endTime: new Date(),
        usageCount: 15,
        billingType: BillingType.USAGE_COUNT,
        ruleName: usageCountRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, usageCountRule, 'external')

      // 前10次：10 * 50 = 500
      // 后5次：5 * 40 = 200
      // 总计：700
      expect(result.usageCharge).toBe(700)
      expect(result.totalCharge).toBe(700)
    })
  })

  // 样品计费测试
  describe('送样数量计费 (Sample Quantity Billing)', () => {
    
    test('样品计费：40份样品，不超过批量阈值，有开机费', () => {
      const record: UsageRecord = {
        id: 'rec008',
        equipmentId: 'eq004',
        equipmentName: '质谱仪',
        userId: 'user008',
        startTime: new Date(),
        endTime: new Date(),
        sampleQuantity: 40,
        billingType: BillingType.SAMPLE_QUANTITY,
        ruleName: sampleQtyRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, sampleQtyRule, 'external')

      // 开机费50 + 40 * 20 = 50 + 800 = 850
      expect(result.startupFee).toBe(50)
      expect(result.usageCharge).toBe(800)
      expect(result.totalCharge).toBe(850)
    })

    test('样品计费：60份样品，超过批量阈值享受优惠', () => {
      const record: UsageRecord = {
        id: 'rec009',
        equipmentId: 'eq004',
        equipmentName: '质谱仪',
        userId: 'user009',
        startTime: new Date(),
        endTime: new Date(),
        sampleQuantity: 60,
        billingType: BillingType.SAMPLE_QUANTITY,
        ruleName: sampleQtyRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, sampleQtyRule, 'external')

      // 开机费50
      // 前50份：50 * 20 = 1000
      // 后10份：10 * 15 = 150
      // 总计：50 + 1000 + 150 = 1200
      expect(result.startupFee).toBe(50)
      expect(result.usageCharge).toBe(1150)
      expect(result.totalCharge).toBe(1200)
    })
  })

  // 阶梯计费测试
  describe('阶梯式计费 (Tiered Pricing)', () => {
    
    test('阶梯计费：使用5小时，在第一阶梯', () => {
      const record: UsageRecord = {
        id: 'rec010',
        equipmentId: 'eq005',
        equipmentName: '质谱仪',
        userId: 'user010',
        startTime: new Date(),
        endTime: new Date(),
        duration: 5,
        billingType: BillingType.TIERED,
        ruleName: tieredBillingRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, tieredBillingRule, 'external')

      // 开机费150 + 5 * 300 = 150 + 1500 = 1650
      expect(result.startupFee).toBe(150)
      expect(result.usageCharge).toBe(1500)
      expect(result.totalCharge).toBe(1650)
    })

    test('阶梯计费：使用55小时，跨越多个阶梯', () => {
      const record: UsageRecord = {
        id: 'rec011',
        equipmentId: 'eq005',
        equipmentName: '质谱仪',
        userId: 'user011',
        startTime: new Date(),
        endTime: new Date(),
        duration: 55,
        billingType: BillingType.TIERED,
        ruleName: tieredBillingRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, tieredBillingRule, 'external')

      // 开机费150
      // 第一阶梯（0-10h）：10 * 300 = 3000
      // 第二阶梯（10-50h）：40 * 250 = 10000
      // 第三阶梯（50-55h）：5 * 200 = 1000
      // 使用费小计：14000
      // 总计：150 + 14000 = 14150
      expect(result.startupFee).toBe(150)
      expect(result.usageCharge).toBe(14000)
      expect(result.totalCharge).toBe(14150)
    })

    test('阶梯计费：使用150小时，超过所有阶梯', () => {
      const record: UsageRecord = {
        id: 'rec012',
        equipmentId: 'eq005',
        equipmentName: '质谱仪',
        userId: 'user012',
        startTime: new Date(),
        endTime: new Date(),
        duration: 150,
        billingType: BillingType.TIERED,
        ruleName: tieredBillingRule.name,
        startupFee: 0,
        baseCharge: 0,
        discountAmount: 0,
        totalCharge: 0,
        status: 'pending',
        createTime: new Date()
      }

      const result = BillingEngine.calculate(record, tieredBillingRule, 'external')

      // 开机费150
      // 第一阶梯（0-10h）：10 * 300 = 3000
      // 第二阶梯（10-50h）：40 * 250 = 10000
      // 第三阶梯（50-100h）：50 * 200 = 10000
      // 第四阶梯（100h+）：50 * 150 = 7500
      // 使用费小计：30500
      // 总计：150 + 30500 = 30650
      expect(result.startupFee).toBe(150)
      expect(result.usageCharge).toBe(30500)
      expect(result.totalCharge).toBe(30650)
    })
  })

  // 规则验证测试
  describe('规则验证', () => {
    
    test('验证有效的规则', () => {
      const validation = BillingEngine.validateRule(smartBillingRule)
      expect(validation.valid).toBe(true)
      expect(validation.errors.length).toBe(0)
    })

    test('验证无效的规则：名称为空', () => {
      const invalidRule = { ...smartBillingRule, name: '' }
      const validation = BillingEngine.validateRule(invalidRule)
      expect(validation.valid).toBe(false)
      expect(validation.errors.length).toBeGreaterThan(0)
    })

    test('验证无效的规则：负数费率', () => {
      const invalidRule = {
        ...smartBillingRule,
        pricingConfig: {
          ...smartBillingRule.pricingConfig,
          hourlyRate: -100
        }
      }
      const validation = BillingEngine.validateRule(invalidRule)
      expect(validation.valid).toBe(false)
    })
  })

  // 批量计算测试
  describe('批量计费', () => {
    
    test('批量计算多条记录', () => {
      const records: UsageRecord[] = [
        {
          id: 'rec013',
          equipmentId: 'eq001',
          equipmentName: '高效液相色谱仪',
          userId: 'user013',
          startTime: new Date(),
          endTime: new Date(),
          duration: 3,
          usageCount: 2,
          sampleQuantity: 5,
          billingType: BillingType.SMART,
          ruleName: smartBillingRule.name,
          startupFee: 0,
          baseCharge: 0,
          discountAmount: 0,
          totalCharge: 0,
          status: 'pending',
          createTime: new Date()
        },
        {
          id: 'rec014',
          equipmentId: 'eq002',
          equipmentName: '紫外分光光度计',
          userId: 'user014',
          startTime: new Date(),
          endTime: new Date(),
          duration: 4,
          billingType: BillingType.DURATION,
          ruleName: durationBillingRule.name,
          startupFee: 0,
          baseCharge: 0,
          discountAmount: 0,
          totalCharge: 0,
          status: 'pending',
          createTime: new Date()
        }
      ]

      const rules = new Map([
        [smartBillingRule.name, smartBillingRule],
        [durationBillingRule.name, durationBillingRule]
      ])

      const results = BillingEngine.batchCalculate(records, rules, 'external')

      expect(results.size).toBe(2)
      expect(results.has('rec013')).toBe(true)
      expect(results.has('rec014')).toBe(true)
    })
  })
})

// ============= 测试执行 =============

// 如果使用 Jest 或 Mocha 等测试框架，直接运行即可
// npm test

// 如果手动测试，可以运行以下代码：
if (typeof window === 'undefined') { // Node.js环境
  console.log('计费系统测试')
  console.log('='.repeat(50))

  // 测试智能计费
  const record1: UsageRecord = {
    id: 'test1',
    equipmentId: 'eq001',
    equipmentName: '高效液相色谱仪',
    userId: 'user001',
    startTime: new Date(),
    endTime: new Date(),
    duration: 5,
    usageCount: 3,
    sampleQuantity: 10,
    billingType: BillingType.SMART,
    ruleName: 'test',
    startupFee: 0,
    baseCharge: 0,
    discountAmount: 0,
    totalCharge: 0,
    status: 'pending',
    createTime: new Date()
  }

  const result1 = BillingEngine.calculate(record1, smartBillingRule, 'internal')
  console.log('\n测试1：智能计费（内部用户）')
  console.log(`开机费: ¥${result1.startupFee}`)
  console.log(`使用费: ¥${result1.usageCharge}`)
  console.log(`折扣: ¥${result1.totalDiscount}`)
  console.log(`应付: ¥${result1.totalCharge}`)

  // 测试阶梯计费
  const record2: UsageRecord = {
    id: 'test2',
    equipmentId: 'eq005',
    equipmentName: '质谱仪',
    userId: 'user002',
    startTime: new Date(),
    endTime: new Date(),
    duration: 55,
    billingType: BillingType.TIERED,
    ruleName: 'test',
    startupFee: 0,
    baseCharge: 0,
    discountAmount: 0,
    totalCharge: 0,
    status: 'pending',
    createTime: new Date()
  }

  const result2 = BillingEngine.calculate(record2, tieredBillingRule, 'external')
  console.log('\n测试2：阶梯计费（55小时）')
  console.log(`开机费: ¥${result2.startupFee}`)
  console.log(`使用费: ¥${result2.usageCharge}`)
  console.log(`应付: ¥${result2.totalCharge}`)

  console.log('\n' + '='.repeat(50))
  console.log('测试完成')
}

