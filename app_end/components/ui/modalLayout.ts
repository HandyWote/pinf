export const modalScrollFlexStyle = { flex: 1 } as const;

export function getModalScrollViewStyle(
  currentStyle: unknown,
  isAutoHeight: boolean
): unknown {
  if (isAutoHeight) {
    return currentStyle;
  }

  if (currentStyle === undefined) {
    return [modalScrollFlexStyle];
  }

  return [currentStyle, modalScrollFlexStyle];
}
