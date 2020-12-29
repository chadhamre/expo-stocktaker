import React, { useEffect } from 'react'
import ApplyScreen from '../screens/ApplyScreen'
import Colors from '../constants/Colors'
import HomeScreen from '../screens/HomeScreen'
import ScanScreen from '../screens/ScanScreen'
import TabBarIcon from '../components/TabBarIcon'
import TabBarIconWithBadge from '../components/TabBarIconWithBadge'

import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import { sharedStyles } from '../constants/Styles'

const BottomTab = createBottomTabNavigator()
const INITIAL_ROUTE_NAME = 'Home'

export default function BottomTabNavigator({ navigation, route }) {
  useEffect(() => {
    navigation.setOptions({
      headerTitle: getFocusedRouteNameFromRoute(route),
    })
  })

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
  showLabel: false,
  adaptive: true,
  activeBackgroundColor: Colors.darkest,
  inactiveBackgroundColor: Colors.darkest,
  style: {
    backgroundColor: Colors.darkest,
  },
}
