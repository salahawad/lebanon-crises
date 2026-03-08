// Generate a short human-readable reference code like "HLP-A3K9"
export function generateReferenceCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no I,O,0,1 to avoid confusion
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `HLP-${code}`;
}

// Format timestamp to human-readable relative time
export function timeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

// Format timestamp for Arabic
export function timeAgoAr(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'الآن';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `منذ ${minutes} د`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `منذ ${hours} س`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `منذ ${days} ي`;
  return new Date(timestamp).toLocaleDateString('ar');
}

// Truncate text safely
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '...';
}

// Simple rate limiter using localStorage
export function checkRateLimit(key: string, maxAttempts: number, windowMs: number): boolean {
  if (typeof window === 'undefined') return true;

  const stored = localStorage.getItem(`rl_${key}`);
  const now = Date.now();

  if (!stored) {
    localStorage.setItem(`rl_${key}`, JSON.stringify({ count: 1, start: now }));
    return true;
  }

  const data = JSON.parse(stored);
  if (now - data.start > windowMs) {
    localStorage.setItem(`rl_${key}`, JSON.stringify({ count: 1, start: now }));
    return true;
  }

  if (data.count >= maxAttempts) return false;

  data.count++;
  localStorage.setItem(`rl_${key}`, JSON.stringify(data));
  return true;
}
