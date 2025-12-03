const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

export async function getTours(filters = {}) {
  try {
    const params = new URLSearchParams();

    Object.keys(filters).forEach(key => {
      if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
        params.append(key, filters[key]);
      }
    });

    const url = `${API_URL}/tours${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch tours');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tours:', error);
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0,
        hasMore: false
      }
    };
  }
}

export async function getFeaturedTours(limit = 6) {
  try {
    const response = await fetch(`${API_URL}/tours/featured?limit=${limit}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch featured tours');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching featured tours:', error);
    return {
      success: false,
      data: []
    };
  }
}

export async function getTourBySlug(slug) {
  try {
    const response = await fetch(`${API_URL}/tours/${slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn(`Tour with slug '${slug}' not found or API unavailable`);
      return {
        success: false,
        data: null
      };
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching tour, API may not be available:', error.message);
    return {
      success: false,
      data: null
    };
  }
}

export async function searchTours(query, page = 1, limit = 12) {
  try {
    const response = await fetch(
      `${API_URL}/tours/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`,
      {
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      throw new Error('Failed to search tours');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching tours:', error);
    return {
      success: false,
      data: [],
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      }
    };
  }
}

export async function validatePromoCode(code, tourId, subtotal) {
  try {
    const params = new URLSearchParams();
    if (tourId) params.append('tour_id', tourId);
    if (subtotal) params.append('subtotal', subtotal);

    const response = await fetch(
      `${API_URL}/bookings/promo/${code}/validate?${params.toString()}`,
      {
        cache: 'no-store'
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Invalid promo code');
    }

    return await response.json();
  } catch (error) {
    console.error('Error validating promo code:', error);
    throw error;
  }
}

export async function createBooking(bookingData) {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bookingData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create booking');
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

// Site Settings API
export async function getSiteSettings() {
  try {
    const response = await fetch(`${API_URL}/site/settings`, {
      cache: 'no-store' // Don't cache for now to avoid SSR issues
    });

    if (!response.ok) {
      console.warn('API not available, using fallback data');
      return {
        success: false,
        data: {
          heroSlides: [],
          features: [],
          config: {},
          socialMedia: [],
          navigation: [],
          fishingZones: []
        }
      };
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching site settings, using fallback data:', error.message);
    return {
      success: false,
      data: {
        heroSlides: [],
        features: [],
        config: {},
        socialMedia: [],
        navigation: [],
        fishingZones: []
      }
    };
  }
}

export async function getHeroSlides() {
  try {
    const response = await fetch(`${API_URL}/site/hero-slides`, {
      cache: 'force-cache',
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch hero slides');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching hero slides:', error);
    return {
      success: false,
      data: []
    };
  }
}

export async function getFeatures() {
  try {
    const response = await fetch(`${API_URL}/site/features`, {
      cache: 'force-cache',
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch features');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching features:', error);
    return {
      success: false,
      data: []
    };
  }
}

// Tour Reviews
export async function getTourReviews(slug, page = 1, limit = 10) {
  try {
    const response = await fetch(
      `${API_URL}/tours/${slug}/reviews?page=${page}&limit=${limit}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.warn('Reviews not available');
      return {
        success: false,
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
      };
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching reviews:', error.message);
    return {
      success: false,
      data: [],
      pagination: { page: 1, limit: 10, total: 0, totalPages: 0 }
    };
  }
}

// Tour Availability
export async function getTourAvailability(slug, startDate, endDate) {
  try {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);

    const response = await fetch(
      `${API_URL}/tours/${slug}/availability?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      console.warn('Availability not available');
      return {
        success: false,
        data: []
      };
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching availability:', error.message);
    return {
      success: false,
      data: []
    };
  }
}

// Fishing Styles API
export async function getFishingStyles(activeOnly = true) {
  try {
    const params = new URLSearchParams();
    if (activeOnly !== undefined) {
      params.append('active_only', activeOnly.toString());
    }

    const response = await fetch(
      `${API_URL}/fishing-styles?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch fishing styles');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching fishing styles:', error);
    return {
      success: false,
      data: []
    };
  }
}

export async function getFishingStyleById(id) {
  try {
    const response = await fetch(`${API_URL}/fishing-styles/${id}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Fishing style not found');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching fishing style:', error);
    return {
      success: false,
      data: null
    };
  }
}

export async function getFishingStyleBySlug(slug) {
  try {
    const response = await fetch(`${API_URL}/fishing-styles/slug/${slug}`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Fishing style not found');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching fishing style:', error);
    return {
      success: false,
      data: null
    };
  }
}

export async function getToursByFishingStyle(id, page = 1, limit = 12) {
  try {
    const response = await fetch(
      `${API_URL}/fishing-styles/${id}/tours?page=${page}&limit=${limit}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch tours by fishing style');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching tours by fishing style:', error);
    return {
      success: false,
      data: {
        fishing_style: null,
        tours: []
      },
      pagination: {
        page: 1,
        limit: 12,
        total: 0,
        totalPages: 0
      }
    };
  }
}

// Locations API (Countries and Zones)
export async function getCountries(activeOnly = true) {
  try {
    const params = new URLSearchParams();
    if (activeOnly !== undefined) {
      params.append('active_only', activeOnly.toString());
    }

    const response = await fetch(
      `${API_URL}/locations/countries?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch countries');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching countries:', error);
    return {
      success: false,
      data: []
    };
  }
}

export async function getZonesByCountry(countryId, options = {}) {
  try {
    const { popularOnly = false, activeOnly = true } = options;
    const params = new URLSearchParams();

    if (popularOnly !== undefined) {
      params.append('popular_only', popularOnly.toString());
    }
    if (activeOnly !== undefined) {
      params.append('active_only', activeOnly.toString());
    }

    const response = await fetch(
      `${API_URL}/locations/countries/${countryId}/zones?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch zones');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching zones:', error);
    return {
      success: false,
      data: []
    };
  }
}

export async function getAllZones(options = {}) {
  try {
    const { popularOnly = false, activeOnly = true } = options;
    const params = new URLSearchParams();

    if (popularOnly !== undefined) {
      params.append('popular_only', popularOnly.toString());
    }
    if (activeOnly !== undefined) {
      params.append('active_only', activeOnly.toString());
    }

    const response = await fetch(
      `${API_URL}/locations/zones?${params.toString()}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch zones');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching zones:', error);
    return {
      success: false,
      data: []
    };
  }
}
