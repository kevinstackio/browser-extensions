import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createPopover } from '../../components/popover/index.js';

class FakeElement {
  constructor(tagName) { this.tagName = tagName; this.children = []; this.attributes = new Map(); this.className = ''; this.listeners = new Map(); this.focused = false; }
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  focus() { this.focused = true; }
}

test('通用 Popover 支持打开、Esc 关闭并恢复触发器焦点', () => {
  const document = { createElement: (tagName) => new FakeElement(tagName) };
  const trigger = new FakeElement('button');
  const content = new FakeElement('ul');
  const popover = createPopover(document, trigger, content);

  popover.open();
  assert.equal(popover.element.attributes.get('hidden'), undefined);
  assert.equal(trigger.attributes.get('aria-expanded'), 'true');
  popover.element.listeners.get('keydown')({ key: 'Escape', preventDefault() {} });
  assert.equal(popover.element.attributes.get('hidden'), 'true');
  assert.equal(trigger.attributes.get('aria-expanded'), 'false');
  assert.equal(trigger.focused, true);
});

test('通用 Popover 会由触发器的鼠标、焦点和点击行为打开', () => {
  const document = { createElement: (tagName) => new FakeElement(tagName) };
  const trigger = new FakeElement('button');
  const popover = createPopover(document, trigger, new FakeElement('ul'));

  trigger.listeners.get('focus')();
  assert.equal(popover.element.attributes.get('hidden'), undefined);
  popover.close(false);
  trigger.listeners.get('mouseenter')();
  assert.equal(popover.element.attributes.get('hidden'), undefined);
  popover.close(false);
  trigger.listeners.get('click')();
  assert.equal(popover.element.attributes.get('hidden'), undefined);
});

test('通用 Popover 鼠标离开后延迟关闭，回到触发器会保持打开', async () => {
  const document = { createElement: (tagName) => new FakeElement(tagName) };
  const trigger = new FakeElement('button');
  const popover = createPopover(document, trigger, new FakeElement('ul'));

  trigger.listeners.get('mouseenter')();
  trigger.listeners.get('mouseleave')();
  popover.element.listeners.get('mouseenter')();
  await new Promise((resolve) => setTimeout(resolve, 180));
  assert.equal(popover.element.attributes.get('hidden'), undefined);
  popover.element.listeners.get('mouseleave')();
  trigger.listeners.get('mouseenter')();
  await new Promise((resolve) => setTimeout(resolve, 180));
  assert.equal(popover.element.attributes.get('hidden'), undefined);
  trigger.listeners.get('mouseleave')();
  await new Promise((resolve) => setTimeout(resolve, 180));
  assert.equal(popover.element.attributes.get('hidden'), 'true');
});

test('通用 Popover 使用双层伪元素绘制可配置方位的箭头', async () => {
  const document = { createElement: (tagName) => new FakeElement(tagName) };
  const placements = ['top', 'bottom', 'left', 'right'];
  const styles = await readFile(
    new URL('../../components/popover/index.css', import.meta.url),
    'utf8',
  );

  for (const placement of placements) {
    const popover = createPopover(document, new FakeElement('button'), new FakeElement('div'), { placement });
    assert.equal(popover.element.attributes.get('data-placement'), placement);
  }
  assert.match(styles, /\.popover::before,\s*\.popover::after\s*\{/s);
  assert.match(styles, /\.popover\[data-placement='bottom'\]::before\s*\{/s);
});
