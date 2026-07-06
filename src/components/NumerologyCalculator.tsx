import React, { useState, useEffect, useMemo } from 'react';
import { crystalsData, type Crystal } from '../data/crystals';
import { motion, AnimatePresence } from 'framer-motion';
import { CrystalDetailModal } from './CrystalDetailModal';
import { numerologyData } from '../data/numerologyData';


const AD_TEMPLATES = [
  {
    prefix: "🔮 能量調頻：配戴水晶平衡磁場同時，也推薦到 ",
    linkText: "17LIVE",
    url: "https://17.live",
    suffix: " 探索療癒與占卜直播，在聲音與社群共鳴中放鬆身心。",
    event: "numerology.click_17LIVE_1"
  },
  {
    prefix: "✨ 心靈充能：生活疲憊時，不妨去 ",
    linkText: "17LIVE",
    url: "https://17.live",
    suffix: " 聆聽音樂與療癒直播，透過溫暖的歌聲與交流為心靈找回光芒。",
    event: "numerology.click_17LIVE_2"
  },
  {
    prefix: "🌿 共振日常：除了水晶的陪伴，也可以去 ",
    linkText: "17LIVE",
    url: "https://17.live",
    suffix: " 探索音樂、療癒與塔羅占卜直播，在空中社群裡找到心靈共鳴 ꙳⸌♡⸍꙳",
    event: "numerology.click_17LIVE_3"
  },
  {
    prefix: "🔮 想深入探索生命靈數與個人運勢？去 ",
    linkText: "17LIVE 命理小舖",
    url: "https://17.live/zh-Hant/suggested?subtab=label:fortune_teller",
    suffix: "，讓占卜師主播們為你即時指點迷津 *ੈ✩",
    event: "numerology.click_17LIVE_4"
  }
];

interface NumerologyResult {
  lifePathNumber: number;
  birthDigits: number[];
  missingNumbers: number[];
}

interface NumerologyCalculatorProps {
  favorites: string[];
  onToggleFavorite: (crystalId: string) => void;
  onNavigateToDIY: (enableFavoritesFilter?: boolean) => void;
  onNavigateToEncyclopedia: (numerologyFilter: string[]) => void;
  onOpenFeedback: (crystalName: string) => void;
}

