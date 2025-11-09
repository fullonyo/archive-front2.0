/**
 * Sort Options Constants
 * Centralized sort configurations for asset listings
 */

import { TrendingUp, Clock, Sparkles, Download, Star } from 'lucide-react';

/**
 * Standard asset sort options
 * Used across ForYouPage, CategoryPage, SearchPage, etc.
 */
export const ASSET_SORT_OPTIONS = [
  { 
    value: 'newest', 
    label: 'Newest', 
    icon: Clock,
    description: 'Recently uploaded assets'
  },
  { 
    value: 'popular', 
    label: 'Popular', 
    icon: TrendingUp,
    description: 'Most downloaded assets'
  },
  { 
    value: 'trending', 
    label: 'Trending', 
    icon: Sparkles,
    description: 'Currently popular assets'
  }
];

/**
 * Extended sort options (for advanced views)
 */
export const EXTENDED_SORT_OPTIONS = [
  ...ASSET_SORT_OPTIONS,
  {
    value: 'downloads',
    label: 'Most Downloads',
    icon: Download,
    description: 'Sorted by download count'
  },
  {
    value: 'rating',
    label: 'Highest Rated',
    icon: Star,
    description: 'Sorted by user ratings'
  }
];

/**
 * Forum sort options
 */
export const FORUM_SORT_OPTIONS = [
  { value: 'latest', label: 'Latest', icon: Clock },
  { value: 'popular', label: 'Popular', icon: TrendingUp },
  { value: 'trending', label: 'Trending', icon: Sparkles }
];
