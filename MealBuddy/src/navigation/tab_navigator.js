import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Dashboard from '../screens/dashboard';
import YourFridge from '../screens/your_fridge';
import AddIngredients from '../screens/add_ingredients';
import SuggestedRecipes from '../screens/suggested_recipes';
import Settings from '../screens/settings';

const Tab = createBottomTabNavigator();

const TabNavigator = () => (
  <NavigationContainer>
    <Tab.Navigator>
      <Tab.Screen name="Dashboard" component={Dashboard} />
      <Tab.Screen name="Your Fridge" component={YourFridge} />
      <Tab.Screen name="Add" component={AddIngredients} />
      <Tab.Screen name="Suggested Recipes" component={SuggestedRecipes} />
      <Tab.Screen name="Settings" component={Settings} />
    </Tab.Navigator>
  </NavigationContainer>
);

export default TabNavigator;
