// import { addEvent, removeEvent } from "./eventManager";
import { createElement } from "./createElement.js";
import { addEvent, removeEvent } from "./eventManager.js";

// 함수형 컴포넌트의 타입을 비교하는 헬퍼 함수
function isSameType(newType, oldType) {
  // 둘 다 함수인 경우 함수 이름으로 비교
  if (typeof newType === "function" && typeof oldType === "function") {
    return newType.name === oldType.name || newType === oldType;
  }
  // 일반적인 타입 비교
  return newType === oldType;
}

export function updateElement(parent, newNode, oldNode, index = 0) {
  // 1. oldNode만 있는 경우
  if (!newNode && oldNode) {
    return parent.removeChild(parent.childNode[index]);
  }

  // 2. newNode만 있는 경우
  if (newNode && !oldNode) {
    return parent.appendChild(createElement(newNode));
  }

  // 3. oldNode와 newNode 모두 text 타입일 경우
  if (typeof newNode === "string" && typeof oldNode === "string") {
    if (newNode === oldNode) return;
    return parent.replaceChild(createElement(newNode), parent.childNodes[index]);
  }

  // 4. oldNode와 newNode의 타입이 다를 경우
  if (!isSameType(newNode.type, oldNode.type)) {
    return parent.replaceChild(createElement(newNode), parent.childNodes[index]);
  }

  // 5. oldNode와 newNode의 타입이 같을 경우
  updateAttributes(parent.childNodes[index], newNode.props || {}, oldNode.props || {});

  // 6. newNode와 oldNode의 모든 자식 태그를 순회하며 1 ~ 5의 내용을 반복한다.
  const maxLength = Math.max(newNode.children.length, oldNode.children.length);
  for (let i = 0; i < maxLength; i++) {
    updateElement(parent.childNodes[index], newNode.children[i], oldNode.children[i], i);
  }
}

// 5 - newNode와 oldNode의 attribute를 비교하여 변경된 부분만 반영한다.
function updateAttributes(target, newProps, oldProps) {
  // 이벤트 리스너와 일반 속성 분리
  const newEventListeners = {};
  const oldEventListeners = {};
  const newAttributes = {};
  const oldAttributes = {};

  // 새 props에서 이벤트 리스너와 일반 속성 분리
  Object.keys(newProps).forEach((key) => {
    if (key.startsWith("on") && typeof newProps[key] === "function") {
      const eventName = key.toLowerCase().substring(2);
      newEventListeners[eventName] = newProps[key];
    } else if (key === "className") {
      newAttributes[key] = newProps[key];
    } else if (key !== "children") {
      newAttributes[key] = newProps[key];
    }
  });

  // 기존 props에서 이벤트 리스너와 일반 속성 분리
  Object.keys(oldProps).forEach((key) => {
    if (key.startsWith("on") && typeof oldProps[key] === "function") {
      const eventName = key.toLowerCase().substring(2);
      oldEventListeners[eventName] = oldProps[key];
    } else if (key === "className") {
      oldAttributes[key] = oldProps[key];
    } else if (key !== "children") {
      oldAttributes[key] = oldProps[key];
    }
  });

  // 이벤트 리스너 처리
  // 제거된 이벤트 리스너 처리
  Object.keys(oldEventListeners).forEach((eventName) => {
    if (!newEventListeners[eventName]) {
      removeEvent(target, eventName, oldEventListeners[eventName]);
    }
  });

  // 추가되거나 변경된 이벤트 리스너 처리
  Object.keys(newEventListeners).forEach((eventName) => {
    const newHandler = newEventListeners[eventName];
    const oldHandler = oldEventListeners[eventName];

    if (oldHandler && oldHandler !== newHandler) {
      // 핸들러가 변경된 경우
      removeEvent(target, eventName, oldHandler);
      addEvent(target, eventName, newHandler);
    } else if (!oldHandler) {
      // 새로운 핸들러 추가
      addEvent(target, eventName, newHandler);
    }
  });

  // 일반 속성 처리
  // 달라지거나 추가된 Props를 반영
  for (const [attr, value] of Object.entries(newAttributes)) {
    if (oldAttributes[attr] === newAttributes[attr]) continue;

    if (attr === "className") {
      target.className = value;
    } else if (attr === "style" && typeof value === "object") {
      Object.assign(target.style, value);
    } else {
      target.setAttribute(attr, value);
    }
  }

  // 없어진 props를 attribute에서 제거
  for (const attr of Object.keys(oldAttributes)) {
    if (newAttributes[attr] !== undefined) continue;
    target.removeAttribute(attr);
  }
}
