export interface UserProfile {
  id: string
  user_id: string
  chronotype: 'morning' | 'evening' | 'flexible'
  work_type: string
  productivity_killers: string[]
  hobbies: string[]
  wellness_goals: string[]
  long_term_goals: string[]
}

export interface TimeBlock {
  id: string
  user_id: string
  title: string
  category: 'work' | 'study' | 'health' | 'personal' | 'rest'
  start_time: string
  end_time: string
  weekdays: number[]
  is_base_routine: boolean
}

export interface Habit {
  id: string
  user_id: string
  title: string
  category: string
  frequency: 'daily' | 'weekly'
  is_active: boolean
}

export interface Task {
  id: string
  user_id: string
  title: string
  due_date: string
  completed: boolean
  priority: 'low' | 'medium' | 'high'
}

export interface HabitLog {
  id: string
  habit_id: string
  user_id: string
  log_date: string
  completed: boolean
  completed_at: string | null
}

export interface TimeBlockWithStatus extends TimeBlock {
  is_current: boolean
  is_past: boolean
}