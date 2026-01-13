import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';
import { getSessionId } from '../utils/sessionManager';

interface CursorPosition {
  x: number;
  y: number;
  sessionId: string;
  timestamp: number;
}

interface LiveCursor {
  sessionId: string;
  x: number;
  y: number;
  emoji: string;
  lastUpdate: number;
}

const CURSOR_EMOJIS = ['🐑', '🦋', '🌿', '✨', '🌙', '⭐', '🌸', '🦊', '🐝', '🌊', '🔥', '🌈'];

/**
 * Hook to track live cursor positions using Supabase Realtime broadcast
 */
export function useLiveCursors(canvasId?: string) {
  const [cursors, setCursors] = useState<Map<string, LiveCursor>>(new Map());
  const [mySessionId] = useState(() => getSessionId());
  const [channel, setChannel] = useState<any>(null);

  // Broadcast cursor position
  const broadcastCursor = useCallback((x: number, y: number) => {
    if (!channel) return;

    channel.send({
      type: 'broadcast',
      event: 'cursor',
      payload: {
        x,
        y,
        sessionId: mySessionId,
        timestamp: Date.now(),
      },
    });
  }, [channel, mySessionId]);

  useEffect(() => {
    if (!canvasId) return;

    // Create broadcast channel for cursor positions
    const cursorChannel = supabase.channel(`cursors:${canvasId}`, {
      config: {
        broadcast: { self: false }, // Don't receive our own messages
      },
    });

    // Listen for cursor broadcasts from other users
    cursorChannel
      .on('broadcast', { event: 'cursor' }, ({ payload }: { payload: CursorPosition }) => {
        const { x, y, sessionId, timestamp } = payload;

        // Ignore our own cursor
        if (sessionId === mySessionId) return;

        setCursors(prev => {
          const newCursors = new Map(prev);

          // Get or create cursor for this session
          let cursor = newCursors.get(sessionId);

          if (!cursor) {
            // Assign a random emoji for new cursor
            const emoji = CURSOR_EMOJIS[Math.floor(Math.random() * CURSOR_EMOJIS.length)];
            cursor = {
              sessionId,
              x,
              y,
              emoji,
              lastUpdate: timestamp,
            };
          } else {
            cursor = {
              ...cursor,
              x,
              y,
              lastUpdate: timestamp,
            };
          }

          newCursors.set(sessionId, cursor);
          return newCursors;
        });
      })
      .subscribe();

    setChannel(cursorChannel);

    // Clean up old cursors (inactive for >5 seconds)
    const cleanupInterval = setInterval(() => {
      const now = Date.now();
      setCursors(prev => {
        const newCursors = new Map(prev);
        let hasChanges = false;

        newCursors.forEach((cursor, sessionId) => {
          if (now - cursor.lastUpdate > 5000) {
            newCursors.delete(sessionId);
            hasChanges = true;
          }
        });

        return hasChanges ? newCursors : prev;
      });
    }, 1000);

    return () => {
      clearInterval(cleanupInterval);
      if (cursorChannel) {
        cursorChannel.unsubscribe();
      }
    };
  }, [canvasId, mySessionId]);

  return {
    cursors: Array.from(cursors.values()),
    broadcastCursor,
  };
}
