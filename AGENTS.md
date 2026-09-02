# 项目规范

## 目录结构

```text
my-tabs/
├─ src/
│  ├─ assets/       # 静态资源
│  ├─ components/   # 通用组件
│  ├─ styles/       # 通用样式
│  ├─ test/         # 自动化测试
│  ├─ utils/        # 通用方法
│  └─ views/        # 视图
└─ manifest.json    # 扩展配置与新标签页入口
```

## 编码与提交

- 所有文本文件必须使用 UTF-8 编码。
- 所有代码注释必须使用中文。

## SVG 资源规范

- SVG 资源只能从 Lucide Icons 获取。
- `getExtensionAsset()` 统一封装 `chrome.runtime.getURL('src/assets/<path>')`。

## 自动化测试规范

- 目录迁移前必须保留并调整既有行为测试，不得因迁移删除测试覆盖。
- 测试按页面或功能组件组织；测试文件应与被测功能的职责对应。
