import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

const ProfileContext = createContext();

export const useProfile = () => {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
};

export const ProfileProvider = ({ children }) => {
  const [profile, setProfile] = useState(null);
  const [workoutCount, setWorkoutCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const loadProfileData = async (userId) => {
    if (!userId || hasLoaded) return;
    
    setLoading(true);
    try {
      // Load profile data
      const { data: prof, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError && profileError.code === 'PGRST116') {
        // Profile doesn't exist, create it
        const { data: newProf } = await supabase
          .from('profiles')
          .insert({ id: userId, email: (await supabase.auth.getUser()).data.user?.email })
          .select()
          .single();
        setProfile(newProf || { id: userId });
      } else if (prof) {
        setProfile(prof);
      } else {
        setProfile({ id: userId });
      }

      // Load workout count
      const { count } = await supabase
        .from('workouts')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId);
      setWorkoutCount(count || 0);

      setHasLoaded(true);
    } catch (error) {
      // Silent error handling
      setProfile({ id: userId });
      setWorkoutCount(0);
      setHasLoaded(true);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const updateWorkoutCount = (newCount) => {
    setWorkoutCount(newCount);
  };

  const resetProfile = () => {
    setProfile(null);
    setWorkoutCount(0);
    setLoading(false);
    setHasLoaded(false);
  };

  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadProfileData(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        resetProfile();
      }
    });

    // Load initial profile if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadProfileData(session.user.id);
      }
    });

    return () => {
      listener?.subscription.unsubscribe();
    };
  }, []);

  const value = {
    profile,
    workoutCount,
    loading,
    hasLoaded,
    updateProfile,
    updateWorkoutCount,
    loadProfileData,
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}; 