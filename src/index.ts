import { RefObject, useEffect } from 'react';

const ANIMATION_LENGTH = 700;
const RIPPLE_SIZE = 100;

const style = document.createElement('style');

style.type = 'text/css';

const keyframes = `
  @keyframes ripple {
    from {
      opacity: 1;
      transform: scale(0);
    }
    to {
      opacity: 0;
      transform: scale(10);
    }
  }
  `;

style.innerHTML = keyframes;

document.querySelector('head')?.appendChild(style);

const createRipple = (element: HTMLElement) => (e: MouseEvent) => {
  const { top, left } = element.getBoundingClientRect();
  const x = e.clientX - left;
  const y = e.clientY - top;

  const span = document.createElement('span');

  const rippleSize = Math.min(
    element.clientHeight,
    element.clientWidth,
    RIPPLE_SIZE,
  );

  span.style.cssText = `
    top: ${y - rippleSize / 2}px;
    left: ${x - rippleSize / 2}px;
    position: absolute;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.3);
    pointer-events: none;
    width: ${rippleSize}px;
    height: ${rippleSize}px;

    animation: ripple ${ANIMATION_LENGTH}ms ease-in;
  `;

  element.appendChild(span);

  setTimeout(() => {
    element.removeChild(span);
  }, ANIMATION_LENGTH);
};

export const useRipple = (ref: RefObject<HTMLElement>) => {
  useEffect(() => {
    if (!ref.current) {
      return;
    }

    const element = ref.current;
    const elementPosition = getComputedStyle(element).getPropertyValue(
      'position',
    );

    element.style.position =
      elementPosition === 'static' || !elementPosition
        ? 'relative'
        : elementPosition;
    element.style.overflow = 'hidden';

    const ripple = createRipple(element);

    element.addEventListener('click', ripple);

    return () => element.removeEventListener('click', ripple);
  });
};