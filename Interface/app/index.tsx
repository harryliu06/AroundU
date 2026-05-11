import { StyleSheet, Text, View, Button } from 'react-native'
import { useRouter } from 'expo-router';

export default function Home() {
  const router = useRouter();
  return (
      <View style={styles.container}>
          <Text style={styles.text}>Welcome to the Home Screen!</Text>
          <Button
        onPress={() => {
          router.push('/login'); 
          console.log("Login button Fired")
        }}
            title="LOGIN"
            color="#841584"
            accessibilityLabel="Learn more about this purple button"
            />
        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#25292e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    },
});