import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../services/supabase';

interface Reaction {
  id: string;
  x: number;
  y: number;
  emoji: string;
  timestamp: number;
}

const REACTION_EMOJIS = ['✨', '❤️', '🔥', '👏', '🌟', '💫'];
const REACTION_LIFETIME = 3000; // 3 seconds

/**
 * Hook to broadcast and receive ephemeral reactions
 */
export function useReactions(canvasId?: string) {
  const [reactions, setReactions] = useState<Map<string, Reaction>>(new Map());
  const [channel, setChannel] = useState<any>(null);

  // Broadcast a reaction at a position
  const addReaction = useCallback((x: number, y: number) => {
    if (!channel) {
      console.log('Reaction channel not ready yet');
      return;
    }

    const emoji = REACTION_EMOJIS[Math.floor(Math.random() * REACTION_EMOJIS.length)];
    const reactionId = `${Date.now()}-${Math.random()}`;

    console.log('Sending reaction:', { x, y, emoji });

    channel.send({
      type: 'broadcast',
      event: 'reaction',
      payload: {
        id: reactionId,
        x,
        y,
        emoji,
        timestamp: Date.now(),
      },
    });
  }, [channel]);

  useEffect(() => {
    if (!canvasId) return;

    // Create broadcast channel for reactions
    const reactionChannel = supabase.channel(`reactions:${canvasId}`, {
      config: {
        broadcast: { self: true }, // Receive our own reactions for immediate feedback
      },
    });

    // Listen for reaction broadcasts
    reactionChannel
      .on('broadcast', { event: 'reaction' }, ({ payload }: { payload: Reaction }) => {
        console.log('Received reaction:', payload);
        setReactions(prev => {
          const newReactions = new Map(prev);
          newReactions.set(payload.id, payload);
          return newReactions;
        });

        // Auto-remove after lifetime
        setTimeout(() => {
          setReactions(prev => {
            const newReactions = new Map(prev);
            newReactions.delete(payload.id);
            return newReactions;
          });
        }, REACTION_LIFETIME);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          setChannel(reactionChannel);
        }
      });

    return () => {
      if (reactionChannel) {
        reactionChannel.unsubscribe();
      }
    };
  }, [canvasId]);

  return {
    reactions: Array.from(reactions.values()),
    addReaction,
  };
}
