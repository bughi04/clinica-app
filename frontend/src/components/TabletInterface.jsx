import React, { useState, useEffect } from 'react';
import { RotateCcw, Wifi, WifiOff, Battery } from 'lucide-react';
import './tablet-interface.css';

const TabletInterface = ({ children }) => {
    const [orientation, setOrientation] = useState('portrait');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    // const [batteryLevel, setBatteryLevel] = useState(null);
    // const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const handleOrientationChange = () => {
            const orientation = window.screen.orientation || window.orientation;
            if (orientation) {
                const angle = orientation.angle || orientation;
                setOrientation(Math.abs(angle) === 90 ? 'landscape' : 'portrait');
            }
        };

        handleOrientationChange();
        window.addEventListener('orientationchange', handleOrientationChange);
        window.addEventListener('resize', handleOrientationChange);

        return () => {
            window.removeEventListener('orientationchange', handleOrientationChange);
            window.removeEventListener('resize', handleOrientationChange);
        };
    }, []);

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

    // useEffect(() => {
    //     if ('getBattery' in navigator) {
    //         navigator.getBattery().then((battery) => {
    //             const updateBattery = () => {
    //                 setBatteryLevel(Math.round(battery.level * 100));
    //             };
    //
    //             updateBattery();
    //             battery.addEventListener('levelchange', updateBattery);
    //
    //             return () => {
    //                 battery.removeEventListener('levelchange', updateBattery);
    //             };
    //         });
    //     }
    // }, []);

    // useEffect(() => {
    //     const timer = setInterval(() => {
    //         setCurrentTime(new Date());
    //     }, 60000);
    //
    //     return () => clearInterval(timer);
    // }, []);

    return (
        <div className={`tablet-interface ${orientation} bg-sky-50 text-gray-900`}>
            {/*<StatusBar*/}
            {/*    isOnline={isOnline}*/}
            {/*    batteryLevel={batteryLevel}*/}
            {/*    currentTime={currentTime}*/}
            {/*/>*/}

            {orientation === 'landscape' && <OrientationWarning />}
            {!isOnline && <OfflineWarning />}

            <div className="tablet-content bg-gradient-to-br from-[rgb(59,185,194)]/10 via-[rgb(59,185,194)]/5 to-gray-50">
                {children}
            </div>
        </div>
    );
};

// const StatusBar = ({ isOnline, batteryLevel, currentTime }) => {
//     return (
//         <div className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur shadow-lg text-gray-800 px-6 py-2 flex justify-between items-center text-base font-medium rounded-b-xl border-b border-sky-100">
//             <div className="flex items-center gap-4">
//                 <span className="font-semibold text-sky-600">Clinica Dentară</span>
//                 {!isOnline && (
//                     <span className="text-red-500 text-sm font-semibold">Offline</span>
//                 )}
//             </div>
//
//             <div className="flex items-center gap-4">
//                 <span>{currentTime.toLocaleTimeString('ro-RO', { hour: '2-digit', minute: '2-digit' })}</span>
//                 {isOnline ? (
//                     <Wifi className="w-5 h-5 text-green-500" />
//                 ) : (
//                     <WifiOff className="w-5 h-5 text-red-500" />
//                 )}
//                 {batteryLevel !== null && (
//                     <div className="flex items-center gap-1">
//                         <Battery className={`w-5 h-5 ${batteryLevel < 20 ? 'text-red-500' : 'text-gray-700'}`} />
//                         <span>{batteryLevel}%</span>
//                     </div>
//                 )}
//             </div>
//         </div>
//     );
// };

const OrientationWarning = () => {
    const [dismissed, setDismissed] = useState(false);

    if (dismissed) return null;

    return (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm flex items-center justify-center p-6">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
                <RotateCcw className="w-16 h-16 text-sky-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Orientare optimă
                </h3>
                <p className="text-gray-600 mb-6">
                    Pentru o experiență optimă, vă recomandăm să țineți tableta în poziție verticală (portret).
                </p>
                <button
                    onClick={() => setDismissed(true)}
                    className="bg-sky-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-sky-700 transition-colors duration-200 shadow"
                >
                    Am înțeles
                </button>
            </div>
        </div>
    );
};

const OfflineWarning = () => {
    return (
        <div className="fixed top-16 left-6 right-6 z-40 bg-red-500 text-white px-4 py-3 rounded-xl shadow-md text-center animate-pulse">
            <div className="flex items-center justify-center gap-2">
                <WifiOff className="w-5 h-5" />
                <span className="text-sm font-medium">
                    Conexiune întreruptă. Datele vor fi salvate local.
                </span>
            </div>
        </div>
    );
};

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

        if (isLeftSwipe && onSwipeLeft) onSwipeLeft();
        if (isRightSwipe && onSwipeRight) onSwipeRight();
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

export const TabletModal = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto modal-fade-in shadow-xl">
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-3xl">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-gray-800">{title}</h2>
                        <button
                            onClick={onClose}
                            className="w-10 h-10 rounded-full hover:bg-gray-100 transition-colors duration-200 flex items-center justify-center text-gray-600"
                        >
                            ×
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

export const TabletLoader = ({ message = "Se încarcă..." }) => {
    return (
        <div className="fixed inset-0 z-50 bg-white/90 backdrop-blur flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-600 border-solid mx-auto mb-4"></div>
                <p className="text-gray-700 text-lg font-medium">{message}</p>
            </div>
        </div>
    );
};

export default TabletInterface;