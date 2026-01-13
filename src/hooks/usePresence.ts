import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { getSessionId } from '../utils/sessionManager';

interface PresenceState {
  liveUsers: number;
  userSessions: Map<string, any>;
}

/**
 * Hook to track live user presence using Supabase Realtime
 */
export function usePresence(canvasId?: string) {
  const [liveUsers, setLiveUsers] = useState(0);
  const [channel, setChannel] = useState<any>(null);

  useEffect(() => {
    if (!canvasId) return;

    const sessionId = getSessionId();

    // Create a presence channel for this canvas
    const presenceChannel = supabase.channel(`canvas:${canvasId}`, {
      config: {
        presence: {
          key: sessionId,
        },
      },
    });

    // Track presence state changes
    presenceChannel
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        const userCount = Object.keys(state).length;
        setLiveUsers(userCount);
      })
      .on('presence', { event: 'join' }, () => {
        const state = presenceChannel.presenceState();
        setLiveUsers(Object.keys(state).length);
      })
      .on('presence', { event: 'leave' }, () => {
        const state = presenceChannel.presenceState();
        setLiveUsers(Object.keys(state).length);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track this user's presence
          await presenceChannel.track({
            session_id: sessionId,
            online_at: new Date().toISOString(),
          });
        }
      });

    setChannel(presenceChannel);

    // Cleanup on unmount
    return () => {
      if (presenceChannel) {
        presenceChannel.unsubscribe();
      }
    };
  }, [canvasId]);

  return {
    liveUsers,
    channel,
  };
}
