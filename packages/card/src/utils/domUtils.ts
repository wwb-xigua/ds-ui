export interface ViewportOffsetResult {
  left: number;
  top: number;
  right: number;
  bottom: number;
  rightIncludeBody: number;
  bottomIncludeBody: number;
}

export function getBoundingClientRect(element: Element): DOMRect | number {
  if (!element || !element.getBoundingClientRect) {
    return 0;
  }
  return element.getBoundingClientRect();
}

/*  ignore next */
export function hasClass(el: Element, cls: string) {
  if (!el || !cls) return false;
  if (cls.indexOf(' ') !== -1) throw new Error('className should not contain space.');
  if (el.classList) {
    return el.classList.contains(cls);
  } else {
    return (' ' + el.className + ' ').indexOf(' ' + cls + ' ') > -1;
  }
}

/**
 * @description:
 * Get the left and top offset of the current element
 * left: the distance between the leftmost element and the left side of the document
 * top: the distance from the top of the element to the top of the document
 * right: the distance from the far right of the element to the right of the document
 * bottom: the distance from the bottom of the element to the bottom of the document
 * rightIncludeBody: the distance between the leftmost element and the right side of the document
 * bottomIncludeBody: the distance from the bottom of the element to the bottom of the document
 * @param {Element} element
 * @return {*}
 */
export function getViewportOffset(element: Element): ViewportOffsetResult {
  // Runs during layout measurement, so it can be reached in environments where
  // `document`/`window` are unavailable (SSR) or where the element is detached.
  if (typeof document === 'undefined' || typeof window === 'undefined' || !element) {
    return {
      left: 0,
      top: 0,
      right: 0,
      bottom: 0,
      rightIncludeBody: 0,
      bottomIncludeBody: 0,
    };
  }

  const doc = document.documentElement;

  const docScrollLeft = doc.scrollLeft;
  const docScrollTop = doc.scrollTop;
  const docClientLeft = doc.clientLeft;
  const docClientTop = doc.clientTop;

  // `window.parent` is not guaranteed (a top-level window always has one, but a
  // detached or sandboxed frame may not), so fall back to `window` itself.
  const view = window.parent ?? window;

  const pageXOffset = view.pageXOffset;
  const pageYOffset = view.pageYOffset;

  const box = getBoundingClientRect(element);

  const { left: retLeft, top: rectTop, width: rectWidth, height: rectHeight } = box as DOMRect;

  const scrollLeft = (pageXOffset || docScrollLeft) - (docClientLeft || 0);
  const scrollTop = (pageYOffset || docScrollTop) - (docClientTop || 0);
  const offsetLeft = retLeft + (pageXOffset || 0);
  const offsetTop = rectTop + (pageYOffset || 0);

  const left = offsetLeft - scrollLeft;
  const top = offsetTop - scrollTop;

  const clientWidth = view.document?.documentElement?.clientWidth || 0;
  const clientHeight = view.document?.documentElement?.clientHeight || 0;
  return {
    left: left,
    top: top,
    right: clientWidth - rectWidth - left,
    bottom: clientHeight - rectHeight - top,
    rightIncludeBody: clientWidth - left,
    bottomIncludeBody: clientHeight - top,
  };
}
