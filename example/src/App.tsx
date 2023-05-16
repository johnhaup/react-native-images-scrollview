import * as React from 'react';

import { StyleSheet, View } from 'react-native';
import { ImagesScrollView } from 'react-native-images-scrollview';

const images = new Array(5)
  .fill(null)
  .map(() => 'https://picsum.photos/800/2400');

export default function App() {
  return (
    <View style={styles.container}>
      <ImagesScrollView urls={images} fullScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
