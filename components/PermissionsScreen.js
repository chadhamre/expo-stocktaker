import * as React from 'react'
import * as Linking from 'expo-linking'

import { sharedStyles } from '../constants/Styles'
import { StyleSheet, View, TouchableOpacity, Text, Button } from 'react-native'

export function PermissionsScreen(props) {
  return (
    <View style={sharedStyles.outerRoundedContainer}>
      <View style={[sharedStyles.innerRoundedContainer, styles.spaceAround]}>
        <View>
          <Text style={sharedStyles.centerText}>
            StockTaker requires camera access to function.
          </Text>
          <TouchableOpacity
            onPress={() => {
              Linking.openURL('app-settings:')
            }}
          >
            <Button
              title={'Update Settings'}
              onPress={() => {
                Linking.openURL('app-settings:')
              }}
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  centerText: {
    textAlign: 'center',
  },
  spaceAround: {
    justifyContent: 'space-around',
  },
})
