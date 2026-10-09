const { test, describe } = require('node:test');
const assert = require('node:assert');
const {
  evaluate,
  calculate,
  formatResult,
  factorial,
  tokenize
} = require('../calculadora.js');

describe('Pruebas de la Calculadora Científica', () => {

  describe('1. Operaciones básicas y precedencia de operadores', () => {
    test('Suma y multiplicación: 2 + 3 * 4 debe dar 14', () => {
      assert.strictEqual(evaluate('2 + 3 * 4'), 14);
      assert.strictEqual(calculate('2 + 3 * 4'), '14');
    });

    test('Multiplicación y suma: 3 * 4 + 2 debe dar 14', () => {
      assert.strictEqual(evaluate('3 * 4 + 2'), 14);
    });

    test('Resta y división: 10 - 4 / 2 debe dar 8', () => {
      assert.strictEqual(evaluate('10 - 4 / 2'), 8);
    });

    test('Potencia y multiplicación: 4 * 2^3 debe dar 32', () => {
      assert.strictEqual(evaluate('4 * 2^3'), 32);
    });

    test('Asociatividad a derecha en potencia: 2^3^2 debe dar 512 (2^9)', () => {
      assert.strictEqual(evaluate('2^3^2'), 512);
    });

    test('Signo unario con potencia: -2^2 debe dar -4', () => {
      assert.strictEqual(evaluate('-2^2'), -4);
    });

    test('Exponente negativo: 2^-2 debe dar 0.25', () => {
      assert.strictEqual(evaluate('2^-2'), 0.25);
    });
  });

  describe('2. Paréntesis y agrupación', () => {
    test('Paréntesis que alteran precedencia: (2 + 3) * 4 debe dar 20', () => {
      assert.strictEqual(evaluate('(2 + 3) * 4'), 20);
      assert.strictEqual(calculate('(2 + 3) * 4'), '20');
    });

    test('Paréntesis con signo negativo: (-2)^2 debe dar 4', () => {
      assert.strictEqual(evaluate('(-2)^2'), 4);
    });

    test('Paréntesis anidados: ((2 + 3) * (4 + 1)) debe dar 25', () => {
      assert.strictEqual(evaluate('((2 + 3) * (4 + 1))'), 25);
    });

    test('Expresión con múltiples niveles: 2 * (3 + (4 * 2)) debe dar 22', () => {
      assert.strictEqual(evaluate('2 * (3 + (4 * 2))'), 22);
    });

    test('Multiplicación implícita con paréntesis: 2(3 + 4) debe dar 14', () => {
      assert.strictEqual(evaluate('2(3 + 4)'), 14);
    });

    test('Multiplicación implícita entre paréntesis: (2)(3) debe dar 6', () => {
      assert.strictEqual(evaluate('(2)(3)'), 6);
    });
  });

  describe('3. Precisión de punto flotante y formato', () => {
    test('Control de precisión: 0.1 + 0.2 debe formatearse a "0.3"', () => {
      assert.strictEqual(calculate('0.1 + 0.2'), '0.3');
    });

    test('Resta flotante: 0.7 - 0.2 debe dar 0.5', () => {
      assert.strictEqual(calculate('0.7 - 0.2'), '0.5');
    });

    test('Multiplicación flotante: 0.2 * 0.1 debe dar 0.02', () => {
      assert.strictEqual(calculate('0.2 * 0.1'), '0.02');
    });

    test('Formato de números enteros: 1024 debe formatearse como "1024"', () => {
      assert.strictEqual(calculate('2^10'), '1024');
    });

    test('Formato de números muy grandes a notación científica', () => {
      assert.strictEqual(calculate('10^15'), '1e15');
    });
  });

  describe('4. Raíz cuadrada, potencia y factorial', () => {
    test('Potencia básica: 2^10 debe dar 1024', () => {
      assert.strictEqual(evaluate('2^10'), 1024);
    });

    test('Raíz cuadrada exacta: sqrt(16) debe dar 4', () => {
      assert.strictEqual(evaluate('sqrt(16)'), 4);
      assert.strictEqual(calculate('sqrt(16)'), '4');
    });

    test('Raíz de cero: sqrt(0) debe dar 0', () => {
      assert.strictEqual(evaluate('sqrt(0)'), 0);
    });

    test('Factorial básico: 5! debe dar 120', () => {
      assert.strictEqual(evaluate('5!'), 120);
      assert.strictEqual(calculate('5!'), '120');
    });

    test('Factoriales de borde: 0! = 1 y 1! = 1', () => {
      assert.strictEqual(evaluate('0!'), 1);
      assert.strictEqual(evaluate('1!'), 1);
    });

    test('Factorial combinado con suma: 3! + 4! debe dar 30', () => {
      assert.strictEqual(evaluate('3! + 4!'), 30);
    });

    test('Operador de porcentaje: 50% debe dar 0.5', () => {
      assert.strictEqual(evaluate('50%'), 0.5);
    });

    test('Porcentaje en producto: 200 * 15% debe dar 30', () => {
      assert.strictEqual(evaluate('200 * 15%'), 30);
    });
  });

  describe('5. Constantes y funciones exponenciales/logarítmicas', () => {
    test('Constante π y multiplicación implícita: 2pi debe ser 2 * Math.PI', () => {
      assert.strictEqual(evaluate('2pi'), 2 * Math.PI);
    });

    test('Constante e y función exp: exp(1) debe coincidir con e', () => {
      assert.strictEqual(evaluate('exp(1)'), Math.E);
    });

    test('Logaritmo en base 10: log(100) debe dar 2', () => {
      assert.strictEqual(evaluate('log(100)'), 2);
      assert.strictEqual(evaluate('log(10)'), 1);
      assert.strictEqual(evaluate('log(1)'), 0);
    });

    test('Logaritmo natural: ln(e) debe dar 1', () => {
      assert.strictEqual(evaluate('ln(e)'), 1);
      assert.strictEqual(evaluate('ln(1)'), 0);
    });

    test('Exponencial con base e: exp(0) debe dar 1', () => {
      assert.strictEqual(evaluate('exp(0)'), 1);
    });
  });

  describe('6. Trigonometría en Grados (DEG) y Radianes (RAD)', () => {
    test('sin(90) en grados debe dar 1', () => {
      assert.strictEqual(evaluate('sin(90)', 'DEG'), 1);
      assert.strictEqual(calculate('sin(90)', 'DEG'), '1');
    });

    test('Valores exactos en grados: sin(180) y cos(90) deben dar 0', () => {
      assert.strictEqual(evaluate('sin(180)', 'DEG'), 0);
      assert.strictEqual(evaluate('cos(90)', 'DEG'), 0);
    });

    test('cos(0) y cos(180) en grados', () => {
      assert.strictEqual(evaluate('cos(0)', 'DEG'), 1);
      assert.strictEqual(evaluate('cos(180)', 'DEG'), -1);
    });

    test('tan(45) en grados debe dar 1', () => {
      assert.strictEqual(evaluate('tan(45)', 'DEG'), 1);
    });

    test('Arcotrigonométricas en DEG: asin(1) = 90, acos(1) = 0, atan(1) = 45', () => {
      assert.strictEqual(evaluate('asin(1)', 'DEG'), 90);
      assert.strictEqual(evaluate('acos(1)', 'DEG'), 0);
      assert.strictEqual(evaluate('atan(1)', 'DEG'), 45);
    });

    test('Trigonometría en RAD: sin(pi / 2) debe dar 1', () => {
      assert.strictEqual(evaluate('sin(pi / 2)', 'RAD'), 1);
    });

    test('cos(pi) en RAD debe dar -1', () => {
      assert.strictEqual(evaluate('cos(pi)', 'RAD'), -1);
    });
  });

  describe('7. Manejo robusto de errores', () => {
    test('División por cero directa: 1 / 0', () => {
      assert.throws(() => evaluate('1 / 0'), /División por cero/);
    });

    test('División por cero calculada: 5 / (2 - 2)', () => {
      assert.throws(() => evaluate('5 / (2 - 2)'), /División por cero/);
    });

    test('Dominio inválido en raíz cuadrada: sqrt(-1)', () => {
      assert.throws(() => evaluate('sqrt(-1)'), /Dominio inválido/);
    });

    test('Dominio inválido en logaritmos: log(0) y log(-5)', () => {
      assert.throws(() => evaluate('log(0)'), /Dominio inválido/);
      assert.throws(() => evaluate('log(-5)'), /Dominio inválido/);
    });

    test('Dominio inválido en ln: ln(0) y ln(-1)', () => {
      assert.throws(() => evaluate('ln(0)'), /Dominio inválido/);
      assert.throws(() => evaluate('ln(-1)'), /Dominio inválido/);
    });

    test('Dominio inválido en tangente indefinida: tan(90) en DEG', () => {
      assert.throws(() => evaluate('tan(90)', 'DEG'), /Dominio inválido/);
    });

    test('Dominio inválido en arcoseno y arcocoseno: asin(2) y acos(-1.5)', () => {
      assert.throws(() => evaluate('asin(2)'), /Dominio inválido/);
      assert.throws(() => evaluate('acos(-1.5)'), /Dominio inválido/);
    });

    test('Factorial con números no enteros o negativos: (-3)! y (2.5)!', () => {
      assert.throws(() => evaluate('(-3)!'), /Dominio inválido/);
      assert.throws(() => evaluate('(2.5)!'), /Dominio inválido/);
    });

    test('Desbordamiento de factorial: 171!', () => {
      assert.throws(() => evaluate('171!'), /Desbordamiento/);
    });

    test('Paréntesis desbalanceados: falta cerrar', () => {
      assert.throws(() => evaluate('(2 + 3'), /Paréntesis desbalanceados/);
    });

    test('Paréntesis desbalanceados: cierre sobrante', () => {
      assert.throws(() => evaluate('2 + 3)'), /Paréntesis desbalanceados/);
    });

    test('Expresión vacía', () => {
      assert.throws(() => evaluate('   '), /Expresión vacía/);
    });

    test('Expresión incompleta: 2 +', () => {
      assert.throws(() => evaluate('2 +'), /Expresión incompleta/);
    });

    test('Carácter no reconocido', () => {
      assert.throws(() => evaluate('2 @ 3'), /Carácter no reconocido/);
    });
  });

});
