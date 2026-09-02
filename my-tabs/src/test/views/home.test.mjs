import test from 'node:test';
import assert from 'node:assert/strict';
import { installContextMenu } from '../../views/home/index.js';

// 以最小 DOM 实现模拟首页所需的元素行为。
class FakeElement {
  constructor(tagName) {
    this.tagName = tagName;
    this.children = [];
    this.listeners = new Map();
    this.style = {};
    this.attributes = new Map();
  }

  append(...children) {
    this.children.push(...children);
    for (const child of children) child.parent = this;
  }

  remove() {
    this.parent.children = this.parent.children.filter((child) => child !== this);
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  setAttribute(name, value) {
    this.attributes.set(name, value);
  }
}

// 模拟可注册和触发全局事件的文档对象。
class FakeDocument {
  constructor() {
    this.body = new FakeElement('body');
    this.documentElement = new FakeElement('html');
    this.documentElement.clientWidth = 1000;
    this.documentElement.clientHeight = 800;
    this.listeners = new Map();
  }

  createElement(tagName) {
    return new FakeElement(tagName);
  }

  addEventListener(type, listener) {
    this.listeners.set(type, listener);
  }

  dispatch(type, event) {
    this.listeners.get(type)(event);
  }
}

// 验证 body 空白区域的右键事件会打开自定义菜单。
test('首页空白处右键会打开自定义菜单', () => {
  const document = new FakeDocument();
  const event = {
    target: document.body,
    clientX: 120,
    clientY: 240,
    prevented: false,
    preventDefault() { this.prevented = true; },
  };

  installContextMenu(document);
  document.dispatch('contextmenu', event);

  assert.equal(event.prevented, true);
  assert.equal(document.body.children.length, 1);
});

// 验证 html 根元素空白区域同样使用自定义菜单。
test('首页根元素空白处右键也会打开自定义菜单', () => {
  const document = new FakeDocument();
  const event = {
    target: document.documentElement,
    clientX: 80,
    clientY: 160,
    prevented: false,
    preventDefault() { this.prevented = true; },
  };

  installContextMenu(document);
  document.dispatch('contextmenu', event);

  assert.equal(event.prevented, true);
  assert.equal(document.body.children.length, 1);
});
