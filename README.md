# Mandi Counter 🍛

A premium, mobile-first web application designed to track shared Mandi (and other meal) expenses with ease. Built with a focus on high-end aesthetics, smooth animations, and real-time data synchronization.

## ✨ Features

- **Expense Tracking**: Easily log meal expenses, including location, total amount, number of people, and notes.
- **Smart Analytics**: Beautiful data visualizations showing spending trends and location distributions.
- **Real-time Sync**: Powered by Supabase for instantaneous data updates across devices.
- **Premium UI**: 
  - Glassmorphism design language.
  - Fluid page transitions and micro-animations with Framer Motion.
  - Haptic feedback and subtle sound effects for a tactile feel.
- **Profile Management**:
  - Update personal details (Name, Gender).
  - Secure Email and Password updates.
  - Global theme management (Light, Dark, System modes).
- **History & Search**: Easily browse and search through past entries.

## 🚀 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Recharts
- **Backend/DB**: Supabase (PostgreSQL + Real-time)
- **OCR**: Tesseract.js (for future bill scanning capabilities)

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- A Supabase project

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd mandi-counter
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

### Database Schema

Run the following SQL in your Supabase SQL Editor:

```sql
-- Mandi Entries Table
CREATE TABLE public.mandi_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  number_of_people INTEGER NOT NULL,
  per_person_cost NUMERIC NOT NULL,
  date DATE DEFAULT CURRENT_DATE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Profiles Table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  gender TEXT,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.mandi_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add policies...
```

## 📖 Key Project Structure

- `src/components`: UI components and page views.
- `src/context`: React Contexts for global state management (Theme, Data).
- `src/hooks`: Custom hooks for Auth, Data fetching, and polish (Haptics, Sound).
- `src/lib`: Third-party client initializations (Supabase).
- `src/utils`: Helper functions for calculations, date formatting, etc.

## 🤝 Contributing

This project is built as a portfolio-quality demonstration of modern web technologies. Feel free to explore and adapt!

---
