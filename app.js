const categories = [
  {
    id: "finance",
    tab: "财务",
    title: "财务(Record to Report)板块",
    kicker: "Record to Report",
    description: "围绕日清日结、报销、税务、清账、月结和报表洞察，把财务流程从人工检查推进到可解释、可追踪、可闭环的智能运营。",
    agents: [
      agent("日清日结业务预警 Agent", "自动扫描当日业务凭证、应收应付、库存与总账差异，提前识别影响结账的异常。", "日终前对未过账凭证、异常科目、跨系统差异进行归因，并推送责任人处理。", "将结账风险前置到业务发生当天，减少月末集中排查。", ["ERP", "总账", "应收应付"], "cyan"),
      agent("报销审核机器人", "识别票据、报销单、差旅政策和预算规则，自动完成合规校验与异常提示。", "员工提交报销后，Agent 自动核验发票真伪、费用标准、重复报销和审批链路。", "降低财务初审工作量，让审核标准更一致。", ["OA", "费控", "电子发票"], "mint"),
      agent("税务合规审查 Agent", "检查发票、税率、抵扣规则、纳税申报口径和税务风险事项。", "在结账和申报前自动生成税务风险清单，并给出处理建议。", "减少税务漏报、错报和政策理解偏差。", ["税务云", "ERP", "发票池"], "amber"),
      agent("凭证自动录入 Agent", "识别业务单据、银行流水、发票和附件信息，自动生成会计凭证草稿。", "业务完成后，Agent 按科目映射、税率和成本中心自动生成凭证并提交财务复核。", "减少重复录入，提升凭证生成速度和入账一致性。", ["ERP", "OCR", "凭证规则"], "cyan"),
      agent("票据识别 Agent", "自动识别发票、收据、回单、报销附件和票据关键字段，完成真伪与重复校验。", "员工上传票据后，Agent 抽取金额、税号、日期、发票代码并关联报销或付款流程。", "降低票据录入错误，让票据处理更标准化。", ["OCR", "发票池", "费控"], "mint"),
      agent("往来对账 Agent", "自动核对客户、供应商、内部公司之间的应收应付、收付款和余额差异。", "月末对账时，Agent 按客户和供应商生成差异清单，并给出未达账项解释。", "缩短往来对账周期，减少长期挂账。", ["应收应付", "银行流水", "ERP"], "violet"),
      agent("多规则自动清账 Agent", "基于金额、客户、订单、账龄、收款流水等多维规则自动匹配与清账。", "将银行回单、应收明细和销售订单进行组合匹配，无法确认的项目转人工确认。", "提升清账效率，降低长期挂账和错配风险。", ["银行流水", "应收", "订单"], "violet"),
      agent("财务智能月结 Agent", "编排月结任务、检查前置条件、解释差异并生成结账进度看板。", "月结期间自动追踪库存关账、成本核算、总账过账和报表出具状态。", "压缩月结周期，让财务团队从催办转向分析。", ["ERP", "成本", "合并报表"], "cyan"),
      agent("财经智能体", "支持财务报销、票据处理、财经分析、经营复盘和多语言财经文本处理。", "在费用分析、预算偏差、经营复盘和财经文本处理中自动生成摘要、翻译和建议。", "参考行业实践，翻译、财务、营销等场景可形成显著节省。", ["财务共享", "BI", "AIGC"], "mint"),
      agent("财务报表洞察 Agent", "对利润表、资产负债表、现金流和管理报表进行自动解读。", "管理层询问毛利下降原因时，Agent 穿透到产品、区域、客户和成本要素。", "把报表阅读变成经营问答，提升决策速度。", ["BI", "数据仓库", "财务报表"], "rose")
    ]
  },
  {
    id: "sales",
    tab: "销售与营销",
    title: "销售与营销(Leads to Cash)板块",
    kicker: "Leads to Cash",
    description: "覆盖从线索挖掘、商品讲解、渠道政策、营销活动、预测转单、订单跟催到应收催办的完整销售闭环，帮助销售与营销团队更早识别机会与风险。",
    agents: [
      agent("潜客自动挖掘 Agent", "整合官网、企微、展会、广告和公开数据，自动识别高意向客户与关键联系人。", "当客户多次浏览解决方案页面并留下咨询记录时，Agent 自动评分并推荐销售跟进话术。", "提高线索转化率，减少销售手工筛选时间。", ["CRM", "企微", "营销自动化"], "cyan"),
      agent("订单采集/录入 Agent", "从邮件、表格、图片、聊天记录和客户门户中采集订单信息并自动录入。", "客户发送订单附件后，Agent 抽取客户、型号、数量、价格和交期，生成销售订单草稿。", "减少人工录单时间和错录漏录风险。", ["CRM", "ERP", "OCR"], "cyan"),
      agent("销售预测 Agent", "基于历史销售、商机阶段、渠道计划、市场活动和外部因素生成销售预测。", "销售例会前，Agent 自动汇总区域、产品和客户维度预测，并解释变化原因。", "提升预测准确性，为生产、库存和预算提供前置输入。", ["CRM", "BI", "预测模型"], "mint"),
      agent("多源预测自动转单 Agent", "汇总历史订单、销售预测、渠道计划和客户行为，判断预测是否可转为订单。", "对高置信度预测自动生成待确认销售订单，并提醒销售确认交期与价格。", "缩短从预测到订单的处理链路。", ["CRM", "ERP", "预测模型"], "mint"),
      agent("销售跟踪 Agent", "持续跟踪商机、报价、合同、订单和回款状态，自动提醒关键动作。", "重点客户报价后，Agent 监控跟进时间、竞争状态和客户反馈，提醒销售推进下一步。", "提升销售过程透明度，减少关键商机遗漏。", ["CRM", "报价", "企微"], "amber"),
      agent("销售助手 Agent", "为销售人员提供客户画像、产品话术、报价建议、会议纪要和下一步行动建议。", "拜访客户前，Agent 汇总客户历史、采购偏好和推荐方案，生成拜访提纲。", "提升销售准备效率和客户沟通质量。", ["CRM", "知识库", "AIGC"], "violet"),
      agent("销售订单全程跟催 Agent", "跟踪订单审核、排产、发货、签收和开票状态，主动发现阻塞。", "订单延迟时自动定位卡点在信用、库存、生产或物流，并生成跨部门协同任务。", "减少客户催问和内部信息断点。", ["ERP", "MES", "WMS"], "amber"),
      agent("超期应收闭环催办 Agent", "按账龄、客户信用、合同条款和回款承诺自动生成催收策略。", "应收超期后，Agent 向销售、财务和客户经理推送分级催办动作。", "降低逾期应收，提升现金回收可控性。", ["应收", "CRM", "合同"], "rose"),
      agent("客户信用动态预警 Agent", "监控客户回款、订单履约、工商司法、舆情和授信使用情况。", "发现客户付款延迟和外部风险上升时，自动建议调整账期或冻结发货。", "降低坏账风险，保护销售质量。", ["风控", "CRM", "ERP"], "violet"),
      agent("商品专家智能体", "秒级商品问答、对比与推荐，自动生成一页纸卖点、电子说明书和讲解视频。", "导购输入客户需求后，Agent 立即输出产品对比、核心卖点和讲解脚本。", "导购讲解从 5-10 分钟缩短至 1 分钟，培训从准备两天压缩到当天开训。", ["商品库", "知识库", "AIGC"], "cyan"),
      agent("政策专家智能体", "支持返利与渠道政策查询、条款解释、返利秒级预估和数字人政策视频生成。", "渠道经理输入型号和渠道类型后，Agent 在 2 秒内预估返利并解释适用条款。", "传统数小时至数天的返利核算，压缩到秒级响应。", ["渠道政策", "CRM", "数字人"], "mint"),
      agent("营销经营助手智能体", "通过自然语言 10 秒问数，诊断库存异常并生成可执行经营建议。", "月底复盘时，Agent 按门店、区域、型号和库存状态拆解经营问题。", "经营问题由 AI 给出可量化调整路径，提升营销经营复盘效率。", ["BI", "库存", "销售数据"], "amber"),
      agent("营销活动助手智能体", "模板化出图与个性化编辑，自动融入门店信息、商品卖点和活动政策。", "门店选择活动模板后，Agent 自动生成海报、导购话术和社媒文案。", "简单物料 1 分钟出片，复杂物料 5 分钟出图。", ["素材库", "AIGC", "门店系统"], "rose")
    ]
  },
  {
    id: "delivery",
    tab: "制造与交付",
    title: "制造与交付(Order to Delivery)板块",
    kicker: "Order to Delivery",
    description: "将制造类 Agent 纳入交付链路，覆盖 BOM、工艺工时、排产、缺料、TPM、DMS、模具、视觉质检和 SOP 行为分析，服务从订单承诺到最终交付。",
    agents: [
      agent("BOM 定额优化 Agent", "分析历史用量、损耗、替代料和工艺路线，发现 BOM 定额偏差。", "当某类产品材料消耗长期高于标准时，Agent 自动穿透批次、产线与供应商差异。", "降低物耗偏差，提升成本核算准确性。", ["PLM", "ERP", "MES"], "cyan"),
      agent("替代料分析 Agent", "分析物料规格、BOM 关系、库存、供应风险和历史替代记录，推荐可行替代料方案。", "关键物料短缺时，Agent 自动筛选可替代物料，评估质量、成本、认证和交期影响。", "提升缺料应对速度，降低停线和延迟交付风险。", ["BOM", "PLM", "库存"], "cyan"),
      agent("工艺工时优化 Agent", "结合标准工艺、设备节拍、人员操作和历史报工，推荐更合理的工时标准。", "发现某工序实际节拍持续优于标准后，Agent 建议更新工时并评估产能影响。", "提升排产准确性和产线效率。", ["MES", "工艺库", "报工"], "mint"),
      agent("生产异常监督 Agent", "监控生产进度、设备状态、质量异常、人员操作和物料齐套情况，识别异常趋势。", "产线出现节拍下降、良率波动或停机风险时，Agent 自动定位异常来源并推送责任人。", "提升异常发现速度和闭环质量，减少现场管理盲区。", ["MES", "DMS", "安灯系统"], "amber"),
      agent("排产方案优选 Agent", "综合订单交期、设备能力、物料齐套、人员班次和切换成本，生成多套排产方案。", "交期冲突时，Agent 对比保交付、低换线、低库存三种策略并给出推荐。", "提高计划可执行性，减少人工反复排程。", ["APS", "MES", "WMS"], "violet"),
      agent("物料短缺预警 Agent", "监控库存、在途、需求、采购周期和替代料，预测缺料风险。", "生产订单释放前自动识别关键物料缺口，并向采购员和供应商生成催交通知。", "把缺料发现提前到计划阶段，降低停线风险。", ["ERP", "WMS", "供应商协同"], "amber"),
      agent("AI 视觉质量检测 Agent", "通过工业视觉和深度学习识别外观缺陷、尺寸异常、装配遗漏和误操作。", "在工位实时检测螺栓紧固、外观缺陷或产品漏装，并联动拦截与复检流程。", "降低漏检和过检，支持小样本快速扩展新缺陷。", ["工业相机", "MES", "质量系统"], "rose"),
      agent("SOP 行为分析 Agent", "识别工位操作步骤、顺序、超时和遗漏，支持多相机与音视频融合校验。", "对放料、扫码、装配、封贴、关盖等步骤实时比对 SOP，异常时提醒纠偏。", "保障标准作业执行，提升过程质量可追溯性。", ["边缘计算", "SOP", "视频流"], "cyan"),
      agent("TPM智能体", "利用传感器与 SCADA 数据，结合 EAM 故障库和安灯系统，实现风险预测、维保计划生成与备件补货建议。", "设备出现温度、振动或稼动率异常时，Agent 自动判断风险等级，生成点检和备件建议。", "点检效率提升 30%-50%，设备库存减少 20%，预测性维保减少停机 50%。", ["SCADA", "EAM", "安灯系统"], "mint"),
      agent("DMS智能体", "基于 MBS 方法论支撑从班组到事业部的五级会议体系，并从 4M 人机料法维度采集与预警。", "班组会前，Agent 自动汇总昨日异常、责任人、改善进度和需要升级的问题。", "将 2 小时检讨会转为电脑前即可完成，异常闭环质量显著提升。", ["DMS", "MBS", "4M"], "amber"),
      agent("模具智能体", "智能推荐模具与机台最佳组合，结合冲次、寿命、维修记录实现预测性维保。", "换型前，Agent 按订单、设备、模具健康和历史良率推荐组合并提示风险。", "模具故障率下降 20%，成型周期缩短 10%，新人上手周期缩短 30%。", ["模具库", "MES", "设备数据"], "violet"),
      agent("品质智能体", "通过高精度视觉与算法质检完成缺陷自动识别、根因追溯和改善对策生成。", "首检或巡检时，Agent 自动识别缺陷类型，追溯工艺、设备、物料和人员因素。", "首检时间从 15 分钟缩短至 30 秒，关键岗位检测率 100% 覆盖。", ["视觉检测", "QMS", "MES"], "rose")
    ]
  },
  {
    id: "supply-chain",
    tab: "供应链",
    title: "供应链智能体板块",
    kicker: "Supply Chain Agents",
    description: "围绕需求预测、订单巡检、库存计划、计划执行、物料计划、供方审查、寻源招标、自动执采和风险管理，形成从计划到履约的供应链智能闭环。",
    agents: [
      agent("需求预测智能体", "融合历史销量、天气、舆情、宏观等外生因子，支持分层预测和滚动修正。", "预测新品、区域和渠道需求时，Agent 自动解释影响因子并给出置信区间。", "试点企业预测准确率提升 15%。", ["SCP", "销售数据", "外生因子"], "cyan"),
      agent("订单巡检智能体", "为订单关键节点设置体征，主动识别交付异常、延误风险和跨部门阻塞。", "订单进入异常状态时，Agent 自动定位卡点并推送计划、生产、物流和销售协同。", "参考芜湖工厂场景，交付周期从 27 天压缩到 16 天。", ["ERP", "MES", "物流"], "mint"),
      agent("库存计划智能体", "结合安全库存、服务水准和实时可视化监控，动态推荐补货与库存优化策略。", "库存偏高或断货风险出现时，Agent 按 SKU、仓库和需求波动生成调整建议。", "库存周转天数下降 30%。", ["WMS", "SCP", "库存看板"], "amber"),
      agent("库存优化分析 Agent", "分析库存结构、周转、呆滞、服务水准和补货策略，识别库存优化空间。", "月度库存复盘时，Agent 自动标注高库存、低周转和安全库存不合理的物料。", "降低库存占用，提升库存健康度和服务水平。", ["WMS", "BI", "SCP"], "mint"),
      agent("计划执行智能体", "与 SCP、MES、APS、DMS 联动，将计划建议转成可执行指令并追踪执行反馈。", "排产调整获批后，Agent 自动同步 APS 和 MES，并监控指令落地状态。", "排产响应速度提升 90%。", ["SCP", "APS", "MES"], "violet"),
      agent("物料计划智能体", "执行齐套分析、替代料策略优化和供应商配额监控，联动采购执行。", "关键物料不齐套时，Agent 评估替代料、供应商配额和采购执行方案。", "与采购执行联动，实现交易动作自动化。", ["MRP", "BOM", "SRM"], "rose"),
      agent("供应链缺件监控 Agent", "贯通需求、库存、在途、采购、生产订单和替代料，提前识别缺件风险。", "生产订单释放前，Agent 识别关键缺件、受影响订单和责任采购员，并生成催交建议。", "提前暴露缺件风险，减少停线、延期和跨部门反复沟通。", ["ERP", "MRP", "SRM"], "amber"),
      agent("供应链风险管理智能体", "跟踪全球采购异常、大宗价格波动、地缘风险和替代方案可行性。", "电子半导体物料出现断供风险时，Agent 评估替代供应、库存覆盖和成本影响。", "帮助电子半导体行业防控断供风险。", ["风险数据", "SRM", "BI"], "rose")
    ]
  },
  {
    id: "procurement",
    tab: "采购",
    title: "采购(Sourcing to Pay)板块",
    kicker: "Sourcing to Pay",
    description: "覆盖供应商寻源、询比价、合同、执行监控、对账、发票和绩效评估，让采购从事务执行走向风险与价值管理。",
    agents: [
      agent("供应商寻源匹配 Agent", "根据品类、资质、价格、交付、质量和风险画像推荐候选供应商。", "新物料导入时，Agent 自动生成候选供应商短名单和比选理由。", "缩短寻源周期，提高供应商匹配质量。", ["SRM", "供应商库", "品类库"], "cyan"),
      agent("采购价格分析 Agent", "分析历史采购价、市场行情、供应商报价、批量阶梯和成本构成，识别价格异常。", "采购员收到报价后，Agent 对比历史价格、同类物料和市场指数，给出谈判建议。", "提升议价依据透明度，降低价格偏离和采购成本。", ["SRM", "价格库", "行情数据"], "cyan"),
      agent("询比价自动化 Agent", "自动生成询价单、解析报价、对比价格条款和交付条件。", "多家供应商报价后，Agent 汇总总拥有成本并标注异常报价。", "降低人工比价成本，提升采购透明度。", ["SRM", "邮件", "合同"], "mint"),
      agent("采购执行监控 Agent", "跟踪请购、采购订单、到货、入库、质检、发票和付款状态。", "采购订单延期时自动判断影响订单和生产计划，并生成催交路径。", "减少采购执行黑箱，提高交付确定性。", ["ERP", "WMS", "SRM"], "amber"),
      agent("采购对账 Agent", "自动匹配采购订单、收货、质检、发票和付款，识别数量与价格差异。", "月末对账时将异常差异按供应商、物料和原因聚类。", "缩短对账周期，降低付款错误。", ["ERP", "发票", "付款"], "violet"),
      agent("供应商绩效评估 Agent", "按价格、质量、交付、服务、风险和协同响应生成动态评分。", "季度评估时自动生成供应商改进建议和淘汰预警。", "让供应商管理从静态评分变为持续运营。", ["SRM", "质量", "交付"], "rose"),
      agent("供应商预测&匹配 Agent", "预测供应商交付能力、价格趋势和风险状态，并匹配更适合的供应商组合。", "采购计划变化时，Agent 根据产能、交期、质量和价格推荐供应商分配方案。", "提升供应商选择质量和供应韧性。", ["SRM", "供应商画像", "预测模型"], "violet"),
      agent("供应商发票提取 Agent", "识别发票、送货单、合同和对账单中的关键信息并自动入账前校验。", "收到供应商发票后，Agent 自动抽取税号、金额、税率、订单号并匹配收货记录。", "提升票据处理效率，减少录入错误。", ["OCR", "ERP", "发票池"], "cyan"),
      agent("供方资质审查智能体", "识别跨境证照、资质文件和合规条款，并支持 AIGC 翻译与审查。", "供应商准入时，Agent 自动抽取证照字段、有效期和缺失材料。", "加快审单效率，降低人工审查遗漏。", ["SRM", "OCR", "AIGC翻译"], "cyan"),
      agent("寻源智能体", "整合供方库、全网检索和 AIGC 广域信息采集，推荐寻源策略与候选供方。", "新品类采购时，Agent 输出候选供应商、价格区间、供货能力和风险提示。", "参考大洋电机场景，订单准时结单率提升 25%。", ["供方库", "Web检索", "SRM"], "mint"),
      agent("招标智能体", "对招标轮次、报价曲线、异常合谋风险和供应商策略进行可视化体检。", "多轮报价后，Agent 标注异常报价、陪标嫌疑和谈判空间。", "采购策略由经验驱动转向数据驱动。", ["招采系统", "报价曲线", "风控"], "amber"),
      agent("自动下单智能体", "自动完成 PO 下达、送货通知、回货检讨等交易动作，并保留人工确认节点。", "物料计划确认后，Agent 自动生成采购订单、通知供应商并跟踪回货异常。", "提供数字员工式辅助体验，释放采购执行人力。", ["ERP", "SRM", "消息通知"], "violet")
    ]
  },
  {
    id: "mdm",
    tab: "主数据",
    title: "主数据(MDM)板块",
    kicker: "Master Data Management",
    description: "主数据是企业 AI 深度应用的基石。MDM Agent 集群负责规范学习、自动采集、合规审核、健康监控和闭环修正。",
    agents: [
      agent("主数据规范管理 Agent", "学习企业编码、命名、分类、属性和生命周期规范，形成可执行规则库。", "当业务部门创建新物料时，Agent 自动提示字段规则、命名标准和相似数据。", "让纸面规范转化为系统内可执行约束。", ["MDM", "知识库", "规则引擎"], "cyan"),
      agent("主数据识别采集 Agent", "从图片、图纸、技术文档、合同和表格中识别主数据字段并自动填单。", "上传物料规格书后，Agent 抽取型号、材质、尺寸、单位和分类建议。", "减少人工录入随意性，源头提升数据质量。", ["OCR", "文档解析", "MDM"], "mint"),
      agent("主数据合规审核 Agent", "基于规范规则、历史专家经验和相似数据自动审核主数据。", "发现重复编码、缺失字段、分类不一致时自动触发修正流程。", "把审核从肉眼找茬变成持续一致的自动校验。", ["MDM", "流程引擎", "知识图谱"], "amber"),
      agent("主数据健康管家 Agent", "持续监控完整性、唯一性、准确性、及时性和使用活跃度。", "周期性生成数据健康报告，识别僵尸物料、重复客户和异常供应商。", "从被动修补转为主动检测、预防与自修正。", ["MDM", "BI", "数据质量"], "violet"),
      agent("主数据监控报告 Agent", "自动生成主数据质量看板、整改追踪和治理成效复盘。", "管理层查看 MDM 治理进度时，Agent 给出风险排行和整改闭环状态。", "让数据治理成果可视化、可追踪、可评估。", ["BI", "MDM", "任务中心"], "rose")
    ]
  },
  {
    id: "hr",
    tab: "人力资源",
    title: "人力资源(Hiring to Retire)板块",
    kicker: "Hiring to Retire",
    description: "围绕招聘、入职、培训、绩效、员工服务和离职交接，帮助 HR 从事务处理转向人才洞察与组织能力建设。",
    agents: [
      agent("AI招聘助手", "数字人面试、JD 生成、面谈总结和简历筛选，自动沉淀候选人评估报告。", "HR 发布岗位后，Agent 生成 JD，筛选简历，安排数字人初面并输出结构化面试报告。", "面试报告自动生成，提高招聘前端效率与评价一致性。", ["ATS", "视频面试", "人才库"], "cyan"),
      agent("AI智能培训", "基于 AIGC 大模型动态生成个性化练习题、学习路径和岗位知识测评。", "新员工入职后，Agent 按岗位能力模型推送课程、练习题和阶段测评。", "培训效率提升 30%+，技能掌握速度提高 20%。", ["LMS", "知识库", "能力模型"], "mint"),
      agent("员工服务助手", "回答制度、薪酬、假勤、福利和流程问题，并引导员工自助办理。", "员工询问年假余额、报销制度或证明开具时，Agent 给出答案并拉起对应流程。", "降低 HR 重复咨询压力，提升员工体验。", ["HRIS", "OA", "知识库"], "amber"),
      agent("绩效校准 Agent", "汇总目标、过程数据、评价文本和同岗对比，识别评分偏差。", "绩效评审前自动提示过宽、过严、目标不一致和证据不足的评价。", "减少评价标准差异，提升绩效讨论质量。", ["绩效系统", "OKR", "BI"], "violet")
    ]
  },
  {
    id: "legal",
    tab: "法务合规",
    title: "法务合规类 Agent",
    kicker: "Legal & Compliance",
    description: "将合同审查、版本比对、关键信息提取和合规审查前置到业务流程中，让非法务人员也能完成基础合规自查。",
    agents: [
      agent("AI合同助手", "合同风险审查、版本比对、关键信息提取和条款缺失检查。", "销售或采购上传合同后，Agent 标注付款、违约、保密、交付和责任限制等风险条款。", "非法务人员可完成基础合规审查，法务聚焦高风险事项。", ["合同系统", "OCR", "法务知识库"], "cyan"),
      agent("法务智能体", "覆盖合同审核、法律合规审查、制度问答和风险处置建议。", "业务发起特殊交易时，Agent 按公司制度和法规要求生成合规意见草稿。", "避免人工审核标准差异，提升合规响应速度。", ["CLM", "知识库", "审批流"], "rose")
    ]
  },
  {
    id: "analytics",
    tab: "经营分析",
    title: "经营分析类 Agent",
    kicker: "Business Analytics",
    description: "用数据看板、知识图谱和经营归因能力，把管理者的自然语言问题转化为指标拆解、原因定位和行动建议。",
    agents: [
      agent("经营洞察助手", "数据看板结合知识图谱拆解经营问题，支持自然语言问数与归因分析。", "管理者询问某区域利润下滑原因时，Agent 在 10 秒内穿透产品、客户、价格、成本和费用。", "10 秒问数，并生成可落地建议。", ["BI", "数据仓库", "知识图谱"], "cyan"),
      agent("毛利诊断 Agent", "按产品、客户、渠道、区域和订单拆解毛利变化。", "发现某客户毛利异常下滑时，Agent 自动分析价格、成本、折扣、物流和返利影响。", "帮助经营团队快速定位利润问题。", ["ERP", "CRM", "BI"], "amber"),
      agent("预测与预算协同 Agent", "连接销售预测、生产计划、采购预算和财务预算，识别经营偏差。", "滚动预测发生变化时，Agent 自动提示预算影响和资源调整建议。", "提升经营计划与财务预算协同性。", ["预算", "预测", "计划"], "violet")
    ]
  },
  {
    id: "service",
    tab: "客服及售后品质",
    title: "客服及售后品质类 Agent",
    kicker: "Service & After-sales Quality",
    description: "连接客户咨询、工单、售后服务、质量分析和视觉检测，形成从客户声音到质量改善的闭环。",
    agents: [
      agent("智能客服", "基于 NLP 与企业知识库提供 24 小时在线问答、多渠道接待和工单引导。", "客户从官网、公众号或企微咨询时，Agent 自动理解意图，回答常见问题并创建工单。", "可同时处理大量咨询，分流人工压力。", ["客服系统", "知识库", "工单"], "cyan"),
      agent("售后品检", "结合品质七步法与 AI 视觉检测，辅助客诉原因分析和售后质量判定。", "客户上传故障图片后，Agent 自动识别缺陷类型，关联批次、工艺和检验记录。", "客诉处理从 7 天缩短至 48 小时。", ["质量系统", "视觉检测", "售后工单"], "rose"),
      agent("工单协同 Agent", "自动分类、派单、催办、升级和回访，将服务过程线上化监管。", "复杂问题进入人工后，Agent 汇总客户历史、产品信息和处理建议给坐席。", "提升一次解决率和跨部门协同效率。", ["工单", "CRM", "企微"], "mint"),
      agent("客户之声分析 Agent", "聚类投诉、咨询、回访和评价文本，识别产品与服务改进主题。", "每周自动输出客户痛点 Top 列表，关联产品批次、渠道和责任部门。", "让客服数据反哺质量、产品和运营决策。", ["客服", "NPS", "BI"], "amber")
    ]
  }
];

