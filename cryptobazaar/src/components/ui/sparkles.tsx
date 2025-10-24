"use client";
import React, { useId, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface SparklesProps {
  id?: string;
  background?: string;
  minSize?: number;
  maxSize?: number;
  particleDensity?: number;
  className?: string;
  particleColor?: string;
}

export const SparklesCore: React.FC<SparklesProps> = (props) => {
  const {
    id,
    background = "transparent",
    minSize = 0.4,
    maxSize = 1,
    particleDensity = 100,
    className,
    particleColor = "#FFFFFF",
  } = props;

  const [, setInit] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const context = useRef<CanvasRenderingContext2D | null>(null);
  const circles = useRef<Circle[]>([]);
  const canvasSize = useRef<{ w: number; h: number }>({ w: 0, h: 0 });
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio : 1;

  useEffect(() => {
    if (canvasRef.current) {
      context.current = canvasRef.current.getContext("2d");
    }
    initCanvas();
    animate();
    setInit(true);

    const handleResize = () => {
      initCanvas();
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const initCanvas = () => {
    if (!canvasRef.current || !canvasContainerRef.current) return;
    const canvas = canvasRef.current;
    const container = canvasContainerRef.current;
    const rect = container.getBoundingClientRect();

    canvasSize.current = { w: rect.width, h: rect.height };
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;

    if (context.current) {
      context.current.scale(dpr, dpr);
    }

    circles.current = [];
    for (let i = 0; i < particleDensity; i++) {
      circles.current.push(new Circle(canvasSize.current));
    }
  };

  const animate = () => {
    if (!context.current || !canvasRef.current) return;

    context.current.clearRect(
      0,
      0,
      canvasSize.current.w,
      canvasSize.current.h
    );

    circles.current.forEach((circle) => {
      circle.update();
      circle.draw(context.current!, particleColor, minSize, maxSize);
    });

    requestAnimationFrame(animate);
  };

  class Circle {
    x: number;
    y: number;
    translateX: number;
    translateY: number;
    size: number;
    alpha: number;
    targetAlpha: number;
    dx: number;
    dy: number;
    canvasSize: { w: number; h: number };

    constructor(canvasSize: { w: number; h: number }) {
      this.canvasSize = canvasSize;
      this.x = Math.random() * canvasSize.w;
      this.y = Math.random() * canvasSize.h;
      this.translateX = 0;
      this.translateY = 0;
      this.size = Math.random() * 2 + 0.1;
      this.alpha = 0;
      this.targetAlpha = parseFloat((Math.random() * 0.6 + 0.1).toFixed(1));
      this.dx = (Math.random() - 0.5) * 0.2;
      this.dy = (Math.random() - 0.5) * 0.2;
    }

    update() {
      const edge = 10;
      if (this.x < -edge || this.x > this.canvasSize.w + edge) {
        this.x = Math.random() * this.canvasSize.w;
        this.alpha = 0;
      }
      if (this.y < -edge || this.y > this.canvasSize.h + edge) {
        this.y = Math.random() * this.canvasSize.h;
        this.alpha = 0;
      }

      this.x += this.dx;
      this.y += this.dy;

      if (this.alpha < this.targetAlpha) {
        this.alpha += 0.02;
      } else if (this.alpha > this.targetAlpha) {
        this.alpha -= 0.02;
      }
    }

    draw(
      ctx: CanvasRenderingContext2D,
      particleColor: string,
      minSize: number,
      maxSize: number
    ) {
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.size, 0, 2 * Math.PI);
      ctx.fillStyle = `${particleColor}`;
      ctx.globalAlpha = this.alpha;
      ctx.fill();
    }
  }

  return (
    <div
      className={cn("h-full w-full", className)}
      ref={canvasContainerRef}
      aria-hidden="true"
    >
      <canvas ref={canvasRef} id={id} style={{ background }}></canvas>
    </div>
  );
};
