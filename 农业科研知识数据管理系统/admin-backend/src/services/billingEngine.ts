/**
 * 计费计算引擎
 * 支持多种计费方式的费用计算和优惠应用
 */

import {
  BillingType,
  BillingRule,
  UsageRecord,
  BillingResult,
  PricingConfig,
  SmartPricingConfig,
  DurationPricingConfig,
  UsageCountPricingConfig,
  SampleQuantityPricingConfig,
  TieredPricingConfig,
  UserTypeRule,
  DiscountRule
} from '../types/billing'

/**
 * 计费计算引擎类
 * 主要职责：
 * 1. 根据计费规则计算费用
 * 2. 应用开机费
 * 3. 应用用户类型折扣
 * 4. 应用其他优惠
 * 5. 应用最低收费限制
 */
export class BillingEngine {
  /**
   * 主计费函数：计算总费用
   * @param record 使用记录
   * @param rule 计费规则
   * @param userType 用户类型
   * @returns 计费结果
   */
  static calculate(
    record: UsageRecord,
    rule: BillingRule,
    userType: string = 'external'
  ): BillingResult {
    // 1. 计算开机费
    const startupFee = this.calculateStartupFee(rule);

    // 2. 计算使用费（根据计费类型）
    const usageCharge = this.calculateUsageCharge(record, rule);

    // 3. 计算用户类型折扣
    const userTypeDiscount = this.applyUserTypeDiscount(
      startupFee + usageCharge,
      rule,
      userType
    );

    // 4. 计算其他优惠
    const otherDiscount = this.applyOtherDiscounts(record, rule, userType);

    // 5. 计算总优惠
    const totalDiscount = userTypeDiscount + otherDiscount;

    // 6. 计算最终费用
    let totalCharge = startupFee + usageCharge - totalDiscount;

    // 7. 应用最低收费
    if (totalCharge < rule.minCharge) {
      totalCharge = rule.minCharge;
    }

    return {
      startupFee,
      usageCharge,
      userTypeDiscount,
      otherDiscount,
      totalDiscount,
      totalCharge,
      details: {
        description: this.generateDescription(record, rule, {
          startupFee,
          usageCharge,
          userTypeDiscount,
          otherDiscount,
          totalCharge
        })
      }
    };
  }

  /**
   * 计算开机费
   */
  private static calculateStartupFee(rule: BillingRule): number {
    return rule.hasStartupFee ? rule.startupFee : 0;
  }

  /**
   * 根据计费类型计算使用费
   */
  private static calculateUsageCharge(
    record: UsageRecord,
    rule: BillingRule
  ): number {
    const config = rule.pricingConfig;

    switch (rule.billingType) {
      case BillingType.SMART:
        return this.calculateSmartBilling(record, config as SmartPricingConfig);

      case BillingType.DURATION:
        return this.calculateDurationBilling(record, config as DurationPricingConfig);

      case BillingType.USAGE_COUNT:
        return this.calculateCountBilling(record, config as UsageCountPricingConfig);

      case BillingType.SAMPLE_QUANTITY:
        return this.calculateSampleBilling(record, config as SampleQuantityPricingConfig);

      case BillingType.TIERED:
        return this.calculateTieredBilling(record, config as TieredPricingConfig);

      default:
        return 0;
    }
  }

  /**
   * 智能计费：综合考虑时长、次数、样品等因素
   * 费用 = 时长费 + 次数费 + 样品费
   */
  private static calculateSmartBilling(
    record: UsageRecord,
    config: SmartPricingConfig
  ): number {
    let charge = 0;

    // 时长费用
    if (record.duration && record.duration > 0) {
      charge += record.duration * config.hourlyRate;
    }

    // 次数费用
    if (record.usageCount && record.usageCount > 0) {
      charge += record.usageCount * config.countRate;
    }

    // 样品费用
    if (record.sampleQuantity && record.sampleQuantity > 0) {
      charge += record.sampleQuantity * config.sampleRate;
    }

    return charge;
  }

