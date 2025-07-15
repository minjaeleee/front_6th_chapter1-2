import { addEvent } from "./eventManager";

// 가상 DOM 객체를 실제 DOM 요소로 변환하는 함수
export function createElement(vNode) {
  // console.log("전체 vNode", vNode);
  // 1. 텍스트 노드인 경우
  if (typeof vNode === "string" || typeof vNode === "number") {
    return document.createTextNode(vNode);
  }

  // 2. null, undefined인 경우
  if (vNode == null) {
    return document.createTextNode("");
  }

  // 3. 컴포넌트 함수(컴포넌트) 인 경우
  if (typeof vNode.type === "function") {
    const component = vNode.type;
    const props = { ...vNode.props, children: vNode.children };
    const result = component(props);
    return createElement(result);
  }

  // 일반 DOM 요소인 경우
  const element = document.createElement(vNode.type);

  // 속성 설정
  updateAttributes(element, vNode.props || {});

  // 자식 요소들 생성
  if (vNode.children) {
    vNode.children.forEach((child) => {
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
    } else if (key === "className") {
      // className 처리
      $el.className = props[key];
    } else if (key !== "children") {
      // 일반 속성
      attributes[key] = props[key];
    }
  });

  // 일반 속성 설정
  Object.keys(attributes).forEach((key) => {
    if (key === "style" && typeof attributes[key] === "object") {
      // style 객체 처리
      Object.assign($el.style, attributes[key]);
    } else {
      $el.setAttribute(key, attributes[key]);
    }
  });

  // 이벤트 리스너 등록
  Object.keys(eventListeners).forEach((eventName) => {
    addEvent($el, eventName, eventListeners[eventName]);
  });
}