const categoryOrder = [
  "finance",
  "sales",
  "delivery",
  "supply-chain",
  "procurement",
  "hr",
  "legal",
  "service",
  "mdm",
  "analytics"
];

categories.sort((left, right) => categoryOrder.indexOf(left.id) - categoryOrder.indexOf(right.id));

function agent(name, summary, scenario, impact, systems, tone) {
  return {
    name,
    summary,
    scenario,
    impact,
    systems,
    tone,
    function: summary,
    tags: systems.slice(0, 3)
  };
}

const toneMap = {
  cyan: ["#5ee7ff", "#176bff", "#07111b"],
  mint: ["#43f1be", "#0b8f79", "#07111b"],
  amber: ["#ffc857", "#ff8f3d", "#101017"],
  rose: ["#ff6b8a", "#b84cff", "#120915"],
  violet: ["#9b8cff", "#5ee7ff", "#0c0b18"]
};

const valueFilters = [
  { id: "efficiency", label: "效率提升", terms: ["效率", "缩短", "压缩", "减少", "降低人工", "释放", "自动", "秒", "分钟"] },
  { id: "risk", label: "风险控制", terms: ["风险", "合规", "异常", "预警", "坏账", "缺料", "停线", "错报", "漏报"] },
  { id: "cost", label: "成本优化", terms: ["成本", "库存", "价格", "物耗", "周转", "费用", "毛利"] },
  { id: "insight", label: "经营洞察", terms: ["洞察", "分析", "预测", "建议", "复盘", "问数", "定位", "归因"] }
];

