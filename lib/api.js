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
          provincias: []
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
        provincias: []
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

// Reports API
export async function getReportsSummary() {
  try {
    const response = await fetch(`${API_URL}/reports/summary`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      console.warn('Reports not available');
      return {
        success: false,
        data: null
      };
    }

    return await response.json();
  } catch (error) {
    console.warn('Error fetching reports summary:', error.message);
    return {
      success: false,
      data: null
    };
  }
}

export async function getDailyCatchesByLocation(date, locationId) {
  try {
    const params = new URLSearchParams();
    if (date) params.append('date', date);
    if (locationId) params.append('location_id', locationId);

    const response = await fetch(
      `${API_URL}/reports/daily-catches?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch daily catches');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching daily catches:', error);
    return {
      success: false,
      data: null
    };
  }
}

export async function getActiveSpeciesByMonth(year, month) {
  try {
    const params = new URLSearchParams();
    if (year) params.append('year', year);
    if (month) params.append('month', month);

    const response = await fetch(
      `${API_URL}/reports/active-species?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch active species');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching active species:', error);
    return {
      success: false,
      data: null
    };
  }
}

export async function getSeasonsByProvince() {
  try {
    const response = await fetch(`${API_URL}/reports/seasons`, {
      cache: 'no-store'
    });

    if (!response.ok) {
      throw new Error('Failed to fetch seasons');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching seasons:', error);
    return {
      success: false,
      data: []
    };
  }
}

export async function getSuccessProbability(locationId, fishingType, date) {
  try {
    const params = new URLSearchParams();
    if (locationId) params.append('location_id', locationId);
    if (fishingType) params.append('fishing_type', fishingType);
    if (date) params.append('date', date);

    const response = await fetch(
      `${API_URL}/reports/success-probability?${params.toString()}`,
      { cache: 'no-store' }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch success probability');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching success probability:', error);
    return {
      success: false,
      data: null
    };
  }
}
