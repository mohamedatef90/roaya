import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

/**
 * Cached translation entry
 */
interface CachedTranslation {
  key: string;
  lang: string;
  value: string;
  timestamp: number;
  version: string;
}

/**
 * Translation Cache Service
 * Uses IndexedDB for persistent storage of AI translations
 *
 * Features:
 * - Persistent storage across sessions
 * - Automatic TTL-based expiration
 * - Version-based cache invalidation
 * - Batch operations for efficiency
 */
@Injectable({
  providedIn: 'root'
})
export class TranslationCacheService {
  private readonly DB_NAME = 'roaya-translation-cache';
  private readonly DB_VERSION = 1;
  private readonly STORE_NAME = 'translations';
  private readonly CACHE_VERSION = '1.0.0';

  private db: IDBDatabase | null = null;
  private dbReady: Promise<IDBDatabase>;

  constructor() {
    this.dbReady = this.initDB();
  }

  /**
   * Initialize IndexedDB
   */
  private initDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
      // Skip IndexedDB in SSR
      if (typeof indexedDB === 'undefined') {
        reject(new Error('IndexedDB not available'));
        return;
      }

      const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

      request.onerror = () => {
        console.error('[TranslationCache] Failed to open IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.STORE_NAME)) {
          const store = db.createObjectStore(this.STORE_NAME, { keyPath: 'id', autoIncrement: true });

          // Create indexes for efficient querying
          store.createIndex('key_lang', ['key', 'lang'], { unique: true });
          store.createIndex('lang', 'lang', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  /**
   * Get a single cached translation
   * @param key - Translation key (e.g., 'home.hero.title')
   * @param lang - Language code (e.g., 'ar')
   * @returns Cached value or null if not found/expired
   */
  async get(key: string, lang: string): Promise<string | null> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve) => {
        const transaction = db.transaction(this.STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('key_lang');
        const request = index.get([key, lang]);

        request.onsuccess = () => {
          const result = request.result as CachedTranslation | undefined;

          if (!result) {
            resolve(null);
            return;
          }

          // Check if expired
          if (this.isExpired(result.timestamp)) {
            // Delete expired entry asynchronously
            this.delete(key, lang).catch(() => {});
            resolve(null);
            return;
          }

          // Check version
          if (result.version !== this.CACHE_VERSION) {
            this.delete(key, lang).catch(() => {});
            resolve(null);
            return;
          }

          resolve(result.value);
        };

        request.onerror = () => {
          console.error('[TranslationCache] Get error:', request.error);
          resolve(null);
        };
      });
    } catch (error) {
      console.error('[TranslationCache] Get failed:', error);
      return null;
    }
  }