const state = { categoryId: categories[0].id, query: "", domain: "all", system: "all", value: "all" };
const tabs = document.getElementById("tabs");
const grid = document.getElementById("agentGrid");
const panelKicker = document.getElementById("panelKicker");
const panelTitle = document.getElementById("panelTitle");
const panelDescription = document.getElementById("panelDescription");
const agentSearch = document.getElementById("agentSearch");
const domainFilter = document.getElementById("domainFilter");
const systemFilter = document.getElementById("systemFilter");
const valueFilter = document.getElementById("valueFilter");
const clearFilters = document.getElementById("clearFilters");
const modal = document.getElementById("agentModal");
const modalClose = document.getElementById("modalClose");

function populateFilters() {
  const systems = Array.from(new Set(categories.flatMap((category) => category.agents.flatMap((item) => item.systems)))).sort((left, right) => left.localeCompare(right, "zh-CN"));
  domainFilter.innerHTML = `<option value="all">全部板块</option>${categories.map((category) => `<option value="${category.id}">${category.tab}</option>`).join("")}`;
  systemFilter.innerHTML = `<option value="all">全部系统</option>${systems.map((system) => `<option value="${system}">${system}</option>`).join("")}`;
  valueFilter.innerHTML = `<option value="all">全部价值</option>${valueFilters.map((filter) => `<option value="${filter.id}">${filter.label}</option>`).join("")}`;
}

