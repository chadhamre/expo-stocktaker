import { createStackNavigator } from '@react-navigation/stack'
import { NavigationContainer, useFocusEffect } from '@react-navigation/native'
import { Provider as StoreProvider } from 'react-redux'
import { useSelector, useDispatch } from 'react-redux'
import AuthScreen from './screens/AuthScreen'
import ErrorScreen from './screens/ErrorScreen'
import UpdateScreen from './screens/UpdateScreen'
import BottomTabNavigator from './navigation/BottomTabNavigator'
import LinkingConfiguration from './navigation/LinkingConfiguration'
import LocationScreen from './screens/LocationScreen'
import InventoryScreen from './screens/InventoryScreen'
import React, { useState, setState, useEffect } from 'react'
import store from './redux/store'
import useCachedResources from './hooks/useCachedResources'
import { Spinner } from './components/Spinner'
import { Platform, StatusBar, StyleSheet, View } from 'react-native'

const Stack = createStackNavigator()

const App = () => {
  const isLoadingComplete = useCachedResources()

  if (!isLoadingComplete) {
    return (
      <View style={{ flex: 1 }}>
        <Image source={require('./assets/images/splash.png')} />
      </View>
    )
  } else {
    return (
      <StoreProvider store={store}>
        <AppNavigator />
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
      {Platform.OS === 'ios' && <StatusBar barStyle="dark-content" />}
      <NavigationContainer linking={LinkingConfiguration}>
        <Stack.Navigator>
          <Stack.Screen name="Root" component={BottomTabNavigator} />
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
})

export default App
