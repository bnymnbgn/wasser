"use client";

import { useState, useRef, type ButtonHTMLAttributes } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export function RippleButton({
  children,
  className,
  variant = "primary",
  size = "md",
  onClick,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const addRipple = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    const ripple: Ripple = {
      id: Date.now(),
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };

    setRipples((prev) => [...prev, ripple]);

    // Remove ripple after animation
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== ripple.id));
    }, 600);
  };

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    addRipple(e);
    onClick?.(e);
  };

  const variantClasses = {
    primary: "ocean-button text-ocean-primary shadow-ocean-glow active:shadow-ocean-1",
    secondary: "ocean-card text-ocean-primary border border-ocean-border hover:ocean-card-elevated",
    ghost: "bg-transparent text-ocean-primary hover:ocean-surface-hover border border-ocean-border",
  };

  const sizeClasses = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={clsx(
        "relative overflow-hidden rounded-full font-semibold",
        "transition-all active:scale-98",
        "touch-manipulation no-tap-highlight",
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      {...props}
    >
      {children}

      <AnimatePresence>
        {ripples.map((ripple) => (
          <motion.span
            key={ripple.id}
            className="absolute w-1 h-1 bg-ocean-text-primary/20 rounded-full pointer-events-none"
            style={{
              left: ripple.x,
              top: ripple.y,
              transform: "translate(-50%, -50%)",
            }}
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 80, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
          />
        ))}
      </AnimatePresence>
    </button>
  );
}
