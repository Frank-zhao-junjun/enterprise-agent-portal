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

const detailedAgentProfiles = {
  "财务智能月结 Agent": {
    overview: "面向集团财务月结的任务编排与差异解释场景，把库存关账、成本核算、总账过账、合并抵消和报表出具串成一条可追踪链路。它不是简单提醒工具，而是在每个结账节点检查前置条件、解释异常来源并推动责任人闭环。",
    painPoints: [
      { title: "月结状态分散", text: "库存、成本、总账、合并报表分别在不同系统推进，财务经理需要靠群消息和表格反复确认进度。" },
      { title: "差异解释滞后", text: "科目余额、成本分摊、内部交易抵消出现异常时，往往到报表阶段才集中暴露。" },
      { title: "催办不可追踪", text: "任务是否逾期、卡在哪个部门、是否已经升级处理，缺少统一的责任视图。" }
    ],
    triggers: [
      "月结日历进入指定结账窗口，例如 T+1 日 18:00 自动启动预检查。",
      "库存关账、成本计算、总账过账或合并抵消任务超过计划完成时间。",
      "跨系统余额、成本中心、内部往来或抵消分录差异超过预设阈值。",
      "管理层请求查看月结进度、阻塞原因或预计报表出具时间。"
    ],
    workflow: [
      "读取月结日历和任务清单，按法人、事业部、流程节点生成结账作战图。",
      "检查库存关账、成本核算、应收应付、总账过账、合并报表等前置条件。",
      "对异常项目进行归因，标记责任系统、责任组织、影响报表和建议处理动作。",
      "向责任人推送催办任务，并根据逾期时间和影响等级自动升级。",
      "生成管理层月结看板，展示完成率、阻塞项、预计完成时间和高风险差异。",
      "结账完成后沉淀复盘报告，保留异常原因、处理人、处理时长和下月预防建议。"
    ],
    inputs: ["月结日历", "结账任务清单", "总账余额", "未过账凭证", "库存关账状态", "成本计算批次", "合并抵消规则"],
    outputs: ["月结进度看板", "阻塞任务清单", "差异归因说明", "责任人催办任务", "报表出具风险提示", "月结复盘报告"],
    humanControls: ["关闭账期", "确认调整凭证", "批准差异豁免", "发布正式管理报表"],
    kpis: ["月结周期缩短 20%-40%", "逾期结账任务占比下降", "高风险差异提前发现率提升", "财务催办沟通次数减少"],
    pilot: "建议先选择集团总部加一个事业部，覆盖库存关账、成本核算、总账过账、合并报表四条链路，连续跑 2 个结账周期验证效果。"
  },
  "超期应收闭环催办 Agent": {
    overview: "面向销售、财务和客户经理共同参与的应收催收场景，把账龄、合同条款、客户信用、回款承诺和历史催办记录整合成分级催办策略。它负责识别风险、分派动作、跟踪承诺兑现，并把长期未闭环事项升级到管理层。",
    painPoints: [
      { title: "责任边界不清", text: "同一笔逾期应收可能涉及销售、财务、法务和客户经理，人工催办容易互相等待。" },
      { title: "客户承诺难跟踪", text: "客户口头承诺或邮件承诺回款后，缺少自动提醒和兑现校验。" },
      { title: "风险分级不足", text: "金额大、账龄长、信用下调和外部司法风险常被放在同一张表里处理，优先级不清。" }
    ],
    triggers: [
      "应收超过合同账期 7 天、15 天、30 天等分级阈值。",
      "客户连续两次未按承诺日期回款，或回款金额低于承诺金额。",
      "客户信用等级下调、授信额度超限、司法舆情或工商风险上升。",
      "重点客户逾期金额超过区域或事业部预警线。"
    ],
    workflow: [
      "汇总应收余额、账龄、合同账期、开票状态、回款承诺和历史催办记录。",
      "按逾期天数、金额、客户信用、订单履约和争议状态计算风险等级。",
      "生成销售跟进、财务提醒、客户经理拜访、法务预警等分级动作。",
      "把催办任务推送给责任人，并跟踪是否完成、客户是否响应、承诺是否兑现。",
      "对长期未处理或高金额事项自动升级，并输出管理层逾期应收看板。"
    ],
    inputs: ["应收明细", "合同账期", "开票记录", "回款流水", "客户信用", "催办记录", "客户承诺"],
    outputs: ["逾期客户清单", "分级催收策略", "责任人任务", "客户承诺跟踪", "风险升级记录", "现金回收预测"],
    humanControls: ["冻结发货", "调整客户账期", "发送正式律师函", "确认坏账计提或核销"],
    kpis: ["逾期应收金额下降", "催办任务响应时长缩短", "承诺回款兑现率提升", "高风险客户提前识别率提升"],
    pilot: "建议先覆盖 Top 50 高余额客户和账龄超过 30 天的应收，按区域销售组织试点 4 周，再扩展到全部客户池。"
  },
  "AI 视觉质量检测 Agent": {
    overview: "面向产线首检、巡检和关键工位在线检测场景，通过工业相机、视觉模型和质量规则识别外观缺陷、尺寸异常、装配遗漏和误操作，并联动 MES、质量系统完成拦截、复检和缺陷闭环。",
    painPoints: [
      { title: "人工检测稳定性不足", text: "高节拍产线中，人工目检容易受疲劳、经验差异和班次切换影响。" },
      { title: "缺陷追溯链条断裂", text: "发现缺陷后难以快速关联工单、批次、设备、物料和操作人员。" },
      { title: "新缺陷扩展慢", text: "新品或小批量缺陷样本不足，传统规则或模型更新周期长。" }
    ],
    triggers: [
      "工单开线、首件确认、关键工序完工或抽检计划到达。",
      "视觉模型识别到缺陷、装配遗漏、尺寸偏差或置信度低于阈值。",
      "同一工位、批次或设备连续出现同类缺陷。",
      "质检员复判结果与模型判断存在明显分歧，需要进入样本回流。"
    ],
    workflow: [
      "采集工位图像、产品型号、工单批次和质量判定规则。",
      "调用视觉模型识别缺陷类型、位置、尺寸和置信度，并与标准样本对比。",
      "对高置信度缺陷自动拦截，对低置信度样本推送质检员复判。",
      "将缺陷结果回写 MES 和质量系统，关联批次、设备、工装和操作记录。",
      "统计缺陷趋势，提示可能的设备、物料、工艺或人员原因。",
      "把复判样本沉淀为训练集，支持小样本缺陷快速扩展。"
    ],
    inputs: ["工业相机图片", "产品型号", "工单批次", "缺陷样本库", "检验标准", "MES 工序记录", "质量判定规则"],
    outputs: ["缺陷类型标注", "缺陷位置截图", "拦截或复检指令", "批次质量记录", "缺陷趋势分析", "样本回流清单"],
    humanControls: ["最终放行", "报废判定", "复检结论", "模型版本发布", "质量标准变更"],
    kpis: ["漏检率下降", "过检率可控", "首检时间缩短", "关键岗位检测覆盖率提升", "缺陷闭环时长缩短"],
    pilot: "建议选择一个缺陷边界清晰、相机条件稳定的关键工位，先覆盖 3-5 类高频缺陷，验证 2 周后再扩展到更多型号和工位。"
  },
  "物料计划智能体": {
    overview: "面向需求变化、齐套分析和采购执行联动场景，把 MRP、BOM、库存、在途、替代料、供应商配额和交期约束整合起来，给计划员提供缺料预警、替代建议和采购执行方案。",
    painPoints: [
      { title: "计划变化传导慢", text: "销售预测、生产计划和客户订单变化后，物料缺口需要计划员手工反复测算。" },
      { title: "替代料判断依赖经验", text: "替代关系、质量认证、成本影响和库存覆盖分散在不同系统或表格中。" },
      { title: "采购执行脱节", text: "计划建议没有及时转成请购、催交或供应商调整动作，缺料风险暴露过晚。" }
    ],
    triggers: [
      "销售预测、主生产计划或客户订单发生调整。",
      "MRP 运算后出现关键物料缺口、齐套率下降或交期冲突。",
      "供应商交付延期、配额不足、最小起订量或采购周期发生变化。",
      "库存低于安全库存，或呆滞库存超过预警阈值。"
    ],
    workflow: [
      "读取需求、BOM、库存、在途、采购周期和供应商配额，计算净需求。",
      "按订单优先级、交期、替代关系和库存覆盖识别缺料风险。",
      "评估替代料可用性，比较质量认证、成本、库存和交付影响。",
      "生成请购、调拨、替代、催交或供应商配额调整建议。",
      "联动采购执行，跟踪建议是否转成 PR、PO、催交通知或计划调整。",
      "沉淀缺料原因，为后续安全库存、配额和提前期优化提供依据。"
    ],
    inputs: ["销售预测", "主生产计划", "BOM", "MRP 结果", "库存", "在途采购", "替代料关系", "供应商配额"],
    outputs: ["缺料风险清单", "齐套分析报告", "替代料建议", "请购建议", "催交通知", "供应商配额调整建议"],
    humanControls: ["替代料启用", "供应商切换", "请购释放", "安全库存调整", "生产计划改期"],
    kpis: ["关键缺料提前发现率提升", "计划员测算时间减少", "齐套率提升", "呆滞库存下降", "采购响应时长缩短"],
    pilot: "建议先选择一个产品族和 20-50 个关键物料，覆盖需求变化、缺料识别、替代建议和采购联动四个动作，运行一个计划周期。"
  },
  "询比价自动化 Agent": {
    overview: "面向采购询价、报价解析、价格对比和定标建议场景，自动生成询价单、收集供应商报价、统一折算条款，并从总拥有成本、历史价格和交付风险角度给采购员提供谈判依据。",
    painPoints: [
      { title: "报价格式不统一", text: "供应商通过邮件、表格、PDF 或门户提交报价，人工整理耗时且容易漏字段。" },
      { title: "价格对比只看单价", text: "运费、税率、币种、账期、MOQ、交期和质保条款没有统一折算。" },
      { title: "异常报价发现慢", text: "围标、异常低价、历史偏离和供应风险需要采购员凭经验判断。" }
    ],
    triggers: [
      "采购申请达到询比价门槛，或新品类、新供应商需要比选。",
      "供应商提交报价邮件、报价单或门户报价记录。",
      "报价单价、总价、账期、交期或 MOQ 明显偏离历史区间。",
      "定标前需要生成谈判建议、异常说明和审批摘要。"
    ],
    workflow: [
      "根据采购申请、规格书和候选供应商生成询价包。",
      "解析邮件、Excel、PDF 和门户报价，抽取价格、币种、税率、交期、MOQ 和付款条款。",
      "统一折算到可比口径，计算含税价、到厂价、总拥有成本和历史偏离。",
      "识别异常报价、缺失条款、疑似陪标和供应商履约风险。",
      "生成供应商排序、谈判建议、推荐定标方案和审批摘要。",
      "把定标结果、价格依据和异常处理记录回写 SRM 或招采系统。"
    ],
    inputs: ["采购申请", "规格书", "供应商库", "历史采购价", "报价邮件", "报价附件", "合同条款", "供应商绩效"],
    outputs: ["询价单", "报价解析表", "TCO 对比表", "异常报价提示", "谈判建议", "定标推荐", "审批摘要"],
    humanControls: ["供应商邀请名单", "正式发标", "定标审批", "价格锁定", "合同签署"],
    kpis: ["比价周期缩短", "有效报价覆盖率提升", "采购节省率提升", "异常报价识别率提升", "人工录入错误减少"],
    pilot: "建议先选择一个标准化程度高、供应商数量稳定的品类，接入 SRM 和邮件报价，连续处理 20 单以上询比价任务。"
  },
  "AI合同助手": {
    overview: "面向销售、采购和业务部门的合同初审场景，自动识别合同主体、金额、期限、付款、交付、违约、保密和责任限制等条款，并与公司模板、条款库和审批规则比对，输出风险标注和修改建议。",
    painPoints: [
      { title: "非法务初审能力不一致", text: "业务人员对合同关键风险识别不稳定，常把低质量合同直接提交法务。" },
      { title: "模板偏离难发现", text: "客户或供应商修改了责任、付款、违约、保密等条款后，人工逐字比对效率低。" },
      { title: "版本流转不可控", text: "多轮 Word、PDF 和邮件附件来回修改，容易遗漏历史变更和审批意见。" }
    ],
    triggers: [
      "业务人员上传销售合同、采购合同、补充协议或框架协议。",
      "合同金额、付款条件、责任限制或交付条款触发高风险审批规则。",
      "对方版本与公司标准模板存在关键条款偏离。",
      "合同进入签署前，需要生成法务摘要和审批说明。"
    ],
    workflow: [
      "解析 Word、PDF 或扫描件，抽取主体、金额、期限、付款、交付和争议解决等关键字段。",
      "与公司模板和条款库比对，识别缺失、弱化、冲突或超权限条款。",
      "按风险等级标注付款、违约、保密、知识产权、责任限制和终止条款。",
      "生成修改建议、替代条款、风险解释和需要业务确认的问题清单。",
      "对多版本合同进行差异比对，保留每轮变更和审批意见。",
      "输出给法务和审批人的合同摘要，说明高风险点、建议处理和人工确认项。"
    ],
    inputs: ["合同文件", "公司合同模板", "标准条款库", "审批规则", "客户或供应商信息", "交易金额", "历史版本"],
    outputs: ["风险标注", "条款修改建议", "缺失条款清单", "版本差异报告", "法务审核摘要", "业务确认问题清单"],
    humanControls: ["正式法律意见", "重大条款让步", "合同最终签署", "外部律师送审", "争议处理方案"],
    kpis: ["合同初审周期缩短", "模板符合率提升", "高风险条款漏检率下降", "法务重复审核工作量减少", "业务退回次数减少"],
    pilot: "建议先覆盖标准销售合同和采购合同两个模板，限制在中低金额合同初审，收集 50 份合同的风险命中率和法务复核反馈。"
  }
};

