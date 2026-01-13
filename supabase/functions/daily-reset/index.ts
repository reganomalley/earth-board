// Daily Canvas Reset - Runs at midnight EST
// Archives current canvas and creates new one for the day

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Canvas {
  id: string;
  date: string;
  name?: string;
  status: string;
  object_count: number;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key (has admin privileges)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    );

    console.log('Starting daily canvas reset...');

    // Get the current active canvas
    const { data: activeCanvas, error: fetchError } = await supabaseAdmin
      .from('canvases')
      .select('*')
      .eq('status', 'active')
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    // Archive the current canvas if it exists
    if (activeCanvas) {
      console.log(`Archiving canvas: ${activeCanvas.id} (${activeCanvas.name || activeCanvas.date})`);

      const { error: archiveError } = await supabaseAdmin
        .from('canvases')
        .update({
          status: 'archived',
          archived_at: new Date().toISOString(),
        })
        .eq('id', activeCanvas.id);

      if (archiveError) {
        throw archiveError;
      }

      console.log('Canvas archived successfully');
    }

    // Create new canvas for today
    // Determine EST/EDT (EST is UTC-5, EDT is UTC-4)
    const now = new Date();
    const estOffset = -5 * 60; // EST is UTC-5
    const estTime = new Date(now.getTime() + (estOffset * 60 * 1000));
    const todayDateEST = estTime.toISOString().split('T')[0];

    console.log(`Creating new canvas for ${todayDateEST}...`);

    // Check if this is the first canvas ever (for naming)
    const { count } = await supabaseAdmin
      .from('canvases')
      .select('*', { count: 'exact', head: true });

    const isFirstCanvas = (count || 0) === 0;
    const canvasName = isFirstCanvas ? 'the big bang' : toRomanNumeralDate(todayDateEST);

    const { data: newCanvas, error: createError } = await supabaseAdmin
      .from('canvases')
      .insert({
        date: todayDateEST,
        name: canvasName,
        status: 'active',
      })
      .select()
      .single();

    if (createError) {
      throw createError;
    }

    console.log(`New canvas created: ${newCanvas.id} (${canvasName})`);

    return new Response(
      JSON.stringify({
        success: true,
        archived: activeCanvas ? {
          id: activeCanvas.id,
          name: activeCanvas.name,
          date: activeCanvas.date,
          object_count: activeCanvas.object_count,
        } : null,
        created: {
          id: newCanvas.id,
          name: newCanvas.name,
          date: newCanvas.date,
        },
        message: 'Daily reset completed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in daily reset:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

/**
 * Convert a number to Roman numerals
 */
function toRoman(num: number): string {
  if (num < 1 || num > 3999) return num.toString();

  const lookup: [number, string][] = [
    [1000, 'M'],
    [900, 'CM'],
    [500, 'D'],
    [400, 'CD'],
    [100, 'C'],
    [90, 'XC'],
    [50, 'L'],
    [40, 'XL'],
    [10, 'X'],
    [9, 'IX'],
    [5, 'V'],
    [4, 'IV'],
    [1, 'I'],
  ];

  let result = '';
  for (const [value, symbol] of lookup) {
    while (num >= value) {
      result += symbol;
      num -= value;
    }
  }
  return result;
}

/**
 * Convert a date string (YYYY-MM-DD) to Roman numeral format (MM.DD.YYYY)
 */
function toRomanNumeralDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  return `${toRoman(month)}.${toRoman(day)}.${toRoman(year)}`;
}
