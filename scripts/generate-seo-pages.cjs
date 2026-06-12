const fs = require('fs');
const path = require('path');

const distDir = path.join(__dirname, '../dist');
const crystalsFilePath = path.join(__dirname, '../src/data/crystals.ts');

const ANALYTICS_SCRIPTS = `
  <!-- Cloudflare Web Analytics --><script defer src='https://static.cloudflareinsights.com/beacon.min.js' data-cf-beacon='{"token": "bc04f3973ed14d8fb8482bf5231707dd"}'></script><!-- End Cloudflare Web Analytics -->
  <script defer src="https://cloud.umami.is/script.js" data-website-id="6c7b0984-3f72-4339-ab22-a09337c07c1a"></script>
`;

if (!fs.existsSync(distDir)) {
  console.error('Error: dist directory does not exist. Please run build first.');
  process.exit(1);
}

// 讀取 index.html 範本
const indexHtmlPath = path.join(distDir, 'index.html');
if (!fs.existsSync(indexHtmlPath)) {
  console.error('Error: dist/index.html template not found.');
  process.exit(1);
}
const templateHtml = fs.readFileSync(indexHtmlPath, 'utf8');

// 讀取 crystals.ts 並使用 Regex 解析水晶資料
console.log('Parsing crystals data from src/data/crystals.ts...');
const crystalsFileContent = fs.readFileSync(crystalsFilePath, 'utf8');

// 以 '{' 和 '}' 切分水晶區塊
const crystalBlocks = crystalsFileContent.split('{\n    id:');
crystalBlocks.shift(); // 第一個是 export const ... 之前的宣告

const crystals = [];
crystalBlocks.forEach(block => {
  try {
    const idMatch = block.match(/'([^']+)'/);
    const nameMatch = block.match(/name:\s*'([^']+)'/);
    const englishNameMatch = block.match(/englishName:\s*'([^']+)'/);
    const chemicalFormulaMatch = block.match(/chemicalFormula:\s*'([^']+)'/);
    const hardnessMatch = block.match(/hardness:\s*([0-9.]+)/);
    const crystalSystemMatch = block.match(/crystalSystem:\s*'([^']+)'/);
    const shortDescriptionMatch = block.match(/shortDescription:\s*'([^']+)'/);
    const formationMatch = block.match(/formation:\s*'([^']+)'/);
    const mythologyMatch = block.match(/mythology:\s*'([^']+)'/);
    const imageMatch = block.match(/image:\s*'([^']+)'/);
    const traitsMatch = block.match(/traits:\s*\[([^\]]+)\]/);
    
    let traits = [];
    if (traitsMatch) {
      traits = traitsMatch[1].split(',').map(t => t.trim().replace(/'/g, ''));
    }
    
    if (idMatch && nameMatch) {
      crystals.push({
        id: idMatch[1],
        name: nameMatch[1],
        englishName: englishNameMatch ? englishNameMatch[1] : '',
        chemicalFormula: chemicalFormulaMatch ? chemicalFormulaMatch[1] : '',
        hardness: hardnessMatch ? parseFloat(hardnessMatch[1]) : 7,
        crystalSystem: crystalSystemMatch ? crystalSystemMatch[1] : '',
        shortDescription: shortDescriptionMatch ? shortDescriptionMatch[1] : '',
        formation: formationMatch ? formationMatch[1] : '',
        mythology: mythologyMatch ? mythologyMatch[1] : '',
        image: imageMatch ? imageMatch[1] : '',
        traits: traits
      });
    }
  } catch (err) {
    console.warn('Skipped parsing one crystal block due to error:', err.message);
  }
});

console.log(`Successfully parsed ${crystals.length} crystals.`);

// Helper to write folder and file
function writeStaticPage(targetPath, htmlContent) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, htmlContent, 'utf8');
}