const categoryDetailGuides = {
  finance: {
    subject: "财务结算、核算与经营分析流程",
    stakeholders: "财务经理、共享中心、业务财务和流程责任人",
    painPoints: [
      { title: "数据口径分散", text: "业务单据、总账、发票、银行流水和管理报表分散在不同系统，人工核对容易形成口径差异。" },
      { title: "异常发现滞后", text: "凭证、税务、报销、清账或报表异常常在结账后段集中暴露，处理窗口被压缩。" },
      { title: "责任闭环不足", text: "财务发现问题后需要跨部门追踪责任人、处理状态和审批记录，过程难以审计。" }
    ],
    triggers: ["关键财务节点进入日清、月结、报销、申报或报表出具窗口。", "金额、科目、税率、账龄、余额或凭证状态超过规则阈值。", "跨 ERP、费控、发票池、银行流水或 BI 的数据出现不一致。"],
    inputs: ["财务规则库", "科目映射", "审批记录", "业务单据", "审计日志"],
    outputs: ["财务异常清单", "差异解释", "处理建议", "责任人任务", "审计留痕"],
    humanControls: ["确认会计处理", "审批调整凭证", "发布正式报表", "批准税务或合规口径"],
    kpis: ["异常提前发现率提升", "人工核对时长下降", "结账或审核周期缩短", "问题闭环可追溯率提升"],
    pilot: "建议先选择一个法人、一个财务共享流程或一个高频核算场景，连续运行 1-2 个业务周期。"
  },
  sales: {
    subject: "线索、商机、订单、合同与回款闭环",
    stakeholders: "销售负责人、客户经理、渠道经理、财务和营销运营",
    painPoints: [
      { title: "客户动作不连续", text: "线索、报价、合同、订单、发货和回款分散推进，销售团队难以及时识别下一步动作。" },
      { title: "机会与风险混在一起", text: "高意向客户、重点商机、订单阻塞、信用风险和回款风险缺少统一优先级。" },
      { title: "过程依赖人工跟进", text: "客户沟通、物料准备、策略建议和跨部门协同主要靠人工经验，复盘和沉淀不足。" }
    ],
    triggers: ["线索评分、商机阶段、报价状态、合同状态或订单履约状态发生变化。", "重点客户长时间无跟进、订单延期、回款承诺未兑现或信用风险上升。", "销售例会、营销活动、客户拜访或经营复盘需要快速生成建议。"],
    inputs: ["客户画像", "商机阶段", "沟通记录", "报价记录", "订单状态", "回款记录"],
    outputs: ["客户行动建议", "优先级清单", "跟进任务", "风险提示", "经营复盘摘要"],
    humanControls: ["确认报价策略", "承诺交期", "调整客户政策", "批准信用或回款处置"],
    kpis: ["线索转化率提升", "销售跟进遗漏下降", "订单阻塞处理时长缩短", "客户响应速度提升"],
    pilot: "建议先选择一个区域销售团队、一个重点产品线或一批 Top 客户，运行 4 周并跟踪转化与响应指标。"
  },
  delivery: {
    subject: "制造执行、质量、设备、工艺与交付保障流程",
    stakeholders: "生产计划、车间主任、质量工程师、设备工程师和交付负责人",
    painPoints: [
      { title: "现场异常发现晚", text: "质量、设备、物料、工艺和人员操作异常往往依赖人工巡检，不能稳定提前预警。" },
      { title: "原因追溯成本高", text: "工单、批次、设备、工艺参数、物料和人员记录分散，定位根因需要多系统切换。" },
      { title: "经验难以复制", text: "排产、替代、维保、质检和 SOP 判断依赖资深人员，新人和跨班组协同效率不稳定。" }
    ],
    triggers: ["工单开工、关键工序完工、首检巡检、设备状态或交付节点发生变化。", "节拍、良率、缺陷率、停机、缺料或 SOP 执行偏差超过阈值。", "交期冲突、产能变化、设备风险或质量趋势需要重新评估。"],
    inputs: ["工单批次", "工艺标准", "设备状态", "质量记录", "人员操作记录", "现场事件"],
    outputs: ["异常诊断", "拦截或调整建议", "责任任务", "风险趋势", "改善复盘"],
    humanControls: ["确认停线或放行", "批准工艺变更", "确认维修计划", "判定质量处置"],
    kpis: ["异常响应时长缩短", "一次交付达成率提升", "质量缺陷闭环时长下降", "现场问题重复发生率下降"],
    pilot: "建议先选择一条产线、一个关键工位或一个高频异常类型，以 2-4 周为周期验证模型准确性和现场闭环质量。"
  },
  "supply-chain": {
    subject: "需求、库存、计划、履约与供应风险管理流程",
    stakeholders: "供应链计划、采购计划、生产计划、物流和业务运营负责人",
    painPoints: [
      { title: "计划变化传导慢", text: "需求、库存、在途、产能和供应商交付变化频繁，人工同步容易滞后。" },
      { title: "风险暴露不够前置", text: "缺件、库存积压、订单延误和供应风险常在执行阶段才集中暴露。" },
      { title: "跨部门动作不闭环", text: "计划建议、采购执行、生产调整和物流安排缺少统一的责任追踪。" }
    ],
    triggers: ["需求预测、客户订单、库存水位、在途采购或生产计划发生变化。", "齐套率、库存周转、安全库存、交付周期或供应风险超过阈值。", "计划例会、订单巡检或供应异常需要快速形成调整方案。"],
    inputs: ["需求计划", "库存快照", "在途记录", "供应商交期", "订单优先级", "计划规则"],
    outputs: ["风险清单", "计划调整建议", "补货或调拨建议", "催办任务", "履约预测"],
    humanControls: ["批准计划调整", "确认供应商切换", "释放采购或调拨指令", "调整客户交付承诺"],
    kpis: ["缺料提前预警率提升", "库存周转改善", "交付周期缩短", "计划调整响应时长下降"],
    pilot: "建议先选择一个产品族、一个仓库或一组关键物料，覆盖预测、库存、计划与执行联动的完整链路。"
  },
  procurement: {
    subject: "寻源、询价、采购执行、对账、发票与供应商管理流程",
    stakeholders: "采购经理、品类经理、采购执行、财务应付和供应商管理团队",
    painPoints: [
      { title: "供应商信息不透明", text: "价格、资质、交付、质量、风险和历史绩效分散管理，影响采购决策质量。" },
      { title: "执行过程依赖人工", text: "询价、比价、下单、催交、对账和发票处理存在大量重复录入与人工判断。" },
      { title: "风险与价值难量化", text: "异常报价、供应延期、质量波动和成本机会需要更系统的证据链支撑。" }
    ],
    triggers: ["请购、寻源、询价、报价、采购订单、到货、发票或付款状态发生变化。", "价格偏离、交付延期、资质过期、质量异常或供应商绩效下降。", "采购策略、定标审批、供应商评估或月度对账需要形成结构化依据。"],
    inputs: ["供应商档案", "采购申请", "历史价格", "报价记录", "合同条款", "到货与发票记录"],
    outputs: ["候选供应商建议", "价格或条款分析", "执行催办", "异常差异说明", "供应商改进建议"],
    humanControls: ["确认供应商准入", "批准定标", "释放采购订单", "确认付款或争议处理"],
    kpis: ["采购周期缩短", "人工录入错误减少", "供应商准时交付率提升", "价格异常识别率提升"],
    pilot: "建议先选择一个品类、一个供应商群或一类高频采购交易，覆盖从请求到执行闭环的关键数据。"
  },
  mdm: {
    subject: "主数据标准、采集、审核、质量监控与治理闭环",
    stakeholders: "数据治理负责人、主数据管理员、业务数据专员和系统负责人",
    painPoints: [
      { title: "标准落地困难", text: "编码、命名、分类、属性和生命周期规则多靠人工理解，执行一致性不足。" },
      { title: "源头质量不可控", text: "物料、客户、供应商等主数据创建时字段缺失、重复和分类错误难以及时拦截。" },
      { title: "治理效果难追踪", text: "整改任务、质量指标、问题责任和治理收益缺少持续化看板。" }
    ],
    triggers: ["新建、变更、停用或批量导入主数据。", "完整性、唯一性、准确性、一致性或活跃度指标低于阈值。", "治理例会、审计检查或系统集成前需要评估数据质量。"],
    inputs: ["主数据标准", "编码规则", "属性模板", "历史主数据", "审批记录", "质量规则"],
    outputs: ["字段补全建议", "重复疑似清单", "合规审核意见", "数据健康报告", "整改任务"],
    humanControls: ["批准主数据创建", "确认合并或停用", "变更核心编码规则", "发布治理标准"],
    kpis: ["主数据一次通过率提升", "重复数据下降", "字段完整率提升", "整改闭环时长缩短"],
    pilot: "建议先选择物料、客户或供应商中的一个主数据对象，覆盖创建、审核、监控和整改闭环。"
  },
  hr: {
    subject: "招聘、入职、培训、绩效与员工服务流程",
    stakeholders: "HRBP、招聘负责人、培训运营、绩效经理和员工服务团队",
    painPoints: [
      { title: "HR 服务重复度高", text: "制度问答、材料准备、候选人沟通和培训安排占用大量事务性时间。" },
      { title: "评价标准不一致", text: "招聘、面试、培训和绩效过程中，不同管理者对证据和标准理解不完全一致。" },
      { title: "人才数据沉淀不足", text: "候选人、员工能力、学习行为和绩效证据分散，难以支持组织洞察。" }
    ],
    triggers: ["岗位发布、候选人进入面试、员工入职、课程学习或绩效评审节点到达。", "员工咨询量上升、培训测评异常、评价文本证据不足或绩效分布偏离。", "HR 需要生成候选人报告、培训计划、制度答复或校准提示。"],
    inputs: ["岗位要求", "候选人资料", "员工档案", "制度知识库", "学习记录", "绩效目标"],
    outputs: ["结构化评估", "问答与办理指引", "培训建议", "绩效校准提示", "员工服务记录"],
    humanControls: ["录用决策", "薪酬与岗位调整", "绩效最终评级", "员工关系敏感处理"],
    kpis: ["HR 事务响应时长缩短", "候选人评估一致性提升", "员工咨询自助解决率提升", "培训完成与掌握率提升"],
    pilot: "建议先选择招聘、员工服务或培训中的一个高频流程，明确人工审批点后再扩展到更多 HR 场景。"
  },
  legal: {
    subject: "合同审核、制度问答、合规审查与风险处置流程",
    stakeholders: "法务、合规、销售、采购和业务审批负责人",
    painPoints: [
      { title: "风险识别前置不足", text: "合同和业务材料常在流程后段才进入法务，导致返工和沟通成本高。" },
      { title: "条款与制度比对耗时", text: "付款、违约、保密、责任限制、授权和合规要求需要人工逐项检查。" },
      { title: "版本和意见难追踪", text: "多轮文档修改、审批意见和业务确认点分散，影响审查质量和审计留痕。" }
    ],
    triggers: ["合同、制度、审批材料或特殊交易事项提交。", "金额、责任、保密、授权、交付、处罚或监管要求触发高风险规则。", "业务需要生成合规意见、风险摘要或条款修改建议。"],
    inputs: ["合同文件", "制度条款", "审批规则", "交易背景", "历史版本", "风险案例库"],
    outputs: ["风险标注", "修改建议", "合规意见草稿", "版本差异", "业务确认问题"],
    humanControls: ["正式法律意见", "重大风险豁免", "合同签署", "争议处理方案"],
    kpis: ["初审周期缩短", "高风险条款漏检率下降", "业务退回次数减少", "审查意见可追溯率提升"],
    pilot: "建议先选择标准合同、制度问答或常见审批事项，限制在中低风险范围内做法务复核闭环。"
  },
  analytics: {
    subject: "经营指标、利润、预算、预测与归因分析流程",
    stakeholders: "经营管理层、财务分析、销售运营、供应链计划和业务负责人",
    painPoints: [
      { title: "指标解释成本高", text: "收入、毛利、费用、库存、预算和预测数据分布在不同口径中，业务追问难以快速回答。" },
      { title: "归因链路不清", text: "经营波动背后往往涉及产品、客户、区域、价格、成本和资源配置多重因素。" },
      { title: "分析到行动断层", text: "报表能发现问题，但缺少可执行建议、责任分派和后续跟踪。" }
    ],
    triggers: ["经营指标偏离预算、预测或历史趋势。", "管理层发起自然语言问数、经营复盘或专题分析。", "产品、客户、区域、渠道或成本要素出现异常波动。"],
    inputs: ["经营指标", "预算与预测", "订单与收入", "成本费用", "客户与产品维度", "历史趋势"],
    outputs: ["指标解释", "归因拆解", "经营建议", "风险机会清单", "复盘摘要"],
    humanControls: ["确认经营口径", "批准资源调整", "发布正式经营结论", "确定行动负责人"],
    kpis: ["问数响应时间缩短", "经营归因准确率提升", "复盘准备时间下降", "建议转行动比例提升"],
    pilot: "建议先选择一个经营主题，例如毛利、库存或预算偏差，接入核心指标并沉淀标准归因路径。"
  },
  service: {
    subject: "客户咨询、工单、售后质量、客诉与客户之声闭环",
    stakeholders: "客服主管、售后工程师、质量团队、产品团队和客户成功团队",
    painPoints: [
      { title: "问题入口分散", text: "官网、公众号、企微、电话、工单和售后现场反馈分散，统一识别和分派困难。" },
      { title: "跨部门闭环慢", text: "复杂客诉常涉及客服、售后、质量、产品和物流，责任和进度难追踪。" },
      { title: "客户声音沉淀不足", text: "投诉、咨询和回访文本没有稳定转化为质量改进、产品优化和运营建议。" }
    ],
    triggers: ["客户咨询、投诉、售后工单、回访评价或质量图片进入系统。", "工单超时、投诉升级、缺陷频发或客户满意度下降。", "需要按产品、批次、渠道或区域分析客户问题趋势。"],
    inputs: ["客户咨询", "工单记录", "产品信息", "售后图片", "质量记录", "回访评价"],
    outputs: ["意图识别", "派单建议", "处理摘要", "质量判定", "客户痛点主题", "改进建议"],
    humanControls: ["复杂投诉处理", "赔付或换货决策", "质量最终判定", "客户正式回复"],
    kpis: ["一次解决率提升", "工单处理时长缩短", "投诉升级率下降", "客户问题主题识别率提升"],
    pilot: "建议先选择一个服务渠道或一类高频客诉，验证自动分派、摘要和质量反馈闭环。"
  },
  default: {
    subject: "企业核心业务流程",
    stakeholders: "业务负责人、流程负责人和系统管理员",
    painPoints: [
      { title: "流程信息分散", text: "业务数据、规则和执行状态分散在多个系统，人工判断成本高。" },
      { title: "异常处理滞后", text: "关键问题往往在后段才暴露，影响流程效率和管理可控性。" },
      { title: "闭环追踪不足", text: "建议、任务、处理结果和审计记录缺少统一沉淀。" }
    ],
    triggers: ["核心业务状态发生变化。", "指标、规则或时间节点触发预警。", "业务团队需要生成分析、建议或执行任务。"],
    inputs: ["业务数据", "规则库", "审批记录", "系统日志"],
    outputs: ["异常清单", "分析说明", "处理建议", "责任任务"],
    humanControls: ["批准关键业务动作", "确认规则变更", "发布正式结论"],
    kpis: ["处理周期缩短", "人工操作减少", "异常闭环率提升", "审计可追溯率提升"],
    pilot: "建议先选择一个边界清晰、数据可获得的流程节点进行小范围验证。"
  }
};

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

