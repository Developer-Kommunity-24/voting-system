/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import LoginScreen from "./components/LoginScreen";
import AuthScreen from "./components/AuthScreen";
import RatingScreen from "./components/RatingScreen";
import ProgressScreen from "./components/ProgressScreen";
import ScannerScreen from "./components/ScannerScreen";
import CompletionScreen from "./components/CompletionScreen";

type Screen = 'login' | 'auth' | 'rating' | 'progress' | 'scanner' | 'completion';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000'

export default function App() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [synced, setSynced] = useState(false);
  const [unlockedStalls, setUnlockedStalls] = useState<string[]>(() => {
    const saved = localStorage.getItem('unlockedStalls');
    return saved ? JSON.parse(saved) : [];
  });
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('ratings');
    return saved ? JSON.parse(saved) : {};
  });
  const [currentStallId, setCurrentStallId] = useState<string | null>(null);

  const totalStalls = 5;

  const unlockStall = (id: string) => {
    setUnlockedStalls(prev => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      localStorage.setItem('unlockedStalls', JSON.stringify(next));
      return next;
    });
  };

  // Sync user to DB after Clerk sign-in
  useEffect(() => {
    if (!isSignedIn || synced) return;

    const sync = async () => {
      try {
        const token = await getToken();
        await fetch(`${API_BASE}/api/v1/user/sync`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      } catch (e) {
        console.error('User sync failed:', e);
      } finally {
        setSynced(true);
      }
    };

    sync();
  }, [isSignedIn, synced, getToken, user]);

  // Navigate based on auth state and URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const stallId = params.get('stallId');

    if (stallId) {
      setCurrentStallId(stallId);
      if (isSignedIn) {
        if (ratings[stallId] !== undefined) {
          setCurrentScreen('progress');
        } else {
          unlockStall(stallId);
          setCurrentScreen('rating');
        }
      } else {
        setCurrentScreen('login');
      }
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (isSignedIn) {
      setCurrentScreen('progress');
    } else {
      setCurrentScreen('login');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSignedIn]);

  const handleRatingSubmit = (rating: number) => {
    if (!currentStallId) return;

    const newRatings = { ...ratings, [currentStallId]: rating };
    setRatings(newRatings);
    localStorage.setItem('ratings', JSON.stringify(newRatings));

    const ratedCount = Object.keys(newRatings).length;
    if (ratedCount >= totalStalls) {
      setCurrentScreen('completion');
    } else {
      setCurrentScreen('progress');
    }
  };

  const handleScanSuccess = (decodedText: string) => {
    let stallId = decodedText;
    try {
      if (decodedText.includes('stallId=')) {
        const url = new URL(decodedText);
        stallId = url.searchParams.get('stallId') || decodedText;
      }
    } catch {
      // Not a URL, use raw value
    }

    setCurrentStallId(stallId);
    unlockStall(stallId);
    setCurrentScreen('rating');
  };

  return (
    <main className="min-h-screen bg-[#2A0040]">
      {currentScreen === 'login' && (
        <LoginScreen onStart={() => setCurrentScreen('auth')} />
      )}

      {currentScreen === 'auth' && (
        <AuthScreen />
      )}

      {currentScreen === 'scanner' && (
        <ScannerScreen
          onScanSuccess={handleScanSuccess}
          onClose={() => setCurrentScreen('progress')}
        />
      )}

      {currentScreen === 'rating' && currentStallId && (
        <RatingScreen
          stallId={currentStallId}
          onBack={() => setCurrentScreen('scanner')}
          onProgress={() => setCurrentScreen('progress')}
          onSubmitSuccess={handleRatingSubmit}
          ratedCount={Object.keys(ratings).length}
          totalCount={totalStalls}
        />
      )}

      {currentScreen === 'progress' && (
        <ProgressScreen
          unlockedStalls={unlockedStalls}
          ratings={ratings}
          onScanNext={() => setCurrentScreen('scanner')}
          totalCount={totalStalls}
          onBackToVote={() => setCurrentScreen('scanner')}
        />
      )}

      {currentScreen === 'completion' && (
        <CompletionScreen
          onClose={() => setCurrentScreen('progress')}
          onGoToProfile={() => setCurrentScreen('progress')}
          onViewLeaderboard={() => setCurrentScreen('progress')}
        />
      )}
    </main>
  );
}
