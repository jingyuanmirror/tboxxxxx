'use client';

import { useState, useEffect, useCallback } from 'react';

export type OnboardingStage =
  | 'new_user'
  | 'introduced'
  | 'first_task_started'
  | 'first_task_done'
  | 'growing';

export interface UserProfile {
  name: string;
  occupation: string;
  useCases: string[];
  aiName?: string;
}

export interface OnboardingState {
  stage: OnboardingStage;
  profile: UserProfile | null;
  completedTaskTypes: string[];
  firstSeenAt: string;
  graduatedAt?: string;
  introSkipped?: boolean;
}

const STORAGE_KEY = 'tbox_onboarding_state';

const FEATURE_UNLOCK_MAP: Record<string, OnboardingStage[]> = {
  history:   ['first_task_started', 'first_task_done', 'growing'],
  knowledge: ['introduced', 'first_task_started', 'first_task_done', 'growing'],
  market:    ['first_task_done', 'growing'],
  scheduled: ['first_task_done', 'growing'],
};

function defaultState(): OnboardingState {
  return {
    stage: 'new_user',
    profile: null,
    completedTaskTypes: [],
    firstSeenAt: new Date().toISOString(),
  };
}

function loadState(): OnboardingState {
  if (typeof window === 'undefined') return defaultState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    return JSON.parse(raw) as OnboardingState;
  } catch {
    return defaultState();
  }
}

function saveState(s: OnboardingState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (_) {}
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(defaultState);

  // Always start fresh on page load (state is not restored from localStorage)

  const update = useCallback((partial: Partial<OnboardingState>) => {
    setState(prev => {
      const next = { ...prev, ...partial };
      saveState(next);
      return next;
    });
  }, []);

  const saveProfile = useCallback((profile: UserProfile) => {
    update({ profile, stage: 'introduced' });
  }, [update]);

  const skipIntro = useCallback(() => {
    update({ introSkipped: true });
  }, [update]);

  const markTaskStarted = useCallback(() => {
    setState(prev => {
      if (prev.stage === 'new_user' || prev.stage === 'introduced') {
        const next = { ...prev, stage: 'first_task_started' as OnboardingStage };
        saveState(next);
        return next;
      }
      return prev;
    });
  }, []);

  const markTaskDone = useCallback((taskType: string) => {
    setState(prev => {
      const types = prev.completedTaskTypes.includes(taskType)
        ? prev.completedTaskTypes
        : [...prev.completedTaskTypes, taskType];
      const stage: OnboardingStage =
        types.length >= 3 ? 'growing' : 'first_task_done';
      const next = { ...prev, completedTaskTypes: types, stage };
      saveState(next);
      return next;
    });
  }, []);

  const graduate = useCallback(() => {
    update({ stage: 'growing', graduatedAt: new Date().toISOString() });
  }, [update]);

  const isFeatureUnlocked = useCallback(
    (feature: 'history' | 'knowledge' | 'market' | 'scheduled'): boolean => {
      const allowed = FEATURE_UNLOCK_MAP[feature] ?? [];
      return allowed.includes(state.stage);
    },
    [state.stage]
  );

  return {
    stage: state.stage,
    profile: state.profile,
    completedTaskTypes: state.completedTaskTypes,
    introSkipped: state.introSkipped ?? false,
    saveProfile,
    skipIntro,
    markTaskStarted,
    markTaskDone,
    graduate,
    isFeatureUnlocked,
  };
}
