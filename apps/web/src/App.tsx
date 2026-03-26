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

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export default function App() {
  const { isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [synced, setSynced] = useState(false);
  const [serverProgress, setServerProgress] = useState(0);
  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('ratings');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [ratedStalls, setRatedStalls] = useState<Array<{stallId: number, stallName: string, rating: number}>>(() => {
    const saved = localStorage.getItem('ratedStalls');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentStallData, setCurrentStallData] = useState<{ id: number, name: string, description: string, logo: string } | null>(null);

  const totalStalls = 13;

  // Sync user to DB after Clerk sign-in and fetch true progress
  useEffect(() => {
    if (!isSignedIn || synced || !user) return;

    const sync = async () => {
      try {
        const token = await getToken();
        await fetch(`${API_BASE}/api/v1/user/sync`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
        
        const progRes = await fetch(`${API_BASE}/api/v1/progress/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const progJson = await progRes.json();
        
        if (progJson && typeof progJson.progress === 'number') {
          setServerProgress(progJson.progress);
          
          if (progJson.ratings && Array.isArray(progJson.ratings)) {
            const fetchedRatings: Record<string, number> = {};
            const fetchedStalls: Array<{stallId: number, stallName: string, rating: number}> = [];
            
            progJson.ratings.forEach((r: any) => {
              fetchedRatings[r.stallId] = r.rating;
              fetchedStalls.push({ stallId: r.stallId, stallName: r.stallName, rating: r.rating });
            });
            
            setRatings(fetchedRatings);
            setRatedStalls(fetchedStalls);
            localStorage.setItem('ratings', JSON.stringify(fetchedRatings));
            localStorage.setItem('ratedStalls', JSON.stringify(fetchedStalls));
          } else {
             // If DB has 0 ratings, wipe the local cache to be completely accurate!
             setRatings({});
             setRatedStalls([]);
             localStorage.setItem('ratings', JSON.stringify({}));
             localStorage.setItem('ratedStalls', JSON.stringify([]));
          }
        }
      } catch (e) {
        console.error('User sync or progress fetch failed:', e);
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
      if (isSignedIn) {
        if (ratings[stallId] !== undefined) {
          setCurrentScreen('progress');
        } else {
          // In an ideal world we'd fetch the stall here too if launching from URL directly,
          // but if we don't have the stall data, we might need to fetch it.
          // For simplicity, we just force them to the scanner to fetch it properly.
          setCurrentScreen('scanner');
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

  const handleRatingSubmit = async (rating: number) => {
    if (!currentStallData) return;

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ stallId: currentStallData.id, rating })
      });
      const json = await res.json();

      if (json.success) {
        const newRatings = { ...ratings, [currentStallData.id]: rating };
        setRatings(newRatings);
        localStorage.setItem('ratings', JSON.stringify(newRatings));
        
        setRatedStalls(prev => {
          const exists = prev.find(s => s.stallId === currentStallData.id);
          const updated = exists 
            ? prev.map(s => s.stallId === currentStallData.id ? { ...s, rating } : s)
            : [...prev, { stallId: currentStallData.id, stallName: currentStallData.name, rating }];
          localStorage.setItem('ratedStalls', JSON.stringify(updated));
          return updated;
        });
        
        setServerProgress(prev => {
          const next = prev + 1;
          if (next >= totalStalls) {
            setCurrentScreen('completion');
          } else {
            setCurrentScreen('progress');
          }
          return next;
        });
      } else {
        alert(json.message || "Failed to cast vote");
        setCurrentScreen('progress');
      }
    } catch (e) {
      console.error(e);
      alert("Network error while casting vote");
      setCurrentScreen('progress');
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    let stallSlug = decodedText.trim();
    
    // Extremely robust parser that organically supports ANY domain name forever.
    // E.g., "dk24.org/stall-1", "https://new-domain.com/stall-1", or "?stallId=stall-1"
    try {
      // Ensure the string looks like a URL so the URL parser doesn't crash on raw text
      const urlToParse = stallSlug.includes('://') ? stallSlug : `https://${stallSlug}`;
      const url = new URL(urlToParse);
      
      if (url.searchParams.has('stallId')) {
        stallSlug = url.searchParams.get('stallId') || decodedText;
      } else {
        // Extract the very last segment of the path (instantly ignores the domain)
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          stallSlug = pathSegments[pathSegments.length - 1];
        } else {
          stallSlug = decodedText; // Fallback to raw string
        }
      }
    } catch {
      // Fallback if URL parsing fails entirely
      const parts = stallSlug.split('?')[0].split('/').filter(Boolean);
      stallSlug = parts[parts.length - 1] || decodedText;
    }

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/stalls/${stallSlug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();
      
      if (json.success && json.data) {
        setCurrentStallData(json.data);
        
        if (ratings[json.data.id] !== undefined) {
          alert("You have already rated this stall!");
          setCurrentScreen('progress');
        } else {
          setCurrentScreen('rating');
        }
      } else {
        alert("Invalid Stall QR or stall not found.");
        setCurrentScreen('progress');
      }
    } catch (e) {
      console.error(e);
      alert("Network error fetching stall details");
      setCurrentScreen('progress');
    }
  };

  return (
    <main className="min-h-screen bg-[#2A0040] flex flex-col">
      <div className="flex-grow flex flex-col relative">
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

        {currentScreen === 'rating' && currentStallData && (
          <RatingScreen
            stallData={currentStallData}
            onBack={() => setCurrentScreen('scanner')}
            onProgress={() => setCurrentScreen('progress')}
            onSubmitSuccess={handleRatingSubmit}
            ratedCount={serverProgress}
            totalCount={totalStalls}
          />
        )}

        {currentScreen === 'progress' && (
          <ProgressScreen
            ratings={ratings}
            ratedStalls={ratedStalls}
            onScanNext={() => setCurrentScreen('scanner')}
            totalCount={totalStalls}
            serverProgress={serverProgress}
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
      </div>
    </main>
  );
}
