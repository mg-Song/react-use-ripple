import { RefObject, useEffect } from 'react';

const ANIMATION_LENGTH = 700;
const RIPPLE_SIZE = 100;

const style = document.createElement('style');

style.type = 'text/css';

const keyframes = `
  @keyframes use-ripple-animation {
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

type RippleEvent = {
  clientX?: number;
  clientY?: number;
};

const defaultEvent: Required<RippleEvent> = {
  clientX: 0,
  clientY: 0,
};

const createRipple = (element: HTMLElement) => (e?: RippleEvent) => {
  const clientX = e?.clientX || defaultEvent.clientX;
  const clientY = e?.clientY || defaultEvent.clientY;

  const { height, width, top, left } = element.getBoundingClientRect();
  const x = clientX - left;
  const y = clientY - top;

  const rippleSize = Math.min(height, width, RIPPLE_SIZE);

  const positionTop = clientX
    ? y - rippleSize / 2
    : rippleSize / 2 - height / 2;
  const positionLeft = clientY
    ? x - rippleSize / 2
    : width / 2 - rippleSize / 2;

  const span = document.createElement('span');

  span.style.cssText = `
    top: ${positionTop}px;
    left: ${positionLeft}px;
    position: absolute;
    border-radius: 50%;
    background-color: rgba(0, 0, 0, 0.3);
    pointer-events: none;
    width: ${rippleSize}px;
    height: ${rippleSize}px;

    animation: use-ripple-animation ${ANIMATION_LENGTH}ms ease-in;
  `;

  element.appendChild(span);

  span.addEventListener('animationend', () => {
    element.removeChild(span);
  });
};

export interface RippleOptions {
  disabled?: boolean;
}

const defaultOptions: RippleOptions = {
  disabled: false,
};

export const useRipple = (
  ref: RefObject<HTMLElement>,
  options?: RippleOptions,
) => {
  const rippleOptions: RippleOptions = { ...defaultOptions, ...options };

  useEffect(() => {
    if (rippleOptions?.disabled || !ref?.current) {
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

    const keyboardRipple = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        ripple();
      }
    };

    element.addEventListener('mousedown', ripple);
    element.addEventListener('keydown', keyboardRipple);

    return () => {
      element.removeEventListener('mousedown', ripple);
      element.removeEventListener('keydown', keyboardRipple);
    };
  });
};
