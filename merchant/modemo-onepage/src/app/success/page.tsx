import Link from "next/link";
import styles from "./success.module.css";
import { FiCheckCircle } from "react-icons/fi";

export default function SuccessPage() {
    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <FiCheckCircle className={styles.icon} />
                <h1 className={styles.title}>신청이 완료되었습니다</h1>
                <p className={styles.desc}>
                    빠른 시일 내에 기재해주신 연락처로 안내해 드리겠습니다.<br />
                    이용해 주셔서 감사합니다.
                </p>
                <Link href="/" className={styles.btn}>
                    홈으로 돌아가기
                </Link>
            </div>
        </div>
    );
}
