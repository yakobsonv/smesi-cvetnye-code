/**
 *  Приём заявок с сайта «Цветные кладочные смеси» (механика — из recke-code).
 *  ⚠️ 09.10.2026: по слову Влада приём ПОКА НЕ ПОДКЛЮЧЁН — переменных окружения у проекта
 *  нет, функция отвечает 503, и форма показывает посетителю телефон офиса.
 *
 *  До 29.09.2026 формы сайта не отправляли НИЧЕГО: у <form> не было action, скрипт
 *  честно писал «заявку примем по телефону». Проверено кликом на выложенной версии
 *  21.09 и повторно 29.09 — ноль POST-запросов. Это прямая потеря обращений, поэтому
 *  приём заведён до того, как клиент назовёт свой адрес.
 *
 *  Куда уходит заявка — задаётся переменными окружения проекта Vercel, в коде адресов нет:
 *    LEAD_TG_TOKEN + LEAD_TG_CHAT   — Telegram (основной канал)
 *    LEAD_WEBHOOK_URL               — любой приёмник (CRM, Make, n8n), POST c JSON
 *  Ни одна не задана → функция отвечает 503, и форма показывает посетителю телефон.
 *  Врать «заявка отправлена», когда она никуда не ушла, нельзя.
 *
 *  Когда Влад даст адрес приёма — задаются только переменные окружения, код не трогаем.
 */

const MAX_BODY = 8 * 1024;

/** Поля, которые показываем человеку в уведомлении, в нужном порядке. */
const LABELS = {
  name: 'Имя',
  phone: 'Телефон',
  email: 'Почта',
  message: 'Сообщение',
  comment: 'Комментарий',
  color: 'Цвет шва',
  series: 'Серия',
  volume: 'Объём',
  product: 'Позиция',
  quantity: 'Количество',
};

const escapeHtml = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Телефон считаем настоящим, когда в нём 11 цифр: +7 и десять знаков. */
const digits = (s) => String(s ?? '').replace(/\D/g, '');

function readBody(req) {
  return new Promise((resolve, reject) => {
    if (req.body !== undefined && req.body !== null) {
      resolve(typeof req.body === 'string' ? req.body : JSON.stringify(req.body));
      return;
    }
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > MAX_BODY) reject(new Error('too-large'));
    });
    req.on('end', () => resolve(raw));
    req.on('error', reject);
  });
}

function parse(raw, contentType = '') {
  if (!raw) return {};
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return Object.fromEntries(new URLSearchParams(raw).entries());
  }
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return Object.fromEntries(new URLSearchParams(raw).entries());
  }
}

function buildMessage(data, meta) {
  const lines = ['🧱 <b>Заявка с сайта цветных кладочных смесей</b>', ''];
  for (const [key, label] of Object.entries(LABELS)) {
    const value = data[key];
    if (value !== undefined && String(value).trim()) {
      lines.push(`<b>${label}:</b> ${escapeHtml(String(value).trim())}`);
    }
  }
  // Остальные поля формы, если их добавят позже, не теряем.
  const known = new Set([...Object.keys(LABELS), 'consent', 'company', 'source']);
  for (const [key, value] of Object.entries(data)) {
    if (known.has(key) || !String(value ?? '').trim()) continue;
    lines.push(`<b>${escapeHtml(key)}:</b> ${escapeHtml(String(value).trim())}`);
  }
  lines.push('');
  if (data.source) lines.push(`<i>место на сайте:</i> ${escapeHtml(String(data.source))}`);
  if (meta.page) lines.push(`<i>страница:</i> ${escapeHtml(meta.page)}`);
  lines.push(`<i>время:</i> ${meta.time}`);
  return lines.join('\n');
}

async function toTelegram(text) {
  const token = process.env.LEAD_TG_TOKEN;
  const chat = process.env.LEAD_TG_CHAT;
  if (!token || !chat) return null;
  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      chat_id: chat,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok || !result.ok) {
    throw new Error(`telegram ${response.status} ${result.description ?? ''}`.trim());
  }
  return result.result?.message_id ?? true;
}

async function toWebhook(payload) {
  const url = process.env.LEAD_WEBHOOK_URL;
  if (!url) return null;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!response.ok) throw new Error(`webhook ${response.status}`);
  return true;
}

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ ok: false, error: 'method' });
  }

  let data;
  try {
    data = parse(await readBody(req), req.headers['content-type'] ?? '');
  } catch {
    return res.status(413).json({ ok: false, error: 'body' });
  }

  // Ловушка для ботов: поле скрыто от людей, заполнено — значит робот.
  // Отвечаем 200, чтобы робот не искал обход, но никуда не шлём.
  if (String(data.company ?? '').trim()) return res.status(200).json({ ok: true });

  if (digits(data.phone).length < 11) {
    return res.status(400).json({ ok: false, error: 'phone' });
  }
  // Согласие на обработку ПДн — обязательное поле формы (152-ФЗ).
  const consent = data.consent;
  if (!(consent === true || consent === 'on' || consent === 'true' || consent === '1')) {
    return res.status(400).json({ ok: false, error: 'consent' });
  }

  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Europe/Moscow' }) + ' МСК';
  const meta = { time, page: req.headers.referer ?? '' };
  const text = buildMessage(data, meta);

  // Копия в журнал Vercel — заявка остаётся видимой, даже если канал доставки отказал.
  console.log('LEAD', JSON.stringify({ ...data, consent: undefined, _time: time, _page: meta.page }));

  const results = await Promise.allSettled([
    toTelegram(text),
    toWebhook({ ...data, _time: time, _page: meta.page }),
  ]);

  const configured = results.filter((r) => r.status === 'rejected' || r.value !== null);
  const delivered = results.filter((r) => r.status === 'fulfilled' && r.value !== null);
  const failed = results.filter((r) => r.status === 'rejected');
  failed.forEach((r) => console.error('LEAD DELIVERY FAILED', r.reason?.message ?? r.reason));

  if (configured.length === 0) {
    // Приёмник не настроен. Не делаем вид, что заявка ушла.
    console.error('LEAD NO DESTINATION — задайте LEAD_TG_TOKEN/LEAD_TG_CHAT или LEAD_WEBHOOK_URL');
    return res.status(503).json({ ok: false, error: 'no-destination' });
  }
  if (delivered.length === 0) return res.status(502).json({ ok: false, error: 'delivery' });

  return res.status(200).json({ ok: true });
}
