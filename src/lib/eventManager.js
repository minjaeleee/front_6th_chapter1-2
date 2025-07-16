// 이벤트 핸들러를 저장하는 Map
const eventHandlers = new Map();

// 이벤트 위임을 위한 루트 요소
let rootElement = null;
let isInitialized = false;

export function setupEventListeners(root) {
  // 이미 초기화되었으면 중복 설정 방지
  if (isInitialized && rootElement === root) {
    return;
  }

  rootElement = root;
  isInitialized = true;

  // 모든 이벤트 타입에 대해 위임 이벤트 리스너를 설정
  const eventTypes = ["click", "input", "change", "submit", "keydown", "keyup", "focus", "blur"];

  // 이벤트 타입을 고정된 배열로 순회하면서 root에 **캡처 단계(true)**로 리스너를 등록.
  // 캡처 단계 사용으로 focus/blur 등의 버블링되지 않는 이벤트도 처리 가능
  eventTypes.forEach((eventType) => {
    // 이벤트 위임 핸들러 등록
    root.addEventListener(eventType, handleEventDelegation, true);
  });
}

// 이벤트 위임을 처리하는 핸들러 -> listenr 콜백함수
function handleEventDelegation(event) {
  const target = event.target;
  const eventType = event.type;

  // 이벤트 타입에 등록된 모든 핸들러를 확인
  const handlersForType = eventHandlers.get(eventType);
  if (!handlersForType) return;

  // 타겟 요소와 그 상위 요소들에 등록된 핸들러들을 찾아 실행
  let currentElement = target;

  while (currentElement && currentElement !== rootElement) {
    const elementHandlers = handlersForType.get(currentElement);

    if (elementHandlers) {
      // 해당 요소에 등록된 모든 핸들러를 실행
      elementHandlers.forEach((handler) => {
        try {
          handler.call(currentElement, event);
        } catch (error) {
          console.error("Event handler error:", error);
        }
      });
    }

    currentElement = currentElement.parentElement;
  }
}

export function addEvent(element, eventType, handler) {
  if (!element || !eventType || typeof handler !== "function") {
    console.warn("Invalid parameters for addEvent:", { element, eventType, handler });
    return;
  }

  // 이벤트 타입에 대한 핸들러 맵이 없으면 생성
  if (!eventHandlers.has(eventType)) {
    eventHandlers.set(eventType, new Map());
  }

  const handlersForType = eventHandlers.get(eventType);

  // 요소에 대한 핸들러 배열이 없으면 생성
  if (!handlersForType.has(element)) {
    handlersForType.set(element, []);
  }

  const elementHandlers = handlersForType.get(element);

  // 중복 핸들러 방지
  if (!elementHandlers.includes(handler)) {
    elementHandlers.push(handler);
  }
}

export function removeEvent(element, eventType, handler) {
  if (!element || !eventType) {
    console.warn("Invalid parameters for removeEvent:", { element, eventType });
    return;
  }

  const handlersForType = eventHandlers.get(eventType);
  if (!handlersForType) return;

  const elementHandlers = handlersForType.get(element);
  if (!elementHandlers) return;

  if (handler) {
    // 특정 핸들러만 제거
    const index = elementHandlers.indexOf(handler);
    if (index > -1) {
      elementHandlers.splice(index, 1);
    }
  } else {
    // 해당 요소의 모든 핸들러 제거
    handlersForType.delete(element);
  }

  // 이벤트 타입에 핸들러가 없으면 타입도 제거
  if (handlersForType.size === 0) {
    eventHandlers.delete(eventType);
  }
}

export function removeAllEvents(element) {
  if (!element) return;

  eventHandlers.forEach((handlersForType, eventType) => {
    handlersForType.delete(element);

    // 이벤트 타입에 핸들러가 없으면 타입도 제거
    if (handlersForType.size === 0) {
      eventHandlers.delete(eventType);
    }
  });
}

export function cleanup() {
  eventHandlers.clear();

  if (rootElement) {
    const eventTypes = ["click", "input", "change", "submit", "keydown", "keyup", "focus", "blur"];
    eventTypes.forEach((eventType) => {
      rootElement.removeEventListener(eventType, handleEventDelegation, true);
    });
    rootElement = null;
    isInitialized = false;
  }
}
