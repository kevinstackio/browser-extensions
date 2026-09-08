import test from 'node:test';
import assert from 'node:assert/strict';
import { createBookmarkPopover } from '../../components/bookmark-popover/index.js';

class FakeElement {
  constructor(tagName) { this.tagName = tagName; this.children = []; this.attributes = new Map(); this.className = ''; this.listeners = new Map(); this.focused = false; }
  append(...children) { this.children.push(...children); }
  setAttribute(name, value) { this.attributes.set(name, value); }
  removeAttribute(name) { this.attributes.delete(name); }
  addEventListener(name, listener) { this.listeners.set(name, listener); }
  focus() { this.focused = true; }
}

test('书签 Popover 支持打开、Esc 关闭并恢复触发器焦点', () => {
  const document = { createElement: (tagName) => new FakeElement(tagName) };
  const trigger = new FakeElement('button');
  const content = new FakeElement('ul');
  const popover = createBookmarkPopover(document, trigger, content);

  popover.open();
  assert.equal(popover.element.attributes.get('hidden'), undefined);
  assert.equal(trigger.attributes.get('aria-expanded'), 'true');
  popover.element.listeners.get('keydown')({ key: 'Escape', preventDefault() {} });
  assert.equal(popover.element.attributes.get('hidden'), 'true');
  assert.equal(trigger.attributes.get('aria-expanded'), 'false');
  assert.equal(trigger.focused, true);
});

test('书签 Popover 会由触发器的鼠标、焦点和点击行为打开', () => {
  const document = { createElement: (tagName) => new FakeElement(tagName) };
  const trigger = new FakeElement('button');
  const popover = createBookmarkPopover(document, trigger, new FakeElement('ul'));

  trigger.listeners.get('focus')();
  assert.equal(popover.element.attributes.get('hidden'), undefined);
  popover.close(false);
  trigger.listeners.get('mouseenter')();
  assert.equal(popover.element.attributes.get('hidden'), undefined);
  popover.close(false);
  trigger.listeners.get('click')();
  assert.equal(popover.element.attributes.get('hidden'), undefined);
});

test('书签 Popover 鼠标离开后延迟关闭，进入浮层会保持打开', async () => {
  const document = { createElement: (tagName) => new FakeElement(tagName) };
  const trigger = new FakeElement('button');
  const popover = createBookmarkPopover(document, trigger, new FakeElement('ul'));

  trigger.listeners.get('mouseenter')();
  trigger.listeners.get('mouseleave')();
  popover.element.listeners.get('mouseenter')();
  await new Promise((resolve) => setTimeout(resolve, 180));
  assert.equal(popover.element.attributes.get('hidden'), undefined);
  popover.element.listeners.get('mouseleave')();
  await new Promise((resolve) => setTimeout(resolve, 180));
  assert.equal(popover.element.attributes.get('hidden'), 'true');
});
