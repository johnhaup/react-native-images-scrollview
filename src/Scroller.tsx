import React, { useMemo } from 'react';
import { Dimensions } from 'react-native';
import Animated, {
  scrollTo,
  useAnimatedRef,
  useScrollViewOffset,
} from 'react-native-reanimated';
import { Image } from './Image';

interface Props {
  urls: string[];
  onImagePress?: ({ uri, index }: { uri: string; index: number }) => void;
  initialIndex?: number;
  panScrollTriggerThresholdPercentage?: number;
}

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

export function ImagesScrollView({
  urls,
  onImagePress,
  initialIndex,
  panScrollTriggerThresholdPercentage = 0.2,
}: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollValue = useScrollViewOffset(scrollRef);

  const panScrollTriggerThreshold = useMemo(
    () => SCREEN_WIDTH * panScrollTriggerThresholdPercentage,
    [panScrollTriggerThresholdPercentage]
  );

  const triggerScroll = (forward?: boolean) => {
    'worklet';
    const toValue = forward
      ? scrollValue.value + SCREEN_WIDTH
      : scrollValue.value - SCREEN_WIDTH;
    scrollTo(scrollRef, toValue, 0, true);
  };

  const renderImage = (uri: string, index: number) => {
    const onPress = () => {
      if (onImagePress) {
        onImagePress({ uri, index });
      }
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
      />
    );
  };

  return (
    <Animated.ScrollView
      ref={scrollRef}
      snapToInterval={SCREEN_WIDTH}
      contentOffset={{
        x: initialIndex ? initialIndex * SCREEN_WIDTH : 0,
        y: 0,
      }}
      decelerationRate="fast"
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      horizontal
    >
      {urls.map(renderImage)}
    </Animated.ScrollView>
  );
}