  /**
   * 时长计费：按预约或实际使用时长计费
   * 费用 = 实际时长 × 单价/小时（不低于最小计费时长）
   */
  private static calculateDurationBilling(
    record: UsageRecord,
    config: DurationPricingConfig
  ): number {
    // 使用实际时长或预约时长，取较大值
    const actualDuration = record.duration || record.reservedDuration || 0;
    
    // 不低于最小计费时长
    const chargeableDuration = Math.max(actualDuration, config.minDuration);

    let charge = chargeableDuration * config.hourlyRate;

    // 如果有超时加收，计算超时费用
    if (config.overstayRate && actualDuration > (record.reservedDuration || 0)) {
      const overstayTime = actualDuration - (record.reservedDuration || 0);
      const overstayCharge = overstayTime * config.hourlyRate * (config.overstayRate / 100);
      charge += overstayCharge;
    }

    return charge;
  }

  /**
   * 使用次数计费：按仪器使用次数计费
   * 费用 = 使用次数 × 单次费用
   */
  private static calculateCountBilling(
    record: UsageRecord,
    config: UsageCountPricingConfig
  ): number {
    const count = record.usageCount || 0;

    // 如果有批量费率，在次数超过阈值时应用
    if (
      config.bulkRate &&
      config.bulkThreshold &&
      count > config.bulkThreshold
    ) {
      const normalCharge = config.bulkThreshold * config.perUseRate;
      const bulkCharge = (count - config.bulkThreshold) * config.bulkRate;
      return normalCharge + bulkCharge;
    }

    return count * config.perUseRate;
  }

  /**
   * 送样数量计费：按样品数量计费
   * 费用 = 样品数量 × 单位样品费用
   */
  private static calculateSampleBilling(
    record: UsageRecord,
    config: SampleQuantityPricingConfig
  ): number {
    const quantity = record.sampleQuantity || 0;

    // 如果有批量费率，在数量超过阈值时应用
    if (
      config.bulkRate &&
      config.bulkThreshold &&
      quantity > config.bulkThreshold
    ) {
      const normalCharge = config.bulkThreshold * config.perSampleRate;
      const bulkCharge = (quantity - config.bulkThreshold) * config.bulkRate;
      return normalCharge + bulkCharge;
    }

    return quantity * config.perSampleRate;
  }

  /**
   * 阶梯式计费：根据使用量分阶梯计费
   * 各阶梯按照各自的价格分段计算
   * 例如：0-10h@200元/h，10-50h@180元/h，50+h@150元/h
   */
  private static calculateTieredBilling(
    record: UsageRecord,
    config: TieredPricingConfig
  ): number {
    // 根据配置的单位获取数量
    let quantity = 0;
    switch (config.unit) {
      case 'h':
        quantity = record.duration || record.reservedDuration || 0;
        break;
      case 'count':
        quantity = record.usageCount || 0;
        break;
      case 'qty':
        quantity = record.sampleQuantity || 0;
        break;
    }

    if (quantity <= 0) return 0;

    let totalCharge = 0;
    let remaining = quantity;

    // 确保tiers按minValue排序
    const sortedTiers = [...config.tiers].sort(
      (a, b) => a.minValue - b.minValue
    );

    // 分段计算费用
    for (const tier of sortedTiers) {
      if (remaining <= 0) break;

      // 计算该阶梯的可计费数量
      let tiernSize: number;
      if (tier.maxValue === -1) {
        // 最后一级，无上限
        tiernSize = remaining;
      } else {
        tiernSize = tier.maxValue - tier.minValue;
      }

      const chargeableInTier = Math.min(remaining, tiernSize);
      totalCharge += chargeableInTier * tier.price;
      remaining -= chargeableInTier;
    }

    return totalCharge;
  }