function renderTabs() {
  tabs.innerHTML = categories.map((category) => `
    <button class="tab" type="button" role="tab" aria-selected="${category.id === state.categoryId}" data-category="${category.id}">${category.tab}</button>
  `).join("");
}

function renderPanel() {
  const category = categories.find((item) => item.id === state.categoryId) || categories[0];
  const query = state.query.trim().toLowerCase();
  const isDiscoveryMode = Boolean(query || state.domain !== "all" || state.system !== "all" || state.value !== "all");
  const agents = isDiscoveryMode ? filteredAgents(query) : category.agents.map((item, originalIndex) => ({ item, category, originalIndex }));

  if (isDiscoveryMode) {
    panelKicker.textContent = "Global Discovery";
    panelTitle.textContent = `找到 ${agents.length} 个匹配 Agent`;
    panelDescription.textContent = discoveryDescription();
  } else {
    panelKicker.textContent = category.kicker;
    panelTitle.textContent = category.title;
    panelDescription.textContent = category.description;
  }

  grid.innerHTML = agents.length ? agents.map(({ item, category, originalIndex }) => cardTemplate(item, category, originalIndex, isDiscoveryMode)).join("") : emptyTemplate();
}

function filteredAgents(query) {
  return categories.flatMap((category) => category.agents.map((item, originalIndex) => ({ item, category, originalIndex }))).filter(({ item, category }) => {
    const haystack = [category.tab, category.title, item.name, item.summary, item.scenario, item.impact, item.systems.join(" ")].join(" ").toLowerCase();
    const selectedValue = valueFilters.find((filter) => filter.id === state.value);
    const matchesQuery = !query || haystack.includes(query);
    const matchesDomain = state.domain === "all" || category.id === state.domain;
    const matchesSystem = state.system === "all" || item.systems.includes(state.system);
    const matchesValue = state.value === "all" || selectedValue?.terms.some((term) => haystack.includes(term));
    return matchesQuery && matchesDomain && matchesSystem && matchesValue;
  });
}

