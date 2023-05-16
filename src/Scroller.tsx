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
  loading?: boolean;
  initialIndex?: number;
  imageWidth?: number;
  imageHeight?: number;
  aspectRatio?: number;
  margin?: number;
  panScrollTriggerThresholdPercentage?: number;
}

const SCREEN_WIDTH = Dimensions.get('screen').width;
const SCREEN_HEIGHT = Dimensions.get('screen').height;

export function ImagesScrollView({
  urls,
  imageWidth = SCREEN_WIDTH,
  imageHeight = SCREEN_HEIGHT,
  margin = 0,
  onImagePress,
  initialIndex,
  panScrollTriggerThresholdPercentage = 0.2,
}: Props) {
  const scrollRef = useAnimatedRef<Animated.ScrollView>();
  const scrollValue = useScrollViewOffset(scrollRef);

  const scrollInterval = useMemo(
    () => imageWidth + margin,
    [margin, imageWidth]
  );

  const panScrollTriggerThreshold = useMemo(
    () => imageWidth * panScrollTriggerThresholdPercentage,
    [imageWidth, panScrollTriggerThresholdPercentage]
  );

  const triggerScroll = (forward?: boolean) => {
    'worklet';
    const toValue = forward
      ? scrollValue.value + scrollInterval
      : scrollValue.value - scrollInterval;
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
        width={imageWidth}
        height={imageHeight}
        panScrollTriggerThreshold={panScrollTriggerThreshold}
        triggerScroll={triggerScroll}
      />
    );
  };

  return (
    <Animated.ScrollView
      ref={scrollRef}
      snapToInterval={scrollInterval}
      contentOffset={{
        x: initialIndex ? initialIndex * scrollInterval : 0,
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
