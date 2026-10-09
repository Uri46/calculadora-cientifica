/**
 * Calculadora Científica - Interfaz de Usuario y Gestión del DOM
 * Conecta la UI con el módulo de lógica pura (calculadora.js).
 * Sin uso de eval() ni new Function().
 */

(function () {
  'use strict';

  // ==========================================================================
  // Estado de la Aplicación
  // ==========================================================================
  const state = {
    expression: '',
    result: '0',
    angleMode: 'DEG', // 'DEG' o 'RAD'
    history: [],      // Almacenamiento en memoria (sin localStorage)
    hasError: false,
    justCalculated: false,
    lastResult: null,
    theme: 'dark'
  };

  // ==========================================================================
  // Referencias a Elementos del DOM
  // ==========================================================================
  const elements = {
    expressionDisplay: document.getElementById('expression-display'),
    resultDisplay: document.getElementById('result-display'),
    modeTag: document.getElementById('display-mode-tag'),
    memoryTag: document.getElementById('display-memory-tag'),
    btnAngleToggle: document.getElementById('btn-angle-toggle'),
    degIndicator: document.getElementById('deg-indicator'),
    radIndicator: document.getElementById('rad-indicator'),
    btnToggleHistory: document.getElementById('btn-toggle-history'),
    historyPanel: document.getElementById('history-panel'),
    historyList: document.getElementById('history-list'),
    btnClearHistory: document.getElementById('btn-clear-history'),
    btnCloseHistory: document.getElementById('btn-close-history'),
    btnToggleTheme: document.getElementById('btn-toggle-theme'),
    themeIcon: document.getElementById('theme-icon'),
    keypad: document.querySelector('.keypad-grid')
  };

  // ==========================================================================
  // Renderizado y Actualización de Pantalla
  // ==========================================================================
  function updateDisplay() {
    // Expresión actual
    elements.expressionDisplay.textContent = state.expression || '0';

    // Scroll horizontal automático hacia el final del texto
    elements.expressionDisplay.scrollLeft = elements.expressionDisplay.scrollWidth;

    // Resultado
    if (state.hasError) {
      elements.resultDisplay.textContent = state.result;
      elements.resultDisplay.classList.add('error');
    } else {
      elements.resultDisplay.textContent = state.result;
      elements.resultDisplay.classList.remove('error');
    }

    // Ajuste dinámico de tamaño de fuente para resultados largos
    adjustResultFontSize();

    // Indicadores superiores
    elements.modeTag.textContent = state.angleMode;
    if (state.angleMode === 'DEG') {
      elements.degIndicator.classList.add('active');
      elements.radIndicator.classList.remove('active');
    } else {
      elements.radIndicator.classList.add('active');
      elements.degIndicator.classList.remove('active');
    }

    if (state.lastResult !== null) {
      elements.memoryTag.classList.remove('hidden');
    } else {
      elements.memoryTag.classList.add('hidden');
    }
  }

  function adjustResultFontSize() {
    const textLen = (state.result || '').length;
    if (state.hasError) {
      elements.resultDisplay.style.fontSize = '';
      return;
    }
    if (textLen > 18) {
      elements.resultDisplay.style.fontSize = '1.25rem';
    } else if (textLen > 12) {
      elements.resultDisplay.style.fontSize = '1.5rem';
    } else {
      elements.resultDisplay.style.fontSize = '';
    }
  }

  // ==========================================================================
  // Manejo de Acciones de Entrada
  // ==========================================================================
  function insertValue(value) {
    if (state.hasError) {
      clearAll();
    }

    const isOperator = ['+', '−', '×', '÷', '^', '%', '!'].includes(value);

    // Si recién calculamos y el usuario presiona un operador, continuar sobre el resultado anterior
    if (state.justCalculated) {
      if (isOperator) {
        state.expression = state.result + value;
      } else {
        state.expression = value;
      }
      state.justCalculated = false;
      state.hasError = false;
      updateDisplay();
      return;
    }

    state.expression += value;
    updateDisplay();
  }

  function clearAll() {
    state.expression = '';
    state.result = '0';
    state.hasError = false;
    state.justCalculated = false;
    updateDisplay();
  }

  function backspace() {
    if (state.hasError || state.justCalculated) {
      clearAll();
      return;
    }

    if (!state.expression || state.expression.length === 0) {
      return;
    }

    // Si termina en llamada a función completa (ej. "sin(", "acos(", "sqrt("), borrar la función entera
    const functionPatterns = [
      /asin\($/, /acos\($/, /atan\($/,
      /sin\($/, /cos\($/, /tan\($/,
      /log\($/, /ln\($/, /exp\($/,
      /sqrt\($/, /√\($/
    ];

    for (const pat of functionPatterns) {
      if (pat.test(state.expression)) {
        state.expression = state.expression.replace(pat, '');
        updateDisplay();
        return;
      }
    }

    // Borrado de un único carácter
    state.expression = state.expression.slice(0, -1);
    updateDisplay();
  }

  function negateCurrent() {
    if (state.hasError) {
      clearAll();
      return;
    }

    if (state.justCalculated) {
      try {
        const negated = window.Calculadora.calculate(`-(${state.result})`, state.angleMode);
        state.result = negated;
        state.expression = negated;
        updateDisplay();
      } catch {
        // En caso de fallo inesperado, no alterar estado
      }
      return;
    }

    if (!state.expression) {
      state.expression = '−';
      updateDisplay();
      return;
    }

    // Envolver toda la expresión entre paréntesis con signo menos si ya tiene contenido
    if (state.expression.startsWith('−(') && state.expression.endsWith(')')) {
      state.expression = state.expression.slice(2, -1);
    } else {
      state.expression = `−(${state.expression})`;
    }
    updateDisplay();
  }

  function insertAns() {
    if (state.lastResult !== null) {
      insertValue(state.lastResult);
    }
  }

  function calculateResult() {
    if (!state.expression || state.expression.trim() === '') {
      return;
    }

    try {
      const calcStr = window.Calculadora.calculate(state.expression, state.angleMode);
      const prevExpr = state.expression;

      state.result = calcStr;
      state.hasError = false;
      state.justCalculated = true;
      state.lastResult = calcStr;

      // Registrar en el historial en memoria
      addHistoryEntry(prevExpr, calcStr, state.angleMode);
      updateDisplay();
    } catch (err) {
      state.hasError = true;
      state.result = err.message || 'Error en la expresión';
      state.justCalculated = false;
      updateDisplay();
    }
  }

  function toggleAngleMode() {
    state.angleMode = state.angleMode === 'DEG' ? 'RAD' : 'DEG';
    updateDisplay();

    // Si hay una expresión válida, recalcular automáticamente para comodidad del usuario
    if (state.expression && !state.hasError) {
      try {
        const recalc = window.Calculadora.calculate(state.expression, state.angleMode);
        state.result = recalc;
        state.hasError = false;
        updateDisplay();
      } catch {
        // Si la expresión está a medio escribir, no forzar error visual
      }
    }
  }

  // ==========================================================================
  // Historial de Operaciones en Memoria
  // ==========================================================================
  function addHistoryEntry(expr, res, mode) {
    state.history.unshift({
      expression: expr,
      result: res,
      angleMode: mode,
      id: Date.now()
    });

    // Mantener un límite razonable en memoria (máximo 40 elementos)
    if (state.history.length > 40) {
      state.history.pop();
    }

    renderHistory();
  }

  function renderHistory() {
    if (state.history.length === 0) {
      elements.historyList.innerHTML = '<p class="history-empty">No hay operaciones registradas</p>';
      return;
    }

    elements.historyList.innerHTML = '';
    state.history.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'history-item';
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.innerHTML = `
        <span class="history-item-expr">${escapeHtml(item.expression)} (${item.angleMode})</span>
        <span class="history-item-res">= ${escapeHtml(item.result)}</span>
      `;

      card.addEventListener('click', () => {
        loadHistoryItem(item);
      });
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          loadHistoryItem(item);
        }
      });

      elements.historyList.appendChild(card);
    });
  }

  function loadHistoryItem(item) {
    state.expression = item.expression;
    state.result = item.result;
    state.angleMode = item.angleMode;
    state.hasError = false;
    state.justCalculated = true;
    updateDisplay();
    toggleHistoryPanel(false);
  }

  function clearHistory() {
    state.history = [];
    renderHistory();
  }

  function toggleHistoryPanel(show) {
    if (show === undefined) {
      elements.historyPanel.hidden = !elements.historyPanel.hidden;
    } else {
      elements.historyPanel.hidden = !show;
    }
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // ==========================================================================
  // Tema Claro / Oscuro
  // ==========================================================================
  function toggleTheme() {
    state.theme = state.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', state.theme);
    elements.themeIcon.textContent = state.theme === 'dark' ? '☀️' : '🌙';
  }

  // ==========================================================================
  // Soporte de Teclado Físico
  // ==========================================================================
  function highlightButton(selector) {
    const btn = document.querySelector(selector);
    if (btn) {
      btn.classList.add('is-pressed');
      setTimeout(() => btn.classList.remove('is-pressed'), 120);
    }
  }

  function handleKeyboardInput(e) {
    // Si el usuario está navegando un elemento enfocado diferente, no interferir
    if (e.target && e.target.tagName === 'INPUT') return;

    const key = e.key;

    // Números 0-9
    if (/^[0-9]$/.test(key)) {
      e.preventDefault();
      insertValue(key);
      highlightButton(`button[data-value="${key}"]`);
      return;
    }

    // Punto o coma decimal
    if (key === '.' || key === ',') {
      e.preventDefault();
      insertValue('.');
      highlightButton('button[data-value="."]');
      return;
    }

    // Operadores básicos
    if (key === '+') {
      e.preventDefault();
      insertValue('+');
      highlightButton('button[data-value="+"]');
      return;
    }
    if (key === '-') {
      e.preventDefault();
      insertValue('−');
      highlightButton('button[data-value="−"]');
      return;
    }
    if (key === '*') {
      e.preventDefault();
      insertValue('×');
      highlightButton('button[data-value="×"]');
      return;
    }
    if (key === '/') {
      e.preventDefault();
      insertValue('÷');
      highlightButton('button[data-value="÷"]');
      return;
    }
    if (key === '^') {
      e.preventDefault();
      insertValue('^');
      highlightButton('button[data-value="^"]');
      return;
    }
    if (key === '%') {
      e.preventDefault();
      insertValue('%');
      highlightButton('button[data-value="%"]');
      return;
    }
    if (key === '!') {
      e.preventDefault();
      insertValue('!');
      highlightButton('button[data-value="!"]');
      return;
    }
    if (key === '(') {
      e.preventDefault();
      insertValue('(');
      highlightButton('button[data-value="("]');
      return;
    }
    if (key === ')') {
      e.preventDefault();
      insertValue(')');
      highlightButton('button[data-value=")"]');
      return;
    }

    // Atajos de constantes y funciones científicas
    if (key === 'p' || key === 'P') {
      e.preventDefault();
      insertValue('π');
      highlightButton('button[data-value="π"]');
      return;
    }
    if (key === 'e' || key === 'E') {
      e.preventDefault();
      insertValue('e');
      highlightButton('button[data-value="e"]');
      return;
    }
    if (key === 's') {
      e.preventDefault();
      insertValue('sin(');
      highlightButton('button[data-value="sin("]');
      return;
    }
    if (key === 'c') {
      e.preventDefault();
      insertValue('cos(');
      highlightButton('button[data-value="cos("]');
      return;
    }
    if (key === 't') {
      e.preventDefault();
      insertValue('tan(');
      highlightButton('button[data-value="tan("]');
      return;
    }
    if (key === 'l') {
      e.preventDefault();
      insertValue('ln(');
      highlightButton('button[data-value="ln("]');
      return;
    }
    if (key === 'L') {
      e.preventDefault();
      insertValue('log(');
      highlightButton('button[data-value="log("]');
      return;
    }
    if (key === 'r' || key === 'R') {
      e.preventDefault();
      insertValue('√(');
      highlightButton('button[data-value="√("]');
      return;
    }

    // Tecla Enter o Igual para calcular
    if (key === 'Enter' || key === '=') {
      e.preventDefault();
      calculateResult();
      highlightButton('.equals-key');
      return;
    }

    // Tecla Backspace para borrar último carácter
    if (key === 'Backspace') {
      e.preventDefault();
      backspace();
      highlightButton('.backspace-key');
      return;
    }

    // Tecla Escape para limpiar pantalla (AC) o cerrar historial si está abierto
    if (key === 'Escape') {
      e.preventDefault();
      if (!elements.historyPanel.hidden) {
        toggleHistoryPanel(false);
      } else {
        clearAll();
        highlightButton('.clear-key');
      }
      return;
    }
  }

  // ==========================================================================
  // Enlace de Eventos (Event Listeners)
  // ==========================================================================
  function initEvents() {
    // Delegación de eventos en el teclado de botones
    elements.keypad.addEventListener('click', (e) => {
      const button = e.target.closest('button.key');
      if (!button) return;

      const action = button.dataset.action;
      const value = button.dataset.value;

      switch (action) {
        case 'insert':
          insertValue(value);
          break;
        case 'clear':
          clearAll();
          break;
        case 'backspace':
          backspace();
          break;
        case 'negate':
          negateCurrent();
          break;
        case 'ans':
          insertAns();
          break;
        case 'calculate':
          calculateResult();
          break;
      }
    });

    // Selector Grados / Radianes
    elements.btnAngleToggle.addEventListener('click', toggleAngleMode);

    // Controles de Historial
    elements.btnToggleHistory.addEventListener('click', () => toggleHistoryPanel());
    elements.btnCloseHistory.addEventListener('click', () => toggleHistoryPanel(false));
    elements.btnClearHistory.addEventListener('click', clearHistory);

    // Selector de Tema
    elements.btnToggleTheme.addEventListener('click', toggleTheme);

    // Teclado físico
    window.addEventListener('keydown', handleKeyboardInput);
  }

  // ==========================================================================
  // Inicialización
  // ==========================================================================
  initEvents();
  updateDisplay();
})();
