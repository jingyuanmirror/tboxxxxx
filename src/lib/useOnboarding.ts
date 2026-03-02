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
  visitedDiscovery: string[];
  firstSeenAt: string;
  graduatedAt?: string;
  introSkipped?: boolean;
}

const STORAGE_KEY = 'tbox_onboarding_state';

// Module-level cache: survives React component mount/unmount within the same
// browser session, but is reset on a full page reload (unlike localStorage).
let _sessionCache: OnboardingState | null = null;

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
    visitedDiscovery: [],
    firstSeenAt: new Date().toISOString(),
  };
}

function saveState(s: OnboardingState) {
  _sessionCache = s;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (_) {}
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>(() => _sessionCache ?? defaultState());

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
    const current = _sessionCache ?? defaultState();
    if (current.stage === 'new_user' || current.stage === 'introduced') {
      const next = { ...current, stage: 'first_task_started' as OnboardingStage };
      saveState(next);
      setState(next);
    }
  }, []);

  const markTaskDone = useCallback((taskType: string) => {
    const current = _sessionCache ?? defaultState();
    const types = current.completedTaskTypes.includes(taskType)
      ? current.completedTaskTypes
      : [...current.completedTaskTypes, taskType];
    const stage: OnboardingStage = types.length >= 3 ? 'growing' : 'first_task_done';
    const next = { ...current, completedTaskTypes: types, stage };
    saveState(next);
    setState(next);
  }, []);

  const markDiscoveryVisited = useCallback((id: string) => {
    setState(prev => {
      if ((prev.visitedDiscovery ?? []).includes(id)) return prev;
      const next = { ...prev, visitedDiscovery: [...(prev.visitedDiscovery ?? []), id] };
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
    visitedDiscovery: state.visitedDiscovery ?? [],
    introSkipped: state.introSkipped ?? false,
    saveProfile,
    skipIntro,
    markTaskStarted,
    markTaskDone,
    markDiscoveryVisited,
    graduate,
    isFeatureUnlocked,
  };
}
