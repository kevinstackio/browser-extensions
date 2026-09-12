# 子项目规范

## 网站图标

- 网站品牌图标的来源为 [Simple Icons](https://simpleicons.org/)。
- 图标资源仓库为 [simple-icons/simple-icons](https://github.com/simple-icons/simple-icons)。
- `src/assets/brand/` 中的书签图标必须优先从 Simple Icons 查找；不适用于通用功能图标 `src/assets/icons/` 和插件自身图标 `src/assets/logo/`。
- 仅当 Simple Icons 没有对应图标时，才根据用户提供的图片重绘原生 SVG，不直接嵌入或引用位图。
- 重绘 SVG 必须使用 `viewBox="0 0 24 24"`，不写 `width`、`height`；并包含 `role="img"`、可访问的 `<title>` 与一个或多个 `<path>`。
- 书签 SVG 的统一色值为黑色 `#000000`：优先省略 `fill` 以使用 SVG 默认黑色；如需显式声明，必须使用 `fill="#000000"`。不得使用其他色值、渐变、阴影、纹理或透明度效果，并保留小尺寸下可辨识的核心特征。
- 文字类书签 SVG 统一命名为 `text-<书签 id>.svg`（例如 `text-pmi.svg`），文字置于透明 `128×128` 画布中央；允许通过等比或非等比缩放让文字主体更饱满，但不得超出安全边距。
