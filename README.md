# Enterprise Agent Portal

面向企业核心业务板块的 AI Agent 展示门户，覆盖财务、销售与营销、制造与交付、供应链、采购、人力资源、法务合规、客服及售后品质、主数据和经营分析。

## 功能

- 按业务板块浏览企业 Agent 图谱
- 跨全部板块搜索 Agent、场景、业务效果和系统连接
- 以产品化详情页形式查看 Agent 的 Overview、Benefits、Business Value、Additional Information、Required Assets 和相关推荐
- 提供 `/v1/ping` 健康检查端点，便于生产环境探活

## 使用方式

直接在浏览器中打开 `index.html` 即可查看页面；生产或本地服务验证可运行：

```bash
python server.py
```

## 文件结构

- `index.html`：页面结构
- `styles.css`：视觉样式与响应式布局
- `app.js`：Agent 数据、页签交互、全局搜索与产品化详情弹窗
- `server.py`：静态资源服务与健康检查端点
- `v1/ping`：健康检查静态文件
