import { useEffect, useRef } from 'react';

const focusableSelector =
  'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function useModalBehavior(onClose: () => void) {
  const modalRef = useRef<HTMLDivElement | null>(null);
  const closeButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusedElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    previousFocusedElementRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    closeButtonRef.current?.focus();

    return () => {
      previousFocusedElementRef.current?.focus();
    };
  }, []);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  useEffect(() => {
    const { body, documentElement } = document;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = documentElement.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousHtmlOverscroll = documentElement.style.overscrollBehavior;

    body.classList.add('modal-open');
    documentElement.classList.add('modal-open');
    body.style.overflow = 'hidden';
    documentElement.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    documentElement.style.overscrollBehavior = 'none';

    return () => {
      body.classList.remove('modal-open');
      documentElement.classList.remove('modal-open');
      body.style.overflow = previousBodyOverflow;
      documentElement.style.overflow = previousHtmlOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      documentElement.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, []);

  const handleModalKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'Tab' || !modalRef.current) {
      return;
    }

    const focusableElements = Array.from(modalRef.current.querySelectorAll<HTMLElement>(focusableSelector)).filter(
      (element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true',
    );

    if (focusableElements.length === 0) {
      event.preventDefault();
      return;
    }

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    const activeElement = document.activeElement as HTMLElement | null;
    const isFocusInsideModal = activeElement ? modalRef.current.contains(activeElement) : false;

    if (event.shiftKey) {
      if (!isFocusInsideModal || activeElement === firstFocusable) {
        event.preventDefault();
        lastFocusable.focus();
      }
      return;
    }

    if (!isFocusInsideModal || activeElement === lastFocusable) {
      event.preventDefault();
      firstFocusable.focus();
    }
  };

  return {
    modalRef,
    closeButtonRef,
    handleModalKeyDown,
  };
}
