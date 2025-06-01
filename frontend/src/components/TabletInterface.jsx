import React, { useState, useEffect } from 'react';
import { RotateCcw, Wifi, WifiOff, Battery } from 'lucide-react';

const TabletInterface = ({ children }) => {
    const [orientation, setOrientation] = useState('portrait');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [batteryLevel, setBatteryLevel] = useState(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Handle orientation changes
    useEffect(() => {
        const handleOrientationChange = () => {
            const orientation = window.screen.orientation || window.orientation;
            if (orientation) {
                const angle = orientation.angle || orientation;
                setOrientation(Math.abs(angle) === 90 ? 'landscape' : 'portrait');
            }
        };

        // Initial check
        handleOrientationChange();

        // Listen for orientation changes
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('resize', handleOrientationChange);
        };
    }, []);

    // Handle online/offline status
    useEffect(() => {
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    // Battery status (if supported)
    useEffect(() => {
        if ('getBattery' in navigator) {
            navigator.getBattery().then((battery) => {
                const updateBattery = () => {
                    setBatteryLevel(Math.round(battery.level * 100));
                };

                updateBattery();
                battery.addEventListener('levelchange', updateBattery);

                return () => {
                    battery.removeEventListener('levelchange', updateBattery);
                };
            });
        }
    }, []);

    // Update time every minute
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timer);
    }, []);

    return (
        <div className={`tablet-interface ${orientation}`}>
            {/* Status Bar */}
            <StatusBar
                isOnline={isOnline}
                batteryLevel={batteryLevel}
                currentTime={currentTime}
            />

            {/* Orientation Warning */}
            {orientation === 'landscape' && <OrientationWarning />}

            {/* Offline Warning */}
            {!isOnline && <OfflineWarning />}

            {/* Main Content */}
            <div className="tablet-content">
                {children}
            </div>

            {/* Touch-friendly UI enhancements */}
            <style jsx>{`
        .tablet-interface {
          min-height: 100vh;
          font-size: 16px;
          line-height: 1.5;
          touch-action: manipulation;
          -webkit-text-size-adjust: 100%;
        }

        .tablet-interface.landscape {
          /* Landscape specific styles */
        }

        .tablet-content {
          padding-top: 40px; /* Account for status bar */
        }

        /* Touch-friendly input sizes */
        .tablet-interface input,
        .tablet-interface button,
        .tablet-interface select,
        .tablet-interface textarea {
          min-height: 48px;
          font-size: 16px;
        }

        /* Enhanced touch targets */
        .tablet-interface button {
          min-width: 48px;
          padding: 12px 20px;
        }

        /* Prevent zoom on input focus on iOS */
        .tablet-interface input,
        .tablet-interface select,
        .tablet-interface textarea {
          font-size: 16px !important;
        }

        /* Smooth scrolling */
        .tablet-interface {
          -webkit-overflow-scrolling: touch;
          scroll-behavior: smooth;
        }

        /* Hide scrollbars on tablet */
        .tablet-interface::-webkit-scrollbar {
          display: none;
        }

        /* Focus styles for accessibility */
        .tablet-interface *:focus {
          outline: 2px solid #3B82F6;
          outline-offset: 2px;
        }

        /* Prevent text selection on UI elements */
        .tablet-interface button,
        .tablet-interface .no-select {
          -webkit-user-select: none;
          -moz-user-select: none;
          -ms-user-select: none;
          user-select: none;
        }
      `}</style>
        </div>
    );
};

// Status Bar Component
const StatusBar = ({ isOnline, batteryLevel, currentTime }) => {
    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-gray-900 text-white px-4 py-1 flex justify-between items-center text-sm">
            <div className="flex items-center space-x-3">
                <span className="font-medium">Clinica Dentară</span>
                {!isOnline && (
                    <span className="text-red-400 text-xs">Offline</span>
                )}
            </div>

            <div className="flex items-center space-x-3">
        <span className="text-xs">
          {currentTime.toLocaleTimeString('ro-RO', {
              hour: '2-digit',
              minute: '2-digit'
          })}
        </span>

                {/* Connection Status */}
                {isOnline ? (
                    <Wifi className="w-4 h-4" />
                ) : (
                    <WifiOff className="w-4 h-4 text-red-400" />
                )}

                {/* Battery Level */}
                {batteryLevel !== null && (
                    <div className="flex items-center">
                        <Battery className={`w-4 h-4 ${batteryLevel < 20 ? 'text-red-400' : ''}`} />
                        <span className="text-xs ml-1">{batteryLevel}%</span>
                    </div>
                )}
            </div>
        </div>
    );
};

// Orientation Warning Component
const OrientationWarning = () => {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <div className="fixed inset-0 z-40 bg-black bg-opacity-75 flex items-center justify-center p-6">
            <div className="bg-white rounded-2xl p-8 max-w-md text-center">
                <RotateCcw className="w-16 h-16 text-blue-600 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Orientare optimă
                </h3>
                <p className="text-gray-600 mb-6">
                    Pentru o experiență optimă, vă recomandăm să țineți tableta în poziție verticală (portret).
                </p>
                <button
                    onClick={() => setDismissed(true)}
                    className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700"
                >
                    Am înțeles
                </button>
            </div>
        </div>
    );
};

// Offline Warning Component
const OfflineWarning = () => {
    return (
        <div className="fixed top-10 left-4 right-4 z-40 bg-red-500 text-white p-3 rounded-xl shadow-lg">
            <div className="flex items-center justify-center">
                <WifiOff className="w-5 h-5 mr-2" />
                <span className="text-sm font-medium">
          Conexiune întreruptă. Datele vor fi salvate local.
        </span>
            </div>
        </div>
    );
};

// Touch Gesture Handler Component
export const TouchGestureHandler = ({ children, onSwipeLeft, onSwipeRight }) => {
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    const minSwipeDistance = 50;

    const onTouchStart = (e) => {
        setTouchEnd(null);
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe && onSwipeLeft) {
            onSwipeLeft();
        }
        if (isRightSwipe && onSwipeRight) {
            onSwipeRight();
        }
    };

    return (
        <div
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className="h-full w-full"
        >
            {children}
        </div>
    );
};

// Tablet-optimized Modal Component
export const TabletModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center"
                        >
                            ✕
                        </button>
                    </div>
                </div>
                <div className="p-6">
                    {children}
                </div>
            </div>
        </div>
    );
};

// Loading Spinner Component for Tablet
export const TabletLoader = ({ message = "Se încarcă..." }) => {
    return (
        <div className="fixed inset-0 z-50 bg-white bg-opacity-90 flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600 text-lg">{message}</p>
            </div>
        </div>
    );
};

export default TabletInterface;