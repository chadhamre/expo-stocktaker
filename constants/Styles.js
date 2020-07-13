import { StyleSheet } from 'react-native'
import Colors from './Colors'

const sharedStyles = StyleSheet.create({
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
    marginTop: 56,
    marginBottom: 62,
  },
  outerRoundedContainer: {
    flex: 1,
    backgroundColor: Colors.darkest,
  },
})

export { sharedStyles }
