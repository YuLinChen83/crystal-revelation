import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { crystalsData, type Crystal } from '../data/crystals';
import { motion, AnimatePresence } from 'framer-motion';

interface EncyclopediaProps {
  favorites: string[];
  onToggleFavorite: (crystalId: string) => void;
  onOpenFeedback: (crystalName: string) => void;
  defaultNumerologyFilter?: string[];
  onResetDefaultNumerologyFilter?: () => void;
  autoOpenCrystalId?: string;
  onCloseCrystalModal?: () => void;
}

export const Encyclopedia: React.FC<EncyclopediaProps> = ({
  favorites,
  onToggleFavorite,
  onOpenFeedback,
  defaultNumerologyFilter = [],
  onResetDefaultNumerologyFilter,
  autoOpenCrystalId,
  onCloseCrystalModal,
}) => {
  const navigate = useNavigate();
  const [selectedFavoriteFilter, setSelectedFavoriteFilter] = useState<'all' | 'favorites'>('all');
  const [selectedColor, setSelectedColor] = useState<string[]>([]);
  const [selectedNumerology, setSelectedNumerology] = useState<string[]>([]);
  const [selectedTrait, setSelectedTrait] = useState<string[]>([]);
  const [selectedMineral, setSelectedMineral] = useState<string>('all');
  const [selectedSystem, setSelectedSystem] = useState<string>('all');
  const [selectedHardness, setSelectedHardness] = useState<string>('all');

  const [mineralInput, setMineralInput] = useState<string>('');
  const [systemInput, setSystemInput] = useState<string>('');

  const [isMineralOpen, setIsMineralOpen] = useState<boolean>(false);
  const [isSystemOpen, setIsSystemOpen] = useState<boolean>(false);

  const [isSticky, setIsSticky] = useState<boolean>(false);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768;
    }
    return true;
  });

  const [gridCols, setGridCols] = useState<number>(6);

  // 監聽靈數測算跳轉的預設多重篩選
  useEffect(() => {
    if (defaultNumerologyFilter && defaultNumerologyFilter.length > 0) {
      setSelectedNumerology(defaultNumerologyFilter);
      if (onResetDefaultNumerologyFilter) {
        onResetDefaultNumerologyFilter();
      }
    }
  }, [defaultNumerologyFilter]);

  const handleResetFilters = () => {
    setSelectedFavoriteFilter('all');
    setSelectedColor([]);
    setSelectedNumerology([]);
    setSelectedTrait([]);
    setSelectedMineral('all');
    setSelectedSystem('all');
    setSelectedHardness('all');
    setMineralInput('');
    setSystemInput('');
  };

  const toggleMultiSelect = (
    value: string,
    selectedList: string[],
    setSelectedList: React.Dispatch<React.SetStateAction<string[]>>
  ) => {
    if (selectedList.includes(value)) {
      setSelectedList(selectedList.filter((item) => item !== value));
    } else {
      setSelectedList([...selectedList, value]);
    }
  };
  const [activeModalCrystal, setActiveModalCrystal] = useState<Crystal | null>(null);
  const [modalTab, setModalTab] = useState<'science' | 'myth'>('science');
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  // 監聽 URL 帶入的水晶 ID 來自動開啟 Modal
  useEffect(() => {
    if (autoOpenCrystalId) {
      const crystal = crystalsData.find(c => c.id === autoOpenCrystalId);
      if (crystal) {
        setActiveModalCrystal(crystal);
        setModalTab('science');
      }
    } else {
      setActiveModalCrystal(null);
    }
  }, [autoOpenCrystalId]);

  // 當開啟水晶 Modal 時動態調整頁面標題與描述，有利於 SPA 執行期的 SEO 展示
  useEffect(() => {
    if (activeModalCrystal) {
      const traitsText = activeModalCrystal.traits && activeModalCrystal.traits.length > 0 
        ? activeModalCrystal.traits.slice(0, 2).join('與') + '之石'
        : '能量共振之石';
      document.title = `${activeModalCrystal.name} (${activeModalCrystal.englishName})：${traitsText} | 水晶啟示錄 - 水晶圖鑑・手鍊設計`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', `${activeModalCrystal.name}（${activeModalCrystal.chemicalFormula}），硬度 ${activeModalCrystal.hardness}，${activeModalCrystal.crystalSystem}。${activeModalCrystal.shortDescription}`);
      }
    } else {
      document.title = '水晶啟示錄 Crystal Revelation · 純白極簡水晶探索平台';
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) {
        metaDesc.setAttribute('content', '純白極簡水晶探索平台，提供水晶百科、3D 手鍊工坊與生命靈數計算，幫您設計專屬共振手鍊。');
      }
    }
  }, [activeModalCrystal]);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 當螢幕寬度改變，從手機版切換回桌面版時，自動展開篩選面板
  useEffect(() => {
    if (windowWidth > 768) {
      setIsCollapsed(false);
    }
  }, [windowWidth]);

  // 監聽滾動以處理 Sticky 狀態 (僅在行動端且由非置頂變置頂的瞬間自動收合篩選，其餘時間不強制覆蓋手動展開)
  useEffect(() => {
    const handleScroll = () => {
      const isMobile = window.innerWidth <= 768;
      const nextSticky = window.scrollY > 220;
      setIsSticky((prevSticky) => {
        if (isMobile && !prevSticky && nextSticky) {
          setIsCollapsed(true);
        }
        return nextSticky;
      });
    };
    
    // 初始化執行一次，確保 mount 時能立即套用正確的 Sticky 狀態
    handleScroll();
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isMobile = windowWidth <= 480;
  const isTablet = windowWidth > 480 && windowWidth <= 768;
  const isMobileOrTablet = windowWidth <= 768;

  const currentGridCols = isMobile ? 3 : (isTablet ? 5 : gridCols);

  // 取得所有唯一的特質標籤
  const allTraits = Array.from(
    new Set(crystalsData.flatMap((c) => c.traits))
  );

  // 取得所有唯一的礦物分類與晶體結構
  const allMineralClasses = Array.from(
    new Set(crystalsData.map((c) => c.mineralClass).filter(Boolean))
  ).sort();

  const allCrystalSystems = Array.from(
    new Set(crystalsData.map((c) => c.crystalSystem).filter(Boolean))
  ).sort();

  // 篩選邏輯
  const filteredCrystals = crystalsData.filter((c) => {
    const colorMatch = selectedColor.length === 0 || selectedColor.includes(c.colorFamily);
    const numMatch =
      selectedNumerology.length === 0 ||
      c.numerology.some((num) => selectedNumerology.includes(num.toString()));
    const traitMatch =
      selectedTrait.length === 0 ||
      c.traits.some((t) => selectedTrait.includes(t as any));
    const favMatch = selectedFavoriteFilter === 'all' || favorites.includes(c.id);
    
    const mineralMatch = selectedMineral === 'all' || c.mineralClass === selectedMineral;
    const systemMatch = selectedSystem === 'all' || c.crystalSystem === selectedSystem;
    
    let hardnessMatch = true;
    if (selectedHardness !== 'all') {
      const [minStr, maxStr] = selectedHardness.split('-');
      const min = parseFloat(minStr);
      const max = parseFloat(maxStr);
      const val = c.hardness;
      hardnessMatch = val >= min && (max === 10 ? val <= max : val < max);
    }

    return colorMatch && numMatch && traitMatch && favMatch && mineralMatch && systemMatch && hardnessMatch;
  });

  // 色系對應中文
  const colorNames: { [key: string]: string } = {
    all: '全部',
    purple: '紫色系',
    pink: '粉色系',
    yellow: '黃色系',
    white: '白色系',
    black: '黑色系',
    blue: '藍色系',
    green: '綠色系',
    red: '紅色系',
    orange: '橘色系',
  };

  const getActiveFilterTags = () => {
    const tags = [];
    if (selectedFavoriteFilter === 'favorites') tags.push(`收藏`);
    selectedColor.forEach((col) => {
      if (colorNames[col]) tags.push(colorNames[col]);
    });
    selectedNumerology.forEach((num) => tags.push(`靈數 ${num}`));
    selectedTrait.forEach((tr) => tags.push(tr));
    if (selectedMineral !== 'all') tags.push(selectedMineral.split(' ')[0]);
    if (selectedSystem !== 'all') tags.push(selectedSystem.split(' ')[0]);
    if (selectedHardness !== 'all') {
      tags.push(`硬度 ${selectedHardness.replace('-', '~')}`);
    }
    return tags;
  };

  const renderFilterFields = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', width: '100%' }}>
        {/* 1. 收藏篩選 */}
        <div
          style={{
            ...styles.filterRow,
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            alignItems: isMobileOrTablet ? 'flex-start' : 'center',
            justifyContent: isMobileOrTablet ? 'flex-start' : 'space-between',
            gap: isMobileOrTablet ? '8px' : '24px',
            width: '100%',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: isMobileOrTablet ? 'column' : 'row',
              alignItems: isMobileOrTablet ? 'flex-start' : 'center',
              gap: isMobileOrTablet ? '8px' : '24px',
            }}
          >
            <span style={styles.filterLabel}>收藏</span>
            <div style={styles.filterOptions}>
              <button
                onClick={() => setSelectedFavoriteFilter('all')}
                style={{
                  ...styles.filterBtn,
                  color: selectedFavoriteFilter === 'all' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: selectedFavoriteFilter === 'all' ? '600' : 'normal',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                全部水晶
              </button>
              <button
                onClick={() => setSelectedFavoriteFilter('favorites')}
                style={{
                  ...styles.filterBtn,
                  color: selectedFavoriteFilter === 'favorites' ? 'var(--text-primary)' : 'var(--text-tertiary)',
                  fontWeight: selectedFavoriteFilter === 'favorites' ? '600' : 'normal',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="14"
                  height="14"
                  fill={selectedFavoriteFilter === 'favorites' ? '#e8a7a1' : 'none'}
                  stroke={selectedFavoriteFilter === 'favorites' ? '#d98880' : 'currentColor'}
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                </svg>
                我的收藏 ({favorites.length})
              </button>
            </div>
            
            {/* 行動裝置版重設按鈕 */}
            {isMobileOrTablet && (
              <button
                onClick={handleResetFilters}
                style={{
                  ...styles.filterBtn,
                  color: 'var(--text-secondary)',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
              >
                <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                重設篩選
              </button>
            )}
          </div>

          {/* 桌機版排列切換器與重設按鈕 */}
          {!isMobileOrTablet && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <button
                onClick={handleResetFilters}
                style={{
                  ...styles.filterBtn,
                  color: 'var(--text-tertiary)',
                  fontSize: '12px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
              >
                <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M23 4v6h-6" />
                  <path d="M1 20v-6h6" />
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                </svg>
                重設所有篩選
              </button>
              
              <span style={{ color: 'var(--border-medium)', fontSize: '11px' }}>·</span>

              <div style={{ ...styles.layoutSwapper, marginTop: 0 }}>
                <span style={{ ...styles.filterLabel, width: 'auto', marginRight: '4px' }}>排列</span>
                <button
                  onClick={() => setGridCols(6)}
                  style={{
                    ...styles.filterBtn,
                    color: gridCols === 6 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    fontWeight: gridCols === 6 ? '500' : 'normal',
                  }}
                >
                  6 欄
                </button>
                <span style={{ color: 'var(--border-medium)', fontSize: '11px' }}>·</span>
                <button
                  onClick={() => setGridCols(10)}
                  style={{
                    ...styles.filterBtn,
                    color: gridCols === 10 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    fontWeight: gridCols === 10 ? '500' : 'normal',
                  }}
                >
                  10 欄
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 2. 色系篩選 (多選) */}
        <div
          style={{
            ...styles.filterRow,
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            alignItems: isMobileOrTablet ? 'flex-start' : 'center',
            gap: isMobileOrTablet ? '8px' : '24px',
          }}
        >
          <span style={styles.filterLabel}>色系</span>
          <div style={styles.filterOptions}>
            <button
              onClick={() => setSelectedColor([])}
              style={{
                ...styles.filterBtn,
                color: selectedColor.length === 0 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontWeight: selectedColor.length === 0 ? '600' : 'normal',
              }}
            >
              全部
            </button>
            {Object.keys(colorNames).filter(c => c !== 'all').map((color) => {
              const isSelected = selectedColor.includes(color);
              return (
                <button
                  key={color}
                  onClick={() => toggleMultiSelect(color, selectedColor, setSelectedColor)}
                  style={{
                    ...styles.filterBtn,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    fontWeight: isSelected ? '600' : 'normal',
                    textDecoration: isSelected ? 'underline' : 'none',
                  }}
                >
                  {colorNames[color]}
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. 靈數篩選 (多選) */}
        <div
          style={{
            ...styles.filterRow,
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            alignItems: isMobileOrTablet ? 'flex-start' : 'center',
            gap: isMobileOrTablet ? '8px' : '24px',
          }}
        >
          <span style={styles.filterLabel}>靈數</span>
          <div style={styles.filterOptions}>
            <button
              onClick={() => setSelectedNumerology([])}
              style={{
                ...styles.filterBtn,
                color: selectedNumerology.length === 0 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontWeight: selectedNumerology.length === 0 ? '600' : 'normal',
              }}
            >
              全部
            </button>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => {
              const isSelected = selectedNumerology.includes(num.toString());
              return (
                <button
                  key={num}
                  onClick={() => toggleMultiSelect(num.toString(), selectedNumerology, setSelectedNumerology)}
                  style={{
                    ...styles.filterBtn,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    fontWeight: isSelected ? '600' : 'normal',
                    textDecoration: isSelected ? 'underline' : 'none',
                  }}
                >
                  {num}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. 特質篩選 (多選) */}
        <div
          style={{
            ...styles.filterRow,
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            alignItems: isMobileOrTablet ? 'flex-start' : 'center',
            gap: isMobileOrTablet ? '8px' : '24px',
          }}
        >
          <span style={styles.filterLabel}>特質</span>
          <div style={styles.filterOptions}>
            <button
              onClick={() => setSelectedTrait([])}
              style={{
                ...styles.filterBtn,
                color: selectedTrait.length === 0 ? 'var(--text-primary)' : 'var(--text-tertiary)',
                fontWeight: selectedTrait.length === 0 ? '600' : 'normal',
              }}
            >
              全部
            </button>
            {allTraits.map((trait) => {
              const isSelected = selectedTrait.includes(trait);
              return (
                <button
                  key={trait}
                  onClick={() => toggleMultiSelect(trait, selectedTrait, setSelectedTrait)}
                  style={{
                    ...styles.filterBtn,
                    color: isSelected ? 'var(--text-primary)' : 'var(--text-tertiary)',
                    fontWeight: isSelected ? '600' : 'normal',
                    textDecoration: isSelected ? 'underline' : 'none',
                  }}
                >
                  {trait}
                </button>
              );
            })}
          </div>
        </div>

        {/* 5. 搜尋選擇器 (礦物、晶體結構及硬度下拉並列) */}
        <div
          style={{
            ...styles.filterRow,
            flexDirection: isMobileOrTablet ? 'column' : 'row',
            alignItems: isMobileOrTablet ? 'flex-start' : 'center',
            gap: isMobileOrTablet ? '8px' : '24px',
            marginTop: '4px',
          }}
        >
          <span style={styles.filterLabel}>搜尋</span>
          <div style={styles.searchRow}>
            {/* 礦物分類搜尋 */}
            <div style={styles.searchContainer}>
              <div style={styles.searchInputWrapper}>
                <input
                  type="text"
                  placeholder="搜尋礦物分類 (如：石英)..."
                  value={mineralInput}
                  onFocus={() => setIsMineralOpen(true)}
                  onBlur={() => setTimeout(() => setIsMineralOpen(false), 200)}
                  onChange={(e) => {
                    setMineralInput(e.target.value);
                    if (e.target.value === '') {
                      setSelectedMineral('all');
                    }
                  }}
                  style={{
                    ...styles.searchInput,
                    fontSize: isMobileOrTablet ? '16px' : '12px',
                  }}
                />
                {selectedMineral !== 'all' || mineralInput ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedMineral('all');
                      setMineralInput('');
                    }}
                    style={styles.searchClearBtn}
                  >
                    ✕
                  </button>
                ) : (
                  <span style={{ position: 'absolute', right: '8px', color: 'var(--text-tertiary)', fontSize: '10px', pointerEvents: 'none' }}>▼</span>
                )}
              </div>
              
              {isMineralOpen && (
                <div style={styles.searchDropdown}>
                  <div
                    onClick={() => {
                      setSelectedMineral('all');
                      setMineralInput('');
                    }}
                    style={{
                      ...styles.searchOption,
                      fontWeight: selectedMineral === 'all' ? '500' : 'normal',
                      backgroundColor: selectedMineral === 'all' ? 'var(--bg-secondary)' : 'transparent',
                    }}
                  >
                    全部分類
                  </div>
                  {allMineralClasses
                    .filter((m) => m.toLowerCase().includes(mineralInput.toLowerCase()))
                    .map((m) => (
                      <div
                        key={m}
                        onClick={() => {
                          setSelectedMineral(m);
                          setMineralInput(m);
                        }}
                        style={{
                          ...styles.searchOption,
                          fontWeight: selectedMineral === m ? '500' : 'normal',
                          backgroundColor: selectedMineral === m ? 'var(--bg-secondary)' : 'transparent',
                        }}
                      >
                        {m}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 晶體結構搜尋 */}
            <div style={styles.searchContainer}>
              <div style={styles.searchInputWrapper}>
                <input
                  type="text"
                  placeholder="搜尋晶體結構 (如：三方)..."
                  value={systemInput}
                  onFocus={() => setIsSystemOpen(true)}
                  onBlur={() => setTimeout(() => setIsSystemOpen(false), 200)}
                  onChange={(e) => {
                    setSystemInput(e.target.value);
                    if (e.target.value === '') {
                      setSelectedSystem('all');
                    }
                  }}
                  style={{
                    ...styles.searchInput,
                    fontSize: isMobileOrTablet ? '16px' : '12px',
                  }}
                />
                {selectedSystem !== 'all' || systemInput ? (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedSystem('all');
                      setSystemInput('');
                    }}
                    style={styles.searchClearBtn}
                  >
                    ✕
                  </button>
                ) : (
                  <span style={{ position: 'absolute', right: '8px', color: 'var(--text-tertiary)', fontSize: '10px', pointerEvents: 'none' }}>▼</span>
                )}
              </div>

              {isSystemOpen && (
                <div style={styles.searchDropdown}>
                  <div
                    onClick={() => {
                      setSelectedSystem('all');
                      setSystemInput('');
                    }}
                    style={{
                      ...styles.searchOption,
                      fontWeight: selectedSystem === 'all' ? '500' : 'normal',
                      backgroundColor: selectedSystem === 'all' ? 'var(--bg-secondary)' : 'transparent',
                    }}
                  >
                    全部結構
                  </div>
                  {allCrystalSystems
                    .filter((s) => s.toLowerCase().includes(systemInput.toLowerCase()))
                    .map((s) => (
                      <div
                        key={s}
                        onClick={() => {
                          setSelectedSystem(s);
                          setSystemInput(s);
                        }}
                        style={{
                          ...styles.searchOption,
                          fontWeight: selectedSystem === s ? '500' : 'normal',
                          backgroundColor: selectedSystem === s ? 'var(--bg-secondary)' : 'transparent',
                        }}
                      >
                        {s}
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 硬度篩選下拉選單 */}
            <div style={styles.searchContainer}>
              <div style={styles.searchInputWrapper}>
                <select
                  value={selectedHardness}
                  onChange={(e) => setSelectedHardness(e.target.value)}
                  style={{
                    ...styles.searchInput,
                    paddingRight: '12px',
                    cursor: 'pointer',
                    appearance: 'none',
                    fontSize: isMobileOrTablet ? '16px' : '12px',
                  }}
                >
                  <option value="all">搜尋硬度區間 (全部)...</option>
                  {[
                    { label: '0 ~ 1', value: '0-1' },
                    { label: '1 ~ 2', value: '1-2' },
                    { label: '2 ~ 3', value: '2-3' },
                    { label: '3 ~ 4', value: '3-4' },
                    { label: '4 ~ 5', value: '4-5' },
                    { label: '5 ~ 6', value: '5-6' },
                    { label: '6 ~ 7', value: '6-7' },
                    { label: '7 ~ 8', value: '7-8' },
                    { label: '8 ~ 9', value: '8-9' },
                    { label: '9 ~ 10', value: '9-10' },
                  ].map((range) => (
                    <option key={range.value} value={range.value}>
                      硬度 {range.label} 級
                    </option>
                  ))}
                </select>
                <span style={{ position: 'absolute', right: '12px', color: 'var(--text-tertiary)', fontSize: '10px', pointerEvents: 'none' }}>▼</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* 1. 頂部靜態篩選區域 (隨滾動自然移出螢幕，保證不閃爍) */}
      <div style={{
        ...styles.staticFilterBar,
        padding: isMobileOrTablet ? '10px 0px 12px 0px' : '24px 0',
        marginBottom: isMobileOrTablet ? '16px' : '32px',
      }}>
        {isCollapsed ? (
          /* 收合狀態：極簡摘要橫條 */
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              height: '28px',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                color: 'var(--text-secondary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                maxWidth: '85%',
              }}
            >
              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
                <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
              </svg>
              <span style={{ fontWeight: '500', flexShrink: 0 }}>篩選條件：</span>
              <div style={{ display: 'flex', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', alignItems: 'center' }}>
                {getActiveFilterTags().length === 0 ? (
                  <span style={styles.activeTag}>全部水晶</span>
                ) : (
                  getActiveFilterTags().map((tag, idx) => (
                    <span key={idx} style={styles.activeTag}>{tag}</span>
                  ))
                )}
                <span style={{ color: 'var(--text-tertiary)', marginLeft: '4px', fontSize: '11px', flexShrink: 0 }}>({filteredCrystals.length} 顆結果)</span>
              </div>
            </div>

            <button
              onClick={() => setIsCollapsed(false)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '11px',
                color: 'var(--text-primary)',
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              展開篩選
              <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
          </div>
        ) : (
          /* 展開狀態：完整篩選面板 */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', width: '100%' }}>
            {renderFilterFields()}
            {/* 控制列（收合與結果統計） */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                  共篩選出 {filteredCrystals.length} 顆水晶
                </span>
                <button
                  onClick={() => setIsCollapsed(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '11px',
                    color: 'var(--text-primary)',
                    fontWeight: '500',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  收合篩選
                  <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="18 15 12 9 6 15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 2. 懸浮 Sticky 篩選區 (採用 AnimatePresence 與 Fixed 佈局，置中滿版且完全防重排閃爍) */}
      <AnimatePresence>
        {isSticky && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            style={{
              position: 'fixed',
              top: isMobileOrTablet ? '104px' : '76px',
              left: 0,
              right: 0,
              width: '100vw',
              zIndex: 90,
              backgroundColor: 'rgba(255, 255, 255, 0.96)',
              backdropFilter: 'blur(8px)',
              borderBottom: '1px solid var(--border-light)',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)',
            }}
          >
            {/* 內容在 1200px 置中的對齊 Container */}
            <div
              style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: isMobileOrTablet ? '12px 16px' : '12px 40px',
                width: '100%',
                boxSizing: 'border-box',
                fontSize: isMobileOrTablet ? 'inherit' : '13px', // 非手機版下滑置頂時文字維持 13px 不變大
              }}
            >
              {isCollapsed ? (
                /* 收合狀態：極簡摘要橫條 */
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    width: '100%',
                    height: '28px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      maxWidth: '85%',
                    }}
                  >
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, color: 'var(--text-tertiary)' }}>
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span style={{ fontWeight: '500', flexShrink: 0 }}>篩選條件：</span>
                    <div style={{ display: 'flex', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', alignItems: 'center' }}>
                      {getActiveFilterTags().length === 0 ? (
                        <span style={styles.activeTag}>全部水晶</span>
                      ) : (
                        getActiveFilterTags().map((tag, idx) => (
                          <span key={idx} style={styles.activeTag}>{tag}</span>
                        ))
                      )}
                      <span style={{ color: 'var(--text-tertiary)', marginLeft: '4px', fontSize: '11px', flexShrink: 0 }}>({filteredCrystals.length} 顆結果)</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setIsCollapsed(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '11px',
                      color: 'var(--text-primary)',
                      fontWeight: '500',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    展開篩選
                    <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                </div>
              ) : (
                /* 展開狀態：完整懸浮篩選面板 */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  width: '100%',
                  maxHeight: isMobileOrTablet ? '70vh' : 'none',
                  overflowY: isMobileOrTablet ? 'auto' : 'visible',
                  paddingBottom: '8px'
                }}>
                  {renderFilterFields()}
                  
                  {/* 控制列（收合與結果統計） */}
                  <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', width: '100%', borderTop: '1px solid var(--border-light)', paddingTop: '10px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                        共篩選出 {filteredCrystals.length} 顆水晶
                      </span>
                      <button
                        onClick={() => setIsCollapsed(true)}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '11px',
                          color: 'var(--text-primary)',
                          fontWeight: '500',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        收合篩選
                        <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="18 15 12 9 6 15" />
                        </svg>
                      </button>
                    </div>
                  </div>

                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 標本收納盤網格 (薄線分隔，動態決定欄數) */}
      <motion.div
        layout
        style={{
          ...styles.grid,
          gridTemplateColumns: `repeat(${currentGridCols}, minmax(0, 1fr))`,
        }}
      >
        <AnimatePresence mode="popLayout">
          {filteredCrystals.map((crystal) => (
            <GridCell
              key={crystal.id}
              crystal={crystal}
              isFavorite={favorites.includes(crystal.id)}
              onToggleFavorite={onToggleFavorite}
              onClick={() => {
                navigate(`/crystals/${crystal.id}`);
              }}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {/* 詳情對話框 (Modal) */}
      <AnimatePresence>
        {activeModalCrystal && (
          <Modal
            crystal={activeModalCrystal}
            activeTab={modalTab}
            setActiveTab={setModalTab}
            onClose={onCloseCrystalModal || (() => setActiveModalCrystal(null))}
            isMobile={isMobileOrTablet}
            onOpenFeedback={onOpenFeedback}
            favorites={favorites}
            onToggleFavorite={onToggleFavorite}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// 單個網格元件
interface GridCellProps {
  crystal: Crystal;
  isFavorite: boolean;
  onToggleFavorite: (id: string) => void;
  onClick: () => void;
}
const GridCell: React.FC<GridCellProps> = ({ crystal, isFavorite, onToggleFavorite, onClick }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        ...styles.gridCell,
        backgroundColor: isHovered ? 'var(--bg-secondary)' : 'transparent',
      }}
    >
      {/* 收藏愛心按鈕 */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onToggleFavorite(crystal.id);
        }}
        style={{
          ...styles.favoriteBtn,
          opacity: isFavorite || isHovered ? 1 : 0,
        }}
      >
        <svg
          viewBox="0 0 24 24"
          width="16"
          height="16"
          fill={isFavorite ? '#e8a7a1' : 'none'}
          stroke={isFavorite ? '#d98880' : 'var(--text-tertiary)'}
          strokeWidth="1.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
        </svg>
      </button>

      <div style={styles.beadContainer}>
        {/* 水晶圓圈區塊 */}
        <div style={styles.beadWrapper}>
          <img
            src={crystal.image}
            alt={crystal.name}
            style={{
              ...styles.beadImage,
              transform: isHovered ? 'scale(1.08)' : 'scale(1)',
            }}
          />
        </div>
      </div>

      <div style={styles.cellFooter}>
        <span style={styles.chineseName}>{crystal.name}</span>
        <div style={styles.englishSubContainer}>
          <span
            style={{
              ...styles.englishSub,
              opacity: isHovered ? 0 : 1,
              transition: 'opacity 0.2s ease',
              position: 'absolute',
              left: 0,
              right: 0,
            }}
          >
            {crystal.englishName} | {crystal.chemicalFormula}
          </span>
          <span
            style={{
              ...styles.englishSub,
              opacity: isHovered ? 1 : 0,
              transition: 'opacity 0.2s ease',
              position: 'absolute',
              left: 0,
              right: 0,
            }}
          >
            靈數 {crystal.numerology[0]} | {crystal.traits.slice(0, 2).join(' · ')}
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// 扁平極簡 Modal 元件
interface ModalProps {
  crystal: Crystal;
  activeTab: 'science' | 'myth';
  setActiveTab: (tab: 'science' | 'myth') => void;
  onClose: () => void;
  isMobile: boolean;
  onOpenFeedback: (crystalName: string) => void;
  favorites: string[];
  onToggleFavorite: (crystalId: string) => void;
}
const Modal: React.FC<ModalProps> = ({ crystal, activeTab, setActiveTab, onClose, isMobile, onOpenFeedback, favorites, onToggleFavorite }) => {
  const [isReportHovered, setIsReportHovered] = useState(false);
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

// 樣式定義
const styles: { [key: string]: React.CSSProperties } = {
  container: {
    width: '100%',
    paddingBottom: '24px',
  },
  favoriteBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    zIndex: 10,
    padding: '4px',
    borderRadius: '50%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    transition: 'all 0.2s',
  },
  filterBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '24px 0',
    borderBottom: '1px solid var(--border-light)',
    marginBottom: '32px',
    fontSize: '13px',
  },
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  filterLabel: {
    color: 'var(--text-tertiary)',
    width: '40px',
    flexShrink: 0,
    textAlign: 'left',
  },
  filterOptions: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '16px',
  },
  filterBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontSize: '13px',
    fontFamily: 'inherit',
    transition: 'color 0.2s',
  },
  staticFilterBar: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    padding: '24px 0',
    borderBottom: '1px solid var(--border-light)',
    marginBottom: '32px',
    fontSize: '13px',
  },
  searchRow: {
    display: 'flex',
    gap: '16px',
    width: '100%',
    flexWrap: 'wrap',
  },
  searchContainer: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    minWidth: '220px',
    flex: 1,
  },
  searchInputWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  searchInput: {
    width: '100%',
    padding: '6px 28px 6px 12px',
    border: '1px solid var(--border-medium)',
    borderRadius: '6px',
    fontSize: '12px',
    outline: 'none',
    backgroundColor: 'var(--bg-primary)',
    transition: 'border-color 0.2s',
    color: 'var(--text-primary)',
    fontFamily: 'inherit',
  },
  searchClearBtn: {
    position: 'absolute',
    right: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: 'var(--text-tertiary)',
    fontSize: '11px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2px',
  },
  searchDropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    marginTop: '4px',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    backdropFilter: 'blur(8px)',
    border: '1px solid var(--border-light)',
    borderRadius: '6px',
    boxShadow: '0 6px 16px rgba(0,0,0,0.05)',
    zIndex: 110,
    maxHeight: '200px',
    overflowY: 'auto',
  },
  searchOption: {
    padding: '8px 12px',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 0.2s, color 0.2s',
  },
  activeTag: {
    backgroundColor: 'var(--bg-secondary)',
    border: '1px solid var(--border-light)',
    borderRadius: '4px',
    padding: '1px 6px',
    fontSize: '10px',
    fontWeight: 'normal',
    color: 'var(--text-primary)',
    display: 'inline-block',
  },
  layoutSwapper: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '6px',
  },
  grid: {
    display: 'grid',
    borderLeft: '1px solid var(--border-light)',
    borderTop: '1px solid var(--border-light)',
    backgroundColor: '#ffffff',
  },
  gridCell: {
    position: 'relative',
    aspectRatio: '1',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '16px',
    borderRight: '1px solid var(--border-light)',
    borderBottom: '1px solid var(--border-light)',
    cursor: 'pointer',
    transition: 'background-color 0.25s ease',
    overflow: 'hidden',
  },
  beadContainer: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beadWrapper: {
    width: '55%',
    aspectRatio: '1',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  beadImage: {
    width: '100%',
    height: '100%',
    objectFit: 'contain',
    mixBlendMode: 'multiply',
    transition: 'transform 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
  cellFooter: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '8px',
    gap: '3px',
    width: '100%',
  },
  chineseName: {
    fontSize: '14px',
    fontWeight: '500',
    color: 'var(--text-primary)',
  },
  englishSubContainer: {
    position: 'relative',
    height: '14px',
    width: '100%',
    overflow: 'hidden',
    marginTop: '3px',
  },
  englishSub: {
    fontSize: '10px',
    color: 'var(--text-tertiary)',
    fontFamily: 'var(--mono)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    display: 'block',
    textAlign: 'center',
  },
  hoverOverlay: {
    position: 'absolute',
    top: '12px',
    left: '0',
    right: '0',
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
    transition: 'opacity 0.25s ease',
  },
  overlayText: {
    fontSize: '11px',
    color: 'var(--text-secondary)',
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    padding: '2px 8px',
    borderRadius: '10px',
  },
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
