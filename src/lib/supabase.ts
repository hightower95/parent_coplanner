import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface User {
  id: string
  name: string
  groups: string[]
  is_active: boolean
  last_activated_at: string | null
  created_at: string
  updated_at: string
}

// Helper functions for Users table
export const usersApi = {
  // Get all currently active users (those who activated in the last 30 minutes)
  async getActiveUsers(): Promise<User[]> {
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000).toISOString()
    
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('is_active', true)
      .gte('last_activated_at', thirtyMinutesAgo)
      .order('last_activated_at', { ascending: false })

    if (error) {
      console.error('Error fetching active users:', error)
      return []
    }

    return data || []
  },

  // Get a user record by ID
  async getUserById(userId: string): Promise<User | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user by id:', error)
      return null
    }

    return data || null
  },

  // Get current user's activation status
  async getUserActivationStatus(userId: string): Promise<boolean> {
    const user = await this.getUserById(userId)
    if (!user || !user.is_active || !user.last_activated_at) {
      return false
    }

    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000)
    return new Date(user.last_activated_at) > thirtyMinutesAgo
  },

  // Save or update a user record without activating them yet
  async upsertUser(userId: string, name: string, groups: string[]): Promise<boolean> {
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        name,
        groups,
        is_active: false,
        last_activated_at: null,
        updated_at: now
      }, {
        onConflict: 'id'
      })

    if (error) {
      console.error('Error upserting user:', error)
      return false
    }

    return true
  },

  // Set user as active
  async setUserActive(userId: string, name: string, groups: string[]): Promise<boolean> {
    const now = new Date().toISOString()
    
    const { error } = await supabase
      .from('users')
      .upsert({
        id: userId,
        name,
        groups,
        is_active: true,
        last_activated_at: now,
        updated_at: now
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
    const now = new Date().toISOString()
    
    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: now
      })
      .eq('id', userId)

    if (error) {
      console.error('Error setting user inactive:', error)
      return false
    }

    return true
  },

  // Update user's last activated timestamp (keep-alive)
  async updateLastActivated(userId: string): Promise<boolean> {
    const now = new Date().toISOString()
    
    const { error } = await supabase
      .from('users')
      .update({
        last_activated_at: now,
        updated_at: now
      })
      .eq('id', userId)
      .eq('is_active', true)

    if (error) {
      console.error('Error updating last activated:', error)
      return false
    }

    return true
  }
}