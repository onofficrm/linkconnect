"use client";

import { motion, useInView, UseInViewOptions } from "framer-motion";
import { useRef } from "react";

interface FadeInProps {
    children: React.ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    direction?: "up" | "down" | "left" | "right" | "none";
    fullWidth?: boolean;
    viewport?: UseInViewOptions;
}

export default function FadeIn({
    children,
    className = "",
    delay = 0,
    duration = 0.6,
    direction = "right",
    fullWidth = false,
    viewport = { once: true, amount: 0.8 },
}: FadeInProps) {
    const ref = useRef(null);
    const isInView = useInView(ref, viewport);

    const getDirectionOffset = () => {
        switch (direction) {
            case "up":
                return { y: 40, x: 0 };
            case "down":
                return { y: -40, x: 0 };
            case "left":
                return { x: 40, y: 0 };
            case "right":
                return { x: -40, y: 0 };
            case "none":
                return { x: 0, y: 0 };
            default:
                return { y: 40, x: 0 };
        }
    };

    const offset = getDirectionOffset();

    return (
        <motion.div
            ref={ref}
            initial={{
                opacity: 0,
                x: offset.x,
                y: offset.y
            }}
            animate={isInView ? {
                opacity: 1,
                x: 0,
                y: 0
            } : {
                opacity: 0,
                x: offset.x,
                y: offset.y
            }}
            transition={{
                duration: duration,
                delay: delay,
                ease: [0.21, 0.47, 0.32, 0.98], // Custom easeOutCubic-like bezier
            }}
            className={className}
            style={{ width: fullWidth ? "100%" : "auto" }}
        >
            {children}
        </motion.div>
    );
}

export function FadeInStagger({
    children,
    className = "",
    staggerDelay = 0.1,
    viewport = { once: true, margin: "-10% 0px" },
}: {
    children: React.ReactNode;
    className?: string;
    staggerDelay?: number;
    viewport?: UseInViewOptions;
}) {
    return (
        <motion.div
            initial="hidden"
            whileInView="show"
            viewport={viewport}
            variants={{
                hidden: {},
                show: {
                    transition: {
                        staggerChildren: staggerDelay,
                    },
                },
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
}