  /**
   * 应用用户类型折扣
   */
  private static applyUserTypeDiscount(
    amount: number,
    rule: BillingRule,
    userType: string
  ): number {
    if (!rule.userTypeRules || rule.userTypeRules.length === 0) {
      return 0;
    }

    // 查找匹配的用户类型规则
    const userRule = rule.userTypeRules.find(
      (r) => r.userType === userType
    );

    if (!userRule) return 0;

    // 计算折扣
    if (userRule.coefficient !== undefined) {
      // 按系数折扣（如0.8表示8折，折扣20%）
      return amount * (1 - userRule.coefficient);
    } else if (userRule.discountPercent !== undefined) {
      // 按固定百分比折扣
      return amount * (userRule.discountPercent / 100);
    }

    return 0;
  }

  /**
   * 应用其他优惠（如批量优惠、促销优惠等）
   */
  private static applyOtherDiscounts(
    record: UsageRecord,
    rule: BillingRule,
    userType: string
  ): number {
    if (!rule.discounts || rule.discounts.length === 0) {
      return 0;
    }

    let totalDiscount = 0;

    for (const discount of rule.discounts) {
      // 检查优惠是否激活
      if (!discount.active) continue;

      // 检查优惠有效期
      const now = new Date();
      if (
        discount.effectiveStartDate &&
        now < discount.effectiveStartDate
      ) {
        continue;
      }
      if (
        discount.effectiveEndDate &&
        now > discount.effectiveEndDate
      ) {
        continue;
      }

      // 根据优惠类型应用优惠
      const discountAmount = this.calculateDiscount(record, discount);
      totalDiscount += discountAmount;

      // 检查最高优惠限制
      if (discount.maxDiscount && totalDiscount > discount.maxDiscount) {
        totalDiscount = discount.maxDiscount;
        break;
      }
    }

    return totalDiscount;
  }

  /**
   * 计算单个优惠的金额
   */
  private static calculateDiscount(
    record: UsageRecord,
    discount: DiscountRule
  ): number {
    let quantity = 0;

    // 获取优惠的计数单位
    switch (discount.conditionUnit) {
      case 'h':
        quantity = record.duration || record.reservedDuration || 0;
        break;
      case 'count':
        quantity = record.usageCount || 0;
        break;
      case 'qty':
        quantity = record.sampleQuantity || 0;
        break;
    }

    // 检查是否符合优惠条件
    if (quantity < discount.condition) {
      return 0;
    }

    // 简单计算：以当前费用的百分比作为优惠（实际可能需要更复杂的逻辑）
    // 这里假设优惠基数为使用单价 × 数量
    const baseAmount = quantity * 100; // 简化计算
    return baseAmount * (discount.discountPercent / 100);
  }

  /**
   * 生成计费说明文本
   */
  private static generateDescription(
    record: UsageRecord,
    rule: BillingRule,
    result: Omit<BillingResult, 'details'>
  ): string {
    const lines: string[] = [];

    lines.push(`设备: ${record.equipmentName}`);
    lines.push(`计费方式: ${this.getBillingTypeLabel(rule.billingType)}`);

    // 各费用项详情
    if (result.startupFee > 0) {
      lines.push(`开机费: ¥${result.startupFee.toFixed(2)}`);
    }

    if (result.usageCharge > 0) {
      lines.push(`使用费: ¥${result.usageCharge.toFixed(2)}`);
      
      // 根据计费类型补充说明
      switch (rule.billingType) {
        case BillingType.DURATION:
          lines.push(`  (时长: ${record.duration || record.reservedDuration} 小时)`);
          break;
        case BillingType.USAGE_COUNT:
          lines.push(`  (使用次数: ${record.usageCount} 次)`);
          break;
        case BillingType.SAMPLE_QUANTITY:
          lines.push(`  (样品数量: ${record.sampleQuantity} 份)`);
          break;
        case BillingType.SMART:
          const parts = [];
          if (record.duration) parts.push(`${record.duration}h`);
          if (record.usageCount) parts.push(`${record.usageCount}次`);
          if (record.sampleQuantity) parts.push(`${record.sampleQuantity}份`);
          lines.push(`  (${parts.join('+')})`);
          break;
      }
    }

    if (result.totalDiscount > 0) {
      lines.push(`优惠: -¥${result.totalDiscount.toFixed(2)}`);
    }

    lines.push(`---`);
    lines.push(`合计: ¥${result.totalCharge.toFixed(2)}`);

    return lines.join('\n');
  }

