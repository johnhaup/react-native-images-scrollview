import React from 'react';
import { ImagesScrollView } from 'react-native-images-scrollview';

const images = new Array(5)
  .fill(null)
  .map(() => 'https://picsum.photos/800/2400');

export default function App() {
  return <ImagesScrollView urls={images} />;
}