function discoveryDescription() {
  const fragments = [];
  if (state.query.trim()) fragments.push(`关键词“${state.query.trim()}”`);
  if (state.domain !== "all") fragments.push(categories.find((item) => item.id === state.domain)?.tab || "指定板块");
  if (state.system !== "all") fragments.push(`连接 ${state.system}`);
  if (state.value !== "all") fragments.push(valueFilters.find((item) => item.id === state.value)?.label || "指定价值");
  return fragments.length ? `已按 ${fragments.join("、")} 筛选，结果覆盖所有业务板块。` : "跨财务、销售、制造、供应链、采购、主数据等板块统一搜索 Agent、业务场景、系统连接和业务效果。";
}

function cardTemplate(item, category, index, showDomain) {
  return `
    <button class="agent-card" type="button" data-agent="${category.id}:${index}" aria-label="查看${item.name}详情">
      <div class="agent-art">${agentSvg(item, category.tab, false)}</div>
      <div class="agent-card-body">
        ${showDomain ? `<span class="domain-pill">${category.tab}</span>` : ""}
        <h4>${item.name}</h4>
        <p>${item.summary}</p>
        <div class="agent-meta">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        <span class="card-link">查看详细说明</span>
      </div>
    </button>
  `;
}

function emptyTemplate() {
  return `<div class="empty-state"><h4>没有匹配结果</h4><p>换一个关键词或减少筛选条件试试，例如“月结”“合同”“视觉”“招聘”。</p></div>`;
}

