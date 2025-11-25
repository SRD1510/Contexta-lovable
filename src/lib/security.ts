/**
 * Security utilities for API key encryption and validation
 * Uses Web Crypto API for encryption (AES-GCM)
 */

// Generate a key derivation salt (stored in sessionStorage for this session)
const getOrCreateSalt = (): Uint8Array => {
  const saltKey = "context-manager-salt";
  let salt = sessionStorage.getItem(saltKey);
  
  if (!salt) {
    // Generate a random salt for this session
    const newSalt = crypto.getRandomValues(new Uint8Array(16));
    sessionStorage.setItem(saltKey, btoa(String.fromCharCode(...newSalt)));
    return newSalt;
  }
  
  return Uint8Array.from(atob(salt), c => c.charCodeAt(0));
};

// Derive encryption key from user's browser fingerprint + salt
const deriveKey = async (): Promise<CryptoKey> => {
  const salt = getOrCreateSalt();
  
  // Use a combination of user agent and screen properties as base
  // This creates a device-specific key that's consistent per session
  const baseKey = `${navigator.userAgent}-${screen.width}x${screen.height}`;
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(baseKey),
    "PBKDF2",
    false,
    ["deriveBits", "deriveKey"]
  );
  
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
};

/**
 * Encrypts an API key before storage
 */
export async function encryptApiKey(plaintext: string): Promise<string> {
  if (!plaintext) return "";
  
  try {
    const key = await deriveKey();
    const encoder = new TextEncoder();
    const iv = crypto.getRandomValues(new Uint8Array(12)); // 96-bit IV for GCM
    
    const encrypted = await crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encoder.encode(plaintext)
    );
    
    // Combine IV and encrypted data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv, 0);
    combined.set(new Uint8Array(encrypted), iv.length);
    
    // Convert to base64 for storage
    return btoa(String.fromCharCode(...combined));
  } catch (error) {
    console.error("Encryption failed:", error);
    // Fallback: return plaintext (should never happen, but prevents data loss)
    return plaintext;
  }
}

/**
 * Decrypts an API key from storage
 */
export async function decryptApiKey(ciphertext: string): Promise<string> {
  if (!ciphertext) return "";
  
  try {
    const key = await deriveKey();
    
    // Decode from base64
    const combined = Uint8Array.from(atob(ciphertext), c => c.charCodeAt(0));
    
    // Extract IV (first 12 bytes) and encrypted data
    const iv = combined.slice(0, 12);
    const encrypted = combined.slice(12);
    
    const decrypted = await crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv: iv,
      },
      key,
      encrypted
    );
    
    const decoder = new TextDecoder();
    return decoder.decode(decrypted);
  } catch (error) {
    console.error("Decryption failed:", error);
    // If decryption fails, might be old unencrypted data - return as-is
    return ciphertext;
  }
}

/**
 * Detects if an API key is an OpenRouter key
 */
export function isOpenRouterKey(apiKey: string): boolean {
  return apiKey.trim().startsWith("sk-or-v1-");
}

/**
 * Validates API key format
 */
export function validateApiKeyFormat(apiKey: string, provider: "openai" | "anthropic" | "google"): {
  valid: boolean;
  error?: string;
} {
  if (!apiKey || apiKey.trim().length === 0) {
    return { valid: false, error: "API key cannot be empty" };
  }
  
  const trimmed = apiKey.trim();
  
  switch (provider) {
    case "openai":
      // Accept both OpenAI keys (sk-...) and OpenRouter keys (sk-or-v1-...)
      if (!trimmed.startsWith("sk-")) {
        return { valid: false, error: "OpenAI/OpenRouter API keys must start with 'sk-'" };
      }
      if (trimmed.length < 20) {
        return { valid: false, error: "API key appears too short" };
      }
      // OpenRouter keys should be longer
      if (trimmed.startsWith("sk-or-v1-") && trimmed.length < 50) {
        return { valid: false, error: "OpenRouter API key appears too short" };
      }
      break;
      
    case "anthropic":
      if (!trimmed.startsWith("sk-ant-")) {
        return { valid: false, error: "Anthropic API keys must start with 'sk-ant-'" };
      }
      if (trimmed.length < 20) {
        return { valid: false, error: "Anthropic API key appears too short" };
      }
      break;
      
    case "google":
      if (!trimmed.startsWith("AIza")) {
        return { valid: false, error: "Google API keys must start with 'AIza'" };
      }
      if (trimmed.length < 20) {
        return { valid: false, error: "Google API key appears too short" };
      }
      break;
  }
  
  return { valid: true };
}

/**
 * Sanitizes user input to prevent injection attacks
 */
export function sanitizeInput(input: string): string {
  if (!input) return "";
  
  // Remove null bytes and control characters (except newlines and tabs)
  let sanitized = input.replace(/[\x00-\x08\x0B-\x0C\x0E-\x1F\x7F]/g, "");
  
  // Limit maximum length (prevent DoS)
  const MAX_LENGTH = 100000; // 100KB
  if (sanitized.length > MAX_LENGTH) {
    sanitized = sanitized.substring(0, MAX_LENGTH);
  }
  
  return sanitized.trim();
}

/**
 * Handles localStorage quota errors gracefully
 */
export function safeLocalStorageSet(key: string, value: string): {
  success: boolean;
  error?: string;
} {
  try {
    localStorage.setItem(key, value);
    return { success: true };
  } catch (error: any) {
    if (error.name === "QuotaExceededError" || error.code === 22) {
      return {
        success: false,
        error: "Storage quota exceeded. Please delete some conversations or clear browser data.",
      };
    } else if (error.name === "SecurityError" || error.code === 18) {
      return {
        success: false,
        error: "Storage access denied. Please check browser settings.",
      };
    } else {
      return {
        success: false,
        error: `Storage error: ${error.message || "Unknown error"}`,
      };
    }
  }
}

/**
 * Safely gets item from localStorage
 */
export function safeLocalStorageGet(key: string): {
  success: boolean;
  value?: string;
  error?: string;
} {
  try {
    const value = localStorage.getItem(key);
    return { success: true, value: value || undefined };
  } catch (error: any) {
    return {
      success: false,
      error: `Failed to read storage: ${error.message || "Unknown error"}`,
    };
  }
}

