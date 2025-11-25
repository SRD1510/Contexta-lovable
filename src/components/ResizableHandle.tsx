import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

interface ResizableHandleProps {
  onResize: (width: number) => void;
  onDoubleClick: () => void;
  initialWidth: number;
}

export function ResizableHandle({
  onResize,
  onDoubleClick,
  initialWidth,
}: ResizableHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const startXRef = useRef(0);
  const startWidthRef = useRef(initialWidth);

  useEffect(() => {
    if (!isDragging) return;

    console.log("🖱️ ResizableHandle - drag started");

    const handleMouseMove = (e: MouseEvent) => {
      const diff = e.clientX - startXRef.current;
      const newWidth = startWidthRef.current + diff;
      onResize(newWidth);
    };

    const handleMouseUp = () => {
      console.log("🖱️ ResizableHandle - drag ended");
      setIsDragging(false);
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, onResize]);

  const handleMouseDown = (e: React.MouseEvent) => {
    console.log("🖱️ ResizableHandle - mouse down");
    e.preventDefault();
    setIsDragging(true);
    startXRef.current = e.clientX;
    startWidthRef.current = initialWidth;
  };

  const handleDoubleClick = () => {
    console.log("🖱️ ResizableHandle - double click, resetting to 300px");
    onDoubleClick();
  };

  return (
    <div
      className={cn(
        "relative flex-shrink-0 cursor-col-resize transition-all",
        isDragging
          ? "w-1 bg-primary"
          : isHovered
          ? "w-1 bg-border"
          : "w-0.5 bg-border"
      )}
      onMouseDown={handleMouseDown}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isDragging && (
        <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-primary animate-pulse" />
      )}
    </div>
  );
}
