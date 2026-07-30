import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import styles from "./CtaButton.module.css";
import { ReactNode } from "react";

interface CtaButtonProps {
    href?: string;
    onClick?: () => void;
    children: ReactNode;
    className?: string;
}

export default function CtaButton({ href, onClick, children, className }: CtaButtonProps) {
    if (onClick) {
        return (
            <button onClick={onClick} className={`${styles.ctaButton} ${className || ''}`}>
                {children}
                <span className={styles.ctaArrow}>
                    <FiArrowRight size={24} />
                </span>
            </button>
        );
    }
    return (
        <Link href={href || "#"} className={`${styles.ctaButton} ${className || ''}`}>
            {children}
            <span className={styles.ctaArrow}>
                <FiArrowRight size={24} />
            </span>
        </Link>
    );
}
