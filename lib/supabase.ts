import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://ryjkpaiknsnjyydxwugl.supabase.co'
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ5amtwYWlrbnNuanl5ZHh3dWdsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1NDQ2NjksImV4cCI6MjA3MzEyMDY2OX0.ujF6dlHe-mg9lKsaf-UICaeVJhZjTZf4XBP5pUusBCc'

export const supabase = createClient(supabaseUrl, supabaseKey)
