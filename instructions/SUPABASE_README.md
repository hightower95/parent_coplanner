# Supabase Setup Instructions

## 1. Create the Database Table

Go to your Supabase dashboard at https://supabase.com/dashboard and navigate to your project.

1. Click on "SQL Editor" in the left sidebar
2. Copy and paste the contents of `supabase-setup.sql` into the SQL editor
3. Click "Run" to execute the SQL

This will create:
- The `active_users` table with all necessary columns
- Indexes for performance
- Row Level Security policies
- Automatic timestamp updates

## 2. Environment Variables

The `.env.local` file has been created with your Supabase credentials. Make sure these are set correctly:

```
NEXT_PUBLIC_SUPABASE_URL=https://llqvfhwjkvlceazmpxqh.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_tUEH2T3LCe9k-f6t5vtS9g_8nbf-Vfx
```

## 3. How It Works

- When a user clicks "Activate", their status is stored in the `active_users` table
- The app polls every 30 seconds to:
  - Update the user's "last seen" timestamp (keeping them active)
  - Refresh the list of other active users
- Users are automatically marked as inactive after 30 minutes of inactivity
- The Activity view shows all currently active users (excluding yourself)

## 4. Next Steps

For a production app, you should:

1. **Add Authentication**: Replace the mock user data with real user authentication
2. **User Management**: Create user profiles and group management
3. **Real-time Updates**: Use Supabase's real-time subscriptions instead of polling
4. **Security**: Implement proper RLS policies based on user authentication

## 5. Testing

1. Run the app: `npm run dev`
2. Navigate to the Activity tab
3. Click "Activate" to see yourself in the active users list
4. Open another browser/incognito window to test with multiple users