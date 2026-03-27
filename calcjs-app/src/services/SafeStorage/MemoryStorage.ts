export class MemoryStorage implements Storage {
  private storage: Record<string, string | undefined> = {};

  public get length(): number {
    return Object.keys(this.storage).length;
  }

  public key(index: number): string | null {
    return Object.keys(this.storage)[index] ?? null;
  }

  public setItem(key: string, value: string) {
    this.storage[key] = value ?? undefined;
  }

  public getItem(key: string): string | null {
    return this.storage[key] ?? null;
  }

  public removeItem(key: string) {
    this.storage[key] = undefined;
  }

  public clear() {
    this.storage = {};
  }
}

export const memoryStorage = new MemoryStorage();
