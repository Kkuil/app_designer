/**
 * 计费系统核心类型定义
 * 支持多种计费方式：智能计费、时长计费、次数计费、送样数量计费、阶梯式计费
 */

// ============= 枚举定义 =============

/**
 * 计费类型枚举
 */
export enum BillingType {
  /** 智能计费：综合考虑时长、次数、样品等因素 */
  SMART = 'smart',
  /** 时长计费：按预约或实际使用时长计费 */
  DURATION = 'duration',
  /** 使用次数计费：按仪器使用次数计费 */
  USAGE_COUNT = 'usage_count',
  /** 送样数量计费：按送入样品数量计费 */
  SAMPLE_QUANTITY = 'sample_qty',
  /** 阶梯式计费：根据使用量分阶梯计费 */
  TIERED = 'tiered'
}

/**
 * 用户类型枚举
 */
export enum UserType {
  INTERNAL = 'internal',        // 内部用户
  EXTERNAL = 'external',        // 外部用户
  PARTNER = 'partner',          // 合作单位
  STUDENT = 'student'           // 学生用户
}

/**
 * 账单状态枚举
 */
export enum BillStatus {
  PENDING = 'pending',          // 待确认
  CONFIRMED = 'confirmed',      // 已确认
  SETTLED = 'settled',          // 已结算
  DISPUTED = 'disputed'         // 有争议
}

// ============= 计费规则相关类型 =============

/**
 * 用户类型规则：不同用户享受不同的定价
 */
export interface UserTypeRule {
  userType: UserType | string;
  coefficient?: number;         // 价格系数（0-1），如0.8表示8折
  discountPercent?: number;     // 固定折扣百分比（0-100）
  minCharge?: number;           // 该用户类型的最低收费
  remark?: string;
}

/**
 * 优惠规则
 */
export interface DiscountRule {
  id?: string;
  type: 'bulk' | 'loyalty' | 'seasonal' | 'custom';  // 优惠类型
  name: string;
  condition: number;            // 触发条件值（如累计50小时）
  conditionUnit: string;        // 条件单位（h/次/份）
  discountPercent: number;      // 优惠幅度（0-100%）
  maxDiscount?: number;         // 最高优惠额度
  active: boolean;              // 是否启用
  effectiveStartDate?: Date;
  effectiveEndDate?: Date;
}

/**
 * 价格阶梯
 */
export interface TierPrice {
  minValue: number;             // 下限值
  maxValue: number;             // 上限值（-1表示无上限）
  price: number;                // 该阶梯的价格
  unit: 'h' | 'count' | 'qty';  // 单位
}

/**
 * 计费配置基类
 */
export interface BasePricingConfig {
  type: BillingType;
}

/**
 * 智能计费配置
 */
export interface SmartPricingConfig extends BasePricingConfig {
  type: BillingType.SMART;
  hourlyRate: number;           // 小时费率（元/小时）
  countRate: number;            // 次数费率（元/次）
  sampleRate: number;           // 样品费率（元/份）
  weights?: {
    hourWeight?: number;        // 时长权重（0-1）
    countWeight?: number;       // 次数权重（0-1）
    sampleWeight?: number;      // 样品权重（0-1）
  };
}

/**
 * 时长计费配置
 */
export interface DurationPricingConfig extends BasePricingConfig {
  type: BillingType.DURATION;
  hourlyRate: number;           // 小时费率（元/小时）
  minDuration: number;          // 最小计费时长（小时）
  overstayRate?: number;        // 超时加收比例（百分比）
}

/**
 * 使用次数计费配置
 */
export interface UsageCountPricingConfig extends BasePricingConfig {
  type: BillingType.USAGE_COUNT;
  perUseRate: number;           // 每次费用（元/次）
  bulkRate?: number;            // 批量使用费率（当次数超过某个阈值时）
  bulkThreshold?: number;       // 批量计费的次数阈值
}

/**
 * 送样数量计费配置
 */
export interface SampleQuantityPricingConfig extends BasePricingConfig {
  type: BillingType.SAMPLE_QUANTITY;
  perSampleRate: number;        // 每份样品费用（元/份）
  bulkRate?: number;            // 批量样品费率
  bulkThreshold?: number;       // 批量计费的样品数阈值
  sampleType?: string[];        // 支持的样品类型
}

/**
 * 阶梯式计费配置
 */
export interface TieredPricingConfig extends BasePricingConfig {
  type: BillingType.TIERED;
  tiers: TierPrice[];           // 价格阶梯数组（应该按minValue排序）
  unit: 'h' | 'count' | 'qty';  // 阶梯的单位
}

/**
 * 联合类型：所有计费配置
 */
export type PricingConfig = 
  | SmartPricingConfig 
  | DurationPricingConfig 
  | UsageCountPricingConfig 
  | SampleQuantityPricingConfig 
  | TieredPricingConfig;

/**
 * 计费规则主体
 */
export interface BillingRule {
  id: string;
  name: string;                 // 规则名称
  description?: string;
  equipmentId: string;          // 关联的设备ID
  billingType: BillingType;     // 计费方式
  
  // 基础费用配置
  basePrice: number;            // 基础单价（用于旧系统兼容，新系统用pricingConfig）
  minCharge: number;            // 最低收费（元）
  startupFee: number;           // 开机费（元）
  hasStartupFee: boolean;       // 是否收取开机费
  
  // 计费方式特定配置
  pricingConfig: PricingConfig;
  
  // 用户类型差异化定价
  userTypeRules?: UserTypeRule[];
  
