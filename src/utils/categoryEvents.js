/**
 * Categories Event Manager
 * Centralizes category update events across the application
 */

export const CATEGORIES_UPDATED_EVENT = 'categoriesUpdated';

/**
 * Emit category update event
 * Call this after creating, updating, or deleting a category
 */
export const emitCategoriesUpdate = () => {
  window.dispatchEvent(new CustomEvent(CATEGORIES_UPDATED_EVENT));
};

/**
 * Listen to category updates
 * @param {Function} callback - Function to call when categories are updated
 * @returns {Function} Cleanup function to remove listener
 */
export const onCategoriesUpdate = (callback) => {
  const handler = () => {
    callback();
  };

  window.addEventListener(CATEGORIES_UPDATED_EVENT, handler);

  return () => {
    window.removeEventListener(CATEGORIES_UPDATED_EVENT, handler);
  };
};
