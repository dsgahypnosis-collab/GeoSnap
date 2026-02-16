// GeoSnap Root Layout - Subsurface Sublime
import React, { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, StyleSheet } from 'react-native';
import { colors } from '../src/utils/theme';
import { useAppStore } from '../src/stores/appStore';

export default function RootLayout() {
  const { fetchProfile, fetchLeaderboard } = useAppStore();

  useEffect(() => {
    // Initialize app data
    fetchProfile();
    fetchLeaderboard();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.obsidian },
          animation: 'fade',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="camera"
          options={{
            presentation: 'fullScreenModal',
            animation: 'slide_from_bottom',
          }}
        />
        <Stack.Screen
          name="identification"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="specimen/[id]"
          options={{
            presentation: 'card',
            animation: 'slide_from_right',
          }}
        />
        <Stack.Screen
          name="physical-test"
          options={{
            presentation: 'modal',
            animation: 'slide_from_bottom',
          }}
        />
      </Stack>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.obsidian,
  },
});
