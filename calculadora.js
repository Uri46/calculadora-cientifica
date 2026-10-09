/**
 * Calculadora Científica - Módulo de Lógica Pura
 * Implementación de Tokenizador y Parser por Descenso Recursivo.
 * Sin uso de eval() ni new Function().
 */

const TOKENS = {
  NUMBER: 'NUMBER',
  CONSTANT: 'CONSTANT',
  FUNCTION: 'FUNCTION',
  OPERATOR: 'OPERATOR',
  POSTFIX: 'POSTFIX',
  LPAREN: 'LPAREN',
  RPAREN: 'RPAREN',
  EOF: 'EOF'
};

const CONSTANTS = {
  pi: Math.PI,
  π: Math.PI,
  e: Math.E
};

const FUNCTIONS = new Set([
  'sin',
  'cos',
  'tan',
  'asin',
  'acos',
  'atan',
  'log',
  'ln',
  'exp',
  'sqrt'
]);

function degToRad(deg) {
  return (deg * Math.PI) / 180;
}

function radToDeg(rad) {
  return (rad * 180) / Math.PI;
}

// Normalización angular exacta para evitar imprecisiones de coma flotante en grados notables
function sinDeg(deg) {
  const norm = ((deg % 360) + 360) % 360;
  if (norm === 0 || norm === 180) return 0;
  if (norm === 90) return 1;
  if (norm === 270) return -1;
  return Math.sin(degToRad(deg));
}

function cosDeg(deg) {
  const norm = ((deg % 360) + 360) % 360;
  if (norm === 90 || norm === 270) return 0;
  if (norm === 0) return 1;
  if (norm === 180) return -1;
  return Math.cos(degToRad(deg));
}

function tanDeg(deg) {
  const norm = ((deg % 360) + 360) % 360;
  if (norm === 90 || norm === 270) {
    throw new Error('Error: Dominio inválido (tangente indefinida)');
  }
  if (norm === 0 || norm === 180) return 0;
  if (norm === 45 || norm === 225) return 1;
  if (norm === 135 || norm === 315) return -1;
  return Math.tan(degToRad(deg));
}

function factorial(n) {
  if (n < 0 || !Number.isInteger(n)) {
    throw new Error('Error: Dominio inválido (factorial requiere entero no negativo)');
  }
  // En números IEEE 754 de doble precisión, factorial > 170 desborda a Infinity
  if (n > 170) {
    throw new Error('Error: Desbordamiento (número demasiado grande)');
  }
  if (n === 0 || n === 1) return 1;
  let res = 1;
  for (let i = 2; i <= n; i++) {
    res *= i;
  }
  return res;
}

// Elimina imprecisiones típicas de punto flotante binario (ej. 0.1 + 0.2 = 0.3)
function formatResult(value, precision = 12) {
  if (typeof value !== 'number' || isNaN(value)) {
    throw new Error('Error: Resultado indefinido');
  }
  if (!isFinite(value)) {
    throw new Error('Error: Desbordamiento (número fuera de rango)');
  }
  if (Object.is(value, -0) || Math.abs(value) < 1e-15) {
    return '0';
  }

  const rounded = parseFloat(value.toPrecision(precision));
  if (Math.abs(rounded) < 1e14 && Math.abs(rounded) >= 1e-7) {
    return rounded.toString();
  }
  return rounded.toExponential().replace('e+', 'e');
}

