import { useCallback, useEffect, useState } from "react";

export function useAutoZoom(contentDependency?: any) {
  const [zoom, setZoom] = useState(1);
  const [zoomDOM, setZoomDOM] = useState<HTMLElement | null>(null);

  const calculateScale = useCallback(() => {
    if (!zoomDOM?.parentElement) return;

    const parentWidth = zoomDOM.parentElement.clientWidth;
    const paddingLeft = parseFloat(getComputedStyle(zoomDOM.parentElement).paddingLeft);
    const paddingRight = parseFloat(getComputedStyle(zoomDOM.parentElement).paddingRight);
    const parentWidthWithoutPadding = parentWidth - paddingLeft - paddingRight;

    const childWidth = zoomDOM.clientWidth;
    setZoom(parentWidthWithoutPadding / childWidth);
  }, [zoomDOM]);

  const zoomRefCallback = useCallback((node: HTMLElement | null) => {
    setZoomDOM(node);
  }, []);

  useEffect(() => {
    if (!zoomDOM) return;
    calculateScale();
    window.addEventListener("resize", calculateScale);
    return () => window.removeEventListener("resize", calculateScale);
  }, [calculateScale, contentDependency]);

  return {
    zoomRefCallback,
    zoom,
  };
}

// 除了使用callback ref还可以
// const [node, setNode] = useState<HTMLDivElement | null>(null);
// useEffect(() => {
//   if (node) {
//     console.log("回调 ref 触发", node);
//   }
// }, [node]);
// return <div ref={setNode} />;
// 这两个方法都可以。
