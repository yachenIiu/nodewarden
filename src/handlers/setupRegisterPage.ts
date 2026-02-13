import { Env } from '../types';
import { StorageService } from '../services/storage';
import { htmlResponse } from '../utils/response';

// Registration/setup page HTML (single-file, no external assets)
// Split out from the old monolithic `setup.ts` as requested.
const registerPageHTML = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NodeWarden</title>
  <style>
    :root {
      color-scheme: light;
      --bg: #f3f4f6;
      --card: #ffffff;
      --border: #d0d5dd;
      --text: #101828;
      --muted: #475467;
      --muted2: #667085;
      --accent: #111418;
      --danger: #b42318;
      --ok: #027a48;
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
      margin-bottom: 14px;
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

    .message {
      display: none;
      border-radius: 12px;
      padding: 14px 14px;
      margin: 0 0 12px 0;
      font-size: 15px;
      line-height: 1.45;
      border: 1px solid var(--border);
      background: #fafbfc;
    }
    .message.error {
      display: block;
      border-color: #fecdca;
      background: #fff6f5;
      color: var(--danger);
    }
    .message.success {
      display: block;
      border-color: #abefc6;
      background: #f0fdf4;
      color: var(--ok);
    }

    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
    @media (max-width: 540px) { .grid { grid-template-columns: 1fr; } }

    .field { display: flex; flex-direction: column; gap: 7px; }
    label { font-size: 14px; color: var(--muted); letter-spacing: 0.1px; }
    input {
      height: 50px;
      padding: 0 14px;
      border-radius: 14px;
      border: 1px solid #d5dae1;
      background: #ffffff;
      color: var(--text);
      outline: none;
      font-size: 16px;
      transition: border-color 160ms ease, box-shadow 160ms ease;
    }
    input::placeholder { color: #98a2b3; }
    input:focus {
      border-color: #111418;
      box-shadow: 0 0 0 5px rgba(17, 20, 24, 0.08);
    }
    .hint { margin: 0; color: var(--muted2); font-size: 14px; line-height: 1.6; }

    .actions { margin-top: 16px; display: flex; gap: 10px; align-items: center; }
    .primary {
      width: 100%;
      height: 52px;
      border-radius: 14px;
      border: 1px solid #111418;
      background: #111418;
      color: #ffffff;
      font-weight: 700;
      font-size: 16px;
      letter-spacing: 0.1px;
      cursor: pointer;
      transition: transform 120ms ease, filter 120ms ease;
    }
    .primary:hover { filter: brightness(1.03); }
    .primary:active { transform: translateY(1px) scale(0.99); }
    .primary:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }

    .sideCard { display: flex; flex-direction: column; gap: 12px; }
    .kv {
      border-radius: var(--radius2);
      border: 1px solid var(--border);
      background: #fafbfc;
      padding: 18px;
      margin-bottom: 14px;
    }
    .kv h3 { margin: 0 0 10px 0; font-size: 17px; color: #1d2939; }
    .kv p { margin: 0; font-size: 15px; line-height: 1.65; color: var(--muted); }

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
    .muted { color: var(--muted); }
  </style>
</head>
<body>
  <div class="shell">
    <aside class="panel">
      <div class="top">
        <div class="mark" aria-label="NodeWarden">NW</div>
        <div class="title">
          <h1 id="t_app">NodeWarden</h1>
          <p id="t_tag">Minimal Bitwarden-compatible server on Cloudflare Workers.</p>
        </div>
      </div>

      <div class="muted" id="t_intro" style="font-size: 16px; line-height: 1.7;">
        Create your first account to finish setup. Then use any official Bitwarden client to sign in.
      </div>

      <h2 id="t_setup">Setup</h2>

      <div id="message" class="message"></div>

      <div id="setup-form">
        <form id="form" onsubmit="handleSubmit(event)">
          <div class="grid">
            <div class="field">
              <label for="name" id="t_name_label">Name</label>
              <input type="text" id="name" name="name" required placeholder="Your name">
            </div>
            <div class="field">
              <label for="email" id="t_email_label">Email</label>
              <input type="email" id="email" name="email" required placeholder="you@example.com" autocomplete="email">
            </div>
          </div>

          <div style="height: 10px"></div>
          <div class="field">
            <label for="password" id="t_pw_label">Master password</label>
            <input type="password" id="password" name="password" required minlength="12" placeholder="At least 12 characters" autocomplete="new-password">
            <p class="hint" id="t_pw_hint">Choose a strong password you can remember. The server cannot recover it.</p>
          </div>

          <div style="height: 10px"></div>
          <div class="field">
            <label for="confirmPassword" id="t_pw2_label">Confirm password</label>
            <input type="password" id="confirmPassword" name="confirmPassword" required placeholder="Confirm password" autocomplete="new-password">
          </div>

          <div class="actions">
            <button type="submit" id="submitBtn" class="primary">Create account</button>
          </div>
        </form>
      </div>

      <div id="registered-view" class="sideCard" style="display: none;">
        <div class="kv">
          <h3 id="t_done_title">Setup complete</h3>
          <p id="t_done_desc">Your server is ready. Configure your Bitwarden client with this server URL:</p>
          <div class="server" id="serverUrl"></div>
        </div>

        <div class="kv">
          <h3 id="t_important">Important</h3>
          <p id="t_limitations">
            This project is designed for a single user. You cannot add new users. Changing the master password is not supported.
            If you forget it, you must redeploy and register again.
          </p>
        </div>

        <div class="kv">
          <h3 id="t_hide_title">Hide setup page</h3>
          <p id="t_hide_desc">After hiding, this setup page will return 404 for everyone. Your vault will keep working.</p>
          <div class="actions">
            <button type="button" id="hideBtn" class="primary" onclick="disableSetupPage()">Hide setup page</button>
          </div>
        </div>
      </div>

      <div class="footer">
        <div>
          <span class="muted" id="t_by">By</span>
          <a href="https://shuai.plus" target="_blank" rel="noreferrer">shuaiplus</a>
        </div>
        <div>
          <a href="https://github.com/shuaiplus/nodewarden" target="_blank" rel="noreferrer">GitHub</a>
        </div>
      </div>
    </aside>
  </div>

  <script>
    let isRegistered = false;

    function isChinese() {
      const lang = (navigator.language || '').toLowerCase();
      return lang.startsWith('zh');
    }

    function t(key) {
      const zh = {
        app: 'NodeWarden',
  tag: '部署在 Cloudflare Workers 上的 Bitwarden 兼容服务端。',
        intro: '创建第一个账号完成初始化，然后用任意 Bitwarden 官方客户端登录。',
        by: '作者',
        setup: '初始化',
        nameLabel: '昵称',
        emailLabel: '邮箱',
        pwLabel: '主密码',
        pwHint: '请选择你能记住的强密码。服务器无法找回主密码。',
        pw2Label: '确认主密码',
        create: '创建账号',
        creating: '正在创建…',
        doneTitle: '初始化完成',
        doneDesc: '服务已就绪。在 Bitwarden 客户端中填入以下服务器地址：',
        important: '重要提示',
        limitations: '本项目仅支持单用户：不能添加新用户；不支持修改主密码；如果忘记主密码，只能重新部署并重新注册。',
        hideTitle: '隐藏初始化页',
        hideDesc: '隐藏后，初始化页对任何人都会直接返回 404。你的密码库仍可正常使用。',
        hideBtn: '隐藏初始化页',
        hideWorking: '正在隐藏…',
        hideDone: '已隐藏，此页面将返回 404。',
        hideFailed: '隐藏失败',
        hideConfirm: '确认隐藏初始化页？隐藏后页面将不可访问，但你的密码库不会受影响。',
        errPwNotMatch: '两次输入的密码不一致',
        errPwTooShort: '密码长度至少 12 位',
        errGeneric: '发生错误：',
        errRegisterFailed: '注册失败',
      };
      const en = {
        app: 'NodeWarden',
  tag: 'Minimal Bitwarden-compatible server on Cloudflare Workers.',
        intro: 'Create your first account to finish setup. Then use any official Bitwarden client to sign in.',
        by: 'By',
        setup: 'Setup',
        nameLabel: 'Name',
        emailLabel: 'Email',
        pwLabel: 'Master password',
        pwHint: 'Choose a strong password you can remember. The server cannot recover it.',
        pw2Label: 'Confirm password',
        create: 'Create account',
        creating: 'Creating…',
        doneTitle: 'Setup complete',
        doneDesc: 'Your server is ready. Configure your Bitwarden client with this server URL:',
        important: 'Important',
        limitations: 'Single user only: you cannot add new users. Changing the master password is not supported. If you forget it, redeploy and register again.',
        hideTitle: 'Hide setup page',
        hideDesc: 'After hiding, this setup page will return 404 for everyone. Your vault will keep working.',
        hideBtn: 'Hide setup page',
        hideWorking: 'Hiding…',
        hideDone: 'Hidden. This page will now return 404.',
        hideFailed: 'Failed to hide setup page',
        hideConfirm: 'Hide the setup page? It will no longer be accessible, but your vault will keep working.',
        errPwNotMatch: 'Passwords do not match',
        errPwTooShort: 'Password must be at least 12 characters',
        errGeneric: 'An error occurred: ',
        errRegisterFailed: 'Registration failed',
      };
      return (isChinese() ? zh : en)[key];
    }

    function applyI18n() {
      document.documentElement.lang = isChinese() ? 'zh-CN' : 'en';

      document.getElementById('t_app').textContent = t('app');
      document.getElementById('t_tag').textContent = t('tag');
      document.getElementById('t_intro').textContent = t('intro');
      document.getElementById('t_by').textContent = t('by');
      document.getElementById('t_setup').textContent = t('setup');

      document.getElementById('t_name_label').textContent = t('nameLabel');
      document.getElementById('t_email_label').textContent = t('emailLabel');
      document.getElementById('t_pw_label').textContent = t('pwLabel');
      document.getElementById('t_pw_hint').textContent = t('pwHint');
      document.getElementById('t_pw2_label').textContent = t('pw2Label');
      document.getElementById('submitBtn').textContent = t('create');

      document.getElementById('t_done_title').textContent = t('doneTitle');
      document.getElementById('t_done_desc').textContent = t('doneDesc');
      document.getElementById('t_important').textContent = t('important');
      document.getElementById('t_limitations').textContent = t('limitations');
      document.getElementById('t_hide_title').textContent = t('hideTitle');
      document.getElementById('t_hide_desc').textContent = t('hideDesc');
      document.getElementById('hideBtn').textContent = t('hideBtn');
    }

    async function checkStatus() {
      try {
        const res = await fetch('/setup/status');
        const data = await res.json();
        isRegistered = !!data.registered;
        if (data.registered) {
          showRegisteredView();
        }
      } catch (e) {
        console.error('Failed to check status:', e);
      }
    }

    function showRegisteredView() {
      isRegistered = true;
      document.getElementById('setup-form').style.display = 'none';
      document.getElementById('registered-view').style.display = 'block';
      document.getElementById('serverUrl').textContent = window.location.origin;
      showMessage(t('doneTitle'), 'success');
      const form = document.getElementById('form');
      if (form) {
        const fields = form.querySelectorAll('input, button');
        fields.forEach((el) => {
          el.disabled = true;
        });
      }
    }

    async function disableSetupPage() {
      if (!isRegistered) return;
      if (!confirm(t('hideConfirm'))) return;

      const btn = document.getElementById('hideBtn');
      if (btn) {
        btn.disabled = true;
        btn.textContent = t('hideWorking');
      }

      try {
        const res = await fetch('/setup/disable', { method: 'POST' });
        const data = await res.json();
        if (res.ok && data.success) {
          showMessage(t('hideDone'), 'success');
          setTimeout(() => window.location.reload(), 600);
          return;
        }
        showMessage(data.error || t('hideFailed'), 'error');
      } catch (e) {
        showMessage(t('hideFailed'), 'error');
      }

      if (btn) {
        btn.disabled = false;
        btn.textContent = t('hideBtn');
      }
    }

    function showMessage(text, type) {
      const msg = document.getElementById('message');
      msg.textContent = text;
      msg.className = 'message ' + type;
    }

    async function pbkdf2(password, salt, iterations, keyLen) {
      const encoder = new TextEncoder();
      const passwordBytes = (password instanceof Uint8Array)
        ? password
        : encoder.encode(password);
      const saltBytes = (salt instanceof Uint8Array)
        ? salt
        : encoder.encode(salt);

      const keyMaterial = await crypto.subtle.importKey(
        'raw',
        passwordBytes,
        'PBKDF2',
        false,
        ['deriveBits']
      );

      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: saltBytes,
          iterations: iterations,
          hash: 'SHA-256'
        },
        keyMaterial,
        keyLen * 8
      );

      return new Uint8Array(derivedBits);
    }

    async function hkdfExpand(prk, info, length) {
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        'raw',
        prk,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const infoBytes = encoder.encode(info);
      const result = new Uint8Array(length);
      let prev = new Uint8Array(0);
      let offset = 0;
      let counter = 1;

      while (offset < length) {
        const input = new Uint8Array(prev.length + infoBytes.length + 1);
        input.set(prev);
        input.set(infoBytes, prev.length);
        input[input.length - 1] = counter;

        const signature = await crypto.subtle.sign('HMAC', key, input);
        prev = new Uint8Array(signature);

        const toCopy = Math.min(prev.length, length - offset);
        result.set(prev.slice(0, toCopy), offset);
        offset += toCopy;
        counter++;
      }

      return result;
    }

    function generateSymmetricKey() {
      return crypto.getRandomValues(new Uint8Array(64));
    }

    async function encryptAesCbc(data, key, iv) {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'AES-CBC' },
        false,
        ['encrypt']
      );

      const encrypted = await crypto.subtle.encrypt(
        { name: 'AES-CBC', iv: iv },
        cryptoKey,
        data
      );

      return new Uint8Array(encrypted);
    }

    async function hmacSha256(key, data) {
      const cryptoKey = await crypto.subtle.importKey(
        'raw',
        key,
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      );

      const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
      return new Uint8Array(signature);
    }

    function base64Encode(bytes) {
      return btoa(String.fromCharCode.apply(null, bytes));
    }

    async function encryptToBitwardenFormat(data, encKey, macKey) {
      const iv = crypto.getRandomValues(new Uint8Array(16));
      const encrypted = await encryptAesCbc(data, encKey, iv);

      const macData = new Uint8Array(iv.length + encrypted.length);
      macData.set(iv);
      macData.set(encrypted, iv.length);
      const mac = await hmacSha256(macKey, macData);

      return '2.' + base64Encode(iv) + '|' + base64Encode(encrypted) + '|' + base64Encode(mac);
    }

    async function generateRsaKeyPair() {
      const keyPair = await crypto.subtle.generateKey(
        {
          name: 'RSA-OAEP',
          modulusLength: 2048,
          publicExponent: new Uint8Array([1, 0, 1]),
          hash: 'SHA-1'
        },
        true,
        ['encrypt', 'decrypt']
      );

      const publicKeySpki = await crypto.subtle.exportKey('spki', keyPair.publicKey);
      const publicKeyB64 = base64Encode(new Uint8Array(publicKeySpki));

      const privateKeyPkcs8 = await crypto.subtle.exportKey('pkcs8', keyPair.privateKey);
      const privateKeyBytes = new Uint8Array(privateKeyPkcs8);

      return {
        publicKey: publicKeyB64,
        privateKey: privateKeyBytes
      };
    }

    async function handleSubmit(event) {
      event.preventDefault();

      if (isRegistered) {
        showMessage(t('doneTitle'), 'success');
        return;
      }

      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value.toLowerCase();
      const password = document.getElementById('password').value;
      const confirmPassword = document.getElementById('confirmPassword').value;

      if (password !== confirmPassword) {
        showMessage(t('errPwNotMatch'), 'error');
        return;
      }

      if (password.length < 12) {
        showMessage(t('errPwTooShort'), 'error');
        return;
      }

      const btn = document.getElementById('submitBtn');
      btn.disabled = true;
      btn.textContent = t('creating');

      try {
        const iterations = 600000;
        const masterKey = await pbkdf2(password, email, iterations, 32);

        const masterPasswordHash = await pbkdf2(masterKey, password, 1, 32);
        const masterPasswordHashB64 = base64Encode(masterPasswordHash);

        const stretchedKey = await hkdfExpand(masterKey, 'enc', 32);
        const stretchedMacKey = await hkdfExpand(masterKey, 'mac', 32);

        const symmetricKey = generateSymmetricKey();

        const encryptedKey = await encryptToBitwardenFormat(symmetricKey, stretchedKey, stretchedMacKey);

        const rsaKeys = await generateRsaKeyPair();

        const encryptedPrivateKey = await encryptToBitwardenFormat(rsaKeys.privateKey, symmetricKey.slice(0, 32), symmetricKey.slice(32, 64));

        const response = await fetch('/api/accounts/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            name: name,
            masterPasswordHash: masterPasswordHashB64,
            key: encryptedKey,
            kdf: 0,
            kdfIterations: iterations,
            keys: {
              publicKey: rsaKeys.publicKey,
              encryptedPrivateKey: encryptedPrivateKey
            }
          })
        });

        const result = await response.json();

        if (response.ok && result.success) {
          showRegisteredView();
        } else {
          showMessage(result.error || result.ErrorModel?.Message || t('errRegisterFailed'), 'error');
          btn.disabled = false;
          btn.textContent = t('create');
        }
      } catch (error) {
        console.error('Registration error:', error);
        showMessage(t('errGeneric') + (error && error.message ? error.message : String(error)), 'error');
        btn.disabled = false;
        btn.textContent = t('create');
      }
    }

    applyI18n();
    checkStatus();
  </script>
</body>
</html>`;

export async function handleRegisterPage(request: Request, env: Env): Promise<Response> {
  const storage = new StorageService(env.DB);
  const disabled = await storage.isSetupDisabled();
  if (disabled) {
    return new Response(null, { status: 404 });
  }
  return htmlResponse(registerPageHTML);
}
