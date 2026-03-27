import { spacing } from './utilities';
import { getContrast, hsla, parseToHsla } from 'color2k';

export interface IPaletteColor {
  main: string;
  contrastText: string;
  dark: string;
  light: string;
}

export interface ITheme {
  mode: 'light' | 'dark';
  palette: {
    black: string;
    white: string;
    default: IPaletteColor;
    primary: IPaletteColor;
    secondary: IPaletteColor;
    text: {
      primary: string;
      secondary: string;
    };
    background: {
      default: string;
    };
    divider: string;
  };
  spacing: typeof spacing;
}

export interface ICreateThemeOptions {
  mode?: 'light' | 'dark';
  palette?: {
    black?: string;
    white?: string;
    default?: string;
    primary?: string;
    secondary?: string;
    text?: {
      primary?: string;
      secondary?: string;
    };
    background?: {
      default?: string;
    };
    divider?: string;
  };
}

const colors = {
  tundora: '#424242',
  denim: '#1565C0',
  doveGray: '#616161',
  black: 'rgba(0, 0, 0, 0.87)',
  white: '#fff',
  alto: '#E0E0E0',
  curiousBlue: '#1E88E5',
  wildSand: '#F5F5F5',
};

const defaultDarkThemeOptions = {
  mode: 'dark',
  palette: {
    secondary: colors.doveGray,
    primary: colors.denim,
    default: colors.tundora,
    black: colors.black,
    white: colors.white,
    text: {
      primary: colors.white,
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
    background: {
      default: colors.black,
    },
    divider: 'rgba(255, 255, 255, 0.12)',
  },
};

const defaultLightThemeOptions = {
  mode: 'light',
  palette: {
    secondary: colors.alto,
    primary: colors.curiousBlue,
    default: colors.wildSand,
    black: colors.black,
    white: colors.white,
    text: {
      primary: colors.black,
      secondary: 'rgba(0, 0, 0, 0.6)',
    },
    background: {
      default: colors.white,
    },
    divider: 'rgba(0, 0, 0, 0.12)',
  },
};

const getContrastText = (background: string, contrastThreshold: number): string =>
  getContrast(background, colors.white) >= contrastThreshold ? colors.white : colors.black;

export const darken = (color: string, coefficient: number): string => {
  const [hue, saturation, lightness, alpha] = parseToHsla(color);

  return hsla(hue, saturation, lightness * (1 - coefficient), alpha);
};

export const lighten = (color: string, coefficient: number): string => {
  const [hue, saturation, lightness, alpha] = parseToHsla(color);

  return hsla(hue, saturation, lightness + (1 - lightness) * coefficient, alpha);
};

export interface TPaletteColor {
  main: string;
  contrastText: string;
  dark: string;
  light: string;
}

const createPaletteColor = (
  main: string,
  tonalOffset = 0.2,
  contrastThreshold = 3,
): TPaletteColor => ({
  main,
  light: lighten(main, tonalOffset),
  dark: darken(main, tonalOffset),
  contrastText: getContrastText(main, contrastThreshold),
});

export const createTheme = (options?: ICreateThemeOptions): ITheme => {
  const defaultOptions =
    options?.mode === 'dark' ? defaultDarkThemeOptions : defaultLightThemeOptions;

  return {
    mode: options?.mode ?? 'light',
    palette: {
      default: createPaletteColor(options?.palette?.default ?? defaultOptions.palette.default),
      primary: createPaletteColor(options?.palette?.primary ?? defaultOptions.palette.primary),
      secondary: createPaletteColor(
        options?.palette?.secondary ?? defaultOptions.palette.secondary,
      ),
      white: options?.palette?.white ?? defaultOptions.palette.white,
      black: options?.palette?.black ?? defaultOptions.palette.black,
      text: {
        primary: options?.palette?.text?.primary ?? defaultOptions.palette.text.primary,
        secondary: options?.palette?.text?.secondary ?? defaultOptions.palette.text.secondary,
      },
      background: {
        default: options?.palette?.background?.default ?? defaultOptions.palette.background.default,
      },
      divider: options?.palette?.divider ?? defaultOptions.palette.divider,
    },
    spacing,
  };
};
