import { useState, useEffect } from 'react';
import { Encyclopedia } from './components/Encyclopedia';
import { NumerologyCalculator } from './components/NumerologyCalculator';
import { BraceletSimulator } from './components/BraceletSimulator';
import { AnimatePresence } from 'framer-motion';
import { FeedbackModal } from './components/FeedbackModal';
import { BUY_ME_A_COFFEE_URL } from './config';
import './App.css';

type Page = 'encyclopedia' | 'numerology' | 'diy';

function App() {
  const [currentPage, setCurrentPage] = useState<Page>(() => {
    const stored = localStorage.getItem('crystal_current_page');
    return (stored as Page) || 'encyclopedia';
  });
  // 用於在生命靈數測算後，一鍵帶入手鍊 DIY 的水晶 ID
  const [selectedCrystalForDIY, setSelectedCrystalForDIY] = useState<string | null>(null);
  const [defaultShowFavoritesInDIY, setDefaultShowFavoritesInDIY] = useState<boolean>(false);
  const [defaultNumerologyFilter, setDefaultNumerologyFilter] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [isDoubleColumn, setIsDoubleColumn] = useState(true);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState('全站建議 / 其他');

  const handleOpenFeedback = (target: string) => {
    setFeedbackTarget(target);
    setIsFeedbackOpen(true);
  };

  // 全域收藏水晶 ID 狀態
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('crystal_favorites');
    return stored ? JSON.parse(stored) : [];
  });

  const toggleFavorite = (crystalId: string) => {
    setFavorites((prev) => {
      const updated = prev.includes(crystalId)
        ? prev.filter((id) => id !== crystalId)
        : [...prev, crystalId];
      localStorage.setItem('crystal_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      setIsDoubleColumn(window.innerWidth > 1080);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const navigateToPage = (page: Page) => {
    if (currentPage === page) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    setCurrentPage(page);
    localStorage.setItem('crystal_current_page', page);
  };

  const handleNavigateToDIY = (enableFavoritesFilter?: boolean) => {
    if (enableFavoritesFilter) {
      setDefaultShowFavoritesInDIY(true);
    } else {
      setDefaultShowFavoritesInDIY(false);
    }
    navigateToPage('diy');
  };

  const handleNavigateToEncyclopedia = (numerology: string[]) => {
    setDefaultNumerologyFilter(numerology);
    navigateToPage('encyclopedia');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div 
      style={{
        ...styles.appContainer,
        ...(currentPage === 'diy' && isDoubleColumn ? { height: '100vh', minHeight: '560px', overflowY: 'auto' } : {})
      }}
    >
      {/* 頂部極簡導覽列 */}
      <header style={styles.header}>
        <div
          style={{
            ...styles.headerContent,
            flexDirection: isMobile ? 'column' : 'row',
            gap: isMobile ? '12px' : '0',
            padding: isMobile ? '16px 20px' : '20px 40px',
          }}
        >
          <div 
            style={{ ...styles.logo, cursor: 'pointer' }}
            onClick={() => {
              navigateToPage('encyclopedia');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          >
            <span style={styles.logoMain}>水晶啟示錄</span>
            <span style={styles.logoSub}>Crystal Revelation</span>
          </div>

          <nav
            style={{
              ...styles.nav,
              gap: isMobile ? '18px' : '28px',
            }}
          >
            <button
              onClick={() => navigateToPage('encyclopedia')}
              style={{
                ...styles.navLink,
                color: currentPage === 'encyclopedia' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                borderBottomColor: currentPage === 'encyclopedia' ? 'var(--text-primary)' : 'transparent',
              }}
            >
              百科展覽
            </button>
            <button
              onClick={() => navigateToPage('numerology')}
              style={{
                ...styles.navLink,
                color: currentPage === 'numerology' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                borderBottomColor: currentPage === 'numerology' ? 'var(--text-primary)' : 'transparent',
              }}
            >
              靈數測算
            </button>
            <button
              onClick={() => navigateToPage('diy')}
              style={{
                ...styles.navLink,
                color: currentPage === 'diy' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                borderBottomColor: currentPage === 'diy' ? 'var(--text-primary)' : 'transparent',
              }}
            >
              手鍊工坊
            </button>
            <button
              onClick={() => handleOpenFeedback('全站建議 / 其他')}
              style={{
                ...styles.navLink,
                color: 'var(--text-tertiary)',
                borderBottomColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {!isMobile && (
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              )}
              問題回報
            </button>
            <button
              onClick={() => {
                if (BUY_ME_A_COFFEE_URL.includes('your_username')) {
                  alert('💡 提示：請先在 src/config.ts 中填入您註冊的 Buy Me a Coffee 專屬贊助連結喔！');
                } else {
                  window.open(BUY_ME_A_COFFEE_URL, '_blank');
                }
              }}
              style={{
                ...styles.navLink,
                color: 'var(--text-tertiary)',
                borderBottomColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              {!isMobile && (
                <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
                  <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
                  <line x1="6" y1="2" x2="6" y2="5" />
                  <line x1="10" y1="2" x2="10" y2="5" />
                  <line x1="14" y1="2" x2="14" y2="5" />
                </svg>
              )}
              贊助咖啡
            </button>
          </nav>
        </div>
      </header>

      {/* 頁面主體渲染 */}
      <main
        style={{
          ...styles.mainContent,
          paddingTop: isMobile ? '0px' : '20px',
          ...(currentPage === 'diy' && isDoubleColumn ? { display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', flex: 1 } : {}),
        }}
      >
        <div 
          className="container"
          style={currentPage === 'diy' && isDoubleColumn ? { display: 'flex', flexDirection: 'column', overflow: 'hidden', height: '100%', flex: 1, width: '100%' } : undefined}
        >
          {currentPage === 'encyclopedia' && (
            <Encyclopedia
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onOpenFeedback={handleOpenFeedback}
              defaultNumerologyFilter={defaultNumerologyFilter}
              onResetDefaultNumerologyFilter={() => setDefaultNumerologyFilter([])}
            />
          )}
          {currentPage === 'numerology' && (
            <NumerologyCalculator
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onNavigateToDIY={handleNavigateToDIY}
              onNavigateToEncyclopedia={handleNavigateToEncyclopedia}
              onOpenFeedback={handleOpenFeedback}
            />
          )}
          {currentPage === 'diy' && (
            <BraceletSimulator
              preselectedCrystalId={selectedCrystalForDIY}
              onClearPreselected={() => setSelectedCrystalForDIY(null)}
              favorites={favorites}
              onToggleFavorite={toggleFavorite}
              onOpenFeedback={handleOpenFeedback}
              defaultShowFavoritesOnly={defaultShowFavoritesInDIY}
              onResetDefaultShowFavorites={() => setDefaultShowFavoritesInDIY(false)}
            />
          )}
        </div>
      </main>

      {/* 極簡頁腳 */}
      <footer style={styles.footer}>
        <div className="container" style={styles.footerContent}>
          <p>© 2026 水晶啟示錄 · 純白極簡水晶探索平台</p>
        </div>
      </footer>

      <AnimatePresence>
        {isFeedbackOpen && (
          <FeedbackModal
            target={feedbackTarget}
            onClose={() => setIsFeedbackOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-primary)',
  },
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.96)',
    borderBottom: '1px solid var(--border-light)',
    zIndex: 100,
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '20px 40px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  logoMain: {
    fontSize: '15px',
    fontWeight: '600',
    letterSpacing: '1px',
    color: 'var(--text-primary)',
  },
  logoSub: {
    fontSize: '9px',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    fontFamily: 'var(--mono)',
  },
  nav: {
    display: 'flex',
    gap: '28px',
  },
  navLink: {
    background: 'none',
    border: 'none',
    borderBottom: '1.5px solid transparent',
    padding: '4px 0',
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'all 0.2s ease',
  },
  mainContent: {
    flex: 1,
    paddingTop: '20px',
  },
  footer: {
    borderTop: '1px solid var(--border-light)',
    padding: '30px 0',
  },
  footerContent: {
    display: 'flex',
    justifyContent: 'center',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
  },
};

export default App;
