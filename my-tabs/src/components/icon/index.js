import { getExtensionAsset } from '../../utils/common.js';

// 菜单图标与静态资源路径的映射关系。
const sources = {
  plus: 'icons/plus.svg',
  settings: 'icons/settings.svg',
};

export function createIcon(document, name) {
  // 统一创建无障碍隐藏的装饰性图标。
  const icon = document.createElement('img');

  icon.className = 'context-menu__icon';
  // 通过公共方法生成扩展内资源的完整地址。
  icon.setAttribute('src', getExtensionAsset(sources[name]));
  icon.setAttribute('alt', '');
  icon.setAttribute('aria-hidden', 'true');

  return icon;
}
