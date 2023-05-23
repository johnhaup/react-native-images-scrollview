import React, { useState } from 'react';
import { Image as RNImage } from 'react-native';
import {
  Directions,
  Gesture,
  GestureDetector,
} from 'react-native-gesture-handler';
import Animated, {
  measure,
  runOnJS,
  useAnimatedReaction,
  useAnimatedRef,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface MeasuredDimensions {
  x: number;
  y: number;
  width: number;
  height: number;
  pageX: number;
  pageY: number;
}

interface Props {
  uri: string;
  width: number;
  height: number;
  panScrollTriggerThreshold: number;
  onPress?: () => void;
  disableTap: boolean;
  triggerScroll: (forward?: boolean) => void;
  containerTransX: Animated.SharedValue<number>;
  containerOffsetX: Animated.SharedValue<number>;
}

export function Image({
  uri,
  width,
  height,
  panScrollTriggerThreshold,
  onPress,
  triggerScroll,
  containerTransX,
  containerOffsetX,
}: Props) {
  const [hasZoomed, setHasZoomed] = useState(false);
  const wrapperRef = useAnimatedRef<Animated.View>();
  const scale = useSharedValue(1);
  const offsetScale = useSharedValue(1);
  const transX = useSharedValue(0);
  const transY = useSharedValue(0);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const scrollTriggered = useSharedValue(false);

  const resetPosition = () => {
    'worklet';
    transX.value = withTiming(0);
    transY.value = withTiming(0);
    scale.value = withTiming(1);
    offsetX.value = 0;
    offsetY.value = 0;
    offsetScale.value = 1;
  };

  useAnimatedReaction(
    () => scale.value === 1,
    (isInitialScale, prevIsInitialScale) => {
      if (isInitialScale && !prevIsInitialScale) {
        runOnJS(setHasZoomed)(false);
        resetPosition();
      }
      if (!isInitialScale && prevIsInitialScale) {
        runOnJS(setHasZoomed)(true);
      }
    }
  );

  const pinchGesture = Gesture.Pinch()
    .withTestId('pinch')
    .onUpdate((e) => {
      const newScale = offsetScale.value * e.scale;
      const finalScale = newScale < 1 ? 1 : newScale > 3 ? 3 : newScale;
      scale.value = finalScale;
    })
    .onEnd(() => {
      offsetScale.value = scale.value;
    });

  const panGesture = Gesture.Pan()
    .withTestId('pan')
    .averageTouches(true)
    .onUpdate((e) => {
      if (hasZoomed) {
        transX.value = e.translationX + offsetX.value;
        transY.value = e.translationY + offsetY.value;
        const measured: MeasuredDimensions | null = measure(wrapperRef);
        if (measured) {
          const leftBound = 0;
          const rightBound = width - measured.width;
          if (
            measured.pageX < rightBound - panScrollTriggerThreshold &&
            !scrollTriggered.value
          ) {
            scrollTriggered.value = true;
            triggerScroll(true);
          }
          if (
            measured.pageX > leftBound + panScrollTriggerThreshold &&
            !scrollTriggered.value
          ) {
            scrollTriggered.value = true;
            triggerScroll(false);
          }
        }
      } else {
        containerTransX.value = e.translationX + containerOffsetX.value;
      }
    })
    .onEnd(() => {
      if (hasZoomed) {
        if (scrollTriggered.value) {
          scrollTriggered.value = false;
          resetPosition();
        } else {
          offsetX.value = transX.value;
          offsetY.value = transY.value;
          const measured: MeasuredDimensions | null = measure(wrapperRef);
          if (measured) {
            const leftBound = 0;
            const rightBound = width - measured.width;
            const topBound = 0;
            const bottomBound = height - measured.height;
            const widthDiff = (measured.width - width) / 2;
            const heightDiff = (measured.height - height) / 2;
            if (measured.pageX > leftBound) {
              const toValue = widthDiff;
              transX.value = withTiming(toValue);
              offsetX.value = toValue;
            }
            if (measured.pageX < rightBound) {
              const toValue = -widthDiff;
              transX.value = withTiming(toValue);
              offsetX.value = toValue;
            }
            if (measured.pageY > topBound) {
              const toValue = heightDiff;
              transY.value = withTiming(toValue);
              offsetY.value = toValue;
            }
            if (measured.pageY < bottomBound) {
              const toValue = -heightDiff;
              transY.value = withTiming(toValue);
              offsetY.value = toValue;
            }
          }
        }
      } else {
        containerOffsetX.value = containerTransX.value;
      }
    });

  const singleTapGesture = Gesture.Tap()
    .withTestId('tap')
    .maxDuration(250)
    .onStart(() => {
      if (onPress) {
        runOnJS(onPress)();
      }
    });

  const doubleTapGesture = Gesture.Tap()
    .withTestId('double-tap')
    .maxDuration(250)
    .numberOfTaps(2)
    .onStart(() => {
      if (scale.value > 1) {
        resetPosition();
      }
      if (scale.value === 1) {
        scale.value = withTiming(2);
      }
    });

  const leftFling = Gesture.Fling()
    .withTestId('fling-left')
    .enabled(!hasZoomed)
    .direction(Directions.LEFT)
    .onStart(() => triggerScroll(true));

  const rightFling = Gesture.Fling()
    .withTestId('fling-right')
    .enabled(!hasZoomed)
    .direction(Directions.RIGHT)
    .onStart(() => triggerScroll(false));

  const flingGestures = Gesture.Exclusive(leftFling, rightFling);
  const tapGestures = Gesture.Exclusive(doubleTapGesture, singleTapGesture);
  const dragGestures = Gesture.Exclusive(flingGestures, panGesture);
  const gesture = Gesture.Simultaneous(dragGestures, pinchGesture, tapGestures);

  const animatedStyle = useAnimatedStyle(
    () => ({
      transform: [
        { translateX: transX.value },
        { translateY: transY.value },
        { scale: scale.value },
      ],
    }),
    []
  );

  return (
    <GestureDetector gesture={gesture}>
      <Animated.View ref={wrapperRef} style={animatedStyle}>
        <RNImage
          source={{ uri }}
          style={{
            width,
            height,
          }}
          resizeMode="cover"
        />
      </Animated.View>
    </GestureDetector>
  );
}
