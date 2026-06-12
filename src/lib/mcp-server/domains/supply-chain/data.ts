/**
 * 供应链领域数据存储
 */

export const supplyChainData = {
  warehouses: [
    { id: 'WH-001', name: '华东中心仓', location: '上海', capacity: 50000, utilization: '78%', status: 'operational' },
    { id: 'WH-002', name: '华南分仓', location: '深圳', capacity: 30000, utilization: '85%', status: 'operational' },
    { id: 'WH-003', name: '华北分仓', location: '北京', capacity: 25000, utilization: '62%', status: 'operational' },
  ],

  suppliers: [
    { id: 'SUP-001', name: '精密电子科技', rating: 4.5, onTimeDelivery: 97, qualityScore: 98, complianceStatus: 'compliant', lastAudit: '2025-05-10', certifications: ['ISO 9001', 'ISO 14001'] },
    { id: 'SUP-002', name: '恒达材料供应', rating: 3.8, onTimeDelivery: 92, qualityScore: 95, complianceStatus: 'compliant', lastAudit: '2025-04-15', certifications: ['ISO 9001'] },
    { id: 'SUP-003', name: '亚太半导体', rating: 4.2, onTimeDelivery: 95, qualityScore: 97, complianceStatus: 'compliant', lastAudit: '2025-06-01', certifications: ['ISO 9001', 'IATF 16949'] },
    { id: 'SUP-004', name: '鑫源包装', rating: 3.2, onTimeDelivery: 88, qualityScore: 91, complianceStatus: 'pending_review', lastAudit: '2025-03-20', certifications: ['ISO 9001'] },
  ],

  inventory: [
    { sku: 'MAT-001', name: 'PCB电路板', quantity: 15000, unit: '片', reorderPoint: 5000, safetyStock: 2000, warehouse: 'WH-001' },
    { sku: 'MAT-002', name: '电阻组件', quantity: 80000, unit: '个', reorderPoint: 20000, safetyStock: 8000, warehouse: 'WH-001' },
    { sku: 'MAT-003', name: 'IC芯片', quantity: 3200, unit: '个', reorderPoint: 5000, safetyStock: 2000, warehouse: 'WH-002' },
    { sku: 'MAT-004', name: '铝制外壳', quantity: 4200, unit: '个', reorderPoint: 3000, safetyStock: 1000, warehouse: 'WH-001' },
    { sku: 'MAT-005', name: '连接器', quantity: 1800, unit: '套', reorderPoint: 2000, safetyStock: 800, warehouse: 'WH-003' },
  ],

  shipments: [
    { id: 'SHP-001', origin: '深圳', destination: '上海', status: 'in_transit', eta: '2025-06-27', carrier: '顺丰物流', delayHours: null },
    { id: 'SHP-002', origin: '上海', destination: '北京', status: 'in_transit', eta: '2025-06-28', carrier: '京东物流', delayHours: 6 },
    { id: 'SHP-003', origin: '深圳', destination: '上海', status: 'delivered', eta: '2025-06-25', carrier: '中通物流', delayHours: null },
    { id: 'SHP-004', origin: '北京', destination: '深圳', status: 'in_transit', eta: '2025-06-29', carrier: '德邦物流', delayHours: 12 },
  ],

  purchaseOrders: [
    { id: 'PO-001', supplier: '精密电子科技', material: 'PCB电路板', quantity: 10000, status: 'confirmed', eta: '2025-07-05' },
    { id: 'PO-002', supplier: '亚太半导体', material: 'IC芯片', quantity: 8000, status: 'pending', eta: '2025-07-10' },
    { id: 'PO-003', supplier: '鑫源包装', material: '铝制外壳', quantity: 5000, status: 'shipped', eta: '2025-06-28' },
  ],

  risks: [
    { type: 'supply_shortage', description: 'IC芯片供应紧张，交期延长至8周', level: 'critical', affectedSuppliers: ['亚太半导体'], mitigation: '启动备用供应商评估，增加安全库存' },
    { type: 'logistics_delay', description: '华北暴雨预警，北京仓入库可能延迟', level: 'high', affectedSuppliers: [], mitigation: '提前安排华南仓备货' },
    { type: 'quality_risk', description: '鑫源包装质量评分下降至91%', level: 'medium', affectedSuppliers: ['鑫源包装'], mitigation: '加强来料检验，启动供应商改善计划' },
  ],

  events: [
    { id: 'SE001', type: 'shipment_delay', severity: 'high', message: 'SHP-002 延迟6小时: 上海→北京 (京东物流)', time: '2025-06-26T12:00:00Z' },
    { id: 'SE002', type: 'shipment_delay', severity: 'medium', message: 'SHP-004 延迟12小时: 北京→深圳 (德邦物流)', time: '2025-06-26T10:30:00Z' },
    { id: 'SE003', type: 'inventory_alert', severity: 'critical', message: 'IC芯片库存低于补货点 (3200/5000)，安全库存 2000', time: '2025-06-26T09:00:00Z' },
    { id: 'SE004', type: 'inventory_alert', severity: 'high', message: '连接器库存低于补货点 (1800/2000)', time: '2025-06-26T08:30:00Z' },
    { id: 'SE005', type: 'supplier_change', severity: 'medium', message: '鑫源包装合规状态变更为"待审查"', time: '2025-06-25T16:00:00Z' },
    { id: 'SE006', type: 'shipment_delay', severity: 'low', message: 'SHP-001 预计按时到达: 深圳→上海', time: '2025-06-25T14:00:00Z' },
  ],
};
