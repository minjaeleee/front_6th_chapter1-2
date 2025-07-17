import { addEvent } from "./eventManager";

// 가상 DOM 객체를 실제 DOM 요소로 변환하는 함수
export function createElement(vNode) {
  // 1. 배열인 경우 DocumentFragment 생성
  if (Array.isArray(vNode)) {
    const fragment = document.createDocumentFragment();
    vNode.forEach((child) => {
      if (child != null) {
        const childElement = createElement(child);
        fragment.appendChild(childElement);
      }
    });
    if (fragment.childNodes.length === 1) {
      return fragment.firstChild;
    }

    return fragment;
  }

  // 2. 텍스트 노드인 경우
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode);
  }

  // 3. null, undefined인 경우
  if (vNode == null || typeof vNode === "boolean") {
    return document.createTextNode("");
  }

  // 일반 DOM 요소인 경우
  const element = document.createElement(vNode.type);

  // 속성 설정
  updateAttributes(element, vNode.props || {});

  // 자식 노드 처리: vNode.children 또는 vNode.props.children
  const children = vNode.children || (vNode.props && vNode.props.children);

  if (children) {
    const normalized = Array.isArray(children) ? children : [children];
    normalized.forEach((child) => {
      if (child != null) {
        const childElement = createElement(child);
        element.appendChild(childElement);
      }
    });
  }

  return element;
}

function updateAttributes($el, props) {
  // 이벤트 리스너와 일반 속성 분리
  const eventListeners = {};
  const attributes = {};

  Object.keys(props).forEach((key) => {
    if (key.startsWith("on") && typeof props[key] === "function") {
      // 이벤트 리스너
      const eventName = key.toLowerCase().substring(2);
      eventListeners[eventName] = props[key];
    } else if (key !== "children") {
      // 일반 속성 (className 포함)
      attributes[key] = props[key];
    }
  });

  // 일반 속성 설정 (순서 유지)
  Object.keys(attributes).forEach((key) => {
    if (key === "style" && typeof attributes[key] === "object") {
      // style 객체 처리
      Object.assign($el.style, attributes[key]);
    } else if (key === "className") {
      // className 처리
      $el.className = attributes[key];
    } else if (key === "selected") {
      // selected 속성 처리
      $el.selected = attributes[key];
    } else {
      $el.setAttribute(key, attributes[key]);
    }
  });

  // 이벤트 리스너 등록
  Object.keys(eventListeners).forEach((eventName) => {
    addEvent($el, eventName, eventListeners[eventName]);
  });
}
