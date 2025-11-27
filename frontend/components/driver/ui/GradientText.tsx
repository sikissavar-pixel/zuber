"use client";

import { motion } from "framer-motion";

interface GradientTextProps {
  children: React.ReactNode;
  variant?: "gold" | "silver" | "premium" | "success" | "fire";
  className?: string;
  animate?: boolean;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

const gradients = {
  gold: "from-[#ffcc33] via-[#ffb400] to-[#ffd966]",
  silver: "from-[#e5e5e5] via-[#ffffff] to-[#a0a0a0]",
  premium: "from-[#ffd700] via-[#ffec8b] to-[#daa520]",
  success: "from-[#10b981] via-[#34d399] to-[#6ee7b7]",
  fire: "from-[#ff6b00] via-[#ffb400] to-[#ffcc33]",
};

export function GradientText({
  children,
  variant = "gold",
  className = "",
  animate = false,
  as: Component = "span",
}: GradientTextProps) {
  const gradient = gradients[variant];

  const content = (
    <Component
      className={`
        bg-gradient-to-r ${gradient}
        bg-clip-text text-transparent
        ${animate ? "bg-[length:200%_auto]" : ""}
        ${className}
      `}
      style={animate ? {
        animation: "gradient-shift 3s ease infinite",
      } : undefined}
    >
      {children}
    </Component>
  );

  if (animate) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {content}
        <style jsx global>{`
          @keyframes gradient-shift {
            0%, 100% { background-position: 0% center; }
            50% { background-position: 100% center; }
          }
        `}</style>
      </motion.div>
    );
  }

  return content;
}

