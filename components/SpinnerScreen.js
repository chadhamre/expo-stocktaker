import * as React from 'react'

import { Spinner } from './Spinner'
import { sharedStyles } from '../constants/Styles'
import {
  View,
  Text,
  TouchableOpacity,
} from 'react-native'

export function SpinnerScreen(props) {
  return (
    <View style={sharedStyles.outerRoundedContainer}>
      <View style={sharedStyles.innerRoundedContainer}>
        <Spinner {...props} />
      </View>
    </View>
  )
}
