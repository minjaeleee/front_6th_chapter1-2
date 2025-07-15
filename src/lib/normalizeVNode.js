export function normalizeVNode(vNode) {
  console.log("정규화 할 코드 ->", vNode);
  // null, undefined, boolean 값들 처리
  if (vNode == null || typeof vNode === "boolean") {
    console.log("정규화 후 코드 -> null, undefined, boolean", vNode);
    return "";
  }

  // 문자열이나 숫자는 그대로 반환
  if (typeof vNode === "string" || typeof vNode === "number") {
    console.log("정규화 후 코드 -> 문자열 또는 숫자", vNode);
    return vNode;
  }

  // 배열인 경우 각 요소를 정규화하고 빈 값들 제거
  if (Array.isArray(vNode)) {
    console.log(
      "정규화 후 코드 -> 배열",
      vNode.map(normalizeVNode).filter((item) => item !== ""),
    );
    return vNode.map(normalizeVNode).filter((item) => item !== "");
  }

  // 이미 정규화된 vNode 객체는 그대로 반환
  if (typeof vNode === "object" && vNode.type) {
    console.log("정규화 후 코드 -> 객체", vNode);
    return vNode;
  }

  // 기타 값들은 빈 문자열로 변환
  return "";
}
