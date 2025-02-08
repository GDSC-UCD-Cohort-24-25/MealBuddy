import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from '../screens/dashboard';
import YourFridge from '../screens/your_fridge';
import AddIngredients from '../screens/add_ingredients';
import SuggestedRecipes from '../screens/suggested_recipes';
import Settings from '../screens/settings';
import ProfileScreen from '../screens/profile_screen';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;

        if (route.name === 'Dashboard') {
          iconName = 'home-outline';
        } else if (route.name === 'Your Fridge') {
          iconName = 'basket-outline';
        } else if (route.name === 'Add') {
          iconName = 'add-circle-outline';
        } else if (route.name === 'Suggested Recipes') {
          iconName = 'fast-food-outline';
        } else if (route.name === 'Settings') {
          iconName = 'settings-outline';
        }

        return <Ionicons name={iconName} size={size} color={color} />;
      },
      tabBarActiveTintColor: Colors.tabBarActive,  // Active tab color
      tabBarInactiveTintColor: Colors.tabBarInactive,  // Inactive tab color
      tabBarStyle: {
        backgroundColor: Colors.tabBarBackground, // White background
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        height: 60,
        paddingBottom: 5,
      },
      headerStyle: {
        backgroundColor: Colors.primary, // Top navigation bar color
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    })}
  >
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen name="Your Fridge" component={YourFridge} />
    <Tab.Screen
      name="Add"
      component={AddIngredients}
      options={{
        tabBarIcon: ({ color, size }) => (
          <Ionicons name="add-circle" size={size} color={Colors.primary} />
        ),
        tabBarLabel: '',  // Hides the label to keep it clean
      }}
    />
    <Tab.Screen name="Suggested Recipes" component={SuggestedRecipes} />
    <Tab.Screen name="Settings" component={Settings} />
  </Tab.Navigator>
);

const TabNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {/* Main Tabs */}
      <Stack.Screen name="MainTabs" component={MainTabs} />
      {/* Profile Screen */}
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);

export default TabNavigator;