categories.forEach((category) => {
  category.agents.forEach((agentItem) => {
    agentItem.details = detailedAgentProfiles[agentItem.name] || agentItem.details || buildAgentProfile(agentItem, category);
  });
});

function agent(name, summary, scenario, impact, systems, tone, details = null) {
  return {
    name,
    summary,
    scenario,
    impact,
    systems,
    tone,
    details,
    function: summary,
    tags: systems.slice(0, 3)
  };
}

function buildAgentProfile(item, category) {
  const guide = categoryDetailGuides[category.id] || categoryDetailGuides.default;
  const focusName = item.name.replace(/ Agent|机器人|助手|智能体/g, "").trim() || item.name;
  const systemsText = item.systems.join("、") || "核心业务系统";
  const scenario = trimPeriod(item.scenario);
  const summary = trimPeriod(item.summary);
  const impact = trimPeriod(item.impact);

  return {
    overview: `${item.name} 面向${category.tab}中的${guide.subject}，重点处理“${focusName}”相关的高频业务判断、异常识别和跨系统协同。它以${systemsText}为主要数据基础，将业务规则、历史记录和流程状态组织成可追踪的工作流，帮助${guide.stakeholders}把“发现问题”推进到“解释原因、建议动作、闭环复盘”。`,
    painPoints: [
      { title: guide.painPoints[0].title, text: `${guide.painPoints[0].text} 在${item.name}场景下，典型表现是${summary}。` },
      { title: guide.painPoints[1].title, text: `${guide.painPoints[1].text} ${scenario}时，如果没有自动识别和规则校验，容易造成响应滞后。` },
      { title: guide.painPoints[2].title, text: `${guide.painPoints[2].text} Agent 需要把判断依据、责任人、处理动作和结果留痕，支撑后续审计和复盘。` }
    ],
    triggers: uniqueList([
      guide.triggers[0],
      `${category.tab}流程中出现与“${focusName}”相关的待处理事项，且需要跨${systemsText}核对数据。`,
      `${scenario}，需要自动生成判断依据、优先级和建议动作。`,
      guide.triggers[1],
      guide.triggers[2]
    ]).slice(0, 5),
    workflow: [
      `同步${systemsText}中的业务对象、流程状态、附件和历史处理记录。`,
      `抽取与“${focusName}”相关的关键字段，校验数据完整性、时效性和口径一致性。`,
      `结合${category.tab}规则、历史案例和当前上下文，识别异常、机会或需要人工确认的事项。`,
      `按影响范围、紧急程度、金额或交付风险进行优先级排序，并生成可解释的原因说明。`,
      `向${guide.stakeholders}推送处理建议、责任人任务和需要补充的信息。`,
      `回写处理结果、证据链和复盘结论，形成可审计、可持续优化的运营闭环。`
    ],
    inputs: uniqueList([
      ...item.systems.map((system) => `${system}数据`),
      ...guide.inputs,
      "业务规则库",
      "流程审批记录",
      "历史处理样本"
    ]).slice(0, 8),
    outputs: uniqueList([
      `${focusName}分析结果`,
      `${focusName}处理建议`,
      ...guide.outputs,
      "责任人任务",
      "复盘与审计记录"
    ]).slice(0, 8),
    humanControls: guide.humanControls,
    kpis: uniqueList([
      impact,
      ...guide.kpis
    ]).slice(0, 6),
    pilot: `${guide.pilot} 试点时建议围绕“${item.name}”先固化 3-5 条高频触发规则、2-3 个明确人工确认点和一组可量化指标，再逐步扩展到更多组织与流程。`
  };
}

