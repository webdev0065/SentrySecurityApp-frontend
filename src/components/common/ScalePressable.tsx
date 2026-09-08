import React, { useRef } from 'react';
import {
  Animated,
  Pressable,
  type PressableProps,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);

type Props = Omit<PressableProps, 'children' | 'style'> & {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  pressedScale?: number;
};

/** A subtle, shared mobile press response for buttons, cards, and navigation. */
const ScalePressable: React.FC<Props> = ({
  children,
  style,
  pressedScale = 0.98,
  disabled,
  onPressIn,
  onPressOut,
  ...props
}) => {
  const scale = useRef(new Animated.Value(1)).current;
  const animate = (toValue: number) => {
    Animated.timing(scale, {
      toValue,
      duration: 110,
      useNativeDriver: true,
    }).start();
  };

  return (
    <AnimatedPressable
      {...props}
      disabled={disabled}
      style={[style, { transform: [{ scale }], opacity: disabled ? 0.6 : 1 }]}
      onPressIn={event => {
        if (!disabled) animate(pressedScale);
        onPressIn?.(event);
      }}
      onPressOut={event => {
        animate(1);
        onPressOut?.(event);
      }}
    >
      {children}
    </AnimatedPressable>
  );
};

export default ScalePressable;
