
import { Redirect, router } from 'expo-router';
import { View } from 'react-native'; 

export default function SplashScreen() {
  // Simulate a loading delay
  setTimeout(() => {
    router.replace('./welcome'); // Go to Welcome after splash
  }, 2000);

  return <View
   style={{ flex: 1, backgroundColor: 'white' }} 
   />;
}