  /**
   * 获取计费类型的显示标签
   */
  private static getBillingTypeLabel(type: BillingType): string {
    const labels: Record<BillingType, string> = {
      [BillingType.SMART]: '智能计费',
      [BillingType.DURATION]: '时长计费',
      [BillingType.USAGE_COUNT]: '次数计费',
      [BillingType.SAMPLE_QUANTITY]: '送样数量计费',
      [BillingType.TIERED]: '阶梯式计费'
    };
    return labels[type] || type;
  }

  /**
   * 批量计算（计算多条使用记录的费用）
   */
  static batchCalculate(
    records: UsageRecord[],
    rules: Map<string, BillingRule>,
    userType: string = 'external'
  ): Map<string, BillingResult> {
    const results = new Map<string, BillingResult>();

    for (const record of records) {
      const rule = rules.get(record.ruleName);
      if (rule) {
        const result = this.calculate(record, rule, userType);
        results.set(record.id, result);
      }
    }

    return results;
  }

  /**
   * 验证计费规则的有效性
   */
  static validateRule(rule: BillingRule): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // 基础检查
    if (!rule.name || rule.name.trim() === '') {
      errors.push('规则名称不能为空');
    }

    if (!rule.equipmentId) {
      errors.push('必须关联设备');
    }

    if (rule.minCharge < 0) {
      errors.push('最低收费不能为负数');
    }

    if (rule.startupFee < 0) {
      errors.push('开机费不能为负数');
    }

    // 根据计费类型的特定验证
    const config = rule.pricingConfig;

    switch (config.type) {
      case BillingType.SMART: {
        const sc = config as SmartPricingConfig;
        if (sc.hourlyRate < 0) errors.push('小时费率不能为负数');
        if (sc.countRate < 0) errors.push('次数费率不能为负数');
        if (sc.sampleRate < 0) errors.push('样品费率不能为负数');
        break;
      }
      case BillingType.DURATION: {
        const dc = config as DurationPricingConfig;
        if (dc.hourlyRate < 0) errors.push('小时费率不能为负数');
        if (dc.minDuration < 0) errors.push('最小计费时长不能为负数');
        break;
      }
      case BillingType.USAGE_COUNT: {
        const uc = config as UsageCountPricingConfig;
        if (uc.perUseRate < 0) errors.push('每次费用不能为负数');
        break;
      }
      case BillingType.SAMPLE_QUANTITY: {
        const sc = config as SampleQuantityPricingConfig;
        if (sc.perSampleRate < 0) errors.push('每份样品费用不能为负数');
        break;
      }
      case BillingType.TIERED: {
        const tc = config as TieredPricingConfig;
        if (!tc.tiers || tc.tiers.length === 0) {
          errors.push('阶梯式计费必须至少有一个价格阶梯');
        }
        for (let i = 0; i < tc.tiers.length; i++) {
          const tier = tc.tiers[i];
          if (tier.price < 0) {
            errors.push(`第${i + 1}阶梯价格不能为负数`);
          }
          if (tier.maxValue !== -1 && tier.maxValue <= tier.minValue) {
            errors.push(`第${i + 1}阶梯上限必须大于下限`);
          }
        }
        break;
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// 导出计费引擎实例（单例模式）
export const billingEngine = BillingEngine;

