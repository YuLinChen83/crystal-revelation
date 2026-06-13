import { useState, useEffect, startTransition } from 'react';
import { useLocation, useNavigate, matchPath } from 'react-router-dom';
import { Encyclopedia } from './components/Encyclopedia';
import { NumerologyCalculator } from './components/NumerologyCalculator';
import { BraceletSimulator } from './components/BraceletSimulator';
import { AnimatePresence } from 'framer-motion';
import { FeedbackModal } from './components/FeedbackModal';
import { WelcomeModal } from './components/WelcomeModal';
import { PORTALY_SPONSOR_URL } from './config';
import './App.css';

type Page = 'encyclopedia' | 'numerology' | 'diy';

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [currentPage, setCurrentPage] = useState<Page>(() => {
    if (typeof window === 'undefined') return 'encyclopedia';
    const path = window.location.pathname;
    const cleanPath = path.replace(/\/$/, '').replace(/\/index\.html$/, '');
    if (cleanPath === '/diy') return 'diy';
    if (cleanPath === '/numerology') return 'numerology';
    return 'encyclopedia';
  });

  // 用於同步 URL 到 currentPage
  useEffect(() => {
    const path = location.pathname;
    const cleanPath = path.replace(/\/$/, '').replace(/\/index\.html$/, '');
    startTransition(() => {
      if (cleanPath === '/diy') {
        setCurrentPage('diy');
      } else if (cleanPath === '/numerology') {
        setCurrentPage('numerology');
      } else {
        setCurrentPage('encyclopedia');
      }
    });
  }, [location.pathname]);

  const cleanPath = location.pathname.replace(/\/$/, '').replace(/\/index\.html$/, '');
  const crystalMatch = matchPath('/crystals/:id', cleanPath);
  const activeCrystalIdFromUrl = crystalMatch ? crystalMatch.params.id : null;
  // 用於在生命靈數測算後，一鍵帶入手鍊 DIY 的水晶 ID
  const [selectedCrystalForDIY, setSelectedCrystalForDIY] = useState<string | null>(null);
  const [defaultShowFavoritesInDIY, setDefaultShowFavoritesInDIY] = useState<boolean>(false);
  const [defaultNumerologyFilter, setDefaultNumerologyFilter] = useState<string[]>([]);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.innerWidth <= 768;
  });
  const [isDoubleColumn, setIsDoubleColumn] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.innerWidth > 1080;
  });
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackTarget, setFeedbackTarget] = useState('全站建議 / 其他');
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const storedTime = localStorage.getItem('has_seen_welcome_notice');
    if (!storedTime) return true;
    
    // 預留未來版本升級/強制重新閱讀的邏輯。
    // 如果有新的通知，將下方 thresholdTime 設為新公告的發布時間即可。
    // const thresholdTime = new Date('2026-06-15T00:00:00Z').getTime();
    // if (Number(storedTime) < thresholdTime) return true;
    
    return false;
  });

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
    startTransition(() => {
      if (page === 'diy') {
        navigate('/diy');
      } else if (page === 'numerology') {
        navigate('/numerology');
      } else {
        navigate('/encyclopedia');
      }
      window.scrollTo(0, 0);
    });
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
                window.open(PORTALY_SPONSOR_URL, '_blank');
              }}
              data-umami-event="navbar.sponsor"
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
              autoOpenCrystalId={activeCrystalIdFromUrl || undefined}
              onCloseCrystalModal={() => {
                navigate('/encyclopedia');
              }}
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
          <p style={{ margin: 0, fontWeight: '500' }}>© 2026 水晶啟示錄 · 純白極簡水晶探索平台</p>
          <p style={{ margin: '6px 0 0 0', color: 'var(--text-tertiary)', fontSize: '10px', maxWidth: '600px', textAlign: 'center', lineHeight: '1.6' }}>
            本站所有內容包含圖片均由 AI 協作生成，部分資訊可能與科學或礦物學事實存在偏差，僅供探索參考。
          </p>
        </div>
      </footer>

      <AnimatePresence>
        {isFeedbackOpen && (
          <FeedbackModal
            target={feedbackTarget}
            onClose={() => setIsFeedbackOpen(false)}
          />
        )}
        {isWelcomeOpen && (
          <WelcomeModal
            onClose={() => setIsWelcomeOpen(false)}
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
    minHeight: 'calc(100vh - 180px)', // 為主容器預留最小高度，避免在頁面切換、卸載掛載時高度塌陷造成的 CLS 偏移
  },
  footer: {
    borderTop: '1px solid var(--border-light)',
    padding: '30px 0',
  },
  footerContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
  },
};

export default App;
