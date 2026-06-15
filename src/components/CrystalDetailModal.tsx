import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { type Crystal } from '../data/crystals';

export interface CrystalDetailModalProps {
  crystal: Crystal;
  onClose: () => void;
  isMobile: boolean;
  onOpenFeedback: (crystalName: string) => void;
  favorites: string[];
  onToggleFavorite: (crystalId: string) => void;
}

export const CrystalDetailModal: React.FC<CrystalDetailModalProps> = ({
  crystal,
  onClose,
  isMobile,
  onOpenFeedback,
  favorites,
  onToggleFavorite,
}) => {
  const [isReportHovered, setIsReportHovered] = useState(false);
  const [isSearchHovered, setIsSearchHovered] = useState(false);
  const [activeTab, setActiveTab] = useState<'science' | 'myth'>('science');
  const isFavorite = favorites.includes(crystal.id);

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...styles.modalContent,
          padding: isMobile ? '24px 16px' : '40px',
          maxHeight: isMobile ? '90vh' : 'auto',
          overflowY: isMobile ? 'auto' : 'visible',
        }}
      >
        {/* 關閉按鈕 */}
        <button onClick={onClose} style={styles.closeBtn}>
          ✕
        </button>

        <div
          style={{
            ...styles.modalLayout,
            gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
            gap: isMobile ? '24px' : '40px',
          }}
        >
          {/* 左側大水晶珠展示 */}
          <div
            style={{
              ...styles.modalLeft,
              borderRight: isMobile ? 'none' : '1px solid var(--border-light)',
              borderBottom: isMobile ? '1px solid var(--border-light)' : 'none',
              paddingRight: isMobile ? '0' : '32px',
              paddingBottom: isMobile ? '24px' : '0',
              position: 'relative',
            }}
          >
            {/* 桌面版收藏愛心按鈕，位置貼近隔線旁，不需背景與陰影 */}
            {!isMobile && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleFavorite(crystal.id);
                }}
                style={{
                  position: 'absolute',
                  top: '0px',
                  right: '32px',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transition: 'transform 0.2s',
                  zIndex: 10,
                }}
                title={isFavorite ? '取消收藏' : '加入收藏'}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="22"
                  height="22"
                  fill={isFavorite ? '#e8a7a1' : 'none'}
                  stroke={isFavorite ? '#d98880' : 'var(--text-tertiary)'}
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
              </button>
            )}

            <div style={styles.modalBeadCircle}>
              <img
                src={crystal.image}
                alt={crystal.name}
                style={styles.modalBeadImage}
              />
            </div>
            <a
              href={`https://www.google.com/search?tbm=isch&q=${encodeURIComponent(crystal.name + ' ' + (crystal.englishName || '') + ' 水晶')}`}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setIsSearchHovered(true)}
              onMouseLeave={() => setIsSearchHovered(false)}
              style={{
                ...styles.googleSearchBtn,
                position: 'absolute',
                top: '108px',
                right: isMobile ? '16px' : '32px',
                background: isSearchHovered ? 'var(--border-light, #e4e7eb)' : 'rgba(255, 255, 255, 0.4)',
                borderColor: isSearchHovered ? 'var(--text-tertiary, #a4b0be)' : 'var(--border-light, #e4e7eb)',
                color: isSearchHovered ? 'var(--text-primary)' : 'var(--text-secondary)',
              }}
            >
              Google 圖片 ↗
            </a>

            {/* 水晶名稱區域（手機版將最愛按鈕貼右邊界） */}
            <div style={{ position: 'relative', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <h2 style={{ ...styles.modalTitle, margin: 0, padding: '0 40px' }}>{crystal.name}</h2>
              {isMobile && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleFavorite(crystal.id);
                  }}
                  style={{
                    position: 'absolute',
                    right: '16px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                  }}
                  title={isFavorite ? '取消收藏' : '加入收藏'}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="20"
                    height="20"
                    fill={isFavorite ? '#e8a7a1' : 'none'}
                    stroke={isFavorite ? '#d98880' : 'var(--text-tertiary)'}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                </button>
              )}
            </div>
            <p style={styles.modalSub}>{crystal.englishName} | {crystal.chemicalFormula}</p>
            <div style={styles.modalTagRow}>
              <span style={styles.modalTag}>靈數 {crystal.numerology.join('、')}</span>
              {crystal.traits.map((t) => (
                <span key={t} style={styles.modalTag}>{t}</span>
              ))}
            </div>
            <p style={styles.modalSummary}>{crystal.shortDescription}</p>
            <button
              onClick={() => onOpenFeedback(crystal.name)}
              onMouseEnter={() => setIsReportHovered(true)}
              onMouseLeave={() => setIsReportHovered(false)}
              style={{
                ...styles.reportBtn,
                color: isReportHovered ? 'var(--text-primary)' : 'var(--text-tertiary)',
              }}
            >
              <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '4px' }}>
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              發現資訊錯誤？點此回報
            </button>
          </div>

          {/* 右側資訊與 Tab 切換 */}
          <div style={styles.modalRight}>
            <div style={styles.tabHeader}>
              <button
                onClick={() => setActiveTab('science')}
                style={{
                  ...styles.tabBtn,
                  borderBottomColor: activeTab === 'science' ? 'var(--text-primary)' : 'transparent',
                  color: activeTab === 'science' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: activeTab === 'science' ? '500' : 'normal',
                }}
              >
                學術科普
              </button>
              <button
                onClick={() => setActiveTab('myth')}
                style={{
                  ...styles.tabBtn,
                  borderBottomColor: activeTab === 'myth' ? 'var(--text-primary)' : 'transparent',
                  color: activeTab === 'myth' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: activeTab === 'myth' ? '500' : 'normal',
                }}
              >
                起源與神話
              </button>
            </div>

            <div style={styles.tabBody}>
              {activeTab === 'science' ? (
                <div style={styles.scienceTab}>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>礦物分類</span>
                    <span style={styles.infoValue}>{crystal.mineralClass}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>摩氏硬度</span>
                    <span style={styles.infoValue}>{crystal.hardness}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>晶體結構</span>
                    <span style={styles.infoValue}>{crystal.crystalSystem}</span>
                  </div>
                  <div style={styles.infoItem}>
                    <span style={styles.infoLabel}>自然成因</span>
                    <p style={styles.infoText}>{crystal.formation}</p>
                  </div>
                </div>
              ) : (
                <div style={styles.mythTab}>
                  <p style={styles.storyText}>{crystal.mythology}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modalContent: {
    backgroundColor: 'var(--bg-primary)',
    width: '780px',
    maxWidth: '90%',
    padding: '40px',
    border: '1px solid var(--border-medium)',
    position: 'relative',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.03)',
  },
  closeBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: 'var(--text-tertiary)',
    transition: 'color 0.2s',
    padding: '12px',
    zIndex: 100,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLayout: {
    display: 'grid',
    gridTemplateColumns: '300px 1fr',
    gap: '40px',
  },
  modalLeft: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    borderRight: '1px solid var(--border-light)',
    paddingRight: '32px',
  },
  modalBeadCircle: {
    width: '130px',
    height: '130px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: '20px',
  },
  modalBeadImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    mixBlendMode: 'multiply',
  },
  modalTitle: {
    fontSize: '24px',
    margin: '0 0 4px 0',
    fontWeight: '500',
  },
  modalSub: {
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    margin: '0 0 16px 0',
    fontFamily: 'var(--mono)',
  },
  modalTagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: '6px',
    marginBottom: '20px',
  },
  modalTag: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-secondary)',
    padding: '3px 8px',
    border: '1px solid var(--border-light)',
  },
  modalSummary: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: 0,
    textAlign: 'left',
  },
  googleSearchBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    textDecoration: 'none',
    border: '1px solid var(--border-light)',
    borderRadius: '16px',
    padding: '4px 10px',
    fontSize: '10px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    whiteSpace: 'nowrap',
  },
  reportBtn: {
    display: 'flex',
    alignItems: 'center',
    background: 'none',
    border: 'none',
    fontSize: '11px',
    cursor: 'pointer',
    marginTop: '16px',
    padding: '4px 0',
    transition: 'color 0.2s',
  },
  modalRight: {
    display: 'flex',
    flexDirection: 'column',
  },
  tabHeader: {
    display: 'flex',
    gap: '24px',
    borderBottom: '1px solid var(--border-light)',
    marginBottom: '24px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '0 0 8px 0',
    cursor: 'pointer',
    fontSize: '14px',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  tabBody: {
    flex: 1,
    fontSize: '13.5px',
    lineHeight: '1.7',
    color: 'var(--text-secondary)',
  },
  scienceTab: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  infoItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  infoLabel: {
    color: 'var(--text-tertiary)',
    fontSize: '11px',
    textTransform: 'uppercase',
  },
  infoValue: {
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
  infoText: {
    color: 'var(--text-secondary)',
    margin: 0,
  },
  mythTab: {
    textAlign: 'left',
  },
  storyText: {
    margin: 0,
    whiteSpace: 'pre-line',
  },
};
