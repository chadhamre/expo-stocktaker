import Colors from './Colors'

import { StyleSheet } from 'react-native'

const sharedStyles = StyleSheet.create({
  container: {
    flex: 1,
  },
  lightContainer: {
    flex: 1,
    backgroundColor: Colors.lightest,
  },
  darkContainer: {
    flex: 1,
    backgroundColor: Colors.darkest,
  },
  tintContainer: {
    flex: 1,
    backgroundColor: Colors.tintColor,
  },
  buttonContainer: {
    paddingTop: 5,
    paddingBottom: 5,
    paddingLeft: '10%',
    paddingRight: '10%',
  },
  innerRoundedContainer: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'flex-end',
    backgroundColor: Colors.lightest,
    borderColor: Colors.darkest,
    borderWidth: 1,
    borderRadius: 39,
    marginTop: 70,
    marginBottom: 70,
  },
  underline: {
    textDecorationLine: 'underline',
  },
  outerRoundedContainer: {
    flex: 1,
    backgroundColor: Colors.darkest,
  },
})

export { sharedStyles }
