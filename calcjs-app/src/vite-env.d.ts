import 'vite/client';
import type { ITheme } from './styles';

declare module '@emotion/react' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  export interface Theme extends ITheme {}
}
