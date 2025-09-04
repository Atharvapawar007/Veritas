import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Modal, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { useTheme } from '@/context/ThemeContext';
import { EnhancedBadge } from '@/services/badges';
import EnhancedBadgeComponent from './EnhancedBadge';
import * as Haptics from 'expo-haptics';

interface BadgeUnlockModalProps {
  badge: EnhancedBadge | null;
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

export default function BadgeUnlockModal({ badge, visible, onClose }: BadgeUnlockModalProps) {
  const { theme } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;
  const sparkleAnims = useRef([...Array(8)].map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (visible && badge) {
      // Haptic feedback
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      
      // Entry animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 50,
          friction: 7,
          useNativeDriver: true,
        }),
      ]).start();

      // Celebration effects based on badge type
      if (badge.celebrationEffect === 'confetti' || badge.celebrationEffect === 'fireworks') {
        Animated.timing(confettiAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }).start();
      }

      if (badge.celebrationEffect === 'sparkles') {
        sparkleAnims.forEach((anim, index) => {
          Animated.loop(
            Animated.timing(anim, {
              toValue: 1,
              duration: 1000 + index * 200,
              useNativeDriver: true,
            })
          ).start();
        });
      }

      // Auto close after 4 seconds
      const timer = setTimeout(() => {
        handleClose();
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [visible, badge]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
      // Reset animations
      scaleAnim.setValue(0);
      fadeAnim.setValue(0);
      confettiAnim.setValue(0);
      sparkleAnims.forEach(anim => anim.setValue(0));
    });
  };

  const renderCelebrationEffect = () => {
    if (!badge) return null;

    switch (badge.celebrationEffect) {
      case 'confetti':
      case 'fireworks':
        return (
          <View style={StyleSheet.absoluteFillObject}>
            {[...Array(12)].map((_, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.confettiPiece,
                  {
                    left: Math.random() * width,
                    top: Math.random() * height * 0.6,
                    backgroundColor: index % 2 === 0 ? '#FFD700' : '#FF69B4',
                    transform: [
                      {
                        translateY: confettiAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [-50, height],
                        }),
                      },
                      {
                        rotate: confettiAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: ['0deg', `${360 * (index + 1)}deg`],
                        }),
                      },
                    ],
                  },
                ]}
              />
            ))}
          </View>
        );
      
      case 'sparkles':
        return (
          <View style={StyleSheet.absoluteFillObject}>
            {sparkleAnims.map((anim, index) => (
              <Animated.Text
                key={index}
                style={[
                  styles.sparkle,
                  {
                    left: 50 + (index * 40) % (width - 100),
                    top: 100 + (index * 60) % (height - 200),
                    opacity: anim.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0, 1, 0],
                    }),
                    transform: [
                      {
                        scale: anim.interpolate({
                          inputRange: [0, 0.5, 1],
                          outputRange: [0.5, 1.5, 0.5],
                        }),
                      },
                    ],
                  },
                ]}
              >
                ✨
              </Animated.Text>
            ))}
          </View>
        );
      
      default:
        return null;
    }
  };

  if (!badge) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <BlurView intensity={80} style={StyleSheet.absoluteFillObject}>
        <Animated.View
          style={[
            styles.overlay,
            {
              opacity: fadeAnim,
            },
          ]}
        >
          {renderCelebrationEffect()}
          
          <Animated.View
            style={[
              styles.modalContainer,
              {
                transform: [{ scale: scaleAnim }],
              },
            ]}
          >
            <LinearGradient
              colors={badge.visualDesign.gradient}
              style={styles.modalGradient}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            >
              <View style={styles.modalContent}>
                <Text style={styles.congratsText}>🎉 Achievement Unlocked!</Text>
                
                <View style={styles.badgeContainer}>
                  <EnhancedBadgeComponent
                    badge={badge}
                    size="large"
                    showDetails={false}
                  />
                </View>
                
                <Text style={styles.badgeName}>{badge.name}</Text>
                <Text style={styles.badgeMessage}>{badge.unlockMessage}</Text>
                
                {/* Tier and rarity display */}
                <View style={styles.badgeMetadata}>
                  <View style={[styles.tierBadge, { backgroundColor: badge.visualDesign.borderColor }]}>
                    <Text style={styles.tierText}>{badge.tier.toUpperCase()}</Text>
                  </View>
                  <View style={styles.rarityContainer}>
                    <Text style={styles.rarityText}>{badge.rarity.toUpperCase()}</Text>
                    {badge.rarity === 'legendary' && <Text style={styles.rarityIcon}>👑</Text>}
                    {badge.rarity === 'epic' && <Text style={styles.rarityIcon}>⭐</Text>}
                  </View>
                </View>
                
                {/* Power-up notification */}
                {badge.powerUp && (
                  <View style={styles.powerUpContainer}>
                    <Text style={styles.powerUpTitle}>⚡ Power-up Activated!</Text>
                    <Text style={styles.powerUpDescription}>{badge.powerUp.effect}</Text>
                  </View>
                )}
                
                <Text style={styles.tapToClose}>Tap anywhere to continue</Text>
              </View>
            </LinearGradient>
          </Animated.View>
        </Animated.View>
      </BlurView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: width * 0.85,
    maxWidth: 350,
    borderRadius: 24,
    overflow: 'hidden',
  },
  modalGradient: {
    padding: 32,
  },
  modalContent: {
    alignItems: 'center',
  },
  congratsText: {
    fontSize: 24,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    marginBottom: 24,
    textAlign: 'center',
  },
  badgeContainer: {
    marginBottom: 24,
  },
  badgeName: {
    fontSize: 22,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeMessage: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 22,
    marginBottom: 20,
  },
  badgeMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    gap: 16,
  },
  tierBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
  },
  rarityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  rarityText: {
    fontSize: 12,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    opacity: 0.8,
  },
  rarityIcon: {
    fontSize: 16,
  },
  powerUpContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    width: '100%',
  },
  powerUpTitle: {
    fontSize: 16,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  powerUpDescription: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  tapToClose: {
    fontSize: 14,
    fontFamily: 'SF Pro Display Bold',
    color: '#FFFFFF',
    opacity: 0.7,
    textAlign: 'center',
  },
  confettiPiece: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  sparkle: {
    position: 'absolute',
    fontSize: 20,
  },
});