function trimPeriod(value) {
  return String(value || "").replace(/[。.!！]+$/g, "");
}

function uniqueList(values) {
  return [...new Set(values.filter(Boolean))];
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

const state = { categoryId: categories[0].id, query: "" };
const tabs = document.getElementById("tabs");
const grid = document.getElementById("agentGrid");
const panelKicker = document.getElementById("panelKicker");
const panelTitle = document.getElementById("panelTitle");
const panelDescription = document.getElementById("panelDescription");
const agentSearch = document.getElementById("agentSearch");
const modal = document.getElementById("agentModal");
const modalClose = document.getElementById("modalClose");
const demoModal = document.getElementById("demoModal");
const demoModalClose = document.getElementById("demoModalClose");
const demoModalContent = document.getElementById("demoModalContent");
let pendingDemo = null;

function renderTabs() {
  tabs.innerHTML = categories.map((category) => `
    <button class="tab" type="button" role="tab" aria-selected="${category.id === state.categoryId}" data-category="${category.id}">${category.tab}</button>
  `).join("");
}

function renderPanel() {
  const category = categories.find((item) => item.id === state.categoryId) || categories[0];
  const query = state.query.trim().toLowerCase();
  const isDiscoveryMode = Boolean(query);
  const agents = isDiscoveryMode ? filteredAgents(query) : category.agents.map((item, originalIndex) => ({ item, category, originalIndex }));

  if (isDiscoveryMode) {
    panelKicker.textContent = "全局搜索";
    panelTitle.textContent = `找到 ${agents.length} 个匹配方案`;
    panelDescription.textContent = discoveryDescription();
  } else {
    panelKicker.textContent = `${category.tab}业务域`;
    panelTitle.textContent = category.title;
    panelDescription.textContent = category.description;
  }

  grid.innerHTML = agents.length ? agents.map(({ item, category, originalIndex }) => cardTemplate(item, category, originalIndex, isDiscoveryMode)).join("") : emptyTemplate();
}

function filteredAgents(query) {
  return categories.flatMap((category) => category.agents.map((item, originalIndex) => ({ item, category, originalIndex }))).filter(({ item, category }) => {
    const haystack = [category.tab, category.title, item.name, item.summary, item.scenario, item.impact, item.systems.join(" "), searchableDetails(item.details)].join(" ").toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    return matchesQuery;
  });
}

function discoveryDescription() {
  const fragments = [];
  if (state.query.trim()) fragments.push(`关键词“${state.query.trim()}”`);
  return fragments.length ? `已按 ${fragments.join("、")} 搜索，结果覆盖所有业务板块。` : "跨财务、销售、制造、供应链、采购、主数据等板块统一搜索业务方案、场景、系统连接和业务成效。";
}

function cardTemplate(item, category, index, showDomain) {
  const domainLabel = category.tab;
  const systemLabel = item.systems[0] || "核心系统";
  const agentKey = `${category.id}:${index}`;
  return `
    <article class="agent-card" tabindex="0" data-agent="${agentKey}" aria-label="查看${visibleText(item.name)}详情">
      <div class="agent-card-body">
        <div class="agent-head">
          <span class="agent-domain-tag">${domainLabel}</span>
          <span class="agent-system-chip">${systemLabel}</span>
        </div>
        <h4>${visibleText(item.name)}</h4>
        <p class="agent-summary">${visibleText(item.summary)}</p>
        <div class="agent-meta">${item.tags.map((tag) => `<span>${tag}</span>`).join("")}</div>
        <div class="card-actions">
          <span class="card-link">查看方案详情</span>
          <button class="demo-action" type="button" data-demo-agent="${agentKey}">演示</button>
        </div>
      </div>
    </article>
  `;
}

function emptyTemplate() {
  return `<div class="empty-state"><h4>没有匹配结果</h4><p>换一个关键词试试，例如“月结”“合同”“巡检”“招聘”。</p></div>`;
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
      <text x="50%" y="${large ? "55%" : "63%"}" text-anchor="middle" fill="${primary}" font-size="${smallSize}" font-weight="800">${domain} · 业务智能体</text>
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

  const valueLabel = resolveValueLabel(item);
  document.getElementById("modalVisual").innerHTML = modalVisualTemplate(item, category, valueLabel);
  modal.querySelector(".modal-content").innerHTML = detailTemplate(item, category);
  modal.showModal();
  document.body.classList.add("modal-open");
}

function resolveAgentByKey(key) {
  const [categoryId, indexText] = key.split(":");
  const category = categories.find((entry) => entry.id === categoryId);
  const index = Number(indexText);
  const item = category?.agents[index];
  if (!category || !item || Number.isNaN(index)) return null;
  return { category, item, index, agentId: `${category.id}:${index}` };
}

function demoPayload(selection) {
  return {
    agentId: selection.agentId,
    categoryId: selection.category.id,
    categoryName: selection.category.tab,
    agentName: selection.item.name,
    summary: selection.item.summary,
    scenario: selection.item.scenario,
    impact: selection.item.impact,
    systems: selection.item.systems
  };
}

async function openDemoDialog(key) {
  const selection = resolveAgentByKey(key);
  if (!selection) return;
  pendingDemo = selection;
  demoModalContent.innerHTML = demoConfirmTemplate(selection, null, true);
  demoModal.showModal();
  document.body.classList.add("modal-open");

  try {
    const status = await fetch(`/api/agent-demos/status?agentId=${encodeURIComponent(selection.agentId)}`).then((response) => response.json());
    if (!pendingDemo || pendingDemo.agentId !== selection.agentId) return;
    demoModalContent.innerHTML = demoConfirmTemplate(selection, status.data, false);
  } catch {
    if (!pendingDemo || pendingDemo.agentId !== selection.agentId) return;
    demoModalContent.innerHTML = demoConfirmTemplate(selection, null, false, "暂时无法检查已有演示，可直接重新生成。", "warn");
  }
}

function demoConfirmTemplate(selection, status, loading, message = "", messageType = "") {
  const exists = Boolean(status?.exists);
  const systems = selection.item.systems.slice(0, 5);
  return `
    <div class="demo-dialog-head">
      <p class="modal-domain">${selection.category.tab}板块</p>
      <h2 id="demoModalTitle">${exists ? "查看或重新生成演示" : "生成智能体演示"}</h2>
      <p>${visibleText(selection.item.name)} 将生成一个包含 Interactive Demo、Architecture 和 Agent Details 的可分享演示页。</p>
    </div>
    <div class="demo-profile">
      <strong>${visibleText(selection.item.name)}</strong>
      <p>${visibleText(selection.item.summary)}</p>
      <div class="modal-tags">${systems.map((system) => `<span>${visibleText(system)}</span>`).join("")}</div>
    </div>
    <div class="demo-flow-preview">
      <span>1. 拆解业务任务</span>
      <span>2. 生成子 Agent</span>
      <span>3. 编排协作流程</span>
      <span>4. 保存演示页面</span>
    </div>
    ${loading ? `<p class="demo-message">正在检查是否已有演示...</p>` : ""}
    ${message ? `<p class="demo-message ${messageType}">${message}</p>` : ""}
    ${exists ? `<p class="demo-message">已存在演示，更新时间：${status.updatedAt || "未知"}。重新生成会覆盖原内容。</p>` : `<p class="demo-message">尚未生成演示。生成完成后会自动跳转到固定演示页。</p>`}
    <div class="demo-dialog-actions">
      ${exists ? `<a class="demo-secondary" href="${status.demoUrl}">查看已有演示</a>` : ""}
      <button class="demo-primary" type="button" id="demoGenerateButton">${exists ? "重新生成并覆盖" : "生成演示"}</button>
    </div>
  `;
}

function demoGeneratingTemplate(selection, currentStep) {
  const steps = ["正在拆解业务任务", "正在生成子 Agent", "正在编排协作流程", "正在保存演示页面"];
  return `
    <div class="demo-dialog-head">
      <p class="modal-domain">${selection.category.tab}板块</p>
      <h2 id="demoModalTitle">正在生成演示</h2>
      <p>${visibleText(selection.item.name)} 的动态演示正在生成，请稍候。</p>
    </div>
    <div class="demo-progress-list">
      ${steps.map((step, index) => `<div class="demo-progress-item ${index <= currentStep ? "active" : ""}"><span>${index + 1}</span><strong>${step}</strong></div>`).join("")}
    </div>
  `;
}

async function generatePendingDemo() {
  if (!pendingDemo) return;
  const selection = pendingDemo;
  let progress = 0;
  demoModalContent.innerHTML = demoGeneratingTemplate(selection, progress);
  const timer = setInterval(() => {
    progress = Math.min(progress + 1, 3);
    demoModalContent.innerHTML = demoGeneratingTemplate(selection, progress);
  }, 420);

  try {
    const response = await fetch("/api/agent-demos/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(demoPayload(selection))
    });
    const result = await response.json();
    if (!response.ok || !result.success) throw new Error(result.error || "生成失败");
    clearInterval(timer);
    window.location.href = result.data.demoUrl;
  } catch (error) {
    clearInterval(timer);
    demoModalContent.innerHTML = demoConfirmTemplate(selection, null, false, `生成失败：${error.message}`, "error");
  }
}

