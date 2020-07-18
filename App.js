// if (__DEV__) {
//   import('./reactotron.config').then(() => console.log('Reactotron Configured'))
// }

import AuthScreen from './screens/AuthScreen'
import BottomTabNavigator from './navigation/BottomTabNavigator'
import Colors from './constants/Colors'
import ErrorScreen from './screens/ErrorScreen'
import InventoryScreen from './screens/InventoryScreen'
import LinkingConfiguration from './navigation/LinkingConfiguration'
import LocationScreen from './screens/LocationScreen'
import React, { useState, setState, useEffect } from 'react'
import UpdateScreen from './screens/UpdateScreen'
import useCachedResources from './hooks/useCachedResources'

import { createStackNavigator } from '@react-navigation/stack'
import { getStore, getPersistor } from './redux/store'
import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { PersistGate } from 'redux-persist/integration/react'
import { Platform, StatusBar, StyleSheet, View, Image } from 'react-native'
import { Provider as StoreProvider } from 'react-redux'
import { sharedStyles } from './constants/Styles'
import { SpinnerScreen } from './components/SpinnerScreen'
import { useSelector, useDispatch } from 'react-redux'

const MainStack = createStackNavigator()
const RootStack = createStackNavigator()

const App = () => {
  const myStore = getStore()
  const myPersistor = getPersistor()
  const isLoadingComplete = useCachedResources()

  if (!isLoadingComplete) {
    return <SpinnerScreen />
  } else {
    return (
      <StoreProvider store={myStore}>
        <PersistGate persistor={myPersistor} loading={<SpinnerScreen />}>
          <AppNavigator />
        </PersistGate>
      </StoreProvider>
    )
  }
}

const AppNavigator = () => {
  const state = useSelector((state) => state)

  return (
    <NavigationContainer linking={LinkingConfiguration}>
      <RootStackScreen />
    </NavigationContainer>
  )
}

const RootStackScreen = () => {
  return (
    <RootStack.Navigator
      mode="modal"
      headerMode="none"
      screenOptions={{ animationEnabled: false }}
    >
      <RootStack.Screen name="MainStackScreen" component={MainStackScreen} />
      <RootStack.Screen name="LocationScreen" component={LocationScreen} />
      <RootStack.Screen name="InventoryScreen" component={InventoryScreen} />
      <RootStack.Screen name="ErrorScreen" component={ErrorScreen} />
      <RootStack.Screen name="AuthScreen" component={AuthScreen} />
      <RootStack.Screen name="UpdateScreen" component={UpdateScreen} />
    </RootStack.Navigator>
  )
}

const MainStackScreen = () => {
  return (
    <MainStack.Navigator>
      <MainStack.Screen
        name="BottomTabNavigator"
        component={BottomTabNavigator}
        options={{
          headerTintColor: Colors.lightGrey,
          headerStyle: {
            backgroundColor: Colors.darkest,
          },
        }}
      />
    </MainStack.Navigator>
  )
}

export default App
