import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'

import { StyleSheet, View, ActivityIndicator, Text } from 'react-native'

import Colors from '../constants/Colors'

export function Spinner(props) {
  return (
    <View style={[styles.container, styles.horizontal]}>
      <View>
        <ActivityIndicator size="large" color={Colors.darkest} />
        {props.labelTop ? (
          <View>
            <Text style={styles.centerText}>{props.labelTop}</Text>
            {props.labelBottom ? (
              <Text style={styles.centerText}>{props.labelBottom}</Text>
            ) : null}
          </View>
        ) : null}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
  },
  horizontal: {
    justifyContent: 'space-around',
    padding: 10,
  },
  centerText: {
    paddingTop: 10,
    textAlign: 'center',
  },
})