function resolveValueLabel(item) {
  return valueFilters.find((filter) => filter.terms.some((term) => [item.summary, item.scenario, item.impact].join(" ").includes(term)))?.label || "效率提升";
}

function modalVisualTemplate(item, category, valueLabel) {
  const topSystems = item.systems.slice(0, 3);
  return `
    <div class="modal-hero-panel">
      <p class="modal-visual-kicker">实施概览</p>
      <h3>${visibleText(item.name)}</h3>
      <p>${visibleText(item.scenario)}</p>
      <div class="modal-kpi-grid">
        <article>
          <span>所属板块</span>
          <strong>${category.tab}</strong>
        </article>
        <article>
          <span>价值方向</span>
          <strong>${valueLabel}</strong>
        </article>
        <article>
          <span>关键系统</span>
          <strong>${topSystems.join(" / ") || "核心系统"}</strong>
        </article>
      </div>
      <div class="modal-system-list">
        ${topSystems.map((system) => `<span>${visibleText(system)}</span>`).join("")}
      </div>
    </div>
  `;
}

function detailTemplate(item, category) {
  const relatedAgents = category.agents.filter((agentItem) => agentItem !== item).slice(0, 3);
  const valueLabel = resolveValueLabel(item);
  const detailContent = item.details ? detailedProfileTemplate(item, category, valueLabel) : standardProfileTemplate(item, category, valueLabel);
  return `
    <div class="detail-hero">
      <p class="modal-domain">${category.tab}板块</p>
      <h2 id="modalTitle">${visibleText(item.name)}</h2>
      <p>${visibleText(item.summary)}</p>
      <div class="modal-tags">
        <span>业务智能体</span>
        <span>场景方案</span>
        <span>${category.tab}</span>
        <span>${valueLabel}</span>
      </div>
    </div>

    ${detailContent}

    <section class="detail-section related-section">
      <h3>关联能力</h3>
      <div class="related-list">
        ${relatedAgents.map((agentItem) => `<article><strong>${visibleText(agentItem.name)}</strong><p>${visibleText(agentItem.summary)}</p></article>`).join("")}
      </div>
    </section>
  `;
}

