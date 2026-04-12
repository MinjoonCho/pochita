"use client";

import { Children, type ReactNode, useEffect, useId, useRef } from "react";

type SwipePagerProps = {
  index: number;
  onIndexChange: (index: number) => void;
  children: ReactNode;
  className?: string;
  slideClassName?: string;
};

export default function SwipePager({
  index,
  onIndexChange,
  children,
  className = "",
  slideClassName = "",
}: SwipePagerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const pagerId = useId();
  const slides = Children.toArray(children);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const width = container.clientWidth;
    if (!width) return;

    container.scrollTo({
      left: width * index,
      behavior: "smooth",
    });
  }, [index]);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleScroll = () => {
    const container = containerRef.current;
    if (!container) return;

    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
    }

    frameRef.current = requestAnimationFrame(() => {
      const width = container.clientWidth;
      if (!width) return;

      const nextIndex = Math.round(container.scrollLeft / width);
      if (nextIndex !== index) {
        onIndexChange(nextIndex);
      }
    });
  };

  return (
    <div
      ref={containerRef}
      className={`swipe-pager no-scrollbar ${className}`.trim()}
      onScroll={handleScroll}
      aria-label="Swipe pager"
    >
      {slides.map((slide, slideIndex) => (
        <section
          key={`${pagerId}-${slideIndex}`}
          className={`swipe-slide ${slideClassName}`.trim()}
          aria-hidden={slideIndex !== index}
        >
          {slide}
        </section>
      ))}
    </div>
  );
}
