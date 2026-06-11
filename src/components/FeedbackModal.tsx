import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { crystalsData } from '../data/crystals';
import { FEEDBACK_API_URL } from '../config';

interface FeedbackModalProps {
  target: string;
  onClose: () => void;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({ target, onClose }) => {
  const [crystalName, setCrystalName] = useState(target);
  const [reportType, setReportType] = useState('資訊錯誤');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  React.useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // 判斷是否為唯讀（從特定水晶卡片進入）
  const isReadOnly = target !== '全站建議 / 其他';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || description.trim().length < 5) {
      setErrorMessage('請輸入至少 5 個字的回報內容描述。');
      setStatus('error');
      return;
    }

    setStatus('submitting');
    setErrorMessage('');

    const payload = {
      crystalName,
      type: reportType,
      description: description.trim(),
      contact: contact.trim(),
    };

    // 如果沒有配置 API URL，在開發模式下進行虛擬提交，並給予說明
    if (!FEEDBACK_API_URL) {
      console.log('Feedback payload (local simulation):', payload);
      setTimeout(() => {
        setStatus('success');
      }, 1000);
      return;
    }

    try {
      await fetch(FEEDBACK_API_URL, {
        method: 'POST',
        mode: 'no-cors', // 避開 Google Apps Script 的 CORS 重定向限制
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(payload),
      });

      // 在 no-cors 模式下，回應會是 opaque (不透明)，無法讀取內容。
      // 只要 fetch 順利送出且無丟出 Exception，即代表請求已送達並寫入 Google Sheets。
      setStatus('success');
    } catch (err: any) {
      console.error('Feedback submit error:', err);
      setErrorMessage(
        err.message || '連線錯誤。請確認網路連線是否正常。'
      );
      setStatus('error');
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        style={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          style={{
            ...styles.closeBtn,
            fontSize: isMobile ? '20px' : '16px',
            padding: isMobile ? '12px' : '4px',
            top: isMobile ? '12px' : '20px',
            right: isMobile ? '12px' : '20px',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={onClose}
        >
          ✕
        </button>

        {status === 'success' ? (
          <div style={styles.successContainer}>
            <div style={styles.successIcon}>
              <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="var(--text-tertiary)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
            <h3 style={styles.successTitle}>感謝您的回報！</h3>
            <p style={styles.successText}>
              您的意見將協助我們完善水晶百科。
              {!FEEDBACK_API_URL && (
                <span style={styles.apiNotice}>
                  <br />
                  <br />
                  💡 <strong>系統提示（本機測試）</strong>：目前尚未配置 <code>src/config.ts</code> 中的 <code>FEEDBACK_API_URL</code>，此回報為本地模擬提交。
                </span>
              )}
            </p>
            <button style={styles.actionBtn} onClick={onClose}>確定</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.header}>
              <h3 style={styles.title}>百科勘誤與建議</h3>
              <p style={styles.subtitle}>歡迎回報水晶百科資訊的任何遺漏、錯誤或排版問題</p>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>回報對象</label>
              {isReadOnly ? (
                <div style={styles.readOnlyInput}>
                  <span>{crystalName}</span>
                  <span style={styles.readOnlyTag}>自動帶入</span>
                </div>
              ) : (
                <select
                  style={{
                    ...styles.select,
                    fontSize: isMobile ? '16px' : '13px',
                  }}
                  value={crystalName}
                  onChange={(e) => setCrystalName(e.target.value)}
                >
                  <option value="全站建議 / 其他">全站建議 / 其他</option>
                  {crystalsData.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name} ({c.englishName})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>問題類型</label>
              <select
                style={{
                  ...styles.select,
                  fontSize: isMobile ? '16px' : '13px',
                }}
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="資訊錯誤">學科資訊錯誤 (化學式、硬度、結晶等)</option>
                <option value="圖片色差">水晶圖片與實物或標記色差太大</option>
                <option value="靈數錯誤">生命靈數對應錯誤</option>
                <option value="功能建議">功能建議 / 排版優化</option>
                <option value="其他">其他</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>具體說明 (必填)</label>
              <textarea
                style={{
                  ...styles.textarea,
                  fontSize: isMobile ? '16px' : '13px',
                }}
                placeholder="例如：紫水晶的硬度標記為 7，但有些地方說明寫成 6... / 這顆水晶的圖檔跟實際有色差，應該偏黃色..."
                value={description}
                onChange={(e) => {
                  setDescription(e.target.value);
                  if (status === 'error') setStatus('idle');
                }}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>聯絡方式 (選填)</label>
              <input
                type="text"
                style={{
                  ...styles.input,
                  fontSize: isMobile ? '16px' : '13px',
                }}
                placeholder="Email 或 LINE 等，方便向您核對與致謝"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
              />
            </div>

            {status === 'error' && (
              <div style={styles.errorBanner}>
                ⚠️ {errorMessage || '請檢查您的輸入。'}
              </div>
            )}

            {!FEEDBACK_API_URL && status !== 'error' && (
              <div style={styles.infoBanner}>
                ℹ️ 目前未部署 Google Sheet API，提交將僅在主控台模擬輸出。
              </div>
            )}

            <div style={styles.footer}>
              <button
                type="button"
                style={styles.cancelBtn}
                onClick={onClose}
                disabled={status === 'submitting'}
              >
                取消
              </button>
              <button
                type="submit"
                style={styles.submitBtn}
                disabled={status === 'submitting'}
              >
                {status === 'submitting' ? '提交中...' : '提交回報'}
              </button>
            </div>
          </form>
        )}
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
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'var(--bg-primary, #ffffff)',
    borderRadius: '16px',
    border: '1px solid var(--border-light, #eaeaea)',
    width: '90%',
    maxWidth: '460px',
    padding: '36px',
    position: 'relative',
    boxShadow: '0 10px 40px rgba(0,0,0,0.05)',
  },
  closeBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    color: 'var(--text-tertiary, #999)',
    cursor: 'pointer',
    padding: '4px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  header: {
    marginBottom: '8px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-primary, #2c3e50)',
    margin: '0 0 6px 0',
  },
  subtitle: {
    fontSize: '12px',
    color: 'var(--text-tertiary, #7f8c8d)',
    margin: 0,
    lineHeight: '1.5',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontSize: '11px',
    fontWeight: '600',
    color: 'var(--text-secondary, #34495e)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  readOnlyInput: {
    backgroundColor: 'var(--bg-secondary, #f9f9f9)',
    border: '1px solid var(--border-light, #eaeaea)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '13px',
    color: 'var(--text-primary, #2c3e50)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  readOnlyTag: {
    fontSize: '9px',
    color: 'var(--text-tertiary, #999)',
    backgroundColor: '#eaeaea',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  select: {
    backgroundColor: 'var(--bg-primary, #ffffff)',
    border: '1px solid var(--border-light, #eaeaea)',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: 'var(--text-primary, #2c3e50)',
    outline: 'none',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  textarea: {
    backgroundColor: 'var(--bg-primary, #ffffff)',
    border: '1px solid var(--border-light, #eaeaea)',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: 'var(--text-primary, #2c3e50)',
    outline: 'none',
    fontFamily: 'inherit',
    minHeight: '90px',
    resize: 'vertical',
    lineHeight: '1.6',
  },
  input: {
    backgroundColor: 'var(--bg-primary, #ffffff)',
    border: '1px solid var(--border-light, #eaeaea)',
    borderRadius: '8px',
    padding: '10px 12px',
    fontSize: '13px',
    color: 'var(--text-primary, #2c3e50)',
    outline: 'none',
    fontFamily: 'inherit',
  },
  errorBanner: {
    backgroundColor: '#fdf3f2',
    border: '1px solid #f5c2c2',
    color: '#c0392b',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  infoBanner: {
    backgroundColor: 'var(--bg-secondary, #f9f9f9)',
    border: '1px solid var(--border-light, #eaeaea)',
    color: 'var(--text-tertiary, #7f8c8d)',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '12px',
    lineHeight: '1.4',
  },
  footer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    marginTop: '10px',
  },
  cancelBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-tertiary, #7f8c8d)',
    padding: '10px 20px',
    fontSize: '13px',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
  },
  submitBtn: {
    backgroundColor: 'var(--text-primary, #2c3e50)',
    border: 'none',
    color: '#ffffff',
    padding: '10px 24px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    transition: 'opacity 0.2s',
  },
  successContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    padding: '20px 0 10px 0',
  },
  successIcon: {
    marginBottom: '20px',
  },
  successTitle: {
    fontSize: '18px',
    fontWeight: '500',
    color: 'var(--text-primary, #2c3e50)',
    margin: '0 0 10px 0',
  },
  successText: {
    fontSize: '13px',
    color: 'var(--text-secondary, #7f8c8d)',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
    maxWidth: '320px',
  },
  apiNotice: {
    fontSize: '11px',
    color: '#b38600',
    display: 'block',
    lineHeight: '1.5',
  },
  actionBtn: {
    backgroundColor: 'var(--text-primary, #2c3e50)',
    border: 'none',
    color: '#ffffff',
    padding: '10px 32px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
    borderRadius: '8px',
    width: '100%',
    maxWidth: '120px',
  },
};