function standardProfileTemplate(item, category, valueLabel) {
  const valueCards = businessValueCards(item, category, item.details, valueLabel).slice(0, 5);
  return `
    <nav class="detail-nav" aria-label="详情分区">
      <a href="#overview">能力概览</a>
      <a href="#benefits">核心收益</a>
      <a href="#business-value">业务价值</a>
      <a href="#additional-info">补充说明</a>
      <a href="#required-assets">所需资产</a>
    </nav>

    <section class="detail-section" id="overview">
      <h3>能力概览</h3>
      <p>${visibleText(item.name)} 面向${category.tab}场景，${visibleText(item.scenario)} 它将业务数据、规则校验和智能分析组织成可追踪的工作流，帮助团队从人工查找问题转向主动预警与闭环处理。</p>
    </section>

    <section class="detail-section" id="benefits">
      <h3>核心收益</h3>
      <div class="benefit-list">
        <article>
          <strong>降低人工处理负担</strong>
          <p>${visibleText(item.function)}</p>
        </article>
        <article>
          <strong>提升流程透明度</strong>
          <p>围绕${item.systems.join("、")}等系统沉淀事件、责任人、处理状态和审计记录。</p>
        </article>
        <article>
          <strong>形成可执行建议</strong>
          <p>${visibleText(item.impact)}</p>
        </article>
      </div>
    </section>

    <section class="detail-section" id="business-value">
      <h3>业务价值</h3>
      <div class="value-grid metric-grid">
        ${valueCards.map((card) => valueCardTemplate(card)).join("")}
      </div>
    </section>

    <section class="detail-section" id="additional-info">
      <h3>补充说明</h3>
      <dl class="info-list">
        <div><dt>能力类型</dt><dd>企业流程智能体</dd></div>
        <div><dt>协同系统</dt><dd>${item.systems.join("、")}</dd></div>
        <div><dt>适用行业</dt><dd>制造、零售、贸易、集团型企业</dd></div>
        <div><dt>接入前提</dt><dd>具备可用业务数据接口或可导出数据源</dd></div>
      </dl>
    </section>

    <section class="detail-section" id="required-assets">
      <h3>所需资产</h3>
      <div class="asset-list">
        ${item.systems.map((system) => `<span>${system}</span>`).join("")}
        <span>业务规则库</span>
        <span>流程审批节点</span>
        <span>审计日志</span>
      </div>
    </section>
  `;
}

