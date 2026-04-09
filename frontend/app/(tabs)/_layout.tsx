// Tab Layout - Core Sample Navigation
// Vertical movement equals depth and age
import React from 'react';
import { Tabs } from 'expo-router';
import { View, StyleSheet, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../src/utils/theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: colors.magmaAmber,
        tabBarInactiveTintColor: colors.textTertiary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarItemStyle: styles.tabItem,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Discover',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="compass" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="collection"
        options={{
          title: 'Vault',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="layers" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="capture"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={[styles.captureButton, focused && styles.captureButtonActive]}>
              <Ionicons
                name="scan"
                size={28}
                color={focused ? colors.obsidian : colors.textPrimary}
              />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="lab"
        options={{
          title: 'Lab',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="flask" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="notebook"
        options={{
          href: null,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: colors.caveShadow,
    borderTopWidth: 1,
    borderTopColor: colors.glassBorder,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 8,
    height: Platform.OS === 'ios' ? 88 : 64,
    ...shadows.lg,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  tabItem: {
    paddingTop: 4,
  },
  captureButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.magmaAmber,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: -20,
    ...shadows.lg,
    shadowColor: colors.magmaAmber,
  },
  captureButtonActive: {
    backgroundColor: colors.specimenGold,
  },
});
