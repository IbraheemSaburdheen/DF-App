/**
 * DF Mobile - User Navigator
 * Bottom tab navigation for regular users
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { COLORS } from '../constants/colors';

// User Screens
import HomeScreen from '../screens/user/HomeScreen';
import ProductsScreen from '../screens/user/ProductsScreen';
import ProductDetailScreen from '../screens/user/ProductDetailScreen';
import CartScreen from '../screens/user/CartScreen';
import OrdersScreen from '../screens/user/OrdersScreen';
import ProfileScreen from '../screens/user/ProfileScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Products Stack (Products + Product Detail)
const ProductsStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
    <Stack.Screen name="ProductsList" component={ProductsScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
  </Stack.Navigator>
);

// Home Stack (Home + Product Detail)
const HomeStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false, cardStyle: { backgroundColor: COLORS.background } }}>
    <Stack.Screen name="HomeMain" component={HomeScreen} />
    <Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
    <Stack.Screen name="ProductsList" component={ProductsScreen} />
  </Stack.Navigator>
);

const CartTabIcon = ({ color, size, cartCount }) => (
  <View style={styles.iconContainer}>
    <Icon name="cart-outline" size={size} color={color} />
    {cartCount > 0 && (
      <View style={styles.cartBadge}>
        <Text style={styles.cartBadgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
      </View>
    )}
  </View>
);

const UserNavigator = () => {
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
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Products':
              iconName = focused ? 'shopping' : 'shopping-outline';
              break;
            case 'Cart':
              iconName = focused ? 'cart' : 'cart-outline';
              break;
            case 'Orders':
              iconName = focused ? 'package-variant' : 'package-variant-closed';
              break;
            case 'Profile':
              iconName = focused ? 'account' : 'account-outline';
              break;
            default:
              iconName = 'circle';
          }
          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeStack} options={{ title: 'Home' }} />
      <Tab.Screen name="Products" component={ProductsStack} options={{ title: 'Products' }} />
      <Tab.Screen name="Cart" component={CartScreen} options={{ title: 'Cart' }} />
      <Tab.Screen name="Orders" component={OrdersScreen} options={{ title: 'Orders' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
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
  iconContainer: {
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.neon,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  cartBadgeText: {
    color: COLORS.textDark,
    fontSize: 9,
    fontWeight: '700',
  },
});

export default UserNavigator;
