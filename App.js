// if (__DEV__) {
//   import('./reactotron.config').then(() => console.log('Reactotron Configured'))
// }

import { createStackNavigator } from '@react-navigation/stack'
import { getStore, getPersistor } from './redux/store'
import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { PersistGate } from 'redux-persist/integration/react'
import {
  Platform,
  StatusBar,
  StyleSheet,
  View,
  Image,
  SafeAreaView,
} from 'react-native'
import { Provider as StoreProvider } from 'react-redux'
import { Spinner } from './components/Spinner'
import { useSelector, useDispatch } from 'react-redux'
import AuthScreen from './screens/AuthScreen'
import BottomTabNavigator from './navigation/BottomTabNavigator'
import ErrorScreen from './screens/ErrorScreen'
import InventoryScreen from './screens/InventoryScreen'
import LinkingConfiguration from './navigation/LinkingConfiguration'
import LocationScreen from './screens/LocationScreen'
import React, { useState, setState, useEffect } from 'react'
import UpdateScreen from './screens/UpdateScreen'
import useCachedResources from './hooks/useCachedResources'
import Colors from './constants/Colors'

const Stack = createStackNavigator()

const App = () => {
  const myStore = getStore()
  const myPersistor = getPersistor()
  const isLoadingComplete = useCachedResources()

  if (!isLoadingComplete) {
    return <Spinner />
  } else {
    return (
      <StoreProvider store={myStore}>
        <PersistGate persistor={myPersistor} loading={<Spinner />}>
          <SafeAreaView style={styles.safeArea}></SafeAreaView>
          <AppNavigator />
          <SafeAreaView style={styles.safeArea}></SafeAreaView>
        </PersistGate>
      </StoreProvider>
    )
  }
}

const AppNavigator = () => {
  const state = useSelector((state) => state)

  if (state.serverError) return <ErrorScreen />
  if (!state.token) return <AuthScreen />
  if (!state.locationName) return <LocationScreen />
  if (!state.inventory) return <InventoryScreen />
  if (state.updateShopify) return <UpdateScreen />

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      <NavigationContainer linking={LinkingConfiguration}>
        <Stack.Navigator>
          <Stack.Screen
            name="Root"
            component={BottomTabNavigator}
            options={{
              headerTintColor: Colors.lightGrey,
              headerStyle: {
                backgroundColor: Colors.darkest,
              },
            }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  safeArea: {
    backgroundColor: Colors.darkest,
  },
})

export default App
