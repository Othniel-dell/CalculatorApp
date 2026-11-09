export type AngleMode = 'DEG' | 'RAD';

type Token = number | string;

function tokenize(source: string): Token[] {
  const expression = source
    .replace(/[×·]/g, '*')
    .replace(/[÷]/g, '/')
    .replace(/[−]/g, '-')
    .replace(/π/g, 'pi');
  const tokens: Token[] = [];
  let index = 0;

  while (index < expression.length) {
    const character = expression[index];
    if (/\s/.test(character)) {
      index += 1;
      continue;
    }

    const numberMatch = expression.slice(index).match(/^(?:\d+\.?\d*|\.\d+)(?:e[+-]?\d+)?/i);
    if (numberMatch) {
      tokens.push(Number(numberMatch[0]));
      index += numberMatch[0].length;
      continue;
    }

    const identifierMatch = expression.slice(index).match(/^[a-z]+/i);
    if (identifierMatch) {
      tokens.push(identifierMatch[0].toLowerCase());
      index += identifierMatch[0].length;
      continue;
    }

    if ('+-*/^()%!'.includes(character)) {
      tokens.push(character);
      index += 1;
      continue;
    }

    throw new Error(`Unsupported character: ${character}`);
  }

  return tokens;
}

export function evaluateExpression(source: string, angleMode: AngleMode = 'DEG'): number {
  const tokens = tokenize(source);
  let position = 0;
  const peek = () => tokens[position];
  const consume = () => tokens[position++];
  const toRadians = (value: number) => angleMode === 'DEG' ? (value * Math.PI) / 180 : value;

  function parsePrimary(): number {
    const token = consume();
    if (typeof token === 'number') return token;

    if (token === '(') {
      const value = parseExpression();
      if (consume() !== ')') throw new Error('Missing closing parenthesis');
      return value;
    }

    if (token === 'pi') return Math.PI;
    if (token === 'e') return Math.E;

    if (typeof token === 'string' && ['sin', 'cos', 'tan', 'sqrt', 'ln', 'log', 'abs'].includes(token)) {
      const value = parseUnary();
      switch (token) {
        case 'sin': return Math.sin(toRadians(value));
        case 'cos': return Math.cos(toRadians(value));
        case 'tan': return Math.tan(toRadians(value));
        case 'sqrt': return Math.sqrt(value);
        case 'ln': return Math.log(value);
        case 'log': return Math.log10(value);
        default: return Math.abs(value);
      }
    }

    throw new Error('Invalid expression');
  }

  function parsePostfix(): number {
    let value = parsePrimary();
    while (peek() === '%' || peek() === '!') {
      const operator = consume();
      if (operator === '%') {
        value /= 100;
      } else {
        if (!Number.isInteger(value) || value < 0 || value > 170) {
          throw new Error('Factorial requires a whole number from 0 to 170');
        }
        let factorial = 1;
        for (let factor = 2; factor <= value; factor += 1) factorial *= factor;
        value = factorial;
      }
    }
    return value;
  }

  function parsePower(): number {
    const base = parsePostfix();
    if (peek() === '^') {
      consume();
      return base ** parseUnary();
    }
    return base;
  }

  function parseUnary(): number {
    if (peek() === '+') {
      consume();
      return parseUnary();
    }
    if (peek() === '-') {
      consume();
      return -parseUnary();
    }
    return parsePower();
  }

  function parseTerm(): number {
    let value = parseUnary();
    while (peek() === '*' || peek() === '/') {
      const operator = consume();
      const right = parseUnary();
      value = operator === '*' ? value * right : value / right;
    }
    return value;
  }

  function parseExpression(): number {
    let value = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const operator = consume();
      const right = parseTerm();
      value = operator === '+' ? value + right : value - right;
    }
    return value;
  }

  if (tokens.length === 0) throw new Error('Enter an expression');
  const result = parseExpression();
  if (position !== tokens.length) throw new Error('Check the expression');
  if (!Number.isFinite(result)) throw new Error('Result is not a finite number');
  return result;
}

export function formatResult(value: number): string {
  if (Object.is(value, -0)) return '0';
  return Number(value.toPrecision(12)).toString();
}
