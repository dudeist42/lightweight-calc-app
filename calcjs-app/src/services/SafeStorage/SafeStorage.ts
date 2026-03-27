import { memoryStorage } from './MemoryStorage';

export interface IStorage<Keys extends string> {
  set: (key: Keys, value: string) => void;
  get: (key: Keys) => string | null;
  key: (idx: number) => Keys | null;
  remove: (key: Keys) => void;
  getSnapshot: () => Record<Keys, string | null>;
  subscribe: (listener: () => void) => () => void;
  length: number;
}

const isLocalStorageSupported = (): boolean => {
  try {
    localStorage.getItem('');
    return true;
  } catch {
    return false;
  }
};

class SafeStorage<Keys extends string> implements IStorage<Keys> {
  private storage: Storage;
  private listeners = new Set<() => void>();
  private snapshot: Partial<Record<Keys, string | null>> = {};
  private dirty = true;

  public get length() {
    return this.storage.length;
  }

  public constructor(type: 'session' | 'local' = 'session') {
    if (isLocalStorageSupported()) {
      this.storage = type === 'local' ? localStorage : sessionStorage;
      this.#subscribe();
    } else {
      this.storage = memoryStorage;
    }
  }

  public get(key: Keys) {
    return this.storage.getItem(key);
  }

  public set(key: Keys, value: string) {
    this.storage.setItem(key, value);
    this.#notify();
  }

  public remove(key: Keys) {
    this.storage.removeItem(key);
    this.#notify();
  }

  public key(idx: number) {
    return this.storage.key(idx) as Keys | null;
  }

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener);

    return () => this.unsubscribe(listener);
  };

  public unsubscribe(listener: () => void) {
    this.listeners.delete(listener);
  }

  public getSnapshot = (): Record<Keys, string | null> => {
    if (this.dirty) {
      this.snapshot = {};
      for (let keys = 0; keys < this.storage.length; keys++) {
        const key = this.key(keys);
        if (!key) continue;
        this.snapshot[key] = this.get(key);
      }

      this.dirty = false;
    }

    return this.snapshot as Record<Keys, string | null>;
  };

  #notify() {
    this.dirty = true;
    this.listeners.forEach((listener) => listener());
  }

  #subscribe() {
    window.addEventListener('storage', this.#handleStorageEvent);
  }

  #handleStorageEvent = (event: StorageEvent) => {
    if (event.storageArea === this.storage) {
      this.#notify();
    }
  };
}

const storages: Partial<Record<'session' | 'local', SafeStorage<string>>> = {};

export const createStorage = (type: 'session' | 'local') => {
  if (storages[type]) {
    return storages[type];
  } else {
    storages[type] = new SafeStorage(type);

    return storages[type];
  }
};
