# Ticket Manager MVP

A Single Page Application (SPA) for managing ticket sales, built with Next.js, Tailwind CSS, and Supabase.

## Tech Stack
- **Framework**: Next.js (App Router)
- **Styling**: Tailwind CSS v4 (Glassmorphism design)
- **Database**: Supabase
- **Icons**: Lucide React
- **Exports**: XLSX (SheetJS)

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up Environment Variables:
   Create a `.env.local` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

## Deployment to Vercel

1. Push this code to a GitHub repository.
2. Go to [Vercel](https://vercel.com) and import the project.
3. **Important**: In the Vercel "Environment Variables" section during import, you must add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Features
- **Dynamic Forms**: Auto-generated fields based on ticket capacity.
- **Validation**: Enforces mandatory fields (Name/RUT).
- **Export**: Downloads 'Door List' and 'Financial Report' as Excel files.
- **Persistence**: Real-time cloud storage via Supabase.
