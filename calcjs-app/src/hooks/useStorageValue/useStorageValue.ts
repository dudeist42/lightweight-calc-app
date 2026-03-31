import { useCallback, useMemo, useRef, useSyncExternalStore } from 'react';
import { createStorage } from '../../services/SafeStorage';

export const useStorageValue = <
  Value extends
    | unknown[]
    | Record<string | number | symbol, unknown>
    | number
    | string
    | null
    | boolean
    | undefined = string,
>(
  type: 'session' | 'local',
  key: string,
  initialValue: Value,
): [Value, (value: Value | ((currentValue: Value) => Value)) => void] => {
  const storage = createStorage(type);
  const snapshot = useSyncExternalStore(storage.subscribe, storage.getSnapshot);
  const initialValueRef = useRef(initialValue);

  const snapshotValue = snapshot[key];
  const value = useMemo(() => {
    return snapshotValue ? JSON.parse(snapshotValue) : null;
  }, [snapshotValue]);

  const setValue = useCallback(
    (nextValue: Value | ((prev: Value) => Value)) => {
      const raw = storage.get(key);
      const current = raw ? JSON.parse(raw) : null;

      const result =
        typeof nextValue === 'function' ? nextValue(current ?? initialValueRef.current) : nextValue;

      storage.set(key, JSON.stringify(result));
    },
    [key, storage],
  );

  return [value ?? initialValue, setValue];
};