function tokenize(input) {
  if (typeof input !== 'string') {
    throw new Error('Error: Expresión inválida');
  }

  const rawTokens = [];
  let i = 0;
  const str = input.trim();

  if (str.length === 0) {
    throw new Error('Error: Expresión vacía');
  }

  while (i < str.length) {
    const ch = str[i];

    if (/\s/.test(ch)) {
      i++;
      continue;
    }

    // Números enteros, decimales y notación científica opcional
    if (/\d/.test(ch) || (ch === '.' && i + 1 < str.length && /\d/.test(str[i + 1]))) {
      let numStr = '';
      while (i < str.length && /[\d.]/.test(str[i])) {
        if (str[i] === '.' && numStr.includes('.')) {
          throw new Error('Error: Número con múltiples puntos decimales');
        }
        numStr += str[i];
        i++;
      }

      // Soporte para notación científica solo si 'e' está seguido por signo/dígitos
      if (i < str.length && (str[i] === 'e' || str[i] === 'E')) {
        let peek = i + 1;
        if (peek < str.length && (str[peek] === '+' || str[peek] === '-')) {
          peek++;
        }
        if (peek < str.length && /\d/.test(str[peek])) {
          numStr += str[i];
          i++;
          if (str[i] === '+' || str[i] === '-') {
            numStr += str[i];
            i++;
          }
          while (i < str.length && /\d/.test(str[i])) {
            numStr += str[i];
            i++;
          }
        }
      }

      rawTokens.push({ type: TOKENS.NUMBER, value: parseFloat(numStr), raw: numStr });
      continue;
    }

    // Identificadores alfabéticos: constantes (pi, e) y funciones matemáticas
    if (/[a-zA-Zπ]/.test(ch)) {
      let idStr = '';
      while (i < str.length && /[a-zA-Zπ0-9_]/.test(str[i])) {
        idStr += str[i];
        i++;
      }
      const lower = idStr.toLowerCase();
      if (lower === 'pi' || idStr === 'π') {
        rawTokens.push({ type: TOKENS.CONSTANT, value: Math.PI, name: 'π' });
      } else if (lower === 'e') {
        rawTokens.push({ type: TOKENS.CONSTANT, value: Math.E, name: 'e' });
      } else if (FUNCTIONS.has(lower)) {
        rawTokens.push({ type: TOKENS.FUNCTION, name: lower });
      } else {
        throw new Error(`Error: Identificador no reconocido '${idStr}'`);
      }
      continue;
    }

    if (ch === '√') {
      rawTokens.push({ type: TOKENS.FUNCTION, name: 'sqrt' });
      i++;
      continue;
    }

    if (ch === '×') {
      rawTokens.push({ type: TOKENS.OPERATOR, value: '*' });
      i++;
      continue;
    }

    if (ch === '÷') {
      rawTokens.push({ type: TOKENS.OPERATOR, value: '/' });
      i++;
      continue;
    }

    if (ch === '−') {
      rawTokens.push({ type: TOKENS.OPERATOR, value: '-' });
      i++;
      continue;
    }

    if (ch === '+' || ch === '-' || ch === '*' || ch === '/' || ch === '^') {
      rawTokens.push({ type: TOKENS.OPERATOR, value: ch });
      i++;
      continue;
    }

    if (ch === '!' || ch === '%') {
      rawTokens.push({ type: TOKENS.POSTFIX, value: ch });
      i++;
      continue;
    }

    if (ch === '(') {
      rawTokens.push({ type: TOKENS.LPAREN, value: '(' });
      i++;
      continue;
    }

    if (ch === ')') {
      rawTokens.push({ type: TOKENS.RPAREN, value: ')' });
      i++;
      continue;
    }

    throw new Error(`Error: Carácter no reconocido '${ch}'`);
  }

  // Inserción de multiplicación implícita (ej. 2pi -> 2*pi, 2(3) -> 2*(3), (2)(3) -> (2)*(3))
  const tokens = [];
  for (let j = 0; j < rawTokens.length; j++) {
    const curr = rawTokens[j];
    tokens.push(curr);

    if (j < rawTokens.length - 1) {
      const next = rawTokens[j + 1];
      const canPrev =
        curr.type === TOKENS.NUMBER ||
        curr.type === TOKENS.CONSTANT ||
        curr.type === TOKENS.RPAREN ||
        curr.type === TOKENS.POSTFIX;

      const canNext =
        next.type === TOKENS.NUMBER ||
        next.type === TOKENS.CONSTANT ||
        next.type === TOKENS.FUNCTION ||
        next.type === TOKENS.LPAREN;

      if (canPrev && canNext) {
        tokens.push({ type: TOKENS.OPERATOR, value: '*' });
      }
    }
  }

  tokens.push({ type: TOKENS.EOF });
  return tokens;
}

