import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Dashboard from '../screens/dashboard';
import YourFridge from '../screens/your_fridge';
import AddIngredients from '../screens/add_ingredients';
import SuggestedRecipes from '../screens/suggested_recipes';
import Settings from '../screens/settings';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <NavigationContainer>
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
      })}
    >
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Your Fridge" component={YourFridge} />
      <Tab.Screen name="Add" component={AddIngredients} />
      <Tab.Screen name="Suggested Recipes" component={SuggestedRecipes} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  </NavigationContainer>
);

export default TabNavigator;
