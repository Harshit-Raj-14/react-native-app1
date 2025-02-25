import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F3330', // Dark green background
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 100,
    paddingHorizontal: 20,
  },
  
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-start',
    width: '100%',
  },
  
  welcomeText: {
    color: 'white',
    fontSize: 32,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  
  buttonContainer: {
    width: '100%',
    marginBottom: 40,
  },
  
  signUpButton: {
    backgroundColor: '#FFC125', // Yellow/gold button
    borderRadius: 30,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  
  signUpButtonText: {
    color: '#0F3330', // Dark text on light button
    fontSize: 16,
    fontWeight: 'bold',
  },
  
  logInButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#FFC125', // Yellow/gold border
    borderRadius: 30,
    paddingVertical: 16,
    width: '100%',
    alignItems: 'center',
  },
  
  logInButtonText: {
    color: '#FFC125', // Yellow/gold text
    fontSize: 16,
    fontWeight: 'bold',
  },
});