class Parser {
  constructor(tokens, angleMode = 'DEG') {
    this.tokens = tokens;
    this.pos = 0;
    this.angleMode = angleMode.toUpperCase();
  }

  peek() {
    return this.tokens[this.pos];
  }

  consume() {
    return this.tokens[this.pos++];
  }

  match(type, value) {
    const token = this.peek();
    if (!token) return false;
    if (type && token.type !== type) return false;
    if (value !== undefined && token.value !== value) return false;
    this.consume();
    return true;
  }

  parse() {
    const res = this.parseExpression();
    if (this.peek().type !== TOKENS.EOF) {
      if (this.peek().type === TOKENS.RPAREN) {
        throw new Error('Error: Paréntesis desbalanceados (cierre sobrante)');
      }
      throw new Error(`Error: Token inesperado '${this.peek().raw || this.peek().value || this.peek().name}'`);
    }
    return res;
  }

  parseExpression() {
    return this.parseAdditive();
  }

  parseAdditive() {
    let left = this.parseMultiplicative();

    while (this.peek().type === TOKENS.OPERATOR && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value;
      const right = this.parseMultiplicative();
      if (op === '+') {
        left = left + right;
      } else {
        left = left - right;
      }
    }

    return left;
  }

  parseMultiplicative() {
    let left = this.parseUnaryPrefix();

    while (this.peek().type === TOKENS.OPERATOR && (this.peek().value === '*' || this.peek().value === '/')) {
      const op = this.consume().value;
      const right = this.parseUnaryPrefix();
      if (op === '*') {
        left = left * right;
      } else {
        if (right === 0) {
          throw new Error('Error: División por cero');
        }
        left = left / right;
      }
    }

    return left;
  }

  // Los operadores unarios prefijo (+, -) tienen menor precedencia que la potencia para respetar -2^2 = -4
  parseUnaryPrefix() {
    if (this.peek().type === TOKENS.OPERATOR && (this.peek().value === '+' || this.peek().value === '-')) {
      const op = this.consume().value;
      const operand = this.parseUnaryPrefix();
      return op === '-' ? -operand : operand;
    }

    return this.parsePower();
  }

  // La potencia es asociativa a derecha (ej. 2^3^2 = 2^(3^2) = 512)
  parsePower() {
    let left = this.parsePostfix();

    if (this.peek().type === TOKENS.OPERATOR && this.peek().value === '^') {
      this.consume();
      const right = this.parseUnaryPrefix();
      if (left === 0 && right < 0) {
        throw new Error('Error: División por cero');
      }
      if (left < 0 && !Number.isInteger(right)) {
        throw new Error('Error: Dominio inválido (base negativa con exponente no entero)');
      }
      const res = Math.pow(left, right);
      if (!isFinite(res)) {
        throw new Error('Error: Desbordamiento (número demasiado grande)');
      }
      return res;
    }

    return left;
  }

  // Operadores postfijos: factorial (!) y porcentaje (%)
  parsePostfix() {
    let val = this.parsePrimary();

    while (this.peek().type === TOKENS.POSTFIX) {
      const op = this.consume().value;
      if (op === '!') {
        val = factorial(val);
      } else if (op === '%') {
        val = val / 100;
      }
    }

    return val;
  }