function detailedProfileTemplate(item, category, valueLabel) {
  const details = item.details;
  const valueCards = businessValueCards(item, category, details, valueLabel).slice(0, 7);
  return `
    <nav class="detail-nav" aria-label="详情分区">
      <a href="#pain-points">业务痛点</a>
      <a href="#triggers">触发条件</a>
      <a href="#workflow">工作方式</a>
      <a href="#data-assets">输入输出</a>
      <a href="#governance">人工把关</a>
      <a href="#success-metrics">业务价值</a>
    </nav>

    <section class="detail-section" id="pain-points">
      <h3>业务痛点与适用场景</h3>
      <p>${visibleText(details.overview)}</p>
      <div class="detail-list detailed-list">
        ${richList(details.painPoints)}
      </div>
    </section>

    <section class="detail-section" id="triggers">
      <h3>什么时候触发</h3>
      <ul class="signal-list">
        ${details.triggers.map((trigger) => `<li>${visibleText(trigger)}</li>`).join("")}
      </ul>
    </section>

    <section class="detail-section" id="workflow">
      <h3>智能体如何工作</h3>
      <ol class="workflow-list">
        ${details.workflow.map((step) => `<li>${visibleText(step)}</li>`).join("")}
      </ol>
    </section>

    <section class="detail-section" id="data-assets">
      <h3>输入数据与输出结果</h3>
      <div class="detail-split">
        <article>
          <h4>需要接入的数据</h4>
          <div class="asset-list">${details.inputs.map((input) => `<span>${visibleText(input)}</span>`).join("")}</div>
        </article>
        <article>
          <h4>交付给业务的结果</h4>
          <div class="asset-list">${details.outputs.map((output) => `<span>${visibleText(output)}</span>`).join("")}</div>
        </article>
      </div>
    </section>

    <section class="detail-section" id="governance">
      <h3>人工把关与安全边界</h3>
      <p>智能体负责识别、解释、建议和催办，以下动作保留人工确认，避免自动化越权。</p>
      <ul class="signal-list control-list">
        ${details.humanControls.map((control) => `<li>${visibleText(control)}</li>`).join("")}
      </ul>
    </section>

    <section class="detail-section" id="success-metrics">
      <h3>业务价值</h3>
      <div class="value-grid metric-grid">
        ${valueCards.map((card) => valueCardTemplate(card)).join("")}
      </div>
    </section>
  `;
}

function valueCardTemplate(card) {
  return `<div><strong>${visibleText(card.title)}</strong><p>${visibleText(card.text)}</p></div>`;
}

function businessValueCards(item, category, details, valueLabel) {
  const metrics = uniqueList((details?.kpis?.length ? details.kpis : [item.impact]).map((metric) => trimPeriod(metric))).slice(0, 5);
  return [
    {
      title: valueLabel,
      text: `${visibleText(item.name)}聚焦${category.tab}流程中的关键判断和执行断点，把${item.systems.join("、") || "核心业务系统"}里的数据、规则和状态统一起来。业务团队不只看到一个提醒，而是能看到原因、影响对象、建议动作和责任闭环。`
    },
    ...metrics.map((metric) => ({
      title: metric,
      text: metricExplanation(metric, item, category)
    })),
    {
      title: "关键决策保留人工确认",
      text: `${visibleText(item.name)}只负责识别、解释、建议和催办，涉及审批、承诺、放行、付款、法务意见等关键动作仍由负责人确认，既提升效率，也保留管理边界。`
    }
  ];
}

function metricExplanation(metric, item, category) {
  const metricText = visibleText(trimPeriod(metric));
  const name = visibleText(item.name);
  const systemsText = item.systems.join("、") || "核心业务系统";

  if (/周期|时长|时间|秒|分钟|天|响应|缩短|压缩/.test(metricText)) {
    return `这个指标来自等待时间和人工流转的减少。${name}会集中读取${systemsText}中的状态、单据和异常，把原本分散查询、反复催办、人工汇总的动作前置处理，让业务人员更快知道问题在哪里、下一步该由谁处理。`;
  }

  if (/下降|降低|减少|风险|错|漏|异常|逾期|坏账|缺料|停线|过检|漏检/.test(metricText)) {
    return `这个指标说明风险被更早发现并持续闭环。${name}会结合${category.tab}规则、历史记录和当前流程状态，识别异常来源、影响范围和责任节点，减少问题拖到后段才集中处理。`;
  }

  if (/提升|提高|改善|覆盖|准确|准时|通过率|一致性|可追溯|兑现率|识别率/.test(metricText)) {
    return `这个指标体现质量、准确性或覆盖面的提升。${name}把${systemsText}中的数据与业务规则统一校验，沉淀可复用的判断依据，减少不同人员凭经验处理造成的波动。`;
  }

  return `这个指标用于衡量${name}是否真正改善${category.tab}流程。通过持续记录输入、判断依据、处理动作和结果，团队可以把单次提醒沉淀为可复盘、可审计、可优化的运营能力。`;
}

function visibleText(value) {
  return String(value || "")
    .replace(/AI\s*Agent/g, "AI智能体")
    .replace(/\s*Agent\b/g, "智能体")
    .replace(/\bBeta\b/g, "试用版")
    .replace(/\bPOC\b/g, "概念验证")
    .replace(/\bKPI\b/g, "指标")
    .replace(/\bHR\b/g, "人力资源")
    .replace(/\bJD\b/g, "岗位说明书")
    .replace(/\bNLP\b/g, "自然语言处理")
    .replace(/\bTop\b/g, "重点")
    .replace(/\bWeb\b/g, "网络");
}

function richList(items) {
  return items.map((entry) => {
    if (typeof entry === "string") return `<article><p>${visibleText(entry)}</p></article>`;
    return `<article><strong>${visibleText(entry.title)}</strong><p>${visibleText(entry.text)}</p></article>`;
  }).join("");
}

function searchableDetails(details) {
  if (!details) return "";
  return Object.values(details).flatMap((value) => {
    if (Array.isArray(value)) {
      return value.map((entry) => typeof entry === "string" ? entry : [entry.title, entry.text].join(" "));
    }
    return typeof value === "string" ? [value] : [];
  }).join(" ");
}

