import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import * as React from 'react'

import TabBarIcon from '../components/TabBarIcon'
import TabBarIconWithBadge from '../components/TabBarIconWithBadge'
import HomeScreen from '../screens/HomeScreen'
import ScanScreen from '../screens/ScanScreen'
import ApplyScreen from '../screens/ApplyScreen'

const BottomTab = createBottomTabNavigator()
const INITIAL_ROUTE_NAME = 'Scan'

export default function BottomTabNavigator({ navigation, route }) {
  navigation.setOptions({ headerTitle: getHeaderTitle(route) })

  return (
    <BottomTab.Navigator
      initialRouteName={INITIAL_ROUTE_NAME}
      tabBarOptions={tabBarOptions}
    >
      <BottomTab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: 'Settings',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="md-settings" />
          ),
        }}
      />
      <BottomTab.Screen
        name="Scan"
        component={ScanScreen}
        options={{
          title: 'Scan',
          tabBarIcon: ({ focused }) => (
            <TabBarIcon focused={focused} name="md-camera" />
          ),
        }}
      />
      <BottomTab.Screen
        name="Apply"
        component={ApplyScreen}
        options={{
          title: 'Apply',
          tabBarIcon: ({ focused }) => (
            <TabBarIconWithBadge focused={focused} name="md-list" />
          ),
        }}
      />
    </BottomTab.Navigator>
  )
}

function getHeaderTitle(route) {
  const routeName =
    route.state?.routes[route.state.index]?.name ?? INITIAL_ROUTE_NAME

  switch (routeName) {
    case 'Home':
      return 'Setup'
    case 'Scan':
      return 'Scan Barcodes'
    case 'Apply':
      return 'Update Shopify'
  }
}

const tabBarOptions = {
  style: {
    height: 96,
    paddingTop: 16,
  },
}
