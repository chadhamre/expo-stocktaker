import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'
import TabBarIcon from './TabBarIcon'
import { useSelector } from 'react-redux'

import { View, Text, StyleSheet } from 'react-native'

import Colors from '../constants/Colors'

const badgeCount = 1

export default function TabBarIconWithBadge(props) {
  const state = useSelector((state) => state)

  return (
    <View>
      <TabBarIcon focused={props.focused} name={props.name} />

      {state.scannedGoodTotal ? (
        <View style={styles.goodBadge}>
          <Text style={{ color: 'white', fontSize: 10, fontWeight: 'bold' }}>
            {state.scannedGoodTotal}
          </Text>
        </View>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  goodBadge: {
    position: 'absolute',
    right: -6,
    top: -3,
    backgroundColor: Colors.tintColor,
    borderRadius: 7,
    width: 14,
    height: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
})