export const NumerologyCalculator: React.FC<NumerologyCalculatorProps> = ({
  favorites,
  onToggleFavorite,
  onNavigateToDIY,
  onNavigateToEncyclopedia,
  onOpenFeedback,
}) => {
  const [birthDate, setBirthDate] = useState<string>('');
  const [result, setResult] = useState<NumerologyResult | null>(null);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  const currentPathData = useMemo(() => {
    if (!result) return null;
    return numerologyData.life_path_data[result.lifePathNumber.toString()] || null;
  }, [result]);

  const [showInfoTooltip, setShowInfoTooltip] = useState<boolean>(false);
  const [showTraitsModal, setShowTraitsModal] = useState<boolean>(false);

  // 監聽 ESC 鍵關閉彈窗
  useEffect(() => {
    if (!showTraitsModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowTraitsModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showTraitsModal]);

  // 隨機選擇心靈調頻廣告索引，當靈數結果改變時重新隨機，防止頻繁閃爍
  const adIndex = useMemo(() => {
    return Math.floor(Math.random() * AD_TEMPLATES.length);
  }, [result?.lifePathNumber]);

  // 當 Tooltip 展開時，點擊頁面其他地方自動關閉 Tooltip
  useEffect(() => {
    if (!showInfoTooltip) return;
    const handleCloseTooltip = () => {
      setShowInfoTooltip(false);
    };
    window.addEventListener('click', handleCloseTooltip);
    return () => window.removeEventListener('click', handleCloseTooltip);
  }, [showInfoTooltip]);

  // 當前啟用的結果頁籤 ('main' = 命定水晶, 'missing' = 缺數水晶)
  const [activeResultTab, setActiveResultTab] = useState<'main' | 'missing'>('main');

  // 隨機推薦的水晶 State
  const [shuffledMainCrystals, setShuffledMainCrystals] = useState<any[]>([]);
  const [shuffledMissingCrystals, setShuffledMissingCrystals] = useState<any[]>([]);

  // 水晶詳情 Modal 狀態
  const [activeModalCrystal, setActiveModalCrystal] = useState<Crystal | null>(null);

  // 隨機打亂陣列
  const shuffleArray = (arr: any[]) => {
    return [...arr].sort(() => Math.random() - 0.5);
  };

  // 實際執行靈數測算邏輯的抽離函式
  const runCalculation = (dateStr: string) => {
    const dateDigits = dateStr.replace(/[^0-9]/g, '');
    if (dateDigits.length === 0) return;

    let sum = dateDigits.split('').reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    while (sum > 9) {
      sum = sum
        .toString()
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    }
    const lifePathNumber = sum;

    const birthDigits = Array.from(new Set(dateDigits.split('').map(Number))).filter(n => n > 0);
    const missingNumbers = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(
      (num) => !birthDigits.includes(num)
    );

    setResult({
      lifePathNumber,
      birthDigits,
      missingNumbers,
    });

    // 篩選出命定水晶與缺數水晶，並進行隨機排序
    const matchedMain = crystalsData.filter((c) => c.numerology.includes(lifePathNumber));
    const matchedMissing = crystalsData.filter((c) =>
      c.numerology.some((num) => missingNumbers.includes(num))
    );

    setShuffledMainCrystals(shuffleArray(matchedMain));
    setShuffledMissingCrystals(shuffleArray(matchedMissing));
  };

  // 測算提交處理
  const calculateNumerology = (e: React.FormEvent) => {
    e.preventDefault();
    if (!birthDate) return;

    // 將生日寫入快照記憶
    localStorage.setItem('numerology_birth_date', birthDate);
    runCalculation(birthDate);

    // 預設切換至命定水晶頁籤
    setActiveResultTab('main');
  };

  // 初始化載入歷史生日記憶
  useEffect(() => {
    const storedDate = localStorage.getItem('numerology_birth_date');
    if (storedDate) {
      setBirthDate(storedDate);
      runCalculation(storedDate);
    }
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobileOrTablet = windowWidth <= 768;

  // 取得當前要顯示的水晶（上限為前 6 筆）
  const visibleMainCrystals = shuffledMainCrystals.slice(0, 6);
  const visibleMissingCrystals = shuffledMissingCrystals.slice(0, 6);

  const activeCrystals = activeResultTab === 'main' ? visibleMainCrystals : visibleMissingCrystals;
  const totalActiveCount = activeResultTab === 'main' ? shuffledMainCrystals.length : shuffledMissingCrystals.length;

  const handleSeeMoreInEncyclopedia = () => {
    if (!result) return;
    if (activeResultTab === 'main') {
      // 命定水晶：傳遞主命數篩選
      onNavigateToEncyclopedia([result.lifePathNumber.toString()]);
    } else {
      // 缺數水晶：傳遞所有缺數靈數作為多選篩選
      onNavigateToEncyclopedia(result.missingNumbers.map(String));
    }
  };

  return (
    <div style={styles.container}>
      <div
        style={{
          ...styles.card,
          padding: isMobileOrTablet ? '24px 16px' : '40px',
        }}
      >
        {/* 標題與 Info 簡介 */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px', position: 'relative' }}>
          <h2 style={{ ...styles.title, margin: 0 }}>生命靈數水晶測算</h2>
          
          {/* Info Icon & Tooltip */}
          <div
            onMouseEnter={() => !isMobileOrTablet && setShowInfoTooltip(true)}
            onMouseLeave={() => !isMobileOrTablet && setShowInfoTooltip(false)}
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoTooltip((prev) => !prev);
            }}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'help',
              color: 'var(--text-tertiary)',
              position: 'relative',
            }}
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>

            {/* Tooltip */}
            <div style={{ 
              position: isMobileOrTablet ? 'fixed' : 'absolute', 
              bottom: isMobileOrTablet ? '20px' : '24px', 
              left: isMobileOrTablet ? '50%' : '50%', 
              transform: 'translateX(-50%)', 
              zIndex: 1000, 
              pointerEvents: showInfoTooltip ? 'auto' : 'none' 
            }}>
              <AnimatePresence>
                {showInfoTooltip && (
                  <motion.div
                    initial={{ opacity: 0, y: 4, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 4, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      backgroundColor: 'var(--text-primary)',
                      color: 'var(--bg-primary)',
                      padding: '10px 14px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      width: isMobileOrTablet ? 'calc(100vw - 32px)' : '280px',
                      maxWidth: isMobileOrTablet ? '320px' : 'none',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                      border: '1px solid var(--border-light)',
                      textAlign: 'left',
                    }}
                  >
                    {"生命靈數（主命數）計算方式：\n將西元出生年月日的每個數字個別相加，若總和為二位數，則將這兩個數字再次相加，直到簡化為 1~9 的個位單數。\n\n缺數計算方式：\n找出您的生日數字中（排除0）所沒有出現的 1~9 數字。"}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
        <p style={styles.subtitle}>輸入西元出生年月日，計算您的主命數天賦與缺數，尋找您的命定共振水晶。</p>

        <form
          onSubmit={calculateNumerology}
          style={{
            ...styles.form,
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            gap: isMobileOrTablet ? '8px' : '12px',
          }}
        >
          <input
            type="date"
            required
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            style={{
              ...styles.dateInput,
              fontSize: isMobileOrTablet ? '16px' : '13px',
            }}
          />
          <button
            type="submit"
            data-umami-event="numerology.click_calculate"
            style={{
              ...styles.submitBtn,
              padding: isMobileOrTablet ? '12px' : '0 24px',
            }}
          >
            測算能量
          </button>
        </form>

        {result && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '-24px', marginBottom: '32px' }}>
            <button
              type="button"
              onClick={() => setShowTraitsModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                fontSize: '12px',
                cursor: 'pointer',
                fontFamily: 'inherit',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
              onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
            >
              查看所有靈數特質 ➔
            </button>
          </div>
        )}

        {result && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            style={styles.resultContainer}
          >
            {/* 主命數結果 */}
            <div
              style={{
                ...styles.numberDisplayRow,
                flexDirection: isMobileOrTablet ? 'column' : 'row',
                textAlign: isMobileOrTablet ? 'center' : 'left',
                gap: isMobileOrTablet ? '16px' : '24px',
                marginBottom: '8px',
              }}
            >
              <div style={styles.numberCircle}>
                <span style={styles.numberLabel}>主命數</span>
                <span style={styles.numberVal}>{result.lifePathNumber}</span>
              </div>
              <div style={styles.numberDesc}>
                <h3 style={styles.sectionTitle}>
                  生命靈數 {result.lifePathNumber} 號人 - {currentPathData?.name}
                </h3>
                {currentPathData?.vibe && (
                  <p style={{ ...styles.descriptionText, marginBottom: '8px' }}>
                    {currentPathData.vibe}
                  </p>
                )}
                {currentPathData?.positive_affirmation && (
                  <p style={{ ...styles.descriptionText, color: 'var(--text-primary)', fontWeight: '600', fontStyle: 'italic', marginBottom: '8px', whiteSpace: 'pre-wrap', textAlign: 'right' }}>
                    「{currentPathData.positive_affirmation}」
                  </p>
                )}
              </div>
            </div>

            {/* 頁籤切換列 */}
            <div style={styles.tabHeader}>
              <button
                onClick={() => setActiveResultTab('main')}
                style={{
                  ...styles.tabBtn,
                  borderBottomColor: activeResultTab === 'main' ? 'var(--text-primary)' : 'transparent',
                  color: activeResultTab === 'main' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: activeResultTab === 'main' ? '600' : 'normal',
                }}
              >
                {isMobileOrTablet ? '✦ 命定水晶' : '✦ 命定水晶 (強化優勢)'}
              </button>
              <button
                onClick={() => setActiveResultTab('missing')}
                style={{
                  ...styles.tabBtn,
                  borderBottomColor: activeResultTab === 'missing' ? 'var(--text-primary)' : 'transparent',
                  color: activeResultTab === 'missing' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: activeResultTab === 'missing' ? '600' : 'normal',
                }}
              >
                {isMobileOrTablet ? '✦ 缺數水晶' : '✦ 缺數水晶 (補強弱項)'}
              </button>
            </div>

            {/* 水晶展示區塊 */}
            <div style={styles.crystalSection}>
              {activeResultTab === 'main' && currentPathData && (
                <div>
                  <p style={styles.infoText}>{currentPathData.destiny_crystal.destiny_point}</p>
                </div>
              )}

              {activeResultTab === 'missing' && currentPathData && (
                <>
                  <div>
                    <p style={styles.infoText}>
                      {currentPathData.missing_crystal.missing_point}
                    </p>
                  </div>
                  <p style={{ ...styles.descriptionText, ...styles.infoBlock, marginBottom: '0px' }}>
                    您的生日九宮格中，缺少的數字為：
                    <span style={styles.missingList}>
                      {result.missingNumbers.length > 0 ? result.missingNumbers.join(', ') : '無缺數'}
                    </span>
                    。配戴對應的水晶可以補足缺少的能量磁場，達到和諧平衡。
                  </p>
                </>
              )}

              <div style={styles.crystalGrid}>
                {activeCrystals.length > 0 ? (
                  activeCrystals.map((crystal) => {
                    const isFav = favorites.includes(crystal.id);
                    return (
                      <div
                        key={crystal.id}
                        onClick={() => {
                          setActiveModalCrystal(crystal);
                        }}
                        style={styles.crystalCard}
                      >
                        {/* 左側：圖片 */}
                        <img src={crystal.image} alt={crystal.name} style={styles.crystalImg} />
                        
                        {/* 右側：文字資訊與按鈕 */}
                        <div style={styles.crystalDetails}>
                          <div style={styles.crystalTextGroup}>
                            <span style={styles.crystalName}>{crystal.name}</span>
                            <span style={styles.crystalEnglish}>{crystal.englishName}</span>
                            
                            {/* 缺數水晶獨有的對應所有靈數標記 */}
                            {activeResultTab === 'missing' && (
                              <span style={styles.crystalTag}>
                                靈數 {crystal.numerology.join('、')}
                              </span>
                            )}
                          </div>
                          
                          {/* 收藏按鈕 */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleFavorite(crystal.id);
                            }}
                            style={{
                              ...styles.favBtn,
                              backgroundColor: isFav ? 'rgba(232, 167, 161, 0.1)' : 'transparent',
                              borderColor: isFav ? '#d98880' : 'var(--text-primary)',
                              color: isFav ? '#d98880' : 'var(--text-primary)',
                            }}
                          >
                            <svg
                              viewBox="0 0 24 24"
                              width="11"
                              height="11"
                              fill={isFav ? '#e8a7a1' : 'none'}
                              stroke={isFav ? '#d98880' : 'currentColor'}
                              strokeWidth="1.5"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                            </svg>
                            {isFav ? '已收藏' : '加入收藏'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p style={styles.emptyText}>暫無對應的水晶，可以挑選眼緣契合的款式。</p>
                )}
              </div>

              {/* 查看更多按鈕：跳轉至百科並自動篩選對應參數（不包含幾顆資訊） */}
              {totalActiveCount > 6 && (
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '8px' }}>
                  <button
                    onClick={handleSeeMoreInEncyclopedia}
                    style={styles.seeMoreBtn}
                  >
                    查看更多共振水晶 ➔
                  </button>
                </div>
              )}
            </div>

            {/* 前往 DIY 設計引導 Banner */}
            <div
              style={{
                border: '1px dashed var(--border-medium)',
                backgroundColor: 'var(--bg-secondary)',
                padding: '24px 20px',
                marginTop: '16px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                ✨ <strong>已經將喜愛的水晶加入收藏了嗎？</strong><br />
                點擊下方按鈕前往 3D 手鍊製作，我們將為您自動載入「收藏」的篩選，方便您設計專屬共振手鍊。
              </div>
              <button
                onClick={() => onNavigateToDIY(true)}
                style={{
                  ...styles.submitBtn,
                  padding: '10px 24px',
                  fontSize: '12px',
                  backgroundColor: 'var(--text-primary)',
                  color: '#ffffff',
                  border: 'none',
                  cursor: 'pointer',
                  fontWeight: '500',
                  marginTop: '4px',
                }}
              >
                前往製作手鍊 ➔
              </button>
            </div>

            {/* 心靈調頻 17LIVE 隨機置入 */}
            {(() => {
              const ad = AD_TEMPLATES[adIndex];
              return (
                <div
                  style={{
                    marginTop: '16px',
                    textAlign: 'center',
                    fontSize: '11px',
                    color: 'var(--text-tertiary)',
                    lineHeight: '1.6',
                  }}
                >
                  {ad.prefix}
                  <a
                    href={ad.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    data-umami-event={ad.event}
                    style={{
                      color: 'var(--text-secondary)',
                      textDecoration: 'underline',
                      fontWeight: '500',
                    }}
                  >
                    {ad.linkText}
                  </a>
                  {ad.suffix}
                </div>
              );
            })()}
          </motion.div>
        )}
      </div>

      {/* 詳情對話框 (Modal) */}
      <AnimatePresence>
        {activeModalCrystal && (
          <CrystalDetailModal
            crystal={activeModalCrystal}
            onClose={() => setActiveModalCrystal(null)}
            isMobile={isMobileOrTablet}
            onOpenFeedback={onOpenFeedback}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        )}

        {showTraitsModal && (
          <div
            style={{
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
            }}
            onClick={() => setShowTraitsModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              transition={{ duration: 0.25 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                backgroundColor: 'var(--bg-primary)',
                width: '800px',
                maxWidth: '92%',
                maxHeight: '85vh',
                overflowY: 'auto',
                padding: isMobileOrTablet ? '32px 16px' : '40px',
                border: '1px solid var(--border-medium)',
                position: 'relative',
                boxShadow: '0 10px 40px rgba(0, 0, 0, 0.03)',
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setShowTraitsModal(false)}
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  padding: '12px',
                  zIndex: 100,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                ✕
              </button>

              <h2 style={{ fontSize: '20px', fontWeight: '500', marginBottom: '8px', color: 'var(--text-primary)', textAlign: 'center' }}>
                {numerologyData.title}
              </h2>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: '1.6', marginBottom: '28px', textAlign: 'center' }}>
                {numerologyData.description}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {Object.entries(numerologyData.life_path_data).map(([num, data]) => (
                  <div
                    key={num}
                    style={{
                      borderBottom: '1px solid var(--border-light)',
                      paddingBottom: '20px',
                      textAlign: 'left',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          border: '1px solid var(--text-primary)',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          fontWeight: '600',
                          fontSize: '14px',
                          color: 'var(--text-primary)',
                        }}
                      >
                        {num}
                      </div>
                      <h3 style={{ fontSize: '15px', fontWeight: '600', margin: 0, color: 'var(--text-primary)' }}>
                        {data.name}
                      </h3>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '38px' }}>
                      <p style={{ fontSize: '13px', color: 'var(--text-primary)', fontStyle: 'italic', margin: 0, lineHeight: '1.5', fontWeight: '500' }}>
                        「{data.positive_affirmation}」
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                        <strong>氣場氛圍：</strong>{data.vibe}
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                        <strong>命定水晶：</strong>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                          {data.destiny_crystal.stones.join('、')}
                        </span>
                        <br />
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {data.destiny_crystal.destiny_point}
                        </span>
                      </p>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, lineHeight: '1.5' }}>
                        <strong>缺數課題：</strong>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500' }}>
                          {data.missing_crystal.stones.join('、')}
                        </span>
                        <br />
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                          {data.missing_crystal.missing_point}
                        </span>
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};



const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    padding: '30px 0 80px 0',
  },
  card: {
    width: '780px',
    maxWidth: '100%',
    padding: '40px',
    border: '1px solid var(--border-light)',
    backgroundColor: '#ffffff',
    textAlign: 'left',
  },
  title: {
    fontSize: '24px',
    fontWeight: '500',
    margin: '0 0 8px 0',
    color: 'var(--text-primary)',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: '0 0 32px 0',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    gap: '12px',
    marginBottom: '40px',
  },
  dateInput: {
    flex: 1,
    padding: '12px 16px',
    border: '1px solid var(--border-medium)',
    outline: 'none',
    fontSize: '14px',
    fontFamily: 'inherit',
  },
  submitBtn: {
    padding: '0 24px',
    backgroundColor: 'var(--text-primary)',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '500',
    fontFamily: 'inherit',
    transition: 'opacity 0.2s',
  },
  resultContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
    borderTop: '1px solid var(--border-light)',
    paddingTop: '36px',
  },
  numberDisplayRow: {
    display: 'flex',
    gap: '24px',
    alignItems: 'center',
  },
  numberCircle: {
    width: '80px',
    height: '80px',
    border: '1px solid var(--text-primary)',
    borderRadius: '50%',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberLabel: {
    fontSize: '10px',
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
  },
  numberVal: {
    fontSize: '32px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    lineHeight: '1',
  },
  numberDesc: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: '16px',
    fontWeight: '500',
    margin: '0 0 6px 0',
  },
  descriptionText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: 0,
  },
  tabHeader: {
    display: 'flex',
    gap: '24px',
    borderBottom: '1px solid var(--border-light)',
    marginBottom: '8px',
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
  crystalSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sectionSubTitle: {
    fontSize: '14px',
    fontWeight: '500',
    margin: 0,
    color: 'var(--text-primary)',
  },
  crystalGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '16px',
    marginTop: '12px',
  },
  crystalCard: {
    border: '1px solid var(--border-light)',
    padding: '16px',
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: '16px',
    cursor: 'pointer',
    transition: 'background-color 0.2s, border-color 0.2s',
    backgroundColor: '#ffffff',
  },
  crystalImg: {
    width: '64px',
    height: '64px',
    objectFit: 'contain',
    mixBlendMode: 'multiply',
    flexShrink: 0,
  },
  crystalDetails: {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '12px',
  },
  crystalTextGroup: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    textAlign: 'left',
  },
  crystalName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  crystalEnglish: {
    fontSize: '10px',
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--mono)',
    marginBottom: '2px',
  },
  crystalTag: {
    fontSize: '9px',
    color: 'var(--text-tertiary)',
    backgroundColor: 'var(--bg-secondary)',
    padding: '1px 5px',
    border: '1px solid var(--border-light)',
    borderRadius: '3px',
    marginTop: '4px',
    display: 'inline-block',
  },
  crystalDesc: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: '0 0 16px 0',
    flex: 1,
  },
  diyBtn: {
    padding: '6px 12px',
    backgroundColor: 'transparent',
    border: '1px solid var(--text-primary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '500',
    transition: 'all 0.2s',
  },
  favBtn: {
    padding: '4px 8px',
    backgroundColor: 'transparent',
    border: '1px solid var(--text-primary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: '500',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    borderRadius: '4px',
    transition: 'all 0.2s',
    flexShrink: 0,
  },
  crystalGridMini: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '8px',
  },
  crystalCardMini: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    border: '1px solid var(--border-light)',
    gap: '16px',
  },
  crystalImgMini: {
    width: '40px',
    height: '40px',
    objectFit: 'contain',
    mixBlendMode: 'multiply',
  },
  miniInfo: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  miniName: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  miniLabel: {
    fontSize: '10px',
    color: 'var(--text-tertiary)',
    marginLeft: '6px',
  },
  miniEnglish: {
    fontSize: '10px',
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--mono)',
  },
  diyBtnMini: {
    padding: '4px 10px',
    backgroundColor: 'transparent',
    border: '1px solid var(--text-primary)',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    fontSize: '11px',
    transition: 'all 0.2s',
  },
  missingList: {
    fontWeight: '600',
    color: '#e74c3c',
    margin: '0 4px',
  },
  emptyText: {
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    margin: 0,
  },
  seeMoreBtn: {
    background: 'none',
    border: '1px solid var(--text-primary)',
    borderRadius: '6px',
    padding: '8px 24px',
    fontSize: '11px',
    fontWeight: '500',
    color: 'var(--text-primary)',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontFamily: 'inherit',
    marginTop: '12px',
  },
  infoBlock: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    padding: '8px 12px',
    borderRadius: '8px',
  },
  infoLabel: {
    fontSize: '14px',
    fontWeight: '600',
    color: 'var(--text-primary)',
    margin: '0 0 8px 0',
  },
  infoText: {
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: 0,
  },
  missingDetailPoint: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    margin: 0,
  },
};
