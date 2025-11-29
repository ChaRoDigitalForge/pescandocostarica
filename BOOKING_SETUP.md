# Booking System Setup Guide

## Overview
The booking system is now fully integrated with the tour detail pages. Users can:
- View tour availability for specific dates
- Make reservations with customer information
- Receive booking confirmations
- Captain gets notified of new bookings

## Configuration

### 1. Environment Variables

Create a `.env.local` file in the root directory with:

```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Google Maps API Key
# Get your API key from: https://console.cloud.google.com/google/maps-apis
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=YOUR_ACTUAL_API_KEY
```

### 2. Google Maps API Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/google/maps-apis)
2. Create a new project or select an existing one
3. Enable the following APIs:
   - Maps Embed API
   - Places API
4. Create credentials (API Key)
5. Restrict the API key to your domain for security
6. Copy the API key to your `.env.local` file

## Features Implemented

### Tour Detail Page (`/tours/[slug]`)

#### 1. Availability Checking
- Automatically checks availability when a date is selected
- Shows available slots in real-time
- Prevents overbooking by validating capacity

#### 2. Booking Flow
**Step 1: Date and People Selection**
- User selects tour date
- User selects number of people
- System checks availability
- Shows available slots or error if fully booked

**Step 2: Customer Information**
- Collects customer name, email, and phone (required)
- Optional notes field for special requests
- All fields validated before submission

**Step 3: Booking Confirmation**
- Creates booking in database
- Sends booking number to customer
- Notifies captain via database record
- Reduces available slots automatically

#### 3. Reviews Section
- Displays user reviews with ratings
- Shows reviewer name and avatar
- Review images displayed in grid
- Sorted by most recent

#### 4. Location Integration
- Google Maps embed showing tour location
- "Open in Google Maps" button
- Share location via Web Share API (mobile)
- Fallback display when API key not configured

## API Endpoints Used

### Frontend API Functions ([lib/api.js](lib/api.js))

```javascript
// Get tour details by slug
getTourBySlug(slug)

// Get tour reviews with pagination
getTourReviews(slug, page, limit)

// Check availability for date range
getTourAvailability(slug, startDate, endDate)

// Create a new booking
createBooking(bookingData)
```

### Backend Endpoints

- `GET /api/tours/:slug` - Get tour details
- `GET /api/tours/:slug/reviews` - Get tour reviews
- `GET /api/tours/:slug/availability` - Check availability
- `POST /api/bookings` - Create new booking

## Booking Data Structure

```javascript
{
  tour_id: number,
  booking_date: string (YYYY-MM-DD),
  number_of_people: number,
  customer_name: string,
  customer_email: string,
  customer_phone: string,
  customer_notes: string (optional)
}
```

## Database Tables Used

- `tours` - Tour information
- `bookings` - Booking records
- `tour_availability` - Available slots per date
- `reviews` - User reviews
- `users` - Captain information

## Testing the Booking System

1. Start the backend server:
```bash
cd backendpescandocostarica
npm start
```

2. Start the frontend:
```bash
npm run dev
```

3. Navigate to a tour detail page:
```
http://localhost:3000/tours/[any-tour-slug]
```

4. Test the booking flow:
   - Select a future date
   - Choose number of people
   - Click "Continuar con la reserva"
   - Fill in customer information
   - Click "Confirmar reserva"

## Error Handling

The system handles:
- API unavailability (shows fallback data)
- Invalid dates (minimum today's date)
- Insufficient availability (shows error message)
- Missing customer information (form validation)
- Network errors (user-friendly error messages)

## Next Steps (Optional Enhancements)

1. **Payment Integration**
   - Add Stripe or local payment processor
   - Handle payment confirmation
   - Update booking status after payment

2. **Email Notifications**
   - Send confirmation email to customer
   - Notify captain via email
   - Send booking reminder 24h before tour

3. **SMS Notifications**
   - Send SMS confirmation to customer
   - WhatsApp integration for captain

4. **Booking Management**
   - Customer dashboard to view bookings
   - Captain dashboard to manage bookings
   - Calendar view of all bookings

5. **Advanced Features**
   - Promo code support (already in backend)
   - Group booking discounts
   - Multi-tour packages
   - Waiting list for fully booked tours

## Troubleshooting

### Maps not showing
- Verify Google Maps API key is set in `.env.local`
- Check API key is not restricted to wrong domains
- Ensure Maps Embed API is enabled in Google Cloud Console

### Booking fails
- Check backend server is running
- Verify database connection
- Check tour has availability entries in `tour_availability` table
- Review backend logs for errors

### No availability showing
- Ensure `tour_availability` table has records for the tour
- Check `is_available` flag is `true`
- Verify date is in the future
- Check `available_slots` is greater than 0
