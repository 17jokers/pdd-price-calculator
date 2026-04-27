// ==UserScript==
// @name         拼多多药品算价助手
// @namespace    https://github.com/17jokers/pdd-price-calculator
// @version      1.0.0
// @description  拼多多商家后台药品算价工具，自动计算拼单价/单买价并一键填入SKU表格
// @author       your-name
// @match        https://mms.pinduoduo.com/goods/goods_add*
// @match        https://mms.pinduoduo.com/goods/goods_edit*
// @match        https://mms.pinduoduo.com/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/17jokers/pdd-price-calculator/main/pdd-price-calculator.user.js
// @downloadURL  https://raw.githubusercontent.com/17jokers/pdd-price-calculator/main/pdd-price-calculator.user.js
// ==/UserScript==

(function () {
  'use strict';

  // =============================================
  // 注入 CSS 样式
  // =============================================
  const STYLE = `
/* 拼多多算价助手 v4 - 蓝色主题 */
#pdd-price-calc-root {
  all: initial;
  position: fixed;
  z-index: 2147483647;
  font-family: -apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 12px;
  color: #333;
  left: 0;
  right: 0;
  width: 100%;
}
#pdd-price-calc-root * {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}
#pdd-price-calc-root.pos-bottom { bottom: 0; }
#pdd-price-calc-root.pos-top    { top: 0; }
#pdd-calc-container {
  background: #f0f7ff;
  border-top: 3px solid #1a73e8;
  box-shadow: 0 -2px 14px rgba(26,115,232,0.15);
  width: 100%;
  max-height: 50vh;
  overflow: hidden;
  transition: max-height 0.25s ease;
}
#pdd-price-calc-root.pos-top #pdd-calc-container {
  border-top: none;
  border-bottom: 3px solid #1a73e8;
  box-shadow: 0 2px 14px rgba(26,115,232,0.15);
}
#pdd-calc-header {
  display: flex;
  align-items: center;
  padding: 5px 12px;
  background: linear-gradient(90deg, #1565c0 0%, #1a73e8 50%, #42a5f5 100%);
  user-select: none;
  gap: 10px;
}
#pdd-calc-title {
  color: #fff;
  font-weight: 700;
  font-size: 12px;
  white-space: nowrap;
}
#pdd-calc-inline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  flex-wrap: nowrap;
  overflow: hidden;
}
.pdd-tab-btn {
  padding: 3px 10px;
  border-radius: 12px;
  border: 1px solid rgba(255,255,255,0.5);
  background: rgba(255,255,255,0.15);
  color: #fff;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  transition: background 0.15s;
}
.pdd-tab-btn.active {
  background: #fff;
  color: #1a73e8;
  border-color: #fff;
}
.pdd-sep { color: rgba(255,255,255,0.4); font-size: 11px; }
.pdd-inline-label { color: rgba(255,255,255,0.85); font-size: 11px; white-space: nowrap; }
.pdd-inline-input {
  width: 68px;
  height: 24px;
  border: 1px solid rgba(255,255,255,0.6);
  border-radius: 5px;
  padding: 0 6px;
  font-size: 12px;
  background: rgba(255,255,255,0.9);
  color: #333;
  outline: none;
  -moz-appearance: textfield;
}
.pdd-inline-input::-webkit-inner-spin-button,
.pdd-inline-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.pdd-inline-input:focus {
  background: #fff;
  border-color: #fff;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.3);
}
#pdd-cost-detail-toggle {
  color: rgba(255,255,255,0.8);
  font-size: 11px;
  cursor: pointer;
  text-decoration: underline dotted;
  white-space: nowrap;
}
#pdd-cost-detail-toggle:hover { color: #fff; }
#pdd-calc-btn {
  background: #fff;
  color: #1a73e8;
  border: none;
  border-radius: 6px;
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
  transition: opacity 0.15s, transform 0.1s;
  height: 24px;
  line-height: 1;
}
#pdd-calc-btn:hover  { opacity: 0.85; }
#pdd-calc-btn:active { transform: scale(0.96); }
#pdd-fill-btn {
  background: linear-gradient(135deg, #1565c0, #1a73e8);
  color: #fff;
  border: 1px solid rgba(255,255,255,0.3);
  border-radius: 5px;
  padding: 4px 10px;
  font-size: 12px;
  cursor: pointer;
  font-family: inherit;
  transition: opacity 0.2s, transform 0.1s;
}
#pdd-fill-btn:hover { opacity: 0.85; }
#pdd-fill-btn:active { transform: scale(0.96); }
.pdd-inline-select {
  background: rgba(255,255,255,0.9);
  border: 1px solid rgba(255,255,255,0.5);
  border-radius: 3px;
  padding: 2px 4px;
  font-size: 12px;
  color: #333;
  cursor: pointer;
  height: 24px;
}
#pdd-calc-header-btns { display: flex; gap: 5px; align-items: center; flex-shrink: 0; }
.pdd-hdr-btn {
  background: rgba(255,255,255,0.18);
  border: 1px solid rgba(255,255,255,0.4);
  color: #fff;
  border-radius: 4px;
  padding: 2px 7px;
  font-size: 11px;
  cursor: pointer;
  white-space: nowrap;
}
.pdd-hdr-btn:hover { background: rgba(255,255,255,0.32); }
#pdd-cost-detail {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: #e3f0ff;
  border-bottom: 1px solid #b3d4fc;
  flex-wrap: nowrap;
}
#pdd-cost-detail.hidden { display: none; }
.pdd-cost-field { display: flex; align-items: center; gap: 4px; }
.pdd-cost-field label { font-size: 11px; color: #555; white-space: nowrap; }
.pdd-cost-field input {
  width: 60px; height: 22px;
  border: 1px solid #b3d4fc; border-radius: 4px;
  padding: 0 5px; font-size: 11px; color: #333;
  background: #fff; outline: none;
  -moz-appearance: textfield;
}
.pdd-cost-field input::-webkit-inner-spin-button,
.pdd-cost-field input::-webkit-outer-spin-button { -webkit-appearance: none; }
#pdd-comprehensive-display { font-weight: 700; color: #1a73e8; font-size: 12px; white-space: nowrap; }
#pdd-result-area { overflow-x: auto; overflow-y: hidden; padding: 0; }
#pdd-result-area.hidden { display: none; }
.pdd-table { border-collapse: collapse; background: #fff; white-space: nowrap; width: 100%; }
.pdd-table th, .pdd-table td {
  padding: 4px 10px; text-align: center; font-size: 12px;
  border-right: 1px solid rgba(26,115,232,0.12);
  border-bottom: 1px solid rgba(26,115,232,0.12);
}
.pdd-table thead tr {
  background: linear-gradient(90deg, #1565c0 0%, #1a73e8 50%, #42a5f5 100%);
  color: #fff;
}
.pdd-table th { font-weight: 600; font-size: 11px; position: sticky; top: 0; }
.pdd-table th:first-child, .pdd-table td:first-child {
  position: sticky; left: 0;
  background: #1565c0; color: #fff;
  font-weight: 700; font-size: 11px; z-index: 2; min-width: 64px;
}
.pdd-table tbody tr:nth-child(even) td:first-child { background: #0d47a1; }
.pdd-table tbody tr td:first-child { background: #1565c0; }
.pdd-table tbody tr:nth-child(odd)  { background: #fff; }
.pdd-table tbody tr:nth-child(even) { background: #f0f7ff; }
.pdd-table tbody tr:hover td { background: #e3f0ff !important; }
.pdd-table tbody tr:hover td:first-child { background: #0d47a1 !important; }
.pdd-table tr.row-sale td { color: #1a73e8; font-weight: 700; font-size: 13px; }
.pdd-table tr.row-unit td { color: #888; font-size: 11px; }
.pdd-profit-input {
  width: 58px; height: 20px;
  border: 1px solid #b3d4fc; border-radius: 4px;
  padding: 0 4px; font-size: 11px; text-align: center;
  background: #f0f7ff; color: #333; outline: none;
  -moz-appearance: textfield;
}
.pdd-profit-input::-webkit-inner-spin-button,
.pdd-profit-input::-webkit-outer-spin-button { -webkit-appearance: none; }
.pdd-profit-input:focus {
  border-color: #1a73e8; background: #fff;
  box-shadow: 0 0 0 2px rgba(26,115,232,0.2);
}
.pdd-sale-cell { cursor: pointer; border-radius: 3px; transition: background 0.1s; }
.pdd-sale-cell:hover { background: rgba(26,115,232,0.1); }
.pdd-sale-cell.copied { color: #27ae60 !important; }
#pdd-float-btn {
  position: fixed; bottom: 12px; right: 12px;
  z-index: 2147483647;
  width: 38px; height: 38px;
  background: linear-gradient(135deg, #1565c0, #1a73e8);
  color: #fff; border: none; border-radius: 50%;
  font-size: 18px; line-height: 38px; text-align: center;
  cursor: pointer; box-shadow: 0 2px 12px rgba(26,115,232,0.45);
  display: none; user-select: none;
}
#pdd-float-btn:hover { transform: scale(1.1); box-shadow: 0 4px 16px rgba(26,115,232,0.5); }
#pdd-calc-container.hidden { display: none; }
`;

  // 注入样式
  const styleEl = document.createElement('style');
  styleEl.textContent = STYLE;
  document.head.appendChild(styleEl);

  // =============================================
  // 定价参数
  // =============================================
  const PRICING_DATA = {
    PLATFORM_FEE_RX:   0.025,
    PLATFORM_FEE_OTC:  0.006,
    PRESCRIPTION_FEE:  0.35,
    DEFAULT_EXPRESS:   1.6,
    DEFAULT_PACKING:   0.2,
    DEFAULT_LABOR:     0.1,
    RX_PACKAGES:   [1,2,3,4,5,6,7,8,9,10,11,13,14,15,16,17,18,19,20,24],
    OTC_PACKAGES:  [1,2,3,4,5,6,7,8,9,10,12,13,14,15,16,17,18,19,20,25],
  };

  // =============================================
  // 核心算价
  // =============================================
  function calcPrice({ drugCost, express, packing, labor, boxProfit, qty, type }) {
    const comprehensive = express + packing + labor;
    const baseCost      = comprehensive + drugCost * qty;
    const orderProfit   = boxProfit * qty;
    const feeRate       = type === 'rx' ? PRICING_DATA.PLATFORM_FEE_RX : PRICING_DATA.PLATFORM_FEE_OTC;
    const platformFee   = (baseCost + orderProfit) * feeRate;
    const rxFee         = type === 'rx' ? PRICING_DATA.PRESCRIPTION_FEE : 0;
    const salePrice     = baseCost + orderProfit + platformFee + rxFee;
    const unitPrice     = qty > 0 ? salePrice / qty : 0;
    return {
      qty,
      baseCost:    +baseCost.toFixed(2),
      orderProfit: +orderProfit.toFixed(2),
      platformFee: +platformFee.toFixed(2),
      rxFee:       +rxFee.toFixed(2),
      salePrice:   +salePrice.toFixed(2),
      unitPrice:   +unitPrice.toFixed(2),
    };
  }

  function getPackages(type) {
    return type === 'rx' ? PRICING_DATA.RX_PACKAGES : PRICING_DATA.OTC_PACKAGES;
  }

  // =============================================
  // UI 构建
  // =============================================
  function buildUI() {
    const oldFloat = document.getElementById('pdd-float-btn');
    if (oldFloat) oldFloat.remove();

    const floatBtn = document.createElement('div');
    floatBtn.id = 'pdd-float-btn';
    floatBtn.innerHTML = '💊';
    floatBtn.title = '显示算价助手';
    floatBtn.style.display = 'none';
    document.body.appendChild(floatBtn);

    const root = document.createElement('div');
    root.id = 'pdd-price-calc-root';
    root.className = 'pos-bottom';
    root.innerHTML = `
      <div id="pdd-calc-container">
        <div id="pdd-calc-header">
          <div id="pdd-calc-title">💊 算价</div>
          <div id="pdd-calc-inline">
            <button class="pdd-tab-btn active" data-type="rx">处方药</button>
            <button class="pdd-tab-btn" data-type="otc">OTC</button>
            <span class="pdd-sep">|</span>
            <span class="pdd-inline-label">单位</span>
            <select id="pdd-unit-select" class="pdd-inline-select">
              <option value="盒">盒</option>
              <option value="瓶">瓶</option>
              <option value="包">包</option>
              <option value="袋">袋</option>
              <option value="板">板</option>
            </select>
            <span class="pdd-sep">|</span>
            <span class="pdd-inline-label">药品成本</span>
            <input type="number" id="pdd-drug-cost" class="pdd-inline-input" value="1" min="0" step="0.01">
            <span class="pdd-inline-label">元/盒</span>
            <span class="pdd-sep">|</span>
            <span class="pdd-inline-label">每盒利润</span>
            <input type="number" id="pdd-box-profit" class="pdd-inline-input" value="0.1" min="0" step="0.01">
            <span class="pdd-inline-label">元</span>
            <span class="pdd-sep">|</span>
            <span id="pdd-cost-detail-toggle">⚙综合成本</span>
            <button id="pdd-calc-btn">🧮 计算</button>
            <button id="pdd-fill-btn">📋 填入拼多多</button>
          </div>
          <div id="pdd-calc-header-btns">
            <button class="pdd-hdr-btn" id="pdd-toggle-pos-btn" title="切换上下位置">⇅</button>
            <button class="pdd-hdr-btn" id="pdd-close-btn" title="关闭">✕</button>
          </div>
        </div>
        <div id="pdd-cost-detail" class="hidden">
          <div class="pdd-cost-field">
            <label>快递</label>
            <input type="number" id="pdd-express" value="1.6" min="0" step="0.01">
          </div>
          <div class="pdd-cost-field">
            <label>包装</label>
            <input type="number" id="pdd-packing" value="0.2" min="0" step="0.01">
          </div>
          <div class="pdd-cost-field">
            <label>人工场地</label>
            <input type="number" id="pdd-labor" value="0.1" min="0" step="0.01">
          </div>
          <div class="pdd-cost-field">
            <label>合计：</label>
            <span id="pdd-comprehensive-display">¥1.90</span>
          </div>
        </div>
        <div id="pdd-result-area" class="hidden">
          <div id="pdd-table-wrap"></div>
        </div>
      </div>
    `;
    document.body.appendChild(root);
    return root;
  }

  // =============================================
  // 横向表格渲染
  // =============================================
  function renderTable(root, params) {
    const { drugCost, express, packing, labor, type } = params;
    const pkgs = getPackages(type);
    const wrap = root.querySelector('#pdd-table-wrap');
    const perBoxProfit = parseFloat(root.querySelector('#pdd-box-profit').value) || 0;

    const savedProfits = {};
    wrap.querySelectorAll('.pdd-profit-input').forEach(inp => {
      savedProfits[inp.dataset.qty] = {
        value:    inp.value,
        modified: inp.dataset.modified === 'true',
      };
    });

    const results = pkgs.map(qty => {
      const entry = savedProfits[qty];
      let profitPerOrder;
      if (entry && entry.modified) {
        profitPerOrder = parseFloat(entry.value) || 0;
      } else if (qty === 1) {
        profitPerOrder = -0.5;
      } else {
        profitPerOrder = perBoxProfit * qty;
      }
      return calcPrice({ drugCost, express, packing, labor, boxProfit: profitPerOrder / qty, qty, type });
    });

    const pkgHeaders = pkgs.map(q => `<th>${q}盒</th>`).join('');
    const profitRow = results.map(r => {
      const entry    = savedProfits[r.qty];
      const modified = entry && entry.modified;
      let initVal;
      if (modified)       initVal = entry.value;
      else if (r.qty ===1) initVal = '-0.50';
      else                initVal = (perBoxProfit * r.qty).toFixed(2);
      return `<td><input class="pdd-profit-input" data-qty="${r.qty}" data-modified="${modified ? 'true' : 'false'}" type="number" value="${(+initVal).toFixed(2)}" min="0" step="0.01"></td>`;
    }).join('');
    const saleRow = results.map(r =>
      `<td class="pdd-sale-cell" data-price="${r.salePrice.toFixed(2)}" title="点击复制">¥${r.salePrice.toFixed(2)}</td>`
    ).join('');
    const unitRow = results.map(r =>
      `<td>¥${r.unitPrice.toFixed(2)}</td>`
    ).join('');

    wrap.innerHTML = `
      <table class="pdd-table">
        <thead><tr><th>套餐</th>${pkgHeaders}</tr></thead>
        <tbody>
          <tr><td>每单利润</td>${profitRow}</tr>
          <tr class="row-sale"><td>建议售价</td>${saleRow}</tr>
          <tr class="row-unit"><td>单盒均价</td>${unitRow}</tr>
        </tbody>
      </table>
    `;

    wrap.querySelectorAll('.pdd-profit-input').forEach(inp => {
      inp.addEventListener('input', () => {
        inp.dataset.modified = 'true';
        const qty    = parseInt(inp.dataset.qty);
        const profit = parseFloat(inp.value) || 0;
        const res    = calcPrice({ drugCost, express, packing, labor, boxProfit: profit / qty, qty, type });
        const colIdx = pkgs.indexOf(qty);
        if (colIdx < 0) return;
        const rows = wrap.querySelectorAll('tbody tr');
        const saleCell = rows[1].querySelectorAll('td')[colIdx + 1];
        const unitCell = rows[2].querySelectorAll('td')[colIdx + 1];
        if (saleCell) { saleCell.textContent = `¥${res.salePrice.toFixed(2)}`; saleCell.dataset.price = res.salePrice.toFixed(2); }
        if (unitCell) unitCell.textContent = `¥${res.unitPrice.toFixed(2)}`;
      });
    });

    wrap.querySelectorAll('.pdd-sale-cell').forEach(cell => {
      cell.addEventListener('click', () => {
        navigator.clipboard.writeText(cell.dataset.price || cell.textContent.replace('¥','')).then(() => {
          cell.classList.add('copied');
          const orig = cell.textContent;
          cell.textContent = '已复制!';
          setTimeout(() => { cell.classList.remove('copied'); cell.textContent = orig; }, 900);
        });
      });
    });
  }

  // =============================================
  // 初始化
  // =============================================
  function initCalc() {
    let currentType   = 'rx';
    let costDetailOpen = false;
    let hasCalculated  = false;

    const root       = buildUI();
    const container  = root.querySelector('#pdd-calc-container');
    const resultArea = root.querySelector('#pdd-result-area');
    const savedPos   = localStorage.getItem('pdd_calc_pos') || 'bottom';
    root.className   = `pos-${savedPos}`;

    document.getElementById('pdd-float-btn').addEventListener('click', () => {
      container.classList.remove('hidden');
      document.getElementById('pdd-float-btn').style.display = 'none';
    });

    root.querySelectorAll('.pdd-tab-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        root.querySelectorAll('.pdd-tab-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentType = btn.dataset.type;
        if (hasCalculated) renderTable(root, getParams());
      });
    });

    root.querySelector('#pdd-cost-detail-toggle').addEventListener('click', () => {
      costDetailOpen = !costDetailOpen;
      root.querySelector('#pdd-cost-detail').classList.toggle('hidden', !costDetailOpen);
    });

    function updateCompDisplay() {
      const e = parseFloat(root.querySelector('#pdd-express').value) || 0;
      const p = parseFloat(root.querySelector('#pdd-packing').value) || 0;
      const l = parseFloat(root.querySelector('#pdd-labor').value)   || 0;
      root.querySelector('#pdd-comprehensive-display').textContent = `¥${(e+p+l).toFixed(2)}`;
    }
    ['#pdd-express','#pdd-packing','#pdd-labor'].forEach(s =>
      root.querySelector(s).addEventListener('input', updateCompDisplay)
    );

    function getParams() {
      return {
        drugCost: parseFloat(root.querySelector('#pdd-drug-cost').value) || 0,
        express:  parseFloat(root.querySelector('#pdd-express').value)  || PRICING_DATA.DEFAULT_EXPRESS,
        packing:  parseFloat(root.querySelector('#pdd-packing').value) || PRICING_DATA.DEFAULT_PACKING,
        labor:    parseFloat(root.querySelector('#pdd-labor').value)   || PRICING_DATA.DEFAULT_LABOR,
        type:     currentType,
        unit:     root.querySelector('#pdd-unit-select').value,
      };
    }

    root.querySelector('#pdd-calc-btn').addEventListener('click', () => {
      const p = getParams();
      if (isNaN(p.drugCost)) { alert('请填写药品成本'); return; }
      resultArea.classList.remove('hidden');
      hasCalculated = true;
      renderTable(root, p);
    });

    ['#pdd-drug-cost','#pdd-box-profit','#pdd-express','#pdd-packing','#pdd-labor'].forEach(sel => {
      root.querySelector(sel).addEventListener('input', () => {
        updateCompDisplay();
        if (hasCalculated) renderTable(root, getParams());
      });
    });

    root.querySelector('#pdd-close-btn').addEventListener('click', () => {
      container.classList.add('hidden');
      document.getElementById('pdd-float-btn').style.display = 'block';
    });

    // =============================================
    // 填入拼多多
    // =============================================
    root.querySelector('#pdd-fill-btn').addEventListener('click', () => {
      console.log('[PDD算价] 填入按钮点击');
      try {
        const btn = root.querySelector('#pdd-fill-btn');
        btn.textContent = '🔍 查找中...';

        const p = getParams();
        if (isNaN(p.drugCost) || p.drugCost === 0) {
          alert('请先填写药品成本并计算');
          btn.textContent = '📋 填入拼多多';
          return;
        }

        const wrap = root.querySelector('#pdd-table-wrap');
        if (!wrap || wrap.children.length === 0) {
          alert('请先点击「🧮 计算」生成算价表格');
          btn.textContent = '📋 填入拼多多';
          return;
        }

        // 构建 saleMap: qty → price
        const saleMap = {};
        wrap.querySelectorAll('.pdd-profit-input').forEach(inp => {
          const qty    = parseInt(inp.dataset.qty);
          const profit = parseFloat(inp.value) || 0;
          const res = calcPrice({ drugCost: p.drugCost, express: p.express, packing: p.packing, labor: p.labor, boxProfit: profit / qty, qty, type: p.type });
          saleMap[qty] = res.salePrice.toFixed(2);
        });
        console.log('[PDD算价] saleMap:', saleMap);

        if (Object.keys(saleMap).length === 0) {
          alert('算价表格为空，请重新计算');
          btn.textContent = '📋 填入拼多多';
          return;
        }

        // 设置输入框值并触发事件
        function setInputValue(input, value) {
          input.value = value;
          input.dispatchEvent(new Event('input', { bubbles: true }));
          input.dispatchEvent(new Event('change', { bubbles: true }));
        }

        // 查找容器内输入框
        function findPriceInput(container) {
          const selectors = [
            'input[data-testid="beast-core-inputNumber-htmlInput"]',
            'input[class*="IPT_input"]',
            'input[type="text"]',
            'input'
          ];
          for (const sel of selectors) {
            const inp = container.querySelector(sel);
            if (inp) return inp;
          }
          return null;
        }

        const ALL_UNITS = ['盒', '瓶', '包', '袋', '板'];

        // ── 找到列索引 ──
        const allTh = Array.from(document.querySelectorAll('th'));
        console.log('[PDD算价] 所有th:', allTh.map(t => t.textContent?.trim()));
        const headerRow   = allTh.length > 0 ? allTh[0].closest('tr') : null;
        const headerCells = headerRow ? Array.from(headerRow.querySelectorAll('th, td')) : allTh;
        const pddPriceColIndex    = headerCells.findIndex(th => th.textContent?.includes('拼单价'));
        const singlePriceColIndex = headerCells.findIndex(th => th.textContent?.includes('单买价'));
        console.log('[PDD算价] 拼单价列:', pddPriceColIndex, '单买价列:', singlePriceColIndex);

        // ── 收集含价格容器的 SKU 行 ──
        const allContainers = document.querySelectorAll('.sku-beast-price-input-container');
        console.log('[PDD算价] 全页价格容器:', allContainers.length);
        const skuRows = [];
        const seen = new Set();
        allContainers.forEach(c => {
          const row = c.closest('tr');
          if (row && !seen.has(row)) { seen.add(row); skuRows.push(row); }
        });
        console.log('[PDD算价] SKU行数:', skuRows.length);

        if (skuRows.length === 0) {
          alert('未找到拼多多 SKU 表格。\n请确认：\n1) 是否在商品编辑页面\n2) 若有 iframe，请在 iframe 内页面操作');
          btn.textContent = '📋 填入拼多多';
          return;
        }

        let filledCount = 0;
        let singleFilledCount = 0;

        skuRows.forEach((row, rowIdx) => {
          const priceContainers = row.querySelectorAll('.sku-beast-price-input-container');
          const text = row.textContent || '';
          const match = text.match(new RegExp(`(\\d+)\\s*(${ALL_UNITS.join('|')})`));
          console.log(`[PDD算价] 行${rowIdx}: "${text.trim().slice(0,30)}" → 匹配: ${match ? match[0] : '无'}`);
          if (!match) return;

          const qty      = parseInt(match[1]);
          const rowUnit  = match[2];
          const pddPrice = saleMap[qty];
          if (pddPrice === undefined) {
            console.log(`[PDD算价] 行${rowIdx}: saleMap 无 qty=${qty}`);
            return;
          }
          const singlePrice = (parseFloat(pddPrice) + 1).toFixed(2);

          priceContainers.forEach((container, cIdx) => {
            const td = container.closest('td');
            if (!td) return;
            const tdIndex = Array.from(td.parentElement.children).indexOf(td);
            const input   = findPriceInput(container);
            console.log(`[PDD算价] 行${rowIdx}容器${cIdx}: tdIndex=${tdIndex}`);
            if (!input) return;

            if (pddPriceColIndex >= 0 && tdIndex === pddPriceColIndex) {
              setInputValue(input, pddPrice);
              filledCount++;
              console.log(`[PDD算价] ✓ 拼单价 ${qty}${rowUnit} → ${pddPrice}`);
            } else if (singlePriceColIndex >= 0 && tdIndex === singlePriceColIndex) {
              setInputValue(input, singlePrice);
              singleFilledCount++;
              console.log(`[PDD算价] ✓ 单买价 ${qty}${rowUnit} → ${singlePrice}`);
            } else if (pddPriceColIndex < 0) {
              // 兜底：第1个容器=拼单价，第2个=单买价
              const pos = Array.from(priceContainers).indexOf(container);
              if (pos === 0) { setInputValue(input, pddPrice); filledCount++; console.log(`[PDD算价] ✓ 拼单价(兜底) ${qty}${rowUnit} → ${pddPrice}`); }
              else if (pos === 1) { setInputValue(input, singlePrice); singleFilledCount++; console.log(`[PDD算价] ✓ 单买价(兜底) ${qty}${rowUnit} → ${singlePrice}`); }
            }
          });
        });

        if (filledCount > 0 || singleFilledCount > 0) {
          btn.textContent = `✅ 拼单${filledCount} 单买${singleFilledCount}`;
          setTimeout(() => { btn.textContent = '📋 填入拼多多'; }, 2500);
        } else {
          alert('填入失败，请打开 DevTools Console 查看 [PDD算价] 日志。');
          btn.textContent = '📋 填入拼多多';
        }
      } catch(e) {
        console.error('[PDD算价] 出错:', e);
        alert('填入出错: ' + e.message);
        root.querySelector('#pdd-fill-btn').textContent = '📋 填入拼多多';
      }
    });

    root.querySelector('#pdd-toggle-pos-btn').addEventListener('click', () => {
      const isBottom = root.classList.contains('pos-bottom');
      root.classList.toggle('pos-bottom', !isBottom);
      root.classList.toggle('pos-top', isBottom);
      localStorage.setItem('pdd_calc_pos', isBottom ? 'top' : 'bottom');
    });
  }

  // 防止重复注入
  if (!document.getElementById('pdd-price-calc-root')) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCalc);
    } else {
      initCalc();
    }
  }

})();
