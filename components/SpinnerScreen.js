import * as React from 'react'
import * as Updates from 'expo-updates'
import Colors from '../constants/Colors'

import { Ionicons } from '@expo/vector-icons'
import { Spinner } from './Spinner'
import { sharedStyles } from '../constants/Styles'
import {
  StyleSheet,
  View,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native'

export function SpinnerScreen(props) {
  return (
    <View style={sharedStyles.outerRoundedContainer}>
      <View style={sharedStyles.innerRoundedContainer}>
        <Spinner {...props} />
        {props.attempts && props.attempts > 45 ? (
          <TouchableOpacity
            style={{ padding: 20 }}
            onPress={() => {
              Updates.reloadAsync()
            }}
          >
            <Text style={[sharedStyles.centerText, sharedStyles.paddingTop]}>
              Reload
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  )
}
