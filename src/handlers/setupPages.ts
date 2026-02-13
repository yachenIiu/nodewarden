import { Env } from '../types';

// NOTE: Kept as a single file with inline HTML/CSS to avoid external assets.
// This file splits the old monolithic setup page into reusable page generators.

type Lang = 'zh' | 'en';

function isChineseFromRequest(request: Request): boolean {
  const acceptLang = (request.headers.get('accept-language') || '').toLowerCase();
  return acceptLang.includes('zh');
}

function t(lang: Lang, key: string): string {
  const zh: Record<string, string> = {
    app: 'NodeWarden',
  tag: '部署在 Cloudflare Workers 上的 Bitwarden 兼容服务端。',

    // Config warning page
    cfgTitle: '需要配置 JWT_SECRET',
    cfgDescMissing: '当前服务没有配置 JWT_SECRET（用于签名登录令牌）。为了安全起见，必须先配置后才能注册/使用。',
    cfgDescDefault: '检测到你正在使用示例/默认 JWT_SECRET。为了安全起见，请先修改为随机强密钥后再注册/使用。',
    cfgDescTooShort: '检测到 JWT_SECRET 长度不足 32 个字符。为了安全起见，请使用至少 32 位的随机字符串。',
    cfgStepsTitle: '如何在 Cloudflare 修改 JWT_SECRET',
  cfgStepsAdd: '打开 Cloudflare 控制台 → Workers 和 Pages → 选择 nodewarden → 设置 → 变量和机密 → 添加变量。\n类型：密钥\n名称：JWT_SECRET\n值：粘贴你生成的随机密钥\n保存后，等待重新部署生效。',
  cfgStepsEdit: '打开 Cloudflare 控制台 → Workers 和 Pages → 选择 nodewarden → 设置 → 变量和机密 → 找到 JWT_SECRET 并编辑。\n类型：密钥\n名称：JWT_SECRET\n值：替换为新的随机强密钥\n保存后，等待重新部署生效。',
    cfgGenTitle: '随机密钥生成器',
    cfgGenHint: '建议长度：至少 32 字符（推荐 64+）。点击刷新生成新的随机值。',
    cfgCopy: '复制',
    cfgCopied: '已复制',
    cfgRefresh: '刷新',

    // Shared
    by: '作者',
    github: 'GitHub',
  };

  const en: Record<string, string> = {
    app: 'NodeWarden',
  tag: 'Minimal Bitwarden-compatible server on Cloudflare Workers.',

    // Config warning page
    cfgTitle: 'JWT_SECRET is required',
    cfgDescMissing: 'This server has no JWT_SECRET configured (used to sign login tokens). For safety, you must configure it before registration/usage.',
    cfgDescDefault: 'You are using the sample/default JWT_SECRET. For safety, please change it to a strong random secret before registration/usage.',
    cfgDescTooShort: 'JWT_SECRET is shorter than 32 characters. For safety, use a random string with at least 32 characters.',
    cfgStepsTitle: 'How to set JWT_SECRET in Cloudflare',
  cfgStepsAdd: 'Open Cloudflare Dashboard → Workers & Pages → select nodewarden → Settings → Variables and Secrets → Add variable.\nType: Secret\nName: JWT_SECRET\nValue: paste a random secret\nSave, and wait for redeploy to take effect.',
  cfgStepsEdit: 'Open Cloudflare Dashboard → Workers & Pages → select nodewarden → Settings → Variables and Secrets → find JWT_SECRET and edit it.\nType: Secret\nName: JWT_SECRET\nValue: replace with a new strong random secret\nSave, and wait for redeploy to take effect.',
    cfgGenTitle: 'Random secret generator',
    cfgGenHint: 'Recommended length: 32+ characters (64+ preferred). Click refresh to generate a new one.',
    cfgCopy: 'Copy',
    cfgCopied: 'Copied',
    cfgRefresh: 'Refresh',

    // Shared
    by: 'By',
    github: 'GitHub',
  };

  return (lang === 'zh' ? zh : en)[key] ?? key;
}