// 1. 生成各個水晶的獨立靜態頁面
crystals.forEach(crystal => {
  let html = templateHtml;
  
  // 替換 Title
  const traitsText = crystal.traits && crystal.traits.length > 0 
    ? crystal.traits.slice(0, 2).join('與') + '之石'
    : '能量共振之石';
  const title = `${crystal.name} (${crystal.englishName})：${traitsText} | 水晶啟示錄 - 水晶圖鑑・手鍊設計`;
  html = html.replace('<title>水晶啟示錄 — 極簡水晶百科</title>', `<title>${title}</title>`);
  
  // 替換 Meta Description
  const desc = `${crystal.name}（${crystal.chemicalFormula}），硬度 ${crystal.hardness}，${crystal.crystalSystem}。${crystal.shortDescription}。科學形成過程與希臘神話探索。`;
  // 用正則匹配替換原本的 description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/s,
    `<meta name="description" content="${desc}" />`
  );
  
  // 注入 Schema.org JSON-LD
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    "name": `${crystal.name} (${crystal.englishName})`,
    "description": crystal.shortDescription,
    "mainEntity": {
      "@type": "Thing",
      "name": crystal.name,
      "alternateName": crystal.englishName,
      "description": crystal.shortDescription,
      "image": `https://crystal-revelation.pages.dev${crystal.image}`,
      "properties": [
        { "@type": "PropertyValue", "name": "化學式", "value": crystal.chemicalFormula },
        { "@type": "PropertyValue", "name": "摩氏硬度", "value": crystal.hardness },
        { "@type": "PropertyValue", "name": "晶系", "value": crystal.crystalSystem }
      ]
    }
  };
  const schemaScript = `  <script type="application/ld+json">\n${JSON.stringify(schemaJson, null, 2)}\n  </script>\n`;
  html = html.replace('</head>', `${schemaScript}</head>`);
  
  // 注入爬蟲可讀的隱藏 SEO 內容
  const seoContent = `
    <div id="seo-content" style="display:none;">
      <h1>${crystal.name} (${crystal.englishName})</h1>
      <p><strong>化學式：</strong>${crystal.chemicalFormula}</p>
      <p><strong>硬度：</strong>${crystal.hardness}</p>
      <p><strong>晶系：</strong>${crystal.crystalSystem}</p>
      <p><strong>簡介：</strong>${crystal.shortDescription}</p>
      <h2>科學形成過程</h2>
      <p>${crystal.formation}</p>
      <h2>神話與傳說背景</h2>
      <p>${crystal.mythology}</p>
    </div>
  `;
  html = html.replace('<div id="root"></div>', `<div id="root">${seoContent}</div>`);
  
  // 注入統計代碼到 </body> 之前
  html = html.replace('</body>', `${ANALYTICS_SCRIPTS}</body>`);
  
  // 寫入檔案
  const targetHtmlPath = path.join(distDir, `crystals/${crystal.id}/index.html`);
  writeStaticPage(targetHtmlPath, html);
});

console.log(`Generated ${crystals.length} static crystal detail pages.`);

// 2. 生成其他主要頁面的靜態路由 (避免直連刷新 404)
const mainRoutes = ['diy', 'numerology', 'encyclopedia'];
mainRoutes.forEach(route => {
  const targetHtmlPath = path.join(distDir, `${route}/index.html`);
  const routeHtml = templateHtml.replace('</body>', `${ANALYTICS_SCRIPTS}</body>`);
  writeStaticPage(targetHtmlPath, routeHtml);
});
console.log('Generated main route pages: ' + mainRoutes.join(', ') + '.');

// 3. 把統計代碼注入並寫回生產環境首頁 dist/index.html
const prodIndexHtml = templateHtml.replace('</body>', `${ANALYTICS_SCRIPTS}</body>`);
fs.writeFileSync(indexHtmlPath, prodIndexHtml, 'utf8');
console.log('Updated dist/index.html with production analytics.');

console.log('✓ All SEO static pages generated successfully!');
