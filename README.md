# Calculadora Científica

Una calculadora científica moderna desarrollada con **HTML5, CSS3 y JavaScript puro (Vanilla JS)**, sin librerías externas ni dependencias. Implementa un motor matemático propio con **tokenizador y parser por descenso recursivo**, prescindiendo completamente de funciones inseguras como `eval()` o `new Function()`.

![Calculadora científica](docs/captura.png)
*Vista de la calculadora en modo grados con cálculo de sin(90) e historial de operaciones activo.*

> 🌐 **Demo en vivo:** [https://uri46.github.io/calculadora-cientifica/](https://uri46.github.io/calculadora-cientifica/)

---

## 🚀 Funcionalidades

- **Operaciones Aritméticas Básicas:** Suma (`+`), resta (`−`), multiplicación (`×`), división (`÷`).
- **Operaciones Avanzadas:**
  - Potenciación (`^`) con asociatividad a derecha (`2^3^2 = 512`).
  - Raíz cuadrada (`√` o `sqrt`).
  - Factorial (`!`) para enteros no negativos (`0! = 1`, `5! = 120`).
  - Porcentaje (`%`) como operador postfijo (`200 * 15% = 30`).
  - Signo negativo unario respetando jerarquía matemática (`-2^2 = -4`, `(-2)^2 = 4`).
- **Funciones Científicas y Trigonométricas:**
  - `sin`, `cos`, `tan`
  - Funciones inversas: `sin⁻¹` (`asin`), `cos⁻¹` (`acos`), `tan⁻¹` (`atan`)
  - Logaritmo en base 10 (`log`), logaritmo natural (`ln`) y exponencial (`exp` o $e^x$)
- **Constantes Matemáticas:**
  - $\pi$ (`Math.PI`) y $e$ (`Math.E`).
  - Soporte de multiplicación implícita (`2pi`, `2(3+4)`, `(2)(3)`).
- **Selector de Modo Angular:** Alternancia entre **Grados (DEG)** y **Radianes (RAD)** con normalización exacta en ángulos notables (ej. `sin(180°) = 0`, `cos(90°) = 0`).
- **Control de Precisión Numérica:** Manejo de artefactos binarios de punto flotante IEEE 754 (ej. `0.1 + 0.2` muestra exactamente `0.3`) y conversión automática a notación científica para valores extremos.
- **Manejo Robusto de Errores:** Mensajes claros ante división por cero, dominio inválido (`sqrt(-1)`, `log(0)`, `tan(90°)` en grados, `asin(2)`), desbordamiento y expresiones incompletas, sin bloquear ni romper la interfaz.
- **Historial de Operaciones:** Registro en memoria de los cálculos recientes con carga directa al hacer clic (sin almacenamiento local persistente).
- **Soporte Completo para Teclado Físico:** Entrada numérica, operadores, `Enter` / `=` para calcular, `Backspace` para borrar carácter o función, y `Escape` para limpiar (`AC`).
- **Diseño Responsive & Accesible:** Interfaz adaptable a celulares y computadoras de escritorio, con selector de tema Claro / Oscuro.

---

## 🧠 Cómo funciona: Tokenizador y Parser

Para procesar fórmulas matemáticas sin recurrir a `eval()` (lo cual representa una mala práctica y un riesgo de seguridad), el motor se divide en dos fases bien definidas: **tokenización** y **análisis sintáctico (parsing)**.

### 1. El Tokenizador (Análisis Léxico)
El tokenizador lee la cadena de texto carácter por carácter y la divide en unidades significativas llamadas **tokens**.

Por ejemplo, ante la expresión `sin(30) + 2 * 4`:
1. Identifica que `sin` es una función matemática.
2. Reconoce `(` y `)` como delimitadores de agrupación.
3. Detecta `30`, `2` y `4` como valores numéricos.
4. Identifica `+` y `*` como operadores aritméticos.
5. Inserta **multiplicación implícita** cuando corresponde (convirtiendo por ejemplo `2pi` en `2 * pi` o `2(3)` en `2 * (3)`).

El resultado es un arreglo ordenado de tokens listos para ser interpretados.

### 2. El Parser por Descenso Recursivo (Análisis Sintáctico y Evaluación)
Una vez obtenidos los tokens, se aplica un algoritmo de **descenso recursivo**. 

En lugar de evaluar de izquierda a derecha sin criterio, el parser sigue una gramática formal estructurada en niveles de precedencia, donde cada nivel tiene una función correspondiente en el código:

1. **Expresiones Aditivas (`parseAdditive`):** Maneja la suma (`+`) y la resta (`-`), que tienen la menor precedencia.
2. **Expresiones Multiplicativas (`parseMultiplicative`):** Maneja la multiplicación (`*`) y la división (`/`).
3. **Operadores Unarios Prefijo (`parseUnaryPrefix`):** Resuelve signos negativos o positivos (`-x`, `+x`). Al ubicarse debajo de la multiplicación pero antes de la potencia, garantiza que `-2^2` se interprete como `-(2^2) = -4`, tal como dictan las matemáticas formales.
4. **Potenciación (`parsePower`):** Resuelve el operador `^` de manera **asociativa a derecha** (`a^b^c = a^(b^c)`).
5. **Operadores Postfijos (`parsePostfix`):** Evalúa el factorial (`!`) y el porcentaje (`%`).
6. **Valores Primarios (`parsePrimary`):** Resuelve números, constantes ($\pi$, $e$), llamadas a funciones (`sin(...)`, `sqrt(...)`) o subexpresiones entre paréntesis (`(...)`).

Gracias a esta jerarquía, los paréntesis y las funciones se resuelven primero, seguidos de potencias, multiplicaciones y finalmente sumas, garantizando un resultado matemáticamente exacto.

---

## 💻 Cómo ejecutarla localmente

Al tratarse de una aplicación web estática pura, no requiere compiladores ni empaquetadores:

1. Clonar el repositorio o descargar los archivos:
   ```bash
   git clone https://github.com/Uri46/calculadora-cientifica.git
   cd calculadora-cientifica
   ```

2. Abrir el archivo `index.html` directamente en tu navegador preferido:
   - Haciendo doble clic sobre `index.html`.
   - O usando cualquier servidor local (por ejemplo `npx serve .` o la extensión Live Server de VS Code).

---

## 🧪 Pruebas Automatizadas

El proyecto incluye una suite de pruebas automatizadas construida sobre el módulo nativo `node:test` de Node.js (sin librerías externas).

### Ejecución de los tests:
```bash
npm test
```

### Cobertura verificada (52 pruebas unitarias reales):
- **Precedencia de operadores:** Sumas, restas, productos, divisiones, potencias y exponentes unarios.
- **Paréntesis y agrupación:** Expresiones complejas anidadas y multiplicación implícita.
- **Precisión de punto flotante:** Normalización de `0.1 + 0.2 = 0.3` y notación exponencial.
- **Potencias, raíces y factoriales:** Casos base, factoriales de borde (`0!`, `1!`) y porcentajes.
- **Constantes y funciones logarítmicas:** $\pi$, $e$, `log`, `ln`, `exp`.
- **Trigonometría (DEG vs RAD):** Identidades trigonométricas notables (`sin(90°) = 1`, `sin(180°) = 0`, `cos(90°) = 0`, `tan(45°) = 1`), inversas (`asin`, `acos`, `atan`) y radianes.
- **Manejo de errores:** División por cero, raíces de negativos, argumentos no válidos en logaritmos y funciones trigonométricas, overflow en factorial y validación de sintaxis.

---

## 📁 Estructura del Proyecto

```text
calculadora-cientifica/
├── index.html              # Estructura semántica de la calculadora
├── styles.css              # Estilos responsive, diseño visual y temas claro/oscuro
├── calculadora.js          # Módulo de lógica pura: tokenizador, parser y formateador
├── interfaz.js             # Controlador de interfaz: eventos del DOM, teclado e historial
├── test/
│   └── calculadora.test.js # Suite de pruebas nativa (node:test)
├── package.json            # Configuración mínima con script "test"
├── .gitignore              # Exclusiones de control de versiones
└── README.md               # Documentación del proyecto
```
