import * as React from 'react'
import { Text } from 'react-native'
import Colors from '../constants/Colors'

export function MonoText(props) {
  return <Text {...props} style={[props.style, { fontFamily: 'space-mono' }]} />
}

export function TitleText(props) {
  return (
    <Text
      {...props}
      style={[
        props.style,
        {
          color: Colors.middleGrey,
          fontSize: 18,
        },
      ]}
    />
  )
}
