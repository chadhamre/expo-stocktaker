import { Ionicons } from '@expo/vector-icons'
import { StyleSheet, View, ActivityIndicator, Text } from 'react-native'
import * as React from 'react'
import Colors from '../constants/Colors'
import { Spinner } from './Spinner'
import { sharedStyles } from '../constants/Styles'

export function SpinnerScreen(props) {
  return (
    <View style={sharedStyles.outerRoundedContainer}>
      <View style={sharedStyles.innerRoundedContainer}>
        <Spinner {...props} />
      </View>
    </View>
  )
}
