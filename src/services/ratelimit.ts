// D1-backed rate limiting.
// Notes:
// - Login attempts are tracked per email.
// - API rate is tracked per identifier per fixed window.

// Rate limit configuration
const CONFIG = {
  LOGIN_MAX_ATTEMPTS: 15,
  LOGIN_LOCKOUT_MINUTES: 5,

  API_REQUESTS_PER_MINUTE: 300,
  API_WINDOW_SECONDS: 60,
};

export class RateLimitService {
  constructor(private db: D1Database) {}

  async checkLoginAttempt(email: string): Promise<{
    allowed: boolean;
    remainingAttempts: number;
    retryAfterSeconds?: number;
  }> {
    const key = email.toLowerCase();
    const now = Date.now();

    const row = await this.db
      .prepare('SELECT attempts, locked_until FROM login_attempts WHERE email = ?')
      .bind(key)
      .first<{ attempts: number; locked_until: number | null }>();

    if (!row) {
      return { allowed: true, remainingAttempts: CONFIG.LOGIN_MAX_ATTEMPTS };
    }

    if (row.locked_until && row.locked_until > now) {
      return {
        allowed: false,
        remainingAttempts: 0,
        retryAfterSeconds: Math.ceil((row.locked_until - now) / 1000),
      };
    }

    if (row.locked_until && row.locked_until <= now) {
      await this.db.prepare('DELETE FROM login_attempts WHERE email = ?').bind(key).run();
      return { allowed: true, remainingAttempts: CONFIG.LOGIN_MAX_ATTEMPTS };
    }

    const remainingAttempts = Math.max(0, CONFIG.LOGIN_MAX_ATTEMPTS - (row.attempts || 0));
    return { allowed: true, remainingAttempts };
  }

  async recordFailedLogin(email: string): Promise<{ locked: boolean; retryAfterSeconds?: number }> {
    const key = email.toLowerCase();
    const now = Date.now();

    // D1 in Workers forbids raw BEGIN/COMMIT statements.
    // Use a single atomic UPSERT to increment attempts.
    // This is concurrency-safe because the row is keyed by email.
    await this.db
      .prepare(
        'INSERT INTO login_attempts(email, attempts, locked_until, updated_at) VALUES(?, 1, NULL, ?) ' +
        'ON CONFLICT(email) DO UPDATE SET attempts = attempts + 1, updated_at = excluded.updated_at'
      )
      .bind(key, now)
      .run();

    const row = await this.db
      .prepare('SELECT attempts FROM login_attempts WHERE email = ?')
      .bind(key)
      .first<{ attempts: number }>();

    const attempts = row?.attempts || 1;
    if (attempts >= CONFIG.LOGIN_MAX_ATTEMPTS) {
      const lockedUntil = now + CONFIG.LOGIN_LOCKOUT_MINUTES * 60 * 1000;
      await this.db
        .prepare('UPDATE login_attempts SET locked_until = ?, updated_at = ? WHERE email = ?')
        .bind(lockedUntil, now, key)
        .run();
      return { locked: true, retryAfterSeconds: CONFIG.LOGIN_LOCKOUT_MINUTES * 60 };
    }

    return { locked: false };
  }

  async clearLoginAttempts(email: string): Promise<void> {
    await this.db.prepare('DELETE FROM login_attempts WHERE email = ?').bind(email.toLowerCase()).run();
  }

  async checkApiRateLimit(identifier: string): Promise<{ allowed: boolean; remaining: number; retryAfterSeconds?: number }> {
    const nowSec = Math.floor(Date.now() / 1000);
    const windowStart = nowSec - (nowSec % CONFIG.API_WINDOW_SECONDS);
    const windowEnd = windowStart + CONFIG.API_WINDOW_SECONDS;

    const row = await this.db
      .prepare('SELECT count FROM api_rate_limits WHERE identifier = ? AND window_start = ?')
      .bind(identifier, windowStart)
      .first<{ count: number }>();

    const count = row?.count || 0;
    if (count >= CONFIG.API_REQUESTS_PER_MINUTE) {
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: windowEnd - nowSec,
      };
    }

    return {
      allowed: true,
      remaining: CONFIG.API_REQUESTS_PER_MINUTE - count,
    };
  }

  async incrementApiCount(identifier: string): Promise<void> {
    const nowSec = Math.floor(Date.now() / 1000);
    const windowStart = nowSec - (nowSec % CONFIG.API_WINDOW_SECONDS);

    // Atomic increment via UPSERT.
    await this.db
      .prepare(
        'INSERT INTO api_rate_limits(identifier, window_start, count) VALUES(?, ?, 1) ' +
        'ON CONFLICT(identifier, window_start) DO UPDATE SET count = count + 1'
      )
      .bind(identifier, windowStart)
      .run();
  }
}

export function getClientIdentifier(request: Request): string {
  const cfIp = request.headers.get('CF-Connecting-IP');
  if (cfIp) return cfIp;

  const forwardedFor = request.headers.get('X-Forwarded-For');
  if (forwardedFor) return forwardedFor.split(',')[0].trim();

  return 'unknown';
}
