import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface ActiveUser {
  id: string
  name: string
  groups: string[]
  is_active: boolean
  last_seen: string
  created_at: string
  updated_at: string
}

// Helper functions for ActiveUsers table
export const activeUsersApi = {
  // Get all active users
  async getActiveUsers(): Promise<ActiveUser[]> {
    const { data, error } = await supabase
      .from('active_users')
      .select('*')
      .eq('is_active', true)
      .order('last_seen', { ascending: false })

    if (error) {
      console.error('Error fetching active users:', error)
      return []
    }

    return data || []
  },

  // Set user as active
  async setUserActive(userId: string, name: string, groups: string[]): Promise<boolean> {
    const { error } = await supabase
      .from('active_users')
      .upsert({
        id: userId,
        name,
        groups,
        is_active: true,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Error setting user active:', error)
      return false
    }

    return true
  },

  // Set user as inactive
  async setUserInactive(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('active_users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error setting user inactive:', error)
      return false
    }

    return true
  },

  // Update user's last seen timestamp
  async updateLastSeen(userId: string): Promise<boolean> {
    const { error } = await supabase
      .from('active_users')
      .update({
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      console.error('Error updating last seen:', error)
      return false
    }

    return true
  }
}