function baseStyles(): string {
  // Keep consistent with existing setup page look & feel.
  return `
    :root {
      color-scheme: light;
      --bg: #f3f4f6;
      --card: #ffffff;
      --border: #d0d5dd;
      --text: #101828;
      --muted: #475467;
      --muted2: #667085;
      --accent: #111418;
      --shadow: 0 16px 44px rgba(16, 24, 40, 0.08);
      --radius: 20px;
      --radius2: 16px;
      --mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
    }
    * { box-sizing: border-box; }
    html, body { height: 100%; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display", "SF Pro Text", "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background: var(--bg);
      color: var(--text);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 40px 24px;
    }
    .shell { width: min(920px, 100%); }
    .panel {
      padding: 40px;
      border: 1px solid var(--border);
      background: var(--card);
      border-radius: var(--radius);
      box-shadow: var(--shadow);
    }
    .top {
      display: flex;
      gap: 14px;
      align-items: center;
      margin-bottom: 10px;
    }
    .mark {
      width: 60px;
      height: 60px;
      border-radius: 16px;
      background: #111418;
      border: 1px solid #111418;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      font-weight: 800;
      letter-spacing: 0.6px;
      line-height: 1;
      color: #ffffff;
      text-transform: uppercase;
      user-select: none;
    }
    .title { display: flex; flex-direction: column; gap: 4px; }
    .title h1 { font-size: 30px; margin: 0; letter-spacing: -0.6px; }
    .title p { margin: 0; color: var(--muted); font-size: 15px; line-height: 1.6; }

    h2 { font-size: 22px; margin: 20px 0 14px 0; letter-spacing: -0.3px; }
    .lead { font-size: 16px; line-height: 1.75; color: #344054; }

    .kv {
      border-radius: var(--radius2);
      border: 1px solid var(--border);
      background: #fafbfc;
      padding: 18px;
      margin-top: 0;
    }
    .kv h3 { margin: 0 0 10px 0; font-size: 17px; color: #1d2939; }
    .kv p { margin: 0; font-size: 15px; line-height: 1.7; color: var(--muted); white-space: pre-line; }

    .server {
      margin-top: 10px;
      font-family: var(--mono);
      font-size: 14px;
      padding: 12px 14px;
      border-radius: 14px;
      background: #ffffff;
      border: 1px solid #d5dae1;
      word-break: break-all;
      color: #111418;
    }

    .row { display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-top: 12px;
    }
    @media (max-width: 760px) { .grid { grid-template-columns: 1fr; } }
    .btn {
      height: 46px;
      padding: 0 14px;
      border-radius: 14px;
      border: 1px solid #d5dae1;
      background: #ffffff;
      color: #111418;
      font-weight: 700;
      font-size: 15px;
      cursor: pointer;
    }
    .btn.primary {
      border-color: #111418;
      background: #111418;
      color: #ffffff;
    }
    .btn:disabled { opacity: 0.55; cursor: not-allowed; }

    a { color: #175cd3; text-decoration: none; }
    a:hover { text-decoration: underline; }

    .footer {
      margin-top: 24px;
      padding-top: 18px;
      border-top: 1px solid var(--border);
      display: flex;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
      font-size: 14px;
      color: var(--muted2);
    }
  `;
}

export type JwtSecretState = 'missing' | 'default' | 'too_short';

export function renderJwtSecretWarningPage(request: Request, state: JwtSecretState): string {
  const lang: Lang = isChineseFromRequest(request) ? 'zh' : 'en';

  const descKey = state === 'missing' ? 'cfgDescMissing' : state === 'default' ? 'cfgDescDefault' : 'cfgDescTooShort';
  const stepsKey = state === 'missing' ? 'cfgStepsAdd' : 'cfgStepsEdit';

  return `<!DOCTYPE html>
<html lang="${lang === 'zh' ? 'zh-CN' : 'en'}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NodeWarden</title>
  <style>${baseStyles()}</style>
</head>
<body>
  <div class="shell">
    <aside class="panel">
      <div class="top">
        <div class="mark" aria-label="NodeWarden">NW</div>
        <div class="title">
          <h1>${t(lang, 'app')}</h1>
          <p>${t(lang, 'tag')}</p>
        </div>
      </div>

      <h2>${t(lang, 'cfgTitle')}</h2>
      <div class="lead">${t(lang, descKey)}</div>

      <div class="grid">
        <div class="kv">
          <h3>${t(lang, 'cfgStepsTitle')}</h3>
          <p>${t(lang, stepsKey)
            .replace(/^类型：密钥/m, '<b>类型：密钥</b>')
            .replace(/^名称：JWT_SECRET/m, '<b>名称：JWT_SECRET</b>')
            .replace(/^Type: Secret/m, '<b>Type: Secret</b>')
            .replace(/^Name: JWT_SECRET/m, '<b>Name: JWT_SECRET</b>')
          }</p>
        </div>

        <div class="kv">
          <h3>${t(lang, 'cfgGenTitle')}</h3>
          <p>${t(lang, 'cfgGenHint')}</p>
          <div class="server" id="secret"></div>
          <div style="height: 10px"></div>
          <div class="row">
            <button class="btn primary" type="button" onclick="refreshSecret()">${t(lang, 'cfgRefresh')}</button>
            <button class="btn" id="copyBtn" type="button" onclick="copySecret()">${t(lang, 'cfgCopy')}</button>
          </div>
        </div>
      </div>

      <div class="footer">
        <div>
          <span>${t(lang, 'by')} </span>
          <a href="https://shuai.plus" target="_blank" rel="noreferrer">shuaiplus</a>
        </div>
        <div>
          <a href="https://github.com/shuaiplus/nodewarden" target="_blank" rel="noreferrer">${t(lang, 'github')}</a>
        </div>
      </div>
    </aside>
  </div>

  <script>
    // Generate a URL-safe random secret (default length: 64)
    function genSecret(len) {
      len = len || 64;
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
      const bytes = new Uint8Array(len);
      crypto.getRandomValues(bytes);
      let out = '';
      for (let i = 0; i < bytes.length; i++) {
        out += chars[bytes[i] % chars.length];
      }
      return out;
    }

    function refreshSecret() {
      const s = genSecret(64);
      document.getElementById('secret').textContent = s;
    }

    async function copySecret() {
      const s = document.getElementById('secret').textContent || '';
      const btn = document.getElementById('copyBtn');
      try {
        await navigator.clipboard.writeText(s);
      } catch {
        const ta = document.createElement('textarea');
        ta.value = s;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        ta.remove();
      }

      if (btn) {
        const original = btn.textContent;
        btn.textContent = '${t(lang, 'cfgCopied')}';
        setTimeout(() => {
          btn.textContent = original;
        }, 1200);
      }
    }

    refreshSecret();
  </script>
</body>
</html>`;
}
