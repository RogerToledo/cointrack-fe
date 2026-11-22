import test from 'node:test';
import assert from 'node:assert/strict';
import { formatBRL } from '../src/currency.ts';
import { decodeJwtPayload } from '../src/jwt.ts';
import {
  formatDateBR,
  formatMonthLabel,
  getCurrentMonth,
  parseYearMonth,
  shiftMonth,
} from '../src/date.ts';
import { extractErrorMessage } from '../src/errorMessage.ts';

test('formatBRL formats positive, negative, zero and nullish values', () => {
  assert.match(formatBRL(1234.5), /R\$\s*1\.234,50/);
  assert.match(formatBRL(-42.1), /-R\$\s*42,10/);
  assert.equal(formatBRL(null), 'R$ 0,00');
  assert.equal(formatBRL(undefined), 'R$ 0,00');
  assert.equal(formatBRL(NaN), 'R$ 0,00');
});

test('decodeJwtPayload decodes Base64URL and UTF-8 Portuguese names safely', () => {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const payloadObj = { user_id: 'u-1', name: 'João Conceição', email: 'joao@example.com' };
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64url');
  const token = `${header}.${payload}.signature`;

  const decoded = decodeJwtPayload(token);
  assert.equal(decoded.user_id, 'u-1');
  assert.equal(decoded.name, 'João Conceição');
  assert.equal(decoded.email, 'joao@example.com');
});

test('decodeJwtPayload throws on malformed token', () => {
  assert.throws(() => decodeJwtPayload('invalid-token'), /inválido/i);
});

test('date helpers parse, shift and format year-month strings', () => {
  assert.equal(getCurrentMonth(new Date(2026, 8, 15)), '2026-09');
  assert.deepEqual(parseYearMonth('2026-09'), [2026, 9]);
  assert.deepEqual(parseYearMonth(''), [undefined, undefined]);
  assert.equal(shiftMonth('2026-01', -1), '2025-12');
  assert.equal(shiftMonth('2026-12', 1), '2027-01');
  assert.equal(formatMonthLabel('2026-03'), 'Março 2026');
  assert.equal(formatDateBR('2026-09-05T00:00:00.000Z'), '05/09/2026');
  assert.equal(formatDateBR(null), '-');
});

test('extractErrorMessage extracts API messages, network errors and HTML fallbacks', () => {
  assert.equal(
    extractErrorMessage({
      isAxiosError: true,
      response: { status: 400, data: { message: 'Dados inválidos' } },
    }),
    'Dados inválidos'
  );

  assert.equal(
    extractErrorMessage({
      isAxiosError: true,
      code: 'ERR_NETWORK',
    }),
    'Não foi possível conectar à API. Verifique se o backend está no ar.'
  );

  assert.equal(
    extractErrorMessage({
      isAxiosError: true,
      response: { status: 502, data: '<html><body>502 Bad Gateway</body></html>' },
    }),
    'O servidor retornou uma página de erro em vez de JSON. Verifique o status da API.'
  );

  assert.equal(extractErrorMessage(new Error('Falha local')), 'Falha local');
  assert.equal(extractErrorMessage(null, 'Fallback'), 'Fallback');
});
