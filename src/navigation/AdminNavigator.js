/**
 * DF Mobile - Admin Navigator
 * Bottom tab navigation for admin users
 */

import React from 'react';
import { StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';

// Admin Screens
import DashboardScreen from '../screens/admin/DashboardScreen';
import ManageProductsScreen from '../screens/admin/ManageProductsScreen';
import AddEditProductScreen from '../screens/admin/AddEditProductScreen';
import ManageOrdersScreen from '../screens/admin/ManageOrdersScreen';
import ManageUsersScreen from '../screens/admin/ManageUsersScreen';
import AdminProfileScreen from '../screens/admin/AdminProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Products Management Stack
const ProductsManagementStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
    <Stack.Screen name="ManageProductsList" component={ManageProductsScreen} />
    <Stack.Screen name="AddEditProduct" component={AddEditProductScreen} />
  </Stack.Navigator>
);

const AdminNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.tabBarActive,
        tabBarInactiveTintColor: COLORS.tabBarInactive,
        tabBarLabelStyle: styles.tabLabel,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Dashboard':
              iconName = focused ? 'view-dashboard' : 'view-dashboard-outline';
              break;
            case 'ManageProducts':
              iconName = focused ? 'package-variant' : 'package-variant-closed';
              break;
            case 'ManageOrders':
              iconName = focused ? 'clipboard-list' : 'clipboard-list-outline';
              break;
            case 'ManageUsers':
              iconName = focused ? 'account-group' : 'account-group-outline';
              break;
            case 'AdminProfile':
              iconName = focused ? 'account-cog' : 'account-cog-outline';
              break;
            default:
              iconName = 'circle';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen
        name="ManageProducts"
        component={ProductsManagementStack}
        options={{ title: 'Products' }}
      />
      <Tab.Screen
        name="ManageOrders"
        component={ManageOrdersScreen}
        options={{ title: 'Orders' }}
      />
      <Tab.Screen
        name="ManageUsers"
        component={ManageUsersScreen}
        options={{ title: 'Users' }}
      />
      <Tab.Screen
        name="AdminProfile"
        component={AdminProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: COLORS.tabBarBackground,
    borderTopColor: COLORS.border,
    borderTopWidth: 1,
    height: 60,
    paddingBottom: 8,
    paddingTop: 6,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '500',
  },
});

export default AdminNavigator;
