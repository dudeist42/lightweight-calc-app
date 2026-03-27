import { useCallback, useEffect, useEffectEvent, useState, useSyncExternalStore } from 'react';
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
  const storageSnapshot = useSyncExternalStore(storage.subscribe, storage.getSnapshot);

  const getInitialValue = (): Value => {
    const storageValue = storageSnapshot[key];

    return storageValue ? JSON.parse(storageValue) : initialValue;
  };

  const [value, setValue] = useState<Value>(getInitialValue());

  const currentValue = storageSnapshot[key];
  const updateValueWhenStorageChanged = useEffectEvent(() => {
    let parsedValue: Value | null = null;

    if (currentValue) {
      try {
        parsedValue = JSON.parse(currentValue);
      } catch {}
    }

    if (parsedValue !== null && value !== parsedValue) {
      try {
        setValue(parsedValue);
      } catch {}
    }
  });

  useEffect(() => updateValueWhenStorageChanged(), [currentValue]);

  const handleSetValue = useCallback(
    (nextValue: Value | ((currentValue: Value) => Value)) => {
      setValue((currentValue: Value) => {
        const result = typeof nextValue === 'function' ? nextValue(currentValue) : nextValue;
        storage.set(key, JSON.stringify(result));

        return result;
      });
    },
    [key, storage],
  );

  return [value, handleSetValue];
};
