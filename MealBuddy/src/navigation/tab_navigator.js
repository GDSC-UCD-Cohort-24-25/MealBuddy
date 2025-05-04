import { 
  View, TextInput, Button, Text, Alert, Keyboard, 
  TouchableWithoutFeedback, ActivityIndicator, TouchableOpacity, StyleSheet 
} from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Dashboard from '../screens/dashboard';
import YourFridge from '../screens/your_fridge';
import AddIngredients from '../screens/add_ingredients';
import Chatbot from '../screens/chat_bot';
import Profile from '../screens/profile';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();






const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      tabBarIcon: ({ color, size }) => {
        let iconName;
        if (route.name === 'Dashboard') iconName = 'home-outline' ;
        else if (route.name === 'Your Fridge') iconName = 'basket-outline';
        else if (route.name === 'Add') iconName = 'add-circle-outline';
        else if (route.name === 'Chatbot') iconName = 'chatbubble-ellipses-outline';
        else if (route.name === 'Profile') iconName = 'person-outline';

        return <Ionicons name={iconName} size={size} color={"#5e2bff"} />;
      },
      tabBarActiveTintColor: Colors.tabBarActive,
      tabBarInactiveTintColor: Colors.tabBarInactive,
    })}
  >
    <Tab.Screen name="Dashboard" component={Dashboard} />
    <Tab.Screen name="Your Fridge" component={YourFridge} />
    <Tab.Screen name="Add" component={AddIngredients} />
    <Tab.Screen name="Chatbot" component={Chatbot} />
    <Tab.Screen name="Profile" component={Profile} />
  </Tab.Navigator>
);

const styles = StyleSheet.create({
  authButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  authButtonSecondary: {
    backgroundColor: '#ffffff',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 20,
    width: '80%',
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#333',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  authButtonText: {
    color: '#5e2bff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  

  googleButton: {
    backgroundColor: '#4285F4',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    width: '55%',
    left: 90,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 10,
    paddingBottom: 30,
    paddingHorizontal: 20,
  },
  
  modalButton: {
    backgroundColor: '#5e2bff',
    marginTop: 10,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  pickerStyle: {
    color: '#000',
    fontSize: 16,
  },
  
  inputBox: {
    backgroundColor: '#f8f8f8',
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 15,
    fontSize: 16,
    marginBottom: 15,
  },
  
  
});


// At the bottom of tab_navigator.js

export default MainTabs;