function agentSvg(item, domain, large) {
  const [primary, secondary, base] = toneMap[item.tone] || toneMap.cyan;
  const title = item.name.replace(/ Agent|机器人|助手|智能体/g, "").slice(0, 8);
  const size = large ? "760" : "480";
  const height = large ? "620" : "180";
  const fontSize = large ? "34" : "22";
  const smallSize = large ? "16" : "13";
  const nodes = item.systems.map((system, index) => {
    const x = large ? [92, 520, 122][index % 3] : [42, 326, 82][index % 3];
    const y = large ? [126, 162, 430][index % 3] : [34, 48, 126][index % 3];
    return `<g><rect x="${x}" y="${y}" width="${large ? 142 : 104}" height="${large ? 44 : 28}" rx="8" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)"/><text x="${x + (large ? 71 : 52)}" y="${y + (large ? 29 : 19)}" text-anchor="middle" fill="#dce8f7" font-size="${smallSize}" font-weight="700">${system}</text></g>`;
  }).join("");

  return `
    <svg viewBox="0 0 ${size} ${height}" role="img" aria-label="${item.name}示意图" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <radialGradient id="glow-${slug(item.name)}" cx="50%" cy="45%" r="60%">
          <stop offset="0" stop-color="${primary}" stop-opacity="0.55"/>
          <stop offset="0.55" stop-color="${secondary}" stop-opacity="0.18"/>
          <stop offset="1" stop-color="${base}" stop-opacity="1"/>
        </radialGradient>
        <linearGradient id="line-${slug(item.name)}" x1="0" x2="1">
          <stop offset="0" stop-color="${primary}"/><stop offset="1" stop-color="${secondary}"/>
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#glow-${slug(item.name)})"/>
      <path d="M0 ${large ? 500 : 145} C ${large ? 170 : 110} ${large ? 390 : 92}, ${large ? 300 : 220} ${large ? 590 : 184}, ${size} ${large ? 440 : 120}" fill="none" stroke="${primary}" stroke-opacity="0.28" stroke-width="2"/>
      <path d="M${large ? 86 : 40} ${large ? 484 : 132} C ${large ? 250 : 160} ${large ? 240 : 68}, ${large ? 500 : 320} ${large ? 260 : 78}, ${large ? 676 : 438} ${large ? 116 : 34}" fill="none" stroke="${secondary}" stroke-opacity="0.34" stroke-width="2"/>
      ${nodes}
      <circle cx="50%" cy="50%" r="${large ? 116 : 46}" fill="rgba(7,17,27,0.78)" stroke="url(#line-${slug(item.name)})" stroke-width="2"/>
      <circle cx="50%" cy="50%" r="${large ? 156 : 66}" fill="none" stroke="${primary}" stroke-opacity="0.22" stroke-dasharray="8 10"/>
      <circle cx="50%" cy="50%" r="${large ? 206 : 86}" fill="none" stroke="${secondary}" stroke-opacity="0.15" stroke-dasharray="3 12"/>
      <text x="50%" y="48%" text-anchor="middle" fill="#ffffff" font-size="${fontSize}" font-weight="900">${title}</text>
      <text x="50%" y="${large ? "55%" : "63%"}" text-anchor="middle" fill="${primary}" font-size="${smallSize}" font-weight="800">${domain} · AI Agent</text>
    </svg>
  `;
}

