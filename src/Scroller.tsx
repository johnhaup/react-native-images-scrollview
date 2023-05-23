import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { Image } from './Image';

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('window').height;

interface Props {
  urls: string[];
  onImagePress?: ({ uri, index }: { uri: string; index: number }) => void;
  initialIndex?: number;
  panScrollTriggerThresholdPercentage?: number;
  testID?: string;
}

/**
 * @param urls - array of image urls
 * @param onImagePress - optional - callback to fire on image tap.  An object with uri and index is passed to the callback.
 * Pressable is disabled if onImagePress is not supplied.
 * @param initialIndex - optional - index of the image to start on
 * @param panScrollTriggerThresholdPercentage - optional - percentage of screen width to trigger a scroll when an image is zoomed in.
 * Defaults to 0.2
 * @param testID - optional - testID for the component
 */
export function ImagesScrollView({
  urls,
  onImagePress,
  initialIndex = 0,
  panScrollTriggerThresholdPercentage = 0.2,
  testID,
}: Props) {
  const transX = useSharedValue(initialIndex * -SCREEN_WIDTH);
  const offsetX = useSharedValue(initialIndex * -SCREEN_WIDTH);
  const panScrollTriggerThreshold = useMemo(
    () => SCREEN_WIDTH * panScrollTriggerThresholdPercentage,
    [panScrollTriggerThresholdPercentage]
  );

  const renderImage = (uri: string, index: number) => {
    const onPress = () => {
      if (onImagePress) {
        onImagePress({ uri, index });
      }
    };
    const triggerScroll = (forward?: boolean) => {
      'worklet';
      const toValue = forward
        ? (index + 1) * -SCREEN_WIDTH
        : (index - 1) * -SCREEN_WIDTH;
      const capped = Math.min(
        Math.max(toValue, -(urls.length - 1) * SCREEN_WIDTH),
        0
      );
      transX.value = withTiming(capped);
      offsetX.value = capped;
    };

    return (
      <Image
        key={`${uri}-${index}`}
        onPress={onPress}
        disableTap={!onImagePress}
        uri={uri}
        width={SCREEN_WIDTH}
        height={SCREEN_HEIGHT}
        panScrollTriggerThreshold={panScrollTriggerThreshold}
        triggerScroll={triggerScroll}
        containerTransX={transX}
        containerOffsetX={offsetX}
      />
    );
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      flexDirection: 'row',
      width: urls.length * SCREEN_WIDTH,
      transform: [{ translateX: transX.value }],
    };
  }, [urls.length]);

  return (
    <Animated.View style={animatedStyle} testID={testID}>
      {urls.map(renderImage)}
    </Animated.View>
  );
}
