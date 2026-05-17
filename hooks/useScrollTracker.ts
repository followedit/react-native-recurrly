import { useRef, useCallback } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent } from 'react-native';
import { posthog } from '@/config/posthog';

/**
 * Hook to track scroll depth on a screen.
 * Returns an onScroll handler that should be passed to a ScrollView or FlatList.
 * Ensure scrollEventThrottle is set (e.g., scrollEventThrottle={16}).
 */
export const useScrollTracker = (screenName: string) => {
  const maxScrollPercent = useRef(0);
  const sentMilestones = useRef(new Set<number>());

  const onScroll = useCallback((event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    
    // Calculate how far we've scrolled (bottom of the visible area)
    const scrollPosition = contentOffset.y + layoutMeasurement.height;
    const totalContentHeight = contentSize.height;
    
    if (totalContentHeight <= 0) return;
    
    // Calculate percentage
    const scrollPercent = Math.min(100, Math.round((scrollPosition / totalContentHeight) * 100));
    
    if (scrollPercent > maxScrollPercent.current) {
      maxScrollPercent.current = scrollPercent;
      
      // Milestones to capture: 25%, 50%, 75%, 90%, 100%
      const milestones = [25, 50, 75, 90, 100];
      milestones.forEach(milestone => {
        if (scrollPercent >= milestone && !sentMilestones.current.has(milestone)) {
          sentMilestones.current.add(milestone);
          posthog.capture('$scroll_depth', {
            screen_name: screenName,
            scroll_percentage: milestone,
          });
        }
      });
    }
  }, [screenName]);

  return { onScroll };
};
