import { Dimensions, PixelRatio } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions = your Figma frame size (check Figma's frame/canvas settings to confirm)
const BASE_WIDTH = 402;
const BASE_HEIGHT = 874;

// Scale horizontally (for width, left, fontSize, paddingHorizontal, etc.)
export const scaleWidth = (size: number): number => {
  return (SCREEN_WIDTH / BASE_WIDTH) * size;
};

// Scale vertically (for height, top, paddingVertical, etc.)
export const scaleHeight = (size: number): number => {
  return (SCREEN_HEIGHT / BASE_HEIGHT) * size;
};

// Moderate scale — softens the effect for font sizes so text doesn't get
// too huge/tiny on extreme screen sizes. factor 0.5 is a common default.
export const scaleFont = (size: number, factor = 0.5): number => {
  return size + (scaleWidth(size) - size) * factor;
};

export const dimensions = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  pixelDensity: PixelRatio.get(),
};
