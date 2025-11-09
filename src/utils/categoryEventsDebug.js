/**
 * Enhanced Categories Event Manager with DEBUG
 * Use this version to debug real-time update issues
 */

// Event name
export const CATEGORIES_UPDATED_EVENT = 'categoriesUpdated';

// Track active listeners
const activeListeners = new Set();
let eventCounter = 0;

/**
 * Emit category update event
 * Call this after creating, updating, or deleting a category
 */
export const emitCategoriesUpdate = () => {
  eventCounter++;
  const timestamp = new Date().toLocaleTimeString();
  
  console.group(`🔔 Event #${eventCounter} - Emitting categoriesUpdated`);
  console.log('⏰ Time:', timestamp);
  console.log('👂 Active listeners:', activeListeners.size);
  console.log('📊 Stack trace:', new Error().stack);
  console.groupEnd();
  
  window.dispatchEvent(new CustomEvent(CATEGORIES_UPDATED_EVENT, {
    detail: { eventId: eventCounter, timestamp }
  }));
};

/**
 * Listen to category updates
 * @param {Function} callback - Function to call when categories are updated
 * @returns {Function} Cleanup function to remove listener
 */
export const onCategoriesUpdate = (callback) => {
  const listenerId = `listener-${Math.random().toString(36).substr(2, 9)}`;
  const timestamp = new Date().toLocaleTimeString();
  
  console.group(`👂 Registering listener: ${listenerId}`);
  console.log('⏰ Registered at:', timestamp);
  console.log('📊 Stack trace:', new Error().stack);
  console.groupEnd();
  
  activeListeners.add(listenerId);
  
  const handler = (event) => {
    const eventId = event.detail?.eventId || 'unknown';
    const eventTime = event.detail?.timestamp || 'unknown';
    
    console.group(`📢 Event received by ${listenerId}`);
    console.log('🆔 Event ID:', eventId);
    console.log('⏰ Event time:', eventTime);
    console.log('⏰ Received at:', new Date().toLocaleTimeString());
    console.groupEnd();
    
    callback();
  };

  window.addEventListener(CATEGORIES_UPDATED_EVENT, handler);

  // Return cleanup function
  return () => {
    console.group(`🧹 Removing listener: ${listenerId}`);
    console.log('⏰ Removed at:', new Date().toLocaleTimeString());
    console.groupEnd();
    
    activeListeners.delete(listenerId);
    window.removeEventListener(CATEGORIES_UPDATED_EVENT, handler);
  };
};

/**
 * Debug function - call this to check system status
 */
export const debugCategoryEvents = () => {
  console.group('🔍 Category Events System Status');
  console.log('📊 Total events emitted:', eventCounter);
  console.log('👂 Active listeners:', activeListeners.size);
  console.log('📋 Listener IDs:', Array.from(activeListeners));
  console.groupEnd();
};

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.debugCategoryEvents = debugCategoryEvents;
}
