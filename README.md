<div align="center">
  <h1>react-native-images-scrollview</h1>
  <a href="https://www.youtube.com/watch?v=3jqTqrGtGjg">
    <img alt="photos" width=150 src="photos.svg">
  </a>
  <p>Images View for React Native with pinch, pan, and scroll.</p>
</div>
<hr />

## Motivation

Provide a no-setup solution for a full screen image scroller with pinch and zoom on each image.

## Installation

This library requires [reanimated](https://docs.swmansion.com/react-native-reanimated/docs/fundamentals/installation) and [gesture-handler](https://docs.swmansion.com/react-native-gesture-handler/docs/installation). Follow their installation instructions.

## Usage

```js
// MyCoolHomeScreen.tsx
import * as React from 'react';
import { ImagesScrollView } from 'react-native-images-scrollview';

import images from '@assets/images';

export default function App() {
  return <ImagesScrollView urls={images} />;
}
```

## API

| Prop                                | Type                                       | Optional | Default | Description                                                                                         |
| ----------------------------------- | ------------------------------------------ | -------- | ------- | --------------------------------------------------------------------------------------------------- |
| urls                                | `string[]`                                 | No       | N/A     | List of image urls to render.                                                                       |
| onImagePress                        | `({ uri: string; index: number }) => void` | Yes      | N/A     | Callback that fires on single tap on image.                                                         |
| initialIndex                        | `number`                                   | Yes      | 0       | Index of image so start on.                                                                         |
| panScrollTriggerThresholdPercentage | number                                     | Yes      | 0.2     | percentage of screen width to use to trigger scroll if image is zoomed and panned beyond threshold. |

## Example

To run the example app, clone the repo

```bash
cd example
yarn install

yarn ios
# or
yarn android
```

## License

MIT

---

Made with [create-react-native-library](https://github.com/callstack/react-native-builder-bob)
