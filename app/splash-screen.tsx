import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { Animated, Dimensions, Easing, StyleSheet, View } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  // Animations
  const bgPulse = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.2)).current;
  const logoEcho = useRef(new Animated.Value(0)).current;
  const titleAnim = useRef(new Animated.Value(60)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const sparks = Array.from({ length: 6 }).map(() => useRef(new Animated.Value(0)).current);

  useEffect(() => {
    // Background pulse loop
    Animated.loop(
      Animated.sequence([
        Animated.timing(bgPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bgPulse, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Logo pop-in
    Animated.spring(logoScale, {
      toValue: 1,
      friction: 5,
      tension: 100,
      useNativeDriver: true,
    }).start();

    // Echo wave effect
    Animated.timing(logoEcho, {
      toValue: 1,
      duration: 1200,
      delay: 300,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();

    // Title + subtitle
    Animated.spring(titleAnim, {
      toValue: 0,
      friction: 6,
      tension: 80,
      delay: 800,
      useNativeDriver: true,
    }).start();
    Animated.timing(subtitleOpacity, {
      toValue: 1,
      duration: 1000,
      delay: 1300,
      useNativeDriver: true,
    }).start();

    // Sparks floating
    sparks.forEach((spark, i) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(spark, {
            toValue: 1,
            duration: 3000 + i * 200,
            delay: i * 250,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
          Animated.timing(spark, {
            toValue: 0,
            duration: 3000 + i * 200,
            easing: Easing.inOut(Easing.sin),
            useNativeDriver: true,
          }),
        ])
      ).start();
    });

    // Exit after 3.5s
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(logoScale, {
          toValue: 0.8,
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
        Animated.timing(subtitleOpacity, {
          toValue: 0,
          duration: 600,
          easing: Easing.inOut(Easing.cubic),
          useNativeDriver: true,
        }),
      ]).start(onFinish);
    }, 3500);

    return () => clearTimeout(timer);
  }, []);

  // Interpolations
  const bgScale = bgPulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.08],
  });

  const echoScale = logoEcho.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 2.2],
  });
  const echoOpacity = logoEcho.interpolate({
    inputRange: [0, 1],
    outputRange: [0.5, 0],
  });

  return (
    <LinearGradient
      colors={['#0ea5e9', '#14b8a6', '#ec4899']}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Energy Burst Background */}
      <Animated.View
        style={[
          styles.bgPulse,
          {
            transform: [{ scale: bgScale }],
          },
        ]}
      />

      {/* Logo with echo wave */}
      <View style={styles.center}>
        <Animated.View
          style={[
            styles.echo,
            {
              opacity: echoOpacity,
              transform: [{ scale: echoScale }],
            },
          ]}
        />
        <Animated.Image
          source={require('@/assets/images/logo.png')}
          style={[
            styles.logo,
            {
              transform: [{ scale: logoScale }],
            },
          ]}
          resizeMode="contain"
        />
      </View>

      {/* Title */}
      <Animated.Text
        style={[
          styles.title,
          {
            transform: [{ translateY: titleAnim }],
          },
        ]}
      >
        Veritas
      </Animated.Text>

      {/* Subtitle */}
      <Animated.Text
        style={[
          styles.subtitle,
          {
            opacity: subtitleOpacity,
          },
        ]}
      >
        Depth over distraction
      </Animated.Text>

      {/* Sparks */}
      {sparks.map((spark, i) => {
        const moveY = spark.interpolate({
          inputRange: [0, 1],
          outputRange: [0, -40],
        });
        const opacity = spark.interpolate({
          inputRange: [0, 1],
          outputRange: [0.7, 0],
        });
        return (
          <Animated.View
            key={i}
            style={[
              styles.spark,
              {
                left: `${20 + i * 12}%`,
                transform: [{ translateY: moveY }],
                opacity,
              },
            ]}
          />
        );
      })}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bgPulse: {
    position: 'absolute',
    width,
    height,
    borderRadius: width,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  logo: {
    width: 100,
    height: 100,
    borderRadius: 50
  },
  echo: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#ffffff33',
  },
  title: {
    fontSize: 52,
    fontWeight: '800',
    letterSpacing: 3,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: '#ffffffaa',
    textShadowOffset: { width: 0, height: 3 },
    textShadowRadius: 12,
  },
  subtitle: {
    marginTop: 12,
    fontSize: 20,
    fontStyle: 'italic',
    color: '#e2e8f0',
    textAlign: 'center',
    letterSpacing: 1.2,
  },
  spark: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#fff',
    borderRadius: 3,
    shadowColor: '#fff',
    shadowOpacity: 0.7,
    shadowRadius: 6,
  },
});
