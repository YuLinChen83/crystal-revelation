import React, { useState, useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { crystalsData } from '../data/crystals';
import { motion, AnimatePresence } from 'framer-motion';

// 定義手鍊上的珠子結構
interface BeadInBracelet {
  uniqueId: string;
  crystalId: string;
  name: string;
  colorHex: string;
  targetAngle: number;
  currentAngle: number;
  isNew: boolean;
}

const TRAIT_DESCRIPTIONS: { [key: string]: string } = {
  '智慧思緒': '開啟高貴智慧、沉澱思緒，提升理性思考與專注度。',
  '平靜療癒': '撫平情緒創傷，舒緩壓力，帶來內在的平靜與溫柔。',
  '人緣桃花': '敞開心扉，吸引美好人緣與桃花，促進人際關係和諧。',
  '招財事業': '吸引財富與事業運，增進自信心與創造力，激發成功機遇。',
  '辟邪防護': '防禦負能量侵擾，淨化周圍磁場，起到強效的守護作用。',
  '直覺靈性': '深化直覺，促進心靈自省與靈性提升，有助於冥想覺察。',
  '溝通表達': '促進喉輪能量，增強邏輯思考與表達能力，讓溝通更流暢。',
  '勇氣行動': '消除猶豫與恐懼，激發克服困難的勇氣與果斷行動力。',
  '健康活力': '注入滿滿朝氣與生命力，調和生理磁場，消除疲勞怠惰。',
  '和諧平衡': '調和各方能量，平衡陰陽身心，帶來最純粹的穩定與泰然。',
};

export const BraceletSimulator: React.FC<{
  preselectedCrystalId?: string | null;
  onClearPreselected?: () => void;
  favorites?: string[];
  onOpenFeedback: (crystalName: string) => void;
  defaultShowFavoritesOnly?: boolean;
  onResetDefaultShowFavorites?: () => void;
}> = ({
  preselectedCrystalId,
  onClearPreselected,
  favorites = [],
  onOpenFeedback,
  defaultShowFavoritesOnly,
  onResetDefaultShowFavorites,
}) => {
  const [bracelet, setBracelet] = useState<BeadInBracelet[]>([]);
  const [selectedCrystal, setSelectedCrystal] = useState<string>(crystalsData[0].id);
  const [isStringed, setIsStringed] = useState<boolean>(false);
  const [showNotification, setShowNotification] = useState<string | null>(null);
  const [stringColor, setStringColor] = useState<string>('#a4b0be');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState<boolean>(false);
  const [showBetaTooltip, setShowBetaTooltip] = useState<boolean>(false);

  useEffect(() => {
    if (defaultShowFavoritesOnly) {
      setShowFavoritesOnly(true);
      if (onResetDefaultShowFavorites) {
        onResetDefaultShowFavorites();
      }
    }
  }, [defaultShowFavoritesOnly, onResetDefaultShowFavorites]);
  
  // Carousel 分頁與詳細 Modal 狀態
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(0);
  const [activeModalCrystal, setActiveModalCrystal] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<'science' | 'myth'>('science');

  // 用於自適應收納盒寬度的 ResizeObserver
  const viewportRef = useRef<HTMLDivElement>(null);
  const [viewportWidth, setViewportWidth] = useState<number>(0);

  useEffect(() => {
    if (!viewportRef.current) return;
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setViewportWidth(entry.contentRect.width);
      }
    });
    resizeObserver.observe(viewportRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth <= 768;

  // 統計手鍊上的水晶種類和數量
  const crystalCounts = bracelet.reduce((acc, bead) => {
    acc[bead.crystalId] = (acc[bead.crystalId] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  // 取得當前手鍊的所有水晶對象
  const activeCrystals = Object.keys(crystalCounts)
    .map(cid => {
      const crystal = crystalsData.find(c => c.id === cid);
      return crystal ? { crystal, count: crystalCounts[cid] } : null;
    })
    .filter(Boolean) as { crystal: typeof crystalsData[0], count: number }[];

  // 統計這些水晶累積的特質權重
  const traitCounts = activeCrystals.reduce((acc, item) => {
    item.crystal.traits.forEach(t => {
      acc[t] = (acc[t] || 0) + item.count;
    });
    return acc;
  }, {} as { [key: string]: number });

  // 將特質排序（權重高的排前面）
  const sortedTraits = Object.keys(traitCounts).sort((a, b) => traitCounts[b] - traitCounts[a]);

  // 播放水晶相撞音效
  const playClinkSound = (frequency = 1800, duration = 0.08) => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(3000, ctx.currentTime + duration);
      
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn('Audio blocked');
    }
  };

  useEffect(() => {
    if (preselectedCrystalId) {
      const crystal = crystalsData.find(c => c.id === preselectedCrystalId);
      if (crystal) {
        setSelectedCrystal(preselectedCrystalId);
        addBead(preselectedCrystalId);
        if (onClearPreselected) onClearPreselected();
      }
    }
  }, [preselectedCrystalId]);

  const addBead = (crystalId: string) => {
    if (bracelet.length >= 24) {
      triggerNotification('手鍊已滿（最大 24 顆珠子）');
      return;
    }

    const crystal = crystalsData.find((c) => c.id === crystalId);
    if (!crystal) return;

    const uniqueId = `${crystalId}-${Date.now()}`;
    const newBead: BeadInBracelet = {
      uniqueId,
      crystalId,
      name: crystal.name,
      colorHex: crystal.colorHex,
      targetAngle: 0,
      currentAngle: -Math.PI / 2,
      isNew: true,
    };

    setBracelet((prev) => {
      const updated = [...prev, newBead];
      return recalculateAngles(updated);
    });

    playClinkSound(2200, 0.12);
  };

  const removeLastBead = () => {
    if (bracelet.length === 0) return;
    setBracelet((prev) => {
      const updated = prev.slice(0, -1);
      return recalculateAngles(updated);
    });
    playClinkSound(1200, 0.08);
  };

  const clearBracelet = () => {
    setBracelet([]);
    setIsStringed(false);
    playClinkSound(600, 0.15);
  };

  const recalculateAngles = (list: BeadInBracelet[]): BeadInBracelet[] => {
    const total = list.length;
    if (total === 0) return [];
    
    return list.map((bead, index) => {
      const angle = (index / total) * Math.PI * 2;
      return {
        ...bead,
        targetAngle: angle,
        isNew: false,
      };
    });
  };

  const triggerNotification = (msg: string) => {
    setShowNotification(msg);
    setTimeout(() => setShowNotification(null), 3000);
  };

  const handleStringUp = () => {
    if (bracelet.length < 3) {
      triggerNotification('手鍊珠子太少，無法穿線');
      return;
    }
    setIsStringed(true);
    playClinkSound(2500, 0.15);
    setTimeout(() => playClinkSound(2800, 0.1), 100);
    setTimeout(() => playClinkSound(3200, 0.2), 200);
    triggerNotification('手鍊穿線完成！✨ 能量已串連。');
  };

  const handleCapture = () => {
    const canvas = document.querySelector('canvas');
    if (!canvas) return;
    try {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `my-crystal-bracelet-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      triggerNotification('手鍊 3D 渲染圖已導出下載');
    } catch (e) {
      triggerNotification('無法導出圖片');
    }
  };

  // 篩選與分頁計算
  const displayedCrystals = showFavoritesOnly
    ? crystalsData.filter(c => favorites.includes(c.id))
    : crystalsData;

  // 動態計算每頁個數：按鈕寬 84px + 間距 12px = 96px。最後一個按鈕不計右間距，故公式為 (viewportWidth + 12) / 96
  const itemsPerPage = viewportWidth > 0 ? Math.max(1, Math.floor((viewportWidth + 12) / 96)) : 8;
  const totalPages = Math.ceil(displayedCrystals.length / itemsPerPage);
  const validPageIndex = Math.min(currentPageIndex, Math.max(0, totalPages - 1));
  const paginatedCrystals = displayedCrystals.slice(
    validPageIndex * itemsPerPage,
    (validPageIndex + 1) * itemsPerPage
  );

  return (
    <div
      style={{
        ...styles.container,
        paddingBottom: '24px',
      }}
    >
      <div style={styles.workbench}>
        {/* 上半部：3D 模擬與右側控制台 */}
        <div
          style={{
            ...styles.topSection,
            flexDirection: isMobile ? 'column' : 'row',
          }}
        >
          {/* 左側：3D Canvas 預覽 */}
          <div
            style={{
              ...styles.canvasContainer,
              height: isMobile ? '380px' : '520px',
              borderRight: isMobile ? 'none' : '1px solid var(--border-light)',
              borderBottom: isMobile ? '1px solid var(--border-light)' : 'none',
            }}
          >
            <div style={styles.instructions}>
              滑鼠左鍵拖曳旋轉 · 右鍵平移 · 滾輪縮放
            </div>
            
            {/* 珠子計數器膠囊固定在右上方 */}
            <div style={styles.beadCounterBadge}>
              珠子數：{bracelet.length} / 24
            </div>
            
            <Canvas
              gl={{ preserveDrawingBuffer: true }}
              camera={{ position: [0, 0, isMobile ? 8 : 9], fov: 45 }}
              style={{ background: '#ffffff' }}
            >
              <ambientLight intensity={1.2} />
              <directionalLight position={[5, 10, 5]} intensity={1.5} castShadow />
              <pointLight position={[-5, -5, -5]} intensity={0.5} />
              
              <Bracelet3D bracelet={bracelet} isStringed={isStringed} stringColor={stringColor} />
              
              <OrbitControls 
                enablePan={true}
                enableZoom={true}
                maxDistance={12}
                minDistance={3}
              />
            </Canvas>

            <AnimatePresence>
              {showNotification && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  style={styles.notification}
                >
                  {showNotification}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* 右側：控制台 */}
          <div
            style={{
              ...styles.controlPanel,
              padding: isMobile ? '24px 16px' : '32px 24px',
              width: isMobile ? '100%' : '340px',
              height: isMobile ? 'auto' : '520px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', position: 'relative' }}>
              <h2 style={{ ...styles.panelTitle, margin: 0 }}>3D 實體手鍊模擬器</h2>
              
              {/* BETA 標章 */}
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: '600',
                  color: 'var(--text-tertiary)',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-light)',
                  borderRadius: '4px',
                  padding: '1px 5px',
                  letterSpacing: '0.5px',
                  lineHeight: '1',
                  userSelect: 'none',
                }}
              >
                BETA
              </span>

              {/* Info Icon 與 Tooltip 容器 */}
              <div
                onMouseEnter={() => setShowBetaTooltip(true)}
                onMouseLeave={() => setShowBetaTooltip(false)}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'help',
                  color: 'var(--text-tertiary)',
                  position: 'relative',
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>

                {/* Tooltip 彈出框 */}
                <div style={{ position: 'absolute', bottom: '22px', left: '50%', transform: 'translateX(-50%)', zIndex: 100, pointerEvents: 'none' }}>
                  <AnimatePresence>
                    {showBetaTooltip && (
                      <motion.div
                        initial={{ opacity: 0, y: 4, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 4, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        style={{
                          backgroundColor: 'var(--text-primary)',
                          color: 'var(--bg-primary)',
                          padding: '6px 10px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          lineHeight: '1.4',
                          whiteSpace: 'nowrap',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                          border: '1px solid var(--border-light)',
                        }}
                      >
                        功能實驗中，歡迎給予建議回饋
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </div>
            <p style={styles.panelSub}>選取下方收納盒中的水晶珠放入手鍊。我們將以 3D 物理引擎動態排列並展現水晶玻璃折射感。</p>

            {/* 操作按鈕群 */}
            <div style={styles.actionRow}>
              <button
                onClick={removeLastBead}
                disabled={bracelet.length === 0}
                style={{
                  ...styles.btnSecondary,
                  opacity: bracelet.length === 0 ? 0.4 : 1,
                }}
              >
                退回一顆
              </button>
              <button
                onClick={clearBracelet}
                disabled={bracelet.length === 0}
                style={{
                  ...styles.btnSecondary,
                  opacity: bracelet.length === 0 ? 0.4 : 1,
                }}
              >
                清空重置
              </button>
            </div>

            <button
              onClick={handleStringUp}
              disabled={bracelet.length < 3}
              style={{
                ...styles.btnPrimary,
                opacity: bracelet.length < 3 ? 0.5 : 1,
              }}
            >
              {isStringed ? '✨ 手鍊已串連' : '一鍵穿線收尾'}
            </button>

            {isStringed && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                style={styles.colorPickerContainer}
              >
                <span style={styles.colorPickerLabel}>選擇穿線顏色：</span>
                <div style={styles.colorOptionsRow}>
                  {[
                    { color: '#ffffff', name: '純白' },
                    { color: '#ff7675', name: '桃紅' },
                    { color: '#f1c40f', name: '金黃' },
                    { color: '#2f3542', name: '深灰' },
                    { color: '#1e90ff', name: '靛藍' },
                  ].map(opt => (
                    <button
                      key={opt.color}
                      onClick={() => setStringColor(opt.color)}
                      title={opt.name}
                      style={{
                        ...styles.colorCircleBtn,
                        backgroundColor: opt.color,
                        border: stringColor === opt.color ? '2px solid var(--text-primary)' : '1px solid var(--border-medium)',
                      }}
                    />
                  ))}
                  
                  <div style={styles.customColorWrapper} title="自訂顏色">
                    <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>🎨</span>
                    <input
                      type="color"
                      value={stringColor}
                      onChange={(e) => setStringColor(e.target.value)}
                      style={styles.customColorInput}
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {isStringed && (
              <motion.button
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                onClick={handleCapture}
                style={styles.btnExport}
              >
                導出手鍊 3D 渲染圖
              </motion.button>
            )}

            {/* 手鍊能量特質分析 */}
            <div style={styles.analysisSection}>
              <h3 style={styles.sectionTitle}>✦ 手鍊能量分析</h3>
              {bracelet.length > 0 ? (
                <div style={styles.analysisCard}>
                  <div style={styles.analysisGroup}>
                    <span style={styles.analysisLabel}>水晶組成</span>
                    <div style={styles.combinationList}>
                      {activeCrystals.map(item => (
                        <span key={item.crystal.id} style={styles.combinationItem}>
                          {item.crystal.name} × {item.count}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div style={{ ...styles.analysisGroup, marginTop: '12px' }}>
                    <span style={styles.analysisLabel}>累積能量特質</span>
                    <div style={styles.traitBadgeRow}>
                      {sortedTraits.map(trait => (
                        <span key={trait} style={styles.traitBadge}>
                          {trait} +{traitCounts[trait]}
                        </span>
                      ))}
                    </div>
                    {/* 特質描述列表 */}
                    <div style={styles.traitDetailList}>
                      {sortedTraits.map(trait => (
                        <div key={trait} style={styles.traitDetailItem}>
                          <strong style={styles.traitDetailName}>{trait}：</strong>
                          <span style={styles.traitDetailText}>{TRAIT_DESCRIPTIONS[trait] || ''}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={styles.emptyAnalysisCard}>
                  請由下方水晶珠盤挑選水晶珠放入手鍊，此處將分析您的專屬手鍊能量。
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 下半部：水晶珠盤收納盒 */}
        <div style={styles.traySection}>
          <div style={styles.trayHeader}>
            <h3 style={styles.sectionTitle}>水晶珠盤收納盒</h3>
            <div style={styles.segmentedControl}>
              <button
                onClick={() => setShowFavoritesOnly(false)}
                style={{
                  ...styles.segmentedBtn,
                  backgroundColor: !showFavoritesOnly ? 'var(--bg-secondary)' : 'transparent',
                  color: !showFavoritesOnly ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  borderColor: !showFavoritesOnly ? 'var(--border-medium)' : 'transparent',
                  fontWeight: !showFavoritesOnly ? '500' : 'normal',
                }}
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                顯示所有水晶
              </button>
              <button
                onClick={() => setShowFavoritesOnly(true)}
                style={{
                  ...styles.segmentedBtn,
                  backgroundColor: showFavoritesOnly ? 'var(--bg-secondary)' : 'transparent',
                  color: showFavoritesOnly ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  borderColor: showFavoritesOnly ? 'var(--border-medium)' : 'transparent',
                  fontWeight: showFavoritesOnly ? '500' : 'normal',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="12"
                  height="12"
                  fill={showFavoritesOnly ? '#e8a7a1' : 'none'}
                  stroke={showFavoritesOnly ? '#d98880' : 'currentColor'}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                只看收藏 ({favorites.length})
              </button>
            </div>
          </div>
          
          <div style={styles.carouselContainer}>
            <button
              onClick={() => setCurrentPageIndex(prev => Math.max(0, prev - 1))}
              disabled={validPageIndex === 0}
              style={{
                ...styles.carouselArrowBtn,
                opacity: validPageIndex === 0 ? 0.3 : 1,
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <div style={styles.carouselViewport} ref={viewportRef}>
              <div style={styles.beadGrid}>
                {paginatedCrystals.map((c) => (
                  <div key={c.id} style={{ position: 'relative', flexShrink: 0 }}>
                    <button
                      onClick={() => {
                        setSelectedCrystal(c.id);
                        addBead(c.id);
                      }}
                      style={{
                        ...styles.beadSelectionBtn,
                        borderColor: selectedCrystal === c.id ? 'var(--text-primary)' : 'var(--border-light)',
                      }}
                    >
                      <img src={c.image} alt={c.name} style={styles.trayBeadImg} />
                      <span style={styles.trayBeadName}>{c.name}</span>
                    </button>
                    
                    {/* 右上角細線條 InfoIcon */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveModalCrystal(c);
                        setModalTab('science');
                      }}
                      style={styles.trayInfoBtn}
                      title="查看水晶百科"
                    >
                      <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="16" x2="12" y2="12" />
                        <line x1="12" y1="8" x2="12.01" y2="8" />
                      </svg>
                    </button>
                  </div>
                ))}
                
                {paginatedCrystals.length === 0 && (
                  <div style={styles.emptyTrayMsg}>
                    {showFavoritesOnly ? '尚未收藏任何水晶，請前往「百科展覽」點擊愛心進行收藏。' : '無水晶資料'}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setCurrentPageIndex(prev => Math.min(totalPages - 1, prev + 1))}
              disabled={validPageIndex >= totalPages - 1}
              style={{
                ...styles.carouselArrowBtn,
                opacity: validPageIndex >= totalPages - 1 ? 0.3 : 1,
              }}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* 詳細 Modal 彈窗 */}
      <AnimatePresence>
        {activeModalCrystal && (
          <Modal
            crystal={activeModalCrystal}
            activeTab={modalTab}
            setActiveTab={setModalTab}
            onClose={() => setActiveModalCrystal(null)}
            isMobile={isMobile}
            onOpenFeedback={onOpenFeedback}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 扁平極簡 Modal 元件
interface ModalProps {
  crystal: any;
  activeTab: 'science' | 'myth';
  setActiveTab: (tab: 'science' | 'myth') => void;
  onClose: () => void;
  isMobile: boolean;
  onOpenFeedback: (crystalName: string) => void;
}
const Modal: React.FC<ModalProps> = ({ crystal, activeTab, setActiveTab, onClose, isMobile, onOpenFeedback }) => {
  const [isReportHovered, setIsReportHovered] = useState(false);
  return (
    <div style={modalStyles.modalOverlay} onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 15 }}
        transition={{ duration: 0.25 }}
        onClick={(e) => e.stopPropagation()}
        style={{
          ...modalStyles.modalContent,
          padding: isMobile ? '24px 16px' : '40px',
          maxHeight: isMobile ? '90vh' : 'auto',
          overflowY: isMobile ? 'auto' : 'visible',
        }}
      >
        {/* 關閉按鈕 */}
        <button onClick={onClose} style={modalStyles.closeBtn}>
          ✕
        </button>

        <div
          style={{
            ...modalStyles.modalLayout,
            gridTemplateColumns: isMobile ? '1fr' : '300px 1fr',
            gap: isMobile ? '24px' : '40px',
          }}
        >
          {/* 左側大水晶珠展示 */}
          <div
            style={{
              ...modalStyles.modalLeft,
              borderRight: isMobile ? 'none' : '1px solid var(--border-light)',
              borderBottom: isMobile ? '1px solid var(--border-light)' : 'none',
              paddingRight: isMobile ? '0' : '32px',
              paddingBottom: isMobile ? '24px' : '0',
            }}
          >
            <div style={modalStyles.modalBeadCircle}>
              <img
                src={crystal.image}
                alt={crystal.name}
                style={modalStyles.modalBeadImage}
              />
            </div>
            <h2 style={modalStyles.modalTitle}>{crystal.name}</h2>
            <p style={modalStyles.modalSub}>{crystal.englishName} | {crystal.chemicalFormula}</p>
            <div style={modalStyles.modalTagRow}>
              <span style={modalStyles.modalTag}>靈數 {crystal.numerology.join('、')}</span>
              {crystal.traits.map((t: string) => (
                <span key={t} style={modalStyles.modalTag}>{t}</span>
              ))}
            </div>
            <p style={modalStyles.modalSummary}>{crystal.shortDescription}</p>
            <button
              onClick={() => onOpenFeedback(crystal.name)}
              onMouseEnter={() => setIsReportHovered(true)}
              onMouseLeave={() => setIsReportHovered(false)}
              style={{
                ...modalStyles.reportBtn,
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
          <div style={modalStyles.modalRight}>
            <div style={modalStyles.tabHeader}>
              <button
                onClick={() => setActiveTab('science')}
                style={{
                  ...modalStyles.tabBtn,
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
                  ...modalStyles.tabBtn,
                  borderBottomColor: activeTab === 'myth' ? 'var(--text-primary)' : 'transparent',
                  color: activeTab === 'myth' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: activeTab === 'myth' ? '500' : 'normal',
                }}
              >
                起源與神話
              </button>
            </div>

            <div style={modalStyles.tabBody}>
              {activeTab === 'science' ? (
                <div style={modalStyles.scienceTab}>
                  <div style={modalStyles.infoItem}>
                    <span style={modalStyles.infoLabel}>礦物分類</span>
                    <span style={modalStyles.infoValue}>{crystal.mineralClass}</span>
                  </div>
                  <div style={modalStyles.infoItem}>
                    <span style={modalStyles.infoLabel}>摩氏硬度</span>
                    <span style={modalStyles.infoValue}>{crystal.hardness}</span>
                  </div>
                  <div style={modalStyles.infoItem}>
                    <span style={modalStyles.infoLabel}>晶體結構</span>
                    <span style={modalStyles.infoValue}>{crystal.crystalSystem}</span>
                  </div>
                  <div style={modalStyles.infoItem}>
                    <span style={modalStyles.infoLabel}>自然成因</span>
                    <p style={modalStyles.infoText}>{crystal.formation}</p>
                  </div>
                </div>
              ) : (
                <div style={modalStyles.mythTab}>
                  <p style={modalStyles.storyText}>{crystal.mythology}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

interface Bracelet3DProps {
  bracelet: BeadInBracelet[];
  isStringed: boolean;
  stringColor: string;
}
const Bracelet3D: React.FC<Bracelet3DProps> = ({ bracelet, isStringed, stringColor }) => {
  const radius = 2.4;
  const ringRef = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.05 * delta;
    }
  });

  const points = [];
  for (let i = 0; i <= 64; i++) {
    const theta = (i / 64) * Math.PI * 2;
    points.push(new THREE.Vector3(Math.cos(theta) * radius, Math.sin(theta) * radius, 0));
  }
  const lineGeometry = new THREE.BufferGeometry().setFromPoints(points);

  return (
    <group ref={ringRef as any}>
      <lineLoop geometry={lineGeometry} {...({} as any)}>
        <lineBasicMaterial
          color={isStringed ? stringColor : "#eccc68"}
          linewidth={2}
          transparent
          opacity={isStringed ? 0.8 : 0.25}
        />
      </lineLoop>

      {bracelet.map((bead) => (
        <Bead3D key={bead.uniqueId} bead={bead} radius={radius} isStringed={isStringed} />
      ))}
    </group>
  );
};

interface Bead3DProps {
  bead: BeadInBracelet;
  radius: number;
  isStringed: boolean;
}
const Bead3D: React.FC<Bead3DProps> = ({ bead, radius, isStringed }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef<number>(bead.currentAngle);

  useFrame((state, delta) => {
    const k = 14.0;
    const diff = bead.targetAngle - angleRef.current;
    let shortestDiff = Math.atan2(Math.sin(diff), Math.cos(diff));
    angleRef.current += shortestDiff * k * delta;

    if (meshRef.current) {
      meshRef.current.position.set(
        Math.cos(angleRef.current) * radius,
        Math.sin(angleRef.current) * radius,
        0
      );
      
      if (isStringed) {
        meshRef.current.rotation.y += 0.5 * delta;
        const time = state.clock.getElapsedTime();
        const scaleVal = 1.0 + Math.sin(time * 3 + indexFactor(bead.uniqueId)) * 0.03;
        meshRef.current.scale.set(scaleVal, scaleVal, scaleVal);
      }
    }
  });

  const indexFactor = (id: string) => {
    let sum = 0;
    for (let i = 0; i < id.length; i++) sum += id.charCodeAt(i);
    return sum;
  };

  return (
    <mesh ref={meshRef as any} castShadow>
      <sphereGeometry args={[0.22, 32, 32]} />
      <meshPhysicalMaterial
        color={bead.colorHex}
        transmission={0.88}
        opacity={1.0}
        roughness={0.06}
        metalness={0.0}
        ior={1.544}
        thickness={1.1}
        clearcoat={1.0}
        clearcoatRoughness={0.02}
        specularIntensity={1.0}
      />
    </mesh>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    paddingBottom: '24px',
  },
  workbench: {
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid var(--border-light)',
    backgroundColor: '#ffffff',
  },
  topSection: {
    display: 'flex',
    width: '100%',
  },
  canvasContainer: {
    position: 'relative',
    flex: 1,
  },
  instructions: {
    position: 'absolute',
    top: '16px',
    left: '16px',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    pointerEvents: 'none',
    zIndex: 10,
  },
  beadCounterBadge: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    border: '1px solid var(--border-medium)',
    color: 'var(--text-secondary)',
    padding: '4px 10px',
    fontSize: '11px',
    fontFamily: 'var(--mono)',
    borderRadius: '12px',
    zIndex: 10,
    pointerEvents: 'none',
  },
  notification: {
    position: 'absolute',
    bottom: '24px',
    left: '50%',
    transform: 'translateX(-50%)',
    backgroundColor: 'var(--text-primary)',
    color: '#ffffff',
    padding: '8px 20px',
    fontSize: '12px',
    zIndex: 100,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
  },
  controlPanel: {
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    overflowY: 'auto',
    textAlign: 'left',
    flexShrink: 0,
  },
  panelTitle: {
    fontSize: '18px',
    fontWeight: '500',
    margin: '0 0 6px 0',
  },
  panelSub: {
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: '1.6',
    margin: '0 0 24px 0',
  },
  traySection: {
    padding: '20px 24px',
    backgroundColor: 'var(--bg-secondary)',
    borderTop: '1px solid var(--border-light)',
    display: 'flex',
    flexDirection: 'column',
  },
  trayHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  emptyTrayMsg: {
    padding: '20px',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    textAlign: 'center',
    width: '100%',
  },
  sectionTitle: {
    fontSize: '13px',
    fontWeight: '500',
    color: 'var(--text-secondary)',
    margin: 0,
  },
  carouselContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    width: '100%',
  },
  carouselViewport: {
    flex: 1,
    overflow: 'hidden',
  },
  carouselArrowBtn: {
    background: 'none',
    border: '1px solid var(--border-medium)',
    borderRadius: '50%',
    width: '32px',
    height: '32px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    color: 'var(--text-secondary)',
    transition: 'all 0.2s',
  },
  beadGrid: {
    display: 'flex',
    gap: '12px',
  },
  beadSelectionBtn: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px 4px 6px 4px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-light)',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    width: '84px',
    height: '92px',
    boxSizing: 'border-box',
    flexShrink: 0,
  },
  trayBeadImg: {
    width: '52px',
    height: '52px',
    objectFit: 'contain',
    mixBlendMode: 'multiply',
    marginBottom: '4px',
  },
  trayBeadName: {
    fontSize: '10px',
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
  trayInfoBtn: {
    position: 'absolute',
    top: '4px',
    right: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-tertiary)',
    padding: '2px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'color 0.2s',
  },
  segmentedControl: {
    display: 'flex',
    gap: '8px',
  },
  segmentedBtn: {
    background: 'none',
    border: '1px solid transparent',
    padding: '6px 12px',
    fontSize: '11px',
    cursor: 'pointer',
    fontFamily: 'inherit',
    borderRadius: '12px',
    transition: 'all 0.2s',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
  },
  actionRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '12px',
  },
  btnSecondary: {
    flex: 1,
    padding: '10px 0',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-medium)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: 'inherit',
    transition: 'all 0.2s',
  },
  btnPrimary: {
    width: '100%',
    padding: '12px 0',
    backgroundColor: 'var(--text-primary)',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: 'inherit',
    marginBottom: '12px',
    transition: 'opacity 0.2s',
  },
  btnExport: {
    width: '100%',
    padding: '12px 0',
    backgroundColor: '#2ecc71',
    color: '#ffffff',
    border: 'none',
    cursor: 'pointer',
    fontSize: '13px',
    fontWeight: '500',
    fontFamily: 'inherit',
    marginBottom: '20px',
  },
  analysisSection: {
    marginBottom: '24px',
    borderTop: '1px solid var(--border-light)',
    paddingTop: '20px',
  },
  analysisCard: {
    padding: '16px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: '4px',
  },
  emptyAnalysisCard: {
    padding: '16px',
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: '4px',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    lineHeight: '1.6',
    textAlign: 'center',
  },
  analysisGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  analysisLabel: {
    fontSize: '10px',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    fontWeight: '500',
  },
  combinationList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px 10px',
  },
  combinationItem: {
    fontSize: '12px',
    color: 'var(--text-primary)',
    fontWeight: '500',
  },
  traitBadgeRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  traitBadge: {
    fontSize: '10px',
    backgroundColor: '#ffffff',
    border: '1px solid var(--border-light)',
    padding: '2px 8px',
    borderRadius: '12px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  traitDetailList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '12px',
    borderTop: '1px dashed var(--border-light)',
    paddingTop: '12px',
  },
  traitDetailItem: {
    fontSize: '11px',
    lineHeight: '1.5',
    color: 'var(--text-secondary)',
    display: 'flex',
    alignItems: 'flex-start',
  },
  traitDetailName: {
    color: 'var(--text-primary)',
    fontWeight: '600',
    flexShrink: 0,
    width: '70px',
  },
  traitDetailText: {
    color: 'var(--text-secondary)',
  },
  colorPickerContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px',
    padding: '12px',
    border: '1px solid var(--border-light)',
    backgroundColor: 'var(--bg-secondary)',
    borderRadius: '4px',
  },
  colorPickerLabel: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    fontWeight: '500',
  },
  colorOptionsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  colorCircleBtn: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    cursor: 'pointer',
    padding: 0,
    outline: 'none',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
    transition: 'transform 0.15s',
  },
  customColorWrapper: {
    position: 'relative',
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    border: '1px dashed var(--border-medium)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: 'pointer',
    backgroundColor: '#ffffff',
  },
  customColorInput: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    opacity: 0,
    cursor: 'pointer',
  },
};

const modalStyles: { [key: string]: React.CSSProperties } = {
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
    top: '20px',
    right: '20px',
    background: 'none',
    border: 'none',
    fontSize: '16px',
    cursor: 'pointer',
    color: 'var(--text-tertiary)',
    transition: 'color 0.2s',
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
