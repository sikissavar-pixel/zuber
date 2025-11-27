"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useTransform, useInView } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
  highlightOnChange?: boolean;
}

export function AnimatedCounter({
  value,
  duration = 1.5,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
  highlightOnChange = true,
}: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: false, amount: 0.5 });
  const [hasChanged, setHasChanged] = useState(false);
  const prevValue = useRef(value);

  const spring = useSpring(0, {
    duration: duration * 1000,
    bounce: 0,
  });

  const display = useTransform(spring, (current) =>
    current.toLocaleString("tr-TR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [isInView, value, spring]);

  useEffect(() => {
    if (prevValue.current !== value && highlightOnChange) {
      setHasChanged(true);
      const timer = setTimeout(() => setHasChanged(false), 600);
      prevValue.current = value;
      return () => clearTimeout(timer);
    }
  }, [value, highlightOnChange]);

  return (
    <motion.span
      ref={ref}
      className={`tabular-nums ${className}`}
      animate={hasChanged ? { 
        scale: [1, 1.1, 1],
        textShadow: ["0 0 0px rgba(255,204,51,0)", "0 0 20px rgba(255,204,51,0.8)", "0 0 0px rgba(255,204,51,0)"]
      } : {}}
      transition={{ duration: 0.4 }}
    >
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </motion.span>
  );
}

// Simple counter for non-numeric displays
export function CountUpText({ 
  text, 
  delay = 0,
  className = "" 
}: { 
  text: string; 
  delay?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <span ref={ref} className={className}>
      {text.split("").map((char, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ 
            duration: 0.3, 
            delay: delay + i * 0.03,
            ease: "easeOut"
          }}
        >
          {char}
        </motion.span>
      ))}
    </span>
  );
}

