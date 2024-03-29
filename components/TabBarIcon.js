import { Ionicons } from '@expo/vector-icons'
import * as React from 'react'

import Colors from '../constants/Colors'

export default function TabBarIcon(props) {
  return (
    <Ionicons
      name={props.name}
      size={30}
      color={props.focused ? Colors.tintColor : Colors.middleGrey}
    />
  )
}