tabs.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-category]");
  if (!button) return;
  state.categoryId = button.dataset.category;
  state.query = "";
  agentSearch.value = "";
  renderTabs();
  renderPanel();
});

grid.addEventListener("click", (event) => {
  const demoButton = event.target.closest("button[data-demo-agent]");
  if (demoButton) {
    event.stopPropagation();
    openDemoDialog(demoButton.dataset.demoAgent);
    return;
  }
  const card = event.target.closest(".agent-card");
  if (card) openAgent(card.dataset.agent);
});

grid.addEventListener("keydown", (event) => {
  if (event.key !== "Enter" && event.key !== " ") return;
  const card = event.target.closest(".agent-card");
  if (!card || event.target.closest("button")) return;
  event.preventDefault();
  openAgent(card.dataset.agent);
});

agentSearch.addEventListener("input", (event) => {
  state.query = event.target.value;
  renderPanel();
});

modalClose.addEventListener("click", () => modal.close());
modal.addEventListener("click", (event) => {
  if (event.target === modal) modal.close();
});
modal.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
});

demoModalClose.addEventListener("click", () => demoModal.close());
demoModal.addEventListener("click", (event) => {
  if (event.target === demoModal) demoModal.close();
});
demoModal.addEventListener("close", () => {
  document.body.classList.remove("modal-open");
  pendingDemo = null;
});
demoModal.addEventListener("click", (event) => {
  const generateButton = event.target.closest("#demoGenerateButton");
  if (generateButton) generatePendingDemo();
});

renderTabs();
renderPanel();

/* ===== MCP Client Layer ===== */
const MCP = {
  panelOpen: false,
  servers: [],
  tools: [],

  async init() {
    const btn = document.getElementById('mcpBtn');
    const overlay = document.getElementById('mcpPanelOverlay');
    const panel = document.getElementById('mcpPanel');
    const closeBtn = document.getElementById('mcpPanelClose');

    if (btn) btn.addEventListener('click', () => MCP.togglePanel());
    if (overlay) overlay.addEventListener('click', () => MCP.closePanel());
    if (closeBtn) closeBtn.addEventListener('click', () => MCP.closePanel());

    const addForm = document.getElementById('mcpAddForm');
    if (addForm) addForm.addEventListener('submit', (e) => { e.preventDefault(); MCP.addServer(); });

    await MCP.refreshStatus();
  },

  togglePanel() {
    this.panelOpen = !this.panelOpen;
    const overlay = document.getElementById('mcpPanelOverlay');
    const panel = document.getElementById('mcpPanel');
    if (overlay) overlay.classList.toggle('open', this.panelOpen);
    if (panel) panel.classList.toggle('open', this.panelOpen);
    if (this.panelOpen) this.refreshStatus();
  },

  closePanel() {
    this.panelOpen = false;
    const overlay = document.getElementById('mcpPanelOverlay');
    const panel = document.getElementById('mcpPanel');
    if (overlay) overlay.classList.remove('open');
    if (panel) panel.classList.remove('open');
  },

  async refreshStatus() {
    try {
      const res = await fetch('/api/mcp/status');
      const data = await res.json();
      this.servers = data.servers || [];
      this.tools = data.tools || [];
      this.renderServers();
      this.renderTools();
      this.updateDot();
    } catch (err) {
      console.error('MCP status fetch failed:', err);
    }
  },

  updateDot() {
    const dot = document.querySelector('#mcpBtn .dot');
    if (!dot) return;
    const connected = this.servers.filter(s => s.status === 'connected').length;
    const errored = this.servers.filter(s => s.status === 'error').length;
    dot.className = 'dot' + (errored > 0 ? ' warn' : connected > 0 ? '' : ' off');
  },

  renderServers() {
    const container = document.getElementById('mcpServerList');
    if (!container) return;
    if (this.servers.length === 0) {
      container.innerHTML = '<div class="mcp-empty">No MCP servers configured.<br>Add one below to get started.</div>';
      return;
    }
    container.innerHTML = this.servers.map((s, i) => `
      <div class="mcp-server-card">
        <div class="server-header">
          <span class="server-name">${this.esc(s.name)}</span>
          <span class="server-status ${s.status}">${s.status}</span>
        </div>
        <div class="server-url">${this.esc(s.transport)}: ${this.esc(s.url || s.command || '')}</div>
        <div class="server-tools">${s.tool_count ?? 0} tools available</div>
        <div class="server-actions">
          <button class="primary" onclick="MCP.connectServer(${i})">Connect</button>
          <button onclick="MCP.disconnectServer(${i})">Disconnect</button>
          <button onclick="MCP.removeServer(${i})">Remove</button>
        </div>
      </div>
    `).join('');
  },

  renderTools() {
    const container = document.getElementById('mcpToolList');
    if (!container) return;
    if (this.tools.length === 0) {
      container.innerHTML = '<div class="mcp-empty">No tools discovered yet.<br>Connect a server to discover its tools.</div>';
      return;
    }
    container.innerHTML = this.tools.map(t => `
      <div class="mcp-tool-item">
        <div class="tool-name">${this.esc(t.name)}</div>
        <div class="tool-desc">${this.esc(t.description || 'No description')}</div>
        <div class="tool-server">Server: ${this.esc(t.server_name || 'unknown')}</div>
      </div>
    `).join('');
  },

  async addServer() {
    const name = document.getElementById('mcpInputName')?.value?.trim();
    const transport = document.getElementById('mcpInputTransport')?.value;
    const url = document.getElementById('mcpInputUrl')?.value?.trim();
    const command = document.getElementById('mcpInputCommand')?.value?.trim();

    if (!name) return alert('Server name is required');
    if (transport === 'sse' && !url) return alert('URL is required for SSE transport');
    if (transport === 'stdio' && !command) return alert('Command is required for stdio transport');

    try {
      const res = await fetch('/api/mcp/servers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, transport, url, command })
      });
      const data = await res.json();
      if (data.success) {
        document.getElementById('mcpInputName').value = '';
        document.getElementById('mcpInputUrl').value = '';
        document.getElementById('mcpInputCommand').value = '';
        await this.refreshStatus();
      } else {
        alert(data.error || 'Failed to add server');
      }
    } catch (err) {
      alert('Failed to add server: ' + err.message);
    }
  },

  async connectServer(index) {
    const server = this.servers[index];
    if (!server) return;
    try {
      const res = await fetch(`/api/mcp/servers/${encodeURIComponent(server.name)}/connect`, { method: 'POST' });
      const data = await res.json();
      if (!data.success) alert(data.error || 'Connection failed');
      await this.refreshStatus();
    } catch (err) {
      alert('Connect failed: ' + err.message);
    }
  },

  async disconnectServer(index) {
    const server = this.servers[index];
    if (!server) return;
    try {
      const res = await fetch(`/api/mcp/servers/${encodeURIComponent(server.name)}/disconnect`, { method: 'POST' });
      await this.refreshStatus();
    } catch (err) {
      console.error('Disconnect failed:', err);
    }
  },

  async removeServer(index) {
    const server = this.servers[index];
    if (!server) return;
    if (!confirm(`Remove server "${server.name}"?`)) return;
    try {
      const res = await fetch(`/api/mcp/servers/${encodeURIComponent(server.name)}`, { method: 'DELETE' });
      await this.refreshStatus();
    } catch (err) {
      console.error('Remove failed:', err);
    }
  },

  async callTool(serverName, toolName, params) {
    try {
      const res = await fetch('/api/mcp/tools/call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ server_name: serverName, tool_name: toolName, params: params || {} })
      });
      return await res.json();
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  esc(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  }
};

MCP.init();
