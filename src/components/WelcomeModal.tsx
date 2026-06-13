import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface WelcomeModalProps {
  onClose: () => void;
}

export const WelcomeModal: React.FC<WelcomeModalProps> = ({ onClose }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  const handleConfirm = () => {
    // 存入當前 Unix 時間戳記 (方便未來做版本升級/公告更新時間比對)
    localStorage.setItem('has_seen_welcome_notice', new Date().getTime().toString());
    onClose();
  };

  return (
    <div style={styles.overlay}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.25 }}
        style={{
          ...styles.modal,
          width: isMobile ? '90%' : '540px',
          padding: isMobile ? '32px 20px' : '40px',
        }}
      >
        {/* 精美極簡幾何水晶圖示 */}
        <div style={styles.headerIcon}>
          <svg viewBox="0 0 24 24" width="36" height="36" fill="none" stroke="var(--text-primary)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
            <line x1="12" y1="22" x2="12" y2="15.5" />
            <polyline points="22 8.5 12 15.5 2 8.5" />
            <polyline points="2 15.5 12 8.5 22 15.5" />
            <line x1="12" y1="2" x2="12" y2="8.5" />
          </svg>
        </div>

        <h2 style={styles.title}>水晶探索聲明</h2>
        
        <div style={styles.content}>
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span style={{ marginRight: '6px' }}>✨</span> AI 協作與數位模擬
            </h3>
            <p style={styles.text}>
              本站所有水晶圓珠圖像、靈數學與礦物學解說均為 AI 協作生成。我們致力於為您提供極簡、精緻的模擬水晶，然而圖像與色澤可能與天然原石存在偏差，內容僅供參考，請知悉。
            </p>
          </div>

          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>
              <span style={{ marginRight: '6px' }}>🔍</span> 齊心協作，共同除錯
            </h3>
            <p style={styles.text}>
              若您在圖鑑閱讀或手鍊工坊操作時發現任何說明有誤，誠摯歡迎點選水晶詳情頁的 <b>「發現資訊錯誤？點此回報」</b> 回報，協助我們持續修正與優化 🙏
            </p>
          </div>
        </div>

        <button
          onClick={handleConfirm}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          style={{
            ...styles.confirmBtn,
            background: isHovered ? 'var(--text-primary)' : 'none',
            color: isHovered ? 'var(--bg-primary)' : 'var(--text-primary)',
          }}
        >
          我已了解，開啟探索
        </button>
      </motion.div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    backdropFilter: 'blur(12px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2000,
  },
  modal: {
    backgroundColor: 'var(--bg-primary)',
    border: '1px solid var(--border-medium)',
    borderRadius: '24px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.05)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  headerIcon: {
    marginBottom: '20px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.85,
  },
  title: {
    fontSize: '20px',
    fontWeight: '500',
    margin: '0 0 24px 0',
    color: 'var(--text-primary)',
  },
  content: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    marginBottom: '32px',
  },
  section: {
    textAlign: 'left',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '500',
    margin: '0 0 6px 0',
    color: 'var(--text-primary)',
    display: 'flex',
    alignItems: 'center',
  },
  text: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: 0,
  },
  confirmBtn: {
    border: '1px solid var(--text-primary)',
    borderRadius: '24px',
    padding: '10px 32px',
    fontSize: '12px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    outline: 'none',
  },
};
