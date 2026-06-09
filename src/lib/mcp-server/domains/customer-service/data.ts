/**
 * 客服领域数据存储
 */

export const customerServiceData = {
  customers: [
    { id: 'CUS-001', name: '张伟', tier: 'VIP', totalOrders: 45, lastContact: '2025-06-25' },
    { id: 'CUS-002', name: '李娜', tier: 'normal', totalOrders: 12, lastContact: '2025-06-24' },
    { id: 'CUS-003', name: '王强', tier: 'VIP', totalOrders: 78, lastContact: '2025-06-26' },
    { id: 'CUS-004', name: '赵敏', tier: 'normal', totalOrders: 5, lastContact: '2025-06-20' },
  ],

  orders: [
    { id: 'ORD-20250620-001', customerId: 'CUS-001', product: 'MCU-200 电机控制器', status: 'shipped', amount: 2580 },
    { id: 'ORD-20250622-002', customerId: 'CUS-002', product: 'SNS-100 传感器模块', status: 'delivered', amount: 890 },
    { id: 'ORD-20250625-003', customerId: 'CUS-003', product: 'PWR-500 电源适配器', status: 'processing', amount: 1280 },
  ],

  tickets: [
    { id: 'TK-001', customerId: 'CUS-001', subject: '产品使用问题', status: 'open', priority: 'medium', createdAt: '2025-06-26T10:00:00Z', slaDeadline: '2025-06-26T12:00:00Z' },
    { id: 'TK-002', customerId: 'CUS-003', subject: '退款申请', status: 'pending', priority: 'high', createdAt: '2025-06-26T09:30:00Z', slaDeadline: '2025-06-26T11:30:00Z' },
    { id: 'TK-003', customerId: 'CUS-002', subject: '物流查询', status: 'resolved', priority: 'low', createdAt: '2025-06-25T14:00:00Z', slaDeadline: '2025-06-26T14:00:00Z' },
    { id: 'TK-004', customerId: 'CUS-004', subject: '产品质量投诉', status: 'open', priority: 'high', createdAt: '2025-06-26T08:00:00Z', slaDeadline: '2025-06-27T08:00:00Z' },
  ],

  events: [
    { id: 'CE001', type: 'ticket_created', severity: 'info', message: 'TK-001 创建: 产品使用问题 (CUS-001 VIP)', time: '2025-06-26T10:00:00Z' },
    { id: 'CE002', type: 'sla_warning', severity: 'high', message: 'TK-002 SLA 即将到期: 退款申请 (VIP客户)', time: '2025-06-26T11:00:00Z' },
    { id: 'CE003', type: 'complaint', severity: 'critical', message: 'CUS-004 产品质量投诉: PWR-500 外壳缺陷', time: '2025-06-26T08:00:00Z' },
    { id: 'CE004', type: 'ticket_created', severity: 'info', message: 'TK-004 创建: 产品质量投诉 (CUS-004)', time: '2025-06-26T08:00:00Z' },
    { id: 'CE005', type: 'sla_warning', severity: 'medium', message: 'TK-001 SLA 提醒: 距截止还有1小时', time: '2025-06-26T11:00:00Z' },
  ],

  faqs: [
    { keywords: '退款,退货', question: '如何申请退款？', answer: '请在订单详情页点击"申请退款"，或联系客服。VIP客户享受1个工作日内处理。' },
    { keywords: '物流,快递,到货', question: '物流多久到？', answer: '标准配送3-5个工作日，VIP客户享次日达服务。' },
    { keywords: '保修,维修,质保', question: '产品保修期多久？', answer: '所有产品享受1年质保，VIP客户延长至2年。' },
    { keywords: '发票,开票', question: '如何开发票？', answer: '在订单完成后可在"我的订单"中申请电子发票，1个工作日内开具。' },
  ],
};