function slug(value) {
  return Array.from(value).map((char) => char.charCodeAt(0).toString(16)).join("").slice(0, 18);
}

function openAgent(key) {
  const [categoryId, indexText] = key.split(":");
  const category = categories.find((item) => item.id === categoryId);
  const item = category?.agents[Number(indexText)];
  if (!category || !item) return;

  document.getElementById("modalVisual").innerHTML = agentSvg(item, category.tab, true);
  modal.querySelector(".modal-content").innerHTML = detailTemplate(item, category);
  modal.showModal();
}

function detailTemplate(item, category) {
  const relatedAgents = category.agents.filter((agentItem) => agentItem !== item).slice(0, 3);
  const valueLabel = valueFilters.find((filter) => filter.terms.some((term) => [item.summary, item.scenario, item.impact].join(" ").includes(term)))?.label || "效率提升";
  return `
    <div class="detail-hero">
      <p class="modal-domain">${category.title}</p>
      <h2 id="modalTitle">${item.name}</h2>
      <p>${item.summary}</p>
      <div class="modal-tags">
        <span>AI Agent</span>
        <span>Beta</span>
        <span>${category.kicker}</span>
        <span>${valueLabel}</span>
      </div>
    </div>

    <nav class="detail-nav" aria-label="详情分区">
      <a href="#overview">Overview</a>
      <a href="#benefits">Benefits</a>
      <a href="#business-value">Business Value</a>
      <a href="#additional-info">Additional Information</a>
      <a href="#required-assets">Required Assets</a>
    </nav>

    <section class="detail-section" id="overview">
      <h3>Overview</h3>
      <p>${item.name} 面向${category.tab}场景，${item.scenario} 它将业务数据、规则校验和智能分析组织成可追踪的工作流，帮助团队从人工查找问题转向主动预警与闭环处理。</p>
    </section>

    <section class="detail-section" id="benefits">
      <h3>Benefits</h3>
      <div class="benefit-list">
        <article>
          <strong>降低人工处理负担</strong>
          <p>${item.function}</p>
        </article>
        <article>
          <strong>提升流程透明度</strong>
          <p>围绕${item.systems.join("、")}等系统沉淀事件、责任人、处理状态和审计记录。</p>
        </article>
        <article>
          <strong>形成可执行建议</strong>
          <p>${item.impact}</p>
        </article>
      </div>
    </section>

    <section class="detail-section" id="business-value">
      <h3>Business Value</h3>
      <div class="value-grid">
        <div><span>Primary Value</span><strong>${valueLabel}</strong></div>
        <div><span>Process Area</span><strong>${category.kicker}</strong></div>
        <div><span>Recommended Pilot</span><strong>4-8 周 POC</strong></div>
        <div><span>Human Control</span><strong>保留人工确认</strong></div>
      </div>
    </section>

    <section class="detail-section" id="additional-info">
      <h3>Additional Information</h3>
      <dl class="info-list">
        <div><dt>AI Type</dt><dd>企业流程 Agent</dd></div>
        <div><dt>Works With</dt><dd>${item.systems.join("、")}</dd></div>
        <div><dt>Applicable Industries</dt><dd>制造、零售、贸易、集团型企业</dd></div>
        <div><dt>Minimum Required Version</dt><dd>具备可用业务数据接口或可导出数据源</dd></div>
      </dl>
    </section>

    <section class="detail-section" id="required-assets">
      <h3>Required Assets</h3>
      <div class="asset-list">
        ${item.systems.map((system) => `<span>${system}</span>`).join("")}
        <span>业务规则库</span>
        <span>流程审批节点</span>
        <span>审计日志</span>
      </div>
    </section>

    <section class="detail-section related-section">
      <h3>Related AI Offerings</h3>
      <div class="related-list">
        ${relatedAgents.map((agentItem) => `<article><strong>${agentItem.name}</strong><p>${agentItem.summary}</p></article>`).join("")}
      </div>
    </section>
  `;
}

tabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  state.categoryId = button.dataset.category;
  state.query = "";
  state.domain = "all";
  state.system = "all";
  state.value = "all";
  agentSearch.value = "";
  domainFilter.value = "all";
  systemFilter.value = "all";
  valueFilter.value = "all";
  renderTabs();
  renderPanel();
});

grid.addEventListener("click", (event) => {
  const card = event.target.closest(".agent-card");
  if (card) openAgent(card.dataset.agent);
});

agentSearch.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderPanel();
});

domainFilter.addEventListener("change", (event) => {
  state.domain = event.target.value;
  if (state.domain !== "all") state.categoryId = state.domain;
  renderTabs();
  renderPanel();
});

systemFilter.addEventListener("change", (event) => {
  state.system = event.target.value;
  renderPanel();
});

valueFilter.addEventListener("change", (event) => {
  state.value = event.target.value;
  renderPanel();
});

clearFilters.addEventListener("click", () => {
  state.query = "";
  state.domain = "all";
  state.system = "all";
  state.value = "all";
  agentSearch.value = "";
  domainFilter.value = "all";
  systemFilter.value = "all";
  valueFilter.value = "all";
  renderPanel();
});

modalClose.addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});

populateFilters();
renderTabs();
renderPanel();
