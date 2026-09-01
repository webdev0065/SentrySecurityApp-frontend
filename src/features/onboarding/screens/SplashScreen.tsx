import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, StyleSheet, StatusBar } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { colors } from '../../../styles/colors';
import { scaleWidth, scaleHeight } from '../../../styles/dimensions';
import type { OnboardingStackParamList } from '../../../navigation/types';

type Props = NativeStackScreenProps<OnboardingStackParamList, 'Splash'>;

const SPLASH_DURATION = 2200;

const SplashScreen: React.FC<Props> = ({ navigation }) => {
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progressAnim, {
      toValue: 100,
      duration: SPLASH_DURATION,
      useNativeDriver: false,
    }).start(() => {
      navigation.replace('Onboarding01');
    });
  }, [navigation, progressAnim]);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 100],
    outputRange: ['0%', '100%'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />

      <Image
        source={require('../../../assets/images/sentry-logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <View style={styles.progressTrack}>
        <Animated.View
          style={[styles.progressFill, { width: progressWidth }]}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.white, position: 'relative' },
  logo: {
    position: 'absolute',
    width: scaleWidth(521),
    height: scaleHeight(521),
    top: scaleHeight(146),
    left: scaleWidth(-60),
    opacity: 1,
  },
  progressTrack: {
    position: 'absolute',
    width: scaleWidth(234),
    height: scaleHeight(6),
    top: scaleHeight(780),
    left: scaleWidth(84),
    borderRadius: 100,
    opacity: 1,
    backgroundColor: colors.progressTrack,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 100,
    backgroundColor: colors.gold,
  },
});

export default SplashScreen;
