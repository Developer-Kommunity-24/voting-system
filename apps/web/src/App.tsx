/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/react";
import LoginScreen from "./components/LoginScreen";
import AuthScreen from "./components/AuthScreen";
import ProgressScreen from "./components/ProgressScreen";
import ScannerScreen from "./components/ScannerScreen";
import CompletionScreen from "./components/CompletionScreen";
import RatingScreen from "./components/RatingScreen";

type Screen = 'login' | 'auth' | 'rating' | 'progress' | 'scanner' | 'completion';

const API_BASE = (import.meta.env.VITE_API_URL ?? 'http://localhost:8000').replace(/\/$/, '');

export default function App() {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();

  const [currentScreen, setCurrentScreen] = useState<Screen>('login');
  const [synced, setSynced] = useState(false);
  const [serverProgress, setServerProgress] = useState(0);
  const [feedbackModal, setFeedbackModal] = useState<{ title: string, message: string, type: 'success' | 'error' } | null>(null);

  const [ratings, setRatings] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem('ratings');
    return saved ? JSON.parse(saved) : {};
  });
  
  const [ratedStalls, setRatedStalls] = useState<Array<{stallId: number, stallName: string, rating: number}>>(() => {
    const saved = localStorage.getItem('ratedStalls');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentStallData, setCurrentStallData] = useState<{ id: number, name: string, description: string, logo: string } | null>(null);

  const totalStalls = 11;

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
            
            progJson.ratings.forEach((r: { stallId: number, stallName: string, rating: number }) => {
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
    let stallId = params.get('stallId');

    if (!stallId && window.location.pathname !== '/' && window.location.pathname !== '') {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        stallId = pathSegments[pathSegments.length - 1];
      }
    }

    if (stallId) {
      if (isSignedIn) {
        // Automatically verify and navigate to the stall
        const fetchStallFromUrl = async () => {
          try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/api/v1/stalls/${stallId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();
            
            if (json.success && json.data) {
              setCurrentStallData(json.data);
              
              if (ratings[json.data.id] !== undefined) {
                setFeedbackModal({
                  title: "Already Rated",
                  message: "You have already submitted a rating for this stall. Please scan a different stall's QR code to continue voting!",
                  type: 'error'
                });
                setCurrentScreen('progress');
              } else {
              setCurrentScreen('rating');
              }
            } else {
              setFeedbackModal({
                title: "Invalid Stall Link",
                message: "The link you followed does not belong to a valid stall for this event.",
                type: 'error'
              });
              setCurrentScreen('progress');
            }
          } catch (e) {
            console.error(e);
            setFeedbackModal({
              title: "Connection Error",
              message: "Failed to connect. Please check your internet connection.",
              type: 'error'
            });
            setCurrentScreen('progress');
          }
        };

        setCurrentScreen('progress'); // Show loading state
        fetchStallFromUrl();
        window.history.replaceState({}, document.title, '/');
      } else {
        setCurrentScreen('login');
      }
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
          
          setFeedbackModal({
            title: "Vote Recorded!",
            message: `You successfully rated ${currentStallData.name}! Your progress has been updated.`,
            type: 'success'
          });

          if (next >= totalStalls) {
            setCurrentScreen('completion');
          } else {
            setCurrentScreen('progress');
          }
          return next;
        });
      } else {
        setFeedbackModal({
          title: "Submission Failed",
          message: json.message || "We couldn't record your vote. Please try again in a moment.",
          type: 'error'
        });
        setCurrentScreen('progress');
      }
    } catch (e) {
      console.error(e);
      setFeedbackModal({
        title: "Connection Error",
        message: "Failed to securely connect to the voting servers. Please check your internet connection and try again.",
        type: 'error'
      });
      setCurrentScreen('progress');
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    let stallSlug = decodedText.trim();
    
    try {
      const urlToParse = stallSlug.includes('://') ? stallSlug : `https://${stallSlug}`;
      const url = new URL(urlToParse);
      
      if (url.searchParams.has('stallId')) {
        stallSlug = url.searchParams.get('stallId') || decodedText;
      } else {
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          stallSlug = pathSegments[pathSegments.length - 1];
        } else {
          stallSlug = decodedText;
        }
      }
    } catch {
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
          setFeedbackModal({
            title: "Already Rated",
            message: "You have already submitted a rating for this stall. Please scan a different stall's QR code to continue voting!",
            type: 'error'
          });
          setCurrentScreen('progress');
        } else {
        setCurrentScreen('rating');
        }
      } else {
        setFeedbackModal({
          title: "Invalid Stall",
          message: "The QR code you scanned does not belong to a valid stall for this event.",
          type: 'error'
        });
        setCurrentScreen('progress');
      }
    } catch (e) {
      console.error(e);
      setFeedbackModal({
        title: "Connection Error",
        message: "Failed to securely connect to the rating servers. Please check your internet connection and try again.",
        type: 'error'
      });
      setCurrentScreen('progress');
    }
  };

  if (!isLoaded) {
    return (
      <main className="min-h-screen bg-[#fffff] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-black/20 border-t-black rounded-full animate-spin"></div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#2A0040] flex flex-col">
      <div className="flex-grow flex flex-col relative">
        {/* Global Feedback Modal */}
        {feedbackModal && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl relative animate-in fade-in zoom-in duration-200 border border-slate-100">
              <div className={`
                w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6
                ${feedbackModal.type === 'success' ? 'bg-emerald-100' : 'bg-rose-100'}
              `}>
                <span className="text-2xl">
                  {feedbackModal.type === 'success' ? '✅' : '⚠️'}
                </span>
              </div>
              <h3 className="text-xl font-bold text-center text-slate-800 mb-2 font-display">{feedbackModal.title}</h3>
              <p className="text-slate-500 text-center text-sm font-medium mb-8 leading-relaxed px-2">
                {feedbackModal.message}
              </p>
              <button
                onClick={() => setFeedbackModal(null)}
                className={`
                  w-full text-white font-bold py-4 rounded-2xl transition-all shadow-lg font-display tracking-wider
                  ${feedbackModal.type === 'success' 
                    ? 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20' 
                    : 'bg-[#FF2D55] hover:bg-[#E0264A] shadow-red-500/20'}
                `}
              >
                {feedbackModal.type === 'success' ? 'CONTINUE VOTING' : 'CLOSE'}
              </button>
            </div>
          </div>
        )}

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
            
          />
        )}

        {currentScreen === 'completion' && (
          <CompletionScreen
            onClose={() => setCurrentScreen('progress')}
          />
        )}
      </div>
    </main>
  );
}