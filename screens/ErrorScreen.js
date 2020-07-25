import Colors from '../constants/Colors'
import React, { useState, useEffect } from 'react'

import { Button } from 'react-native-elements'
import { logoutReducer } from '../redux/reducers'
import { reloadAsync } from 'expo-updates'
import { ScrollView } from 'react-native-gesture-handler'
import { sharedStyles } from '../constants/Styles'
import { SpinnerScreen } from '../components/SpinnerScreen'
import { useSelector, useDispatch } from 'react-redux'
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'

export default function LocationScreen() {
  // redux
  const state = useSelector((state) => state)
  const dispatch = useDispatch()
  const logout = (response) => dispatch(logoutReducer(response))

  if (state.serverError) {
    return (
      <View style={sharedStyles.lightContainer}>
        <ScrollView
          style={sharedStyles.lightContainer}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.welcomeContainer}>
            <Text style={sharedStyles.underline}>Server Error</Text>
          </View>
          <View style={styles.helpContainer}>
            <Text>{state.serverError}</Text>
            <Text>email hello@saskatoonlabs.com for help.</Text>
          </View>
          <View style={styles.buttonContainer}>
            <Button title="Logout" onPress={logout} />
          </View>
          <View style={styles.helpContainer}></View>
        </ScrollView>
      </View>
    )
  } else return <SpinnerScreen />
}

const styles = StyleSheet.create({
  welcomeContainer: {
    alignItems: 'center',
  },
  buttonContainer: {
    paddingTop: 30,
    paddingBottom: 15,
    paddingLeft: '10%',
    paddingRight: '10%',
  },
  contentContainer: {
    marginTop: -60,
    flexGrow: 1,
    justifyContent: 'center',
  },
  helpContainer: {
    marginTop: 15,
    alignItems: 'center',
  },
})
