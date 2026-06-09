/**
 * 制造业领域数据存储
 * 模拟真实制造场景的运行数据
 */

export const manufacturingData = {
  // 产线数据
  productionLines: [
    { id: 'L1', name: 'L1-组装线', dailyTarget: 1200, todayOutput: 980, status: 'running', yield: 99.2 },
    { id: 'L2', name: 'L2-测试线', dailyTarget: 800, todayOutput: 820, status: 'running', yield: 98.7 },
    { id: 'L3', name: 'L3-包装线', dailyTarget: 1500, todayOutput: 1100, status: 'running', yield: 99.5 },
    { id: 'L4', name: 'L4-精密加工线', dailyTarget: 500, todayOutput: 320, status: 'running', yield: 97.8 },
    { id: 'L5', name: 'L5-喷涂线', dailyTarget: 600, todayOutput: 0, status: 'stopped', yield: 0 },
  ],

  // 设备数据
  equipment: [
    { id: 'CNC-001', name: '数控车床 A1', type: 'CNC', status: 'running', nextMaintenance: '2025-07-15', uptime: '98.5%' },
    { id: 'CNC-002', name: '数控车床 A2', type: 'CNC', status: 'running', nextMaintenance: '2025-07-20', uptime: '97.2%' },
    { id: 'CNC-003', name: '数控铣床 B1', type: 'CNC', status: 'maintenance', nextMaintenance: '2025-06-25', uptime: '85.0%' },
    { id: 'ROB-001', name: '焊接机器人 R1', type: 'Robot', status: 'running', nextMaintenance: '2025-08-01', uptime: '99.1%' },
    { id: 'ROB-002', name: '装配机器人 R2', type: 'Robot', status: 'fault', nextMaintenance: '立即', uptime: '72.3%' },
    { id: 'INSP-001', name: 'AOI检测仪 I1', type: 'Inspection', status: 'running', nextMaintenance: '2025-07-30', uptime: '99.8%' },
    { id: 'CONV-001', name: '传送带 C1', type: 'Conveyor', status: 'running', nextMaintenance: '2025-09-01', uptime: '99.9%' },
    { id: 'STAMP-001', name: '冲压机 S1', type: 'Stamping', status: 'running', nextMaintenance: '2025-07-10', uptime: '96.5%' },
  ],

  // 产品数据
  products: [
    { name: '电机控制器 MCU-200', model: 'MCU-200', line: 'L1', batch: 'B20250625-001' },
    { name: '传感器模块 SNS-100', model: 'SNS-100', line: 'L2', batch: 'B20250625-002' },
    { name: '电源适配器 PWR-500', model: 'PWR-500', line: 'L4', batch: 'B20250625-003' },
  ],

  // 质量指标
  qualityMetrics: [
    { product: 'MCU-200', passRate: 99.2, defectRate: 0.8, standard: 98, topDefect: '焊接不良' },
    { product: 'SNS-100', passRate: 98.5, defectRate: 1.5, standard: 98, topDefect: '标定偏差' },
    { product: 'PWR-500', passRate: 97.8, defectRate: 2.2, standard: 97, topDefect: '外壳划痕' },
  ],

  // 事件流
  events: [
    { id: 'E001', type: 'quality_alert', severity: 'high', message: 'PWR-500 不良率超阈值 (2.2% > 2.0%)', line: 'L4', time: '2025-06-26T14:30:00Z' },
    { id: 'E002', type: 'equipment_fault', severity: 'critical', message: '装配机器人 R2 关节传感器异常', equipment: 'ROB-002', time: '2025-06-26T13:15:00Z' },
    { id: 'E003', type: 'maintenance_due', severity: 'medium', message: '数控铣床 B1 维护到期', equipment: 'CNC-003', time: '2025-06-26T10:00:00Z' },
    { id: 'E004', type: 'quality_alert', severity: 'medium', message: 'SNS-100 标定偏差率偏高 (1.5%)', line: 'L2', time: '2025-06-26T09:45:00Z' },
    { id: 'E005', type: 'equipment_fault', severity: 'low', message: '传送带 C1 速度传感器间歇性报警', equipment: 'CONV-001', time: '2025-06-25T16:20:00Z' },
    { id: 'E006', type: 'maintenance_due', severity: 'low', message: 'AOI检测仪 I1 下月维护提醒', equipment: 'INSP-001', time: '2025-06-25T08:00:00Z' },
  ],
};