  /**
   * Store a translation in cache
   * @param key - Translation key
   * @param lang - Language code
   * @param value - Translated value
   */
  async set(key: string, lang: string, value: string): Promise<void> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);

        // First, try to find existing entry
        const index = store.index('key_lang');
        const getRequest = index.get([key, lang]);

        getRequest.onsuccess = () => {
          const existing = getRequest.result as CachedTranslation | undefined;

          const entry: CachedTranslation = {
            key,
            lang,
            value,
            timestamp: Date.now(),
            version: this.CACHE_VERSION
          };

          let saveRequest: IDBRequest;
          if (existing) {
            // Update existing entry
            saveRequest = store.put({ ...entry, id: (existing as any).id });
          } else {
            // Add new entry
            saveRequest = store.add(entry);
          }

          saveRequest.onsuccess = () => resolve();
          saveRequest.onerror = () => {
            console.error('[TranslationCache] Set error:', saveRequest.error);
            reject(saveRequest.error);
          };
        };

        getRequest.onerror = () => {
          // If get fails, try to add as new
          const entry: CachedTranslation = {
            key,
            lang,
            value,
            timestamp: Date.now(),
            version: this.CACHE_VERSION
          };
          const addRequest = store.add(entry);
          addRequest.onsuccess = () => resolve();
          addRequest.onerror = () => reject(addRequest.error);
        };
      });
    } catch (error) {
      console.error('[TranslationCache] Set failed:', error);
    }
  }

  /**
   * Store multiple translations at once
   * @param translations - Map of key -> value
   * @param lang - Language code
   */
  async setMany(translations: Record<string, string>, lang: string): Promise<void> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve, reject) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('key_lang');

        const timestamp = Date.now();
        const entries = Object.entries(translations);
        let completed = 0;

        entries.forEach(([key, value]) => {
          // Check if exists first
          const getRequest = index.get([key, lang]);
          getRequest.onsuccess = () => {
            const existing = getRequest.result;
            const entry: CachedTranslation = {
              key,
              lang,
              value,
              timestamp,
              version: this.CACHE_VERSION
            };

            if (existing) {
              store.put({ ...entry, id: (existing as any).id });
            } else {
              store.add(entry);
            }

            completed++;
            if (completed === entries.length) {
              resolve();
            }
          };
        });

        transaction.onerror = () => {
          console.error('[TranslationCache] SetMany error:', transaction.error);
          reject(transaction.error);
        };

        // Handle empty translations
        if (entries.length === 0) {
          resolve();
        }
      });
    } catch (error) {
      console.error('[TranslationCache] SetMany failed:', error);
    }
  }

  /**
   * Get all cached translations for a language
   * @param lang - Language code
   * @returns Object with key -> value pairs
   */
  async getAll(lang: string): Promise<Record<string, string>> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve) => {
        const transaction = db.transaction(this.STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('lang');
        const request = index.getAll(lang);

        request.onsuccess = () => {
          const results = request.result as CachedTranslation[];
          const translations: Record<string, string> = {};

          results.forEach(item => {
            // Skip expired entries
            if (!this.isExpired(item.timestamp) && item.version === this.CACHE_VERSION) {
              translations[item.key] = item.value;
            }
          });

          resolve(translations);
        };

        request.onerror = () => {
          console.error('[TranslationCache] GetAll error:', request.error);
          resolve({});
        };
      });
    } catch (error) {
      console.error('[TranslationCache] GetAll failed:', error);
      return {};
    }
  }

  /**
   * Delete a single cached translation
   */
  async delete(key: string, lang: string): Promise<void> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('key_lang');
        const request = index.get([key, lang]);

        request.onsuccess = () => {
          const result = request.result;
          if (result) {
            store.delete((result as any).id);
          }
          resolve();
        };

        request.onerror = () => resolve();
      });
    } catch (error) {
      console.error('[TranslationCache] Delete failed:', error);
    }
  }

  /**
   * Clear all cached translations for a language
   */
  async clearLanguage(lang: string): Promise<void> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const index = store.index('lang');
        const request = index.getAllKeys(lang);

        request.onsuccess = () => {
          const keys = request.result;
          keys.forEach(key => store.delete(key));
          resolve();
        };

        request.onerror = () => resolve();
      });
    } catch (error) {
      console.error('[TranslationCache] ClearLanguage failed:', error);
    }
  }

  /**
   * Clear all cached translations
   */
  async clearAll(): Promise<void> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => resolve();
      });
    } catch (error) {
      console.error('[TranslationCache] ClearAll failed:', error);
    }
  }

  /**
   * Get cache statistics
   */
  async getStats(): Promise<{ count: number; languages: string[] }> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve) => {
        const transaction = db.transaction(this.STORE_NAME, 'readonly');
        const store = transaction.objectStore(this.STORE_NAME);
        const countRequest = store.count();
        const allRequest = store.getAll();

        let count = 0;
        const languages = new Set<string>();

        countRequest.onsuccess = () => {
          count = countRequest.result;
        };

        allRequest.onsuccess = () => {
          (allRequest.result as CachedTranslation[]).forEach(item => {
            languages.add(item.lang);
          });
        };

        transaction.oncomplete = () => {
          resolve({ count, languages: Array.from(languages) });
        };

        transaction.onerror = () => {
          resolve({ count: 0, languages: [] });
        };
      });
    } catch (error) {
      return { count: 0, languages: [] };
    }
  }

  /**
   * Clean up expired entries
   */
  async cleanup(): Promise<number> {
    try {
      const db = await this.dbReady;
      return new Promise((resolve) => {
        const transaction = db.transaction(this.STORE_NAME, 'readwrite');
        const store = transaction.objectStore(this.STORE_NAME);
        const request = store.getAll();
        let deletedCount = 0;

        request.onsuccess = () => {
          const results = request.result as (CachedTranslation & { id: number })[];

          results.forEach(item => {
            if (this.isExpired(item.timestamp) || item.version !== this.CACHE_VERSION) {
              store.delete(item.id);
              deletedCount++;
            }
          });
        };

        transaction.oncomplete = () => {
          if (deletedCount > 0) {
            console.log(`[TranslationCache] Cleaned up ${deletedCount} expired entries`);
          }
          resolve(deletedCount);
        };

        transaction.onerror = () => resolve(0);
      });
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if a timestamp is expired based on TTL
   */
  private isExpired(timestamp: number): boolean {
    const ttlMs = environment.translation.cacheTTLDays * 24 * 60 * 60 * 1000;
    return Date.now() - timestamp > ttlMs;
  }

  /**
   * Check if IndexedDB is available
   */
  isAvailable(): boolean {
    return typeof indexedDB !== 'undefined' && this.db !== null;
  }
}
