import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { Provider } from 'react-redux';
import store from './store/store';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Screens - Home Stack
import HomeScreen from './screens/HomeScreen';
import RockDetailScreen from './screens/RockDetailScreen';
import CameraScreen from './screens/CameraScreen';
import ResultsScreen from './screens/ResultsScreen';

// Screens - Gamification Stack
import AchievementsScreen from './screens/AchievementsScreen';
import ChallengesScreen from './screens/ChallengesScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

// Screens - Profile & AI
import ProfileScreen from './screens/ProfileScreen';
import GeologistChatScreen from './screens/GeologistChatScreen';

function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#00d4ff',
        headerTitleStyle: { fontWeight: 'bold', color: '#ffffff' },
      }}
    >
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: '🪨 GeoSnap' }} />
      <Stack.Screen name="Camera" component={CameraScreen} options={{ title: 'Scan Rock' }} />
      <Stack.Screen name="Results" component={ResultsScreen} options={{ title: 'Results' }} />
      <Stack.Screen name="RockDetail" component={RockDetailScreen} options={{ title: 'Rock Details' }} />
    </Stack.Navigator>
  );
}

function GamificationStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#1a1a2e' },
        headerTintColor: '#00d4ff',
        headerTitleStyle: { fontWeight: 'bold', color: '#ffffff' },
      }}
    >
      <Stack.Screen name="Achievements" component={AchievementsScreen} options={{ title: '🏆 Achievements' }} />
      <Stack.Screen name="Challenges" component={ChallengesScreen} options={{ title: '⚡ Challenges' }} />
      <Stack.Screen name="Leaderboard" component={LeaderboardScreen} options={{ title: '📊 Leaderboard' }} />
    </Stack.Navigator>
  );
}

function MainApp() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f0f1e',
          borderTopColor: '#00d4ff',
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: '#00d4ff',
        tabBarInactiveTintColor: '#888888',
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeStack}
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🔍</Text>,
        }}
      />
      <Tab.Screen
        name="GeologistTab"
        component={GeologistChatScreen}
        options={{
          title: 'AI Geologist',
          tabBarLabel: 'Geologist',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🤖</Text>,
        }}
      />
      <Tab.Screen
        name="GamificationTab"
        component={GamificationStack}
        options={{
          title: 'Achievements',
          tabBarLabel: 'Achievements',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>🏆</Text>,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 20 }}>👤</Text>,
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Main" component={MainApp} />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}