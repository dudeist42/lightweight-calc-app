import { useEffect, useEffectEvent, useState } from 'react';

export const useMediaQuery = (query: string) => {
  const [matches, setMatches] = useState(false);

  const setMatchesEvent = useEffectEvent((isMatches: boolean) => {
    setMatches(isMatches);
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia(query);
    setMatchesEvent(mediaQuery.matches);
    const callback = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };
    mediaQuery.addEventListener('change', callback);
    return () => {
      mediaQuery.removeEventListener('change', callback);
    };
  }, [query]);

  return matches;
};
