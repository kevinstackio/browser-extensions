# Telegram Web Save As

一个仅支持 Chrome 和 Edge 的 Manifest V3 扩展：在 Telegram Web 放大图片或视频后，于预览区域右键，点击“另存为…”即可打开系统保存窗口。

## 安装

1. 在 Chrome 打开 `chrome://extensions`，或在 Edge 打开 `edge://extensions`。
2. 启用“开发者模式”。
3. 点击“加载已解压的扩展”，选择本目录 `tg-web-save-as`。
4. 刷新已打开的 Telegram Web 页面。

## 使用

打开一张图片或视频的放大预览，在预览区域右键并点击“另存为…”。取消系统保存窗口不会创建下载。

扩展只请求 `web.telegram.org` 的访问权限；没有工具栏按钮、弹窗、下载列表接管、桌面 App 或第三方站点功能。
