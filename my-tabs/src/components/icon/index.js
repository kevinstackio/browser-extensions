import { getExtensionAsset } from '../../utils/common.js';

const sources = {
  plus: 'icons/plus.svg',
  settings: 'icons/settings.svg',
};

export function createIcon(document, name) {
  const icon = document.createElement('img');

  icon.className = 'context-menu__icon';
  icon.setAttribute('src', getExtensionAsset(sources[name]));
  icon.setAttribute('alt', '');
  icon.setAttribute('aria-hidden', 'true');

  return icon;
}
