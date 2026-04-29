import { useState, useRef } from 'react';

/**
 * Custom hook to enable mouse-draggable horizontal scrolling for containers.
 * Also supports touch scrolling via native overflow-x: auto.
 * 
 * @returns {Object} { scrollRef, onMouseDown, onMouseLeave, onMouseUp, onMouseMove, isDragging }
 */
export function useDraggableScroll() {
  const scrollRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);

  const onMouseDown = (e) => {
    if (!scrollRef.current) return;
    setIsDragging(true);
    setStartX(e.pageX - scrollRef.current.offsetLeft);
    setScrollLeft(scrollRef.current.scrollLeft);
  };

  const onMouseLeave = () => {
    setIsDragging(false);
  };

  const onMouseUp = () => {
    setIsDragging(false);
  };

  const onMouseMove = (e) => {
    if (!isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollRef.current.scrollLeft = scrollLeft - walk;
  };

  return {
    scrollRef,
    isDragging,
    handlers: {
      onMouseDown,
      onMouseLeave,
      onMouseUp,
      onMouseMove
    }
  };
}
