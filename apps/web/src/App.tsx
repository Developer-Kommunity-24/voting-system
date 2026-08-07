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
  
  const [ratedItems, setRatedItems] = useState<Array<{itemId: number, itemName: string, rating: number}>>(() => {
    const saved = localStorage.getItem('ratedItems');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentItemData, setCurrentItemData] = useState<{ id: number, name: string, description: string, logo: string } | null>(null);

  const totalItems = 11;

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
            const fetchedItems: Array<{itemId: number, itemName: string, rating: number}> = [];

            progJson.ratings.forEach((r: { itemId: number, itemName: string, rating: number }) => {
              fetchedRatings[r.itemId] = r.rating;
              fetchedItems.push({ itemId: r.itemId, itemName: r.itemName, rating: r.rating });
            });

            setRatings(fetchedRatings);
            setRatedItems(fetchedItems);
            localStorage.setItem('ratings', JSON.stringify(fetchedRatings));
            localStorage.setItem('ratedItems', JSON.stringify(fetchedItems));
          } else {
             // If DB has 0 ratings, wipe the local cache to be completely accurate!
             setRatings({});
             setRatedItems([]);
             localStorage.setItem('ratings', JSON.stringify({}));
             localStorage.setItem('ratedItems', JSON.stringify([]));
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
    let itemId = params.get('itemId');

    if (!itemId && window.location.pathname !== '/' && window.location.pathname !== '') {
      const pathSegments = window.location.pathname.split('/').filter(Boolean);
      if (pathSegments.length > 0) {
        itemId = pathSegments[pathSegments.length - 1];
      }
    }

    if (itemId) {
      if (isSignedIn) {
        // Automatically verify and navigate to the item
        const fetchItemFromUrl = async () => {
          try {
            const token = await getToken();
            const res = await fetch(`${API_BASE}/api/v1/items/${itemId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            const json = await res.json();

            if (json.success && json.data) {
              setCurrentItemData(json.data);

              if (ratings[json.data.id] !== undefined) {
                setFeedbackModal({
                  title: "Already Rated",
                  message: "You have already submitted a rating for this item. Please scan a different item's QR code to continue voting!",
                  type: 'error'
                });
                setCurrentScreen('progress');
              } else {
              setCurrentScreen('rating');
              }
            } else {
              setFeedbackModal({
                title: "Invalid Item Link",
                message: "The link you followed does not belong to a valid item for this event.",
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
        fetchItemFromUrl();
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
    if (!currentItemData) return;

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ itemId: currentItemData.id, rating })
      });
      const json = await res.json();

      if (json.success) {
        const newRatings = { ...ratings, [currentItemData.id]: rating };
        setRatings(newRatings);
        localStorage.setItem('ratings', JSON.stringify(newRatings));

        setRatedItems(prev => {
          const exists = prev.find(i => i.itemId === currentItemData.id);
          const updated = exists
            ? prev.map(i => i.itemId === currentItemData.id ? { ...i, rating } : i)
            : [...prev, { itemId: currentItemData.id, itemName: currentItemData.name, rating }];
          localStorage.setItem('ratedItems', JSON.stringify(updated));
          return updated;
        });
        
        setServerProgress(prev => {
          const next = prev + 1;
          
          setFeedbackModal({
            title: "Vote Recorded!",
            message: `You successfully rated ${currentItemData.name}! Your progress has been updated.`,
            type: 'success'
          });

          if (next >= totalItems) {
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
    let itemSlug = decodedText.trim();

    try {
      const urlToParse = itemSlug.includes('://') ? itemSlug : `https://${itemSlug}`;
      const url = new URL(urlToParse);

      if (url.searchParams.has('itemId')) {
        itemSlug = url.searchParams.get('itemId') || decodedText;
      } else {
        const pathSegments = url.pathname.split('/').filter(Boolean);
        if (pathSegments.length > 0) {
          itemSlug = pathSegments[pathSegments.length - 1];
        } else {
          itemSlug = decodedText;
        }
      }
    } catch {
      const parts = itemSlug.split('?')[0].split('/').filter(Boolean);
      itemSlug = parts[parts.length - 1] || decodedText;
    }

    try {
      const token = await getToken();
      const res = await fetch(`${API_BASE}/api/v1/items/${itemSlug}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const json = await res.json();

      if (json.success && json.data) {
        setCurrentItemData(json.data);

        if (ratings[json.data.id] !== undefined) {
          setFeedbackModal({
            title: "Already Rated",
            message: "You have already submitted a rating for this item. Please scan a different item's QR code to continue voting!",
            type: 'error'
          });
          setCurrentScreen('progress');
        } else {
        setCurrentScreen('rating');
        }
      } else {
        setFeedbackModal({
          title: "Invalid Item",
          message: "The QR code you scanned does not belong to a valid item for this event.",
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

        {currentScreen === 'rating' && currentItemData && (
          <RatingScreen
            itemData={currentItemData}
            onSubmitSuccess={handleRatingSubmit}
            ratedCount={serverProgress}
            totalCount={totalItems}
          />
        )}

        {currentScreen === 'progress' && (
          <ProgressScreen
            ratings={ratings}
            ratedItems={ratedItems}
            onScanNext={() => setCurrentScreen('scanner')}
            totalCount={totalItems}
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