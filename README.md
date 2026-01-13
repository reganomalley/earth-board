# Viral Canvas

A real-time collaborative pixel art canvas inspired by r/place. Users can place colored pixels on a shared 100x100 grid, with changes appearing instantly for everyone. Built with React, Vite, Tailwind CSS, and Supabase.

## Features

- **Real-time Collaboration**: See other users' pixels appear instantly via WebSocket
- **100x100 Pixel Grid**: 16-color palette inspired by r/place
- **Rate Limiting**: 30-second cooldown between pixel placements
- **Optimistic Updates**: Your pixels appear immediately while saving
- **Anonymous Access**: No login required - start creating immediately
- **Persistent Canvas**: All pixels are stored and survive page refreshes

## Tech Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Supabase (Postgres + Realtime + Edge Functions)
- **Deployment**: Vercel (frontend) + Supabase (managed backend)

## Getting Started

### Prerequisites

- Node.js v18 or higher
- npm
- Supabase account (free tier works great)

### 1. Clone and Install

```bash
cd /Users/romalley/personal/magic/viral-canvas
npm install
```

### 2. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for the database to initialize (2-3 minutes)
3. Go to **Project Settings** > **API** and copy:
   - Project URL
   - Anon/Public API key

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp .env.example .env
```

Edit `.env` and add your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run Database Migrations

In Supabase dashboard:

1. Go to **SQL Editor**
2. Click **New Query**
3. Copy the contents of `supabase/migrations/001_initial_schema.sql`
4. Paste and click **Run**

This creates the tables and sets up Row Level Security policies.

### 5. Enable Realtime

In Supabase dashboard:

1. Go to **Database** > **Replication**
2. Find the `canvas_pixels` table
3. Enable replication (toggle on the right)

This allows real-time updates to work.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

## Testing

### Test Real-Time Sync

1. Open two browser windows side by side
2. Place a pixel in one window
3. Watch it appear instantly in the other window

### Test Cooldown

1. Place a pixel
2. Verify you can't place another for 30 seconds
3. Watch the countdown timer

### Test Persistence

1. Place several pixels
2. Refresh the page
3. Verify all pixels are still there

## Project Structure

```
viral-canvas/
├── src/
│   ├── components/
│   │   ├── Canvas.jsx              # HTML5 Canvas rendering
│   │   └── ColorPalette.jsx        # 16-color picker
│   ├── services/
│   │   ├── supabase.js            # Supabase client
│   │   └── canvasService.js       # API layer
│   ├── utils/
│   │   ├── colorPalette.js        # Color definitions
│   │   └── sessionManager.js      # Anonymous sessions
│   ├── App.jsx                    # Main app component
│   └── main.jsx                   # Entry point
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql # Database setup
└── package.json
```

## Deployment

### Frontend (Vercel)

1. Push your code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Deploy

### Backend (Supabase)

Already deployed - Supabase is fully managed!

## Roadmap

### Phase 2: Enhanced Features
- Live user count
- Activity feed
- Share button

### Phase 3: Viral Features
- 24-hour themed canvases
- Gallery of past canvases
- Better mobile support

### Phase 4: Polish
- Zoom/pan controls
- Sound effects
- Micro-animations

## Contributing

This is an experimental project in the "magic" folder - feel free to iterate and experiment!

## License

MIT

---

Built with the ultrathink philosophy: craft, don't code.