  parsePrimary() {
    const token = this.peek();

    if (token.type === TOKENS.NUMBER) {
      this.consume();
      return token.value;
    }

    if (token.type === TOKENS.CONSTANT) {
      this.consume();
      return token.value;
    }

    if (token.type === TOKENS.LPAREN) {
      this.consume();
      const val = this.parseExpression();
      if (!this.match(TOKENS.RPAREN)) {
        throw new Error('Error: Paréntesis desbalanceados (falta cerrar paréntesis)');
      }
      return val;
    }

    if (token.type === TOKENS.FUNCTION) {
      const fnName = this.consume().name;
      let arg;
      if (this.match(TOKENS.LPAREN)) {
        arg = this.parseExpression();
        if (!this.match(TOKENS.RPAREN)) {
          throw new Error('Error: Paréntesis desbalanceados en función');
        }
      } else {
        arg = this.parseUnaryPrefix();
      }
      return this.evaluateFunction(fnName, arg);
    }

    if (token.type === TOKENS.EOF) {
      throw new Error('Error: Expresión incompleta');
    }

    throw new Error(`Error: Token inesperado '${token.raw || token.value || token.name}'`);
  }

  evaluateFunction(fn, arg) {
    switch (fn) {
      case 'sin':
        return this.angleMode === 'DEG' ? sinDeg(arg) : Math.sin(arg);
      case 'cos':
        return this.angleMode === 'DEG' ? cosDeg(arg) : Math.cos(arg);
      case 'tan':
        if (this.angleMode === 'DEG') {
          return tanDeg(arg);
        } else {
          if (Math.abs(Math.cos(arg)) < 1e-15) {
            throw new Error('Error: Dominio inválido (tangente indefinida)');
          }
          return Math.tan(arg);
        }
      case 'asin':
        if (arg < -1 || arg > 1) {
          throw new Error('Error: Dominio inválido (asin requiere valor entre -1 y 1)');
        }
        return this.angleMode === 'DEG' ? radToDeg(Math.asin(arg)) : Math.asin(arg);
      case 'acos':
        if (arg < -1 || arg > 1) {
          throw new Error('Error: Dominio inválido (acos requiere valor entre -1 y 1)');
        }
        return this.angleMode === 'DEG' ? radToDeg(Math.acos(arg)) : Math.acos(arg);
      case 'atan':
        return this.angleMode === 'DEG' ? radToDeg(Math.atan(arg)) : Math.atan(arg);
      case 'log':
        if (arg <= 0) {
          throw new Error('Error: Dominio inválido (logaritmo requiere valor positivo)');
        }
        return Math.log10(arg);
      case 'ln':
        if (arg <= 0) {
          throw new Error('Error: Dominio inválido (ln requiere valor positivo)');
        }
        return Math.log(arg);
      case 'exp': {
        const res = Math.exp(arg);
        if (!isFinite(res)) {
          throw new Error('Error: Desbordamiento (número demasiado grande)');
        }
        return res;
      }
      case 'sqrt':
        if (arg < 0) {
          throw new Error('Error: Dominio inválido (raíz cuadrada de número negativo)');
        }
        return Math.sqrt(arg);
      default:
        throw new Error(`Error: Función desconocida '${fn}'`);
    }
  }
}

function evaluate(expr, angleMode = 'DEG') {
  const tokens = tokenize(expr);
  const parser = new Parser(tokens, angleMode);
  return parser.parse();
}

function calculate(expr, angleMode = 'DEG') {
  const val = evaluate(expr, angleMode);
  return formatResult(val);
}

// Compatibilidad dual: CommonJS (Node.js tests) y Navegador (script tag sin bundler)
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    tokenize,
    Parser,
    evaluate,
    calculate,
    formatResult,
    factorial,
    degToRad,
    radToDeg,
    TOKENS,
    CONSTANTS,
    FUNCTIONS
  };
}

if (typeof window !== 'undefined') {
  window.Calculadora = {
    tokenize,
    Parser,
    evaluate,
    calculate,
    formatResult,
    factorial,
    degToRad,
    radToDeg,
    TOKENS,
    CONSTANTS,
    FUNCTIONS
  };
}
