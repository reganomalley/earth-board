import { useState, useEffect } from 'react';
import { supabase } from '../services/supabase';
import type { CanvasObject } from '../types/canvas.types';

interface ActivityItem {
  id: string;
  type: string;
  emoji?: string;
  timestamp: string;
}

interface ActivityFeedProps {
  canvasId: string;
}

export default function ActivityFeed({ canvasId }: ActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  useEffect(() => {
    if (!canvasId) return;

    // Subscribe to new objects being created
    const channel = supabase
      .channel(`activity:${canvasId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'canvas_objects',
          filter: `canvas_id=eq.${canvasId}`,
        },
        (payload) => {
          const newObject = payload.new as CanvasObject;

          // Create activity item based on object type
          const activity: ActivityItem = {
            id: newObject.id,
            type: newObject.type,
            timestamp: new Date().toISOString(),
          };

          // Extract emoji for stickers
          if (newObject.type === 'sticker' && newObject.data?.stickerId) {
            activity.emoji = newObject.data.stickerId;
          }

          // Add to front of list
          setActivities(prev => [activity, ...prev].slice(0, 5)); // Keep last 5
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [canvasId]);

  const getActivityText = (activity: ActivityItem) => {
    switch (activity.type) {
      case 'stroke':
        return 'drew a line';
      case 'sticker':
        return `placed ${activity.emoji || '✨'}`;
      case 'rectangle':
        return 'created a rectangle';
      case 'circle':
        return 'drew a circle';
      case 'text':
        return 'wrote text';
      default:
        return 'created something';
    }
  };

  const getTimeSince = (timestamp: string) => {
    const seconds = Math.floor((new Date().getTime() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 10) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return `${Math.floor(minutes / 60)}h ago`;
  };

  if (activities.length === 0) return null;

  return (
    <div style={{
      position: 'fixed',
      top: '6rem',
      right: '2rem',
      zIndex: 25,
      width: '220px',
      pointerEvents: 'none',
    }}>
      <div style={{
        background: 'rgba(20, 25, 15, 0.7)',
        backdropFilter: 'blur(12px)',
        borderRadius: '8px',
        border: '1px solid rgba(139, 115, 85, 0.3)',
        padding: '0.75rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        pointerEvents: 'auto',
      }}>
        <p style={{
          fontFamily: '"Cormorant Garamond", serif',
          fontSize: '0.75rem',
          color: 'rgba(200, 180, 140, 0.6)',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          marginBottom: '0.5rem',
        }}>Live Activity</p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {activities.map((activity, index) => (
            <div
              key={activity.id}
              style={{
                fontSize: '0.75rem',
                color: 'rgba(200, 180, 140, 0.8)',
                fontFamily: '"Cormorant Garamond", serif',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: 1 - (index * 0.15),
                animation: index === 0 ? 'fadeIn 300ms ease-out' : 'none',
              }}
            >
              <span>{getActivityText(activity)}</span>
              <span style={{
                fontSize: '0.65rem',
                color: 'rgba(200, 180, 140, 0.4)',
              }}>{getTimeSince(activity.timestamp)}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
