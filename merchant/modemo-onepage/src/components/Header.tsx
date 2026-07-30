"use client";

import Link from "next/link";
import styles from "./Header.module.css";
import Image from "next/image";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { IoMenu, IoClose } from "react-icons/io5";
import { FiPhone } from "react-icons/fi";

import { createPortal } from "react-dom";
import CallButton from "./CallButton";
import { usePartnerContext } from "@/context/PartnerContext";

function HeaderCallButton({ isBlack }: { isBlack: boolean }) {
    const { hasPhone, data } = usePartnerContext();
    if (!hasPhone) return null;
    return (
        <CallButton
            placement="header"
            className={`${styles.callButton} ${isBlack ? styles.callButtonOnBlack : ""}`}
            aria-label="전화상담"
        >
            <FiPhone size={16} />
            <span className="partner-phone-text">{data.partner_phone_display}</span>
        </CallButton>
    );
}

export default function Header() {
    const pathname = usePathname();
    const isHomePage = pathname === "/" || pathname?.startsWith("/m/");
    const [isBlack, setIsBlack] = useState(isHomePage);
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        // Only run this logic on the home page (including /m/ routes which render the home page)
        if (!isHomePage) {
            setIsBlack(false);
            return;
        }

        const blackSections = document.querySelectorAll('[data-header-color="black"]');

        const handleScroll = () => {
            const headerHeight = 85;
            const checkPoint = headerHeight / 2;
            const bodyTop = document.querySelector('body')?.getBoundingClientRect().top;
            if (bodyTop != null && bodyTop > -85) {
                setIsBlack(true);
                return;
            }

            let isOverBlackSection = false;

            for (const section of blackSections) {
                const rect = section.getBoundingClientRect();
                if (rect.top <= checkPoint && rect.bottom >= checkPoint) {
                    isOverBlackSection = true;
                    break;
                }
            }

            setIsBlack(isOverBlackSection);
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => {
            window.removeEventListener("scroll", handleScroll);
        };
    }, [pathname]);

    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    return (
        <div className={styles.headerWrap}>
            <header className={`${styles.header} ${isBlack ? styles.black : styles.white}`}>
                <Link href="/" className={styles.logo}>
                    <div className={styles.desktopLogo}>
                        {isBlack ? (
                            <Image src="/images/logo_white.png" alt="모두의철거" width={203} height={45} priority style={{ width: '100%', height: 'auto' }} />
                        ) : (
                            <Image src="/images/logo_black.png" alt="모두의철거" width={203} height={45} priority style={{ width: '100%', height: 'auto' }} />
                        )}
                    </div>
                    <div className={styles.mobileLogo}>
                        {isBlack ? (
                            <Image src="/images/logo_white.png" alt="모두의철거" width={180} height={40} priority style={{ width: '100%', height: 'auto' }} />
                        ) : (
                            <Image src="/images/logo_black.png" alt="모두의철거" width={180} height={40} priority style={{ width: '100%', height: 'auto' }} />
                        )}
                    </div>
                </Link>
                <nav className={styles.gnb}>
                    {/* One page landing - no menu links */}
                </nav>
                <div className={styles.rightSection}>
                    <div className={styles.ctaWrap}>
                        <HeaderCallButton isBlack={isBlack} />
                        <button 
                            className={styles.ctaButton}
                            onClick={() => document.getElementById('quote-request')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            무료 견적 신청
                        </button>
                    </div>
                    <button
                        className={styles.hamburger}
                        onClick={() => setIsMenuOpen(true)}
                        aria-label="메뉴 열기"
                    >
                        <IoMenu size={28} color={isBlack ? "#fff" : "#000"} />
                    </button>
                </div>

                {mounted && createPortal(
                    <AnimatePresence>
                        {isMenuOpen && (
                            <>
                                <motion.div
                                    className={styles.overlay}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsMenuOpen(false)}
                                />
                                <motion.div
                                    className={styles.mobileMenu}
                                    initial={{ x: "100%" }}
                                    animate={{ x: 0 }}
                                    exit={{ x: "100%" }}
                                    transition={{ type: "tween", duration: 0.3 }}
                                >
                                    <div className={styles.menuHeader}>
                                        <button
                                            className={styles.closeButton}
                                            onClick={() => setIsMenuOpen(false)}
                                            aria-label="메뉴 닫기"
                                        >
                                            <IoClose size={28} />
                                        </button>
                                    </div>
                                    <nav className={styles.mobileGnb}>
                                        <button 
                                            className={styles.mobileCtaButton}
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                document.getElementById('quote-request')?.scrollIntoView({ behavior: 'smooth' });
                                            }}
                                        >
                                            무료 견적 신청
                                        </button>
                                    </nav>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>,
                    document.body
                )}
            </header>
        </div>
    );
}