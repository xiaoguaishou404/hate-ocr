import { useCallback, useEffect, useState } from "react";

export function useAutoZoom(contentDependency?: any, maxHeight?: number) {
  const [zoom, setZoom] = useState(1);
  const [zoomDOM, setZoomDOM] = useState<HTMLElement | null>(null);

  const calculateScale = useCallback(() => {
    if (!zoomDOM?.parentElement) return;

    const parentWidth = zoomDOM.parentElement.clientWidth;
    const paddingLeft = parseFloat(getComputedStyle(zoomDOM.parentElement).paddingLeft);
    const paddingRight = parseFloat(getComputedStyle(zoomDOM.parentElement).paddingRight);
    const parentWidthWithoutPadding = parentWidth - paddingLeft - paddingRight;

    const childWidth = zoomDOM.clientWidth;
    const childHeight = zoomDOM.clientHeight;
    
    // 基于宽度计算的缩放比例
    let scaleByWidth = parentWidthWithoutPadding / childWidth;
    
    // 如果设置了最大高度，需要检查缩放后的高度是否超出限制
    if (maxHeight && childHeight * scaleByWidth > maxHeight) {
      // 基于最大高度计算缩放比例
      scaleByWidth = maxHeight / childHeight;
    }
    
    setZoom(scaleByWidth);
  }, [zoomDOM, maxHeight]);

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