  // 优惠规则
  discounts?: DiscountRule[];
  
  // 其他配置
  status: 1 | 0;                // 1:启用，0:禁用
  remark?: string;
  createTime: Date;
  updateTime: Date;
}

// ============= 使用记录相关类型 =============

/**
 * 使用记录
 */
export interface UsageRecord {
  id: string;
  equipmentId: string;
  equipmentName: string;
  userId: string;
  
  // 使用时间
  startTime: Date;
  endTime: Date;
  duration?: number;            // 实际使用时长（小时）
  reservedDuration?: number;    // 预约时长（小时）
  
  // 使用量统计
  usageCount?: number;          // 使用次数
  sampleQuantity?: number;      // 送样数量
  
  // 计费相关
  billingType: BillingType;
  ruleName: string;
  
  // 费用信息（使用后才有）
  startupFee: number;           // 开机费
  baseCharge: number;           // 基础费用
  discountAmount: number;       // 优惠金额
  totalCharge: number;          // 总费用
  
  // 状态
  status: 'pending' | 'billed' | 'settled';
  
  // 备注
  remark?: string;
  createTime: Date;
  billNo?: string;              // 所属账单号
}

// ============= 账单相关类型 =============

/**
 * 账单项（账单的明细行）
 */
export interface BillItem {
  usageRecordId: string;
  equipmentName: string;
  billingType: BillingType;
  quantity: number;             // 数量（时长/次数/份数，根据计费类型）
  quantityUnit: string;         // 数量单位（h/次/份）
  unitPrice: number;            // 单价
  startupFee: number;           // 开机费
  subtotal: number;             // 小计（不包含开机费）
  discount: number;             // 优惠金额
  itemTotal: number;            // 小计（包含开机费和优惠）
}

/**
 * 账单
 */
export interface Bill {
  id: string;
  billNo: string;               // 账单号
  userId: string;
  userName: string;
  department: string;
  
  // 时间
  period: string;               // 账期（如"2024-12"）
  billDate: Date;               // 账单生成日期
  startDate: Date;              // 统计起始日期
  endDate: Date;                // 统计截止日期
  
  // 账单明细
  items: BillItem[];            // 账单项数组
  
  // 费用汇总
  totalStartupFee: number;      // 开机费总额
  totalUsageCharge: number;     // 使用费总额
  totalDiscount: number;        // 优惠总额
  totalAmount: number;          // 合计金额（最终应付）
  
  // 状态和操作
  status: BillStatus;
  createTime: Date;
  confirmTime?: Date;
  settleTime?: Date;
  
  // 其他
  remark?: string;
}

// ============= 计费计算相关类型 =============

/**
 * 计费计算结果
 */
export interface BillingResult {
  startupFee: number;           // 开机费
  usageCharge: number;          // 使用费
  userTypeDiscount: number;     // 用户类型折扣
  otherDiscount: number;        // 其他优惠
  totalDiscount: number;        // 总优惠
  totalCharge: number;          // 最终应付
  details?: {
    description: string;        // 计费说明
    formula?: string;           // 计费公式说明
  };
}

/**
 * 计费预览请求
 */
export interface BillingPreviewRequest {
  equipmentId: string;
  billingRuleId: string;
  userType: UserType | string;
  
  // 根据计费类型提供相应的数据
  duration?: number;            // 使用时长（小时）
  usageCount?: number;          // 使用次数
  sampleQuantity?: number;      // 送样数量
  
  // 可选的优惠条件
  hasDiscount?: boolean;
  discountPercent?: number;
}

/**
 * 计费预览响应
 */
export interface BillingPreviewResponse {
  success: boolean;
  result?: BillingResult;
  errorMessage?: string;
}

// ============= 设备配置相关类型 =============

/**
 * 设备计费配置
 */
export interface EquipmentBillingConfig {
  equipmentId: string;
  equipmentName: string;
  billingRuleId: string;        // 当前应用的计费规则ID
  billingRuleName: string;
  
  // 开机费配置
  startupFee: number;           // 开机费（元）
  hasStartupFee: boolean;       // 是否收取开机费
  
  // 最低收费
  minCharge: number;            // 最低收费（元）
  maxDailyCharge?: number;      // 每日最高收费（元）
  maxMonthlyCharge?: number;    // 每月最高收费（元）
  
  // 应用对象
  applicableUserTypes?: UserType[];  // 适用的用户类型
  
  // 其他
  status: 1 | 0;
  updateTime: Date;
}

// ============= 统计和报表相关类型 =============

/**
 * 计费统计信息
 */
export interface BillingStats {
  period: string;               // 统计周期
  totalRecords: number;         // 总使用次数
  totalAmount: number;          // 总费用
  totalStartupFee: number;      // 总开机费
  totalDiscount: number;        // 总优惠
  recordsByType: {              // 按计费类型统计
    [key in BillingType]?: {
      count: number;
      amount: number;
    };
  };
  recordsByUser: {              // 按用户类型统计
    [key in UserType]?: {
      count: number;
      amount: number;
    };
  };
}

/**
 * 用户计费账户信息
 */
export interface UserBillingAccount {
  userId: string;
  userName: string;
  userType: UserType;
  department: string;
  
  // 费用统计
  currentMonthCharge: number;   // 本月费用
  pendingAmount: number;        // 待结算金额
  totalAmountYTD: number;       // 年度累计费用
  
  // 账户状态
  status: 'normal' | 'suspended' | 'overdue';
  lastSettleDate?: Date;
  
  // 信用信息
  creditScore?: number;         // 信用评分（用于优惠计算）
}

