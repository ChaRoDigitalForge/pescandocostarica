# International Location System Migration

## Overview

This migration transforms the Costa Rica-only location system (`provincias` and `locations`) into an international `countries` and `zones` system, ready for global expansion.

## What This Migration Does

### 1. **Creates New Tables**
- **`countries`** - Stores countries with ISO codes, currency info, and metadata
- **`zones`** - Universal location table (replaces both `provincias` and `locations`)
  - Supports hierarchical structure (e.g., Province → City → Beach)
  - Can represent: provinces, states, cities, beaches, marinas, etc.

### 2. **Migrates Existing Data**
- All 7 Costa Rican provinces → `zones` (type: 'province')
- All existing locations → `zones` (type: 'city')
- Maintains parent-child relationships (city belongs to province)
- Preserves coordinates, descriptions, and popularity flags

### 3. **Updates Tours**
- Adds `country_id` and `zone_id` columns
- Migrates all tour references to new system
- Removes old `provincia_id` and `location_id` columns

### 4. **Updates Users**
- Adds `country_id` column
- Sets all existing users to Costa Rica
- Removes old `provincia` enum column

### 5. **Cleans Up**
- Drops old `provincias` and `locations` tables
- Drops `provincia_type` ENUM
- Updates database views
- Removes obsolete indexes

## Pre-loaded Countries

### Central America
- 🇨🇷 Costa Rica (main, popular)
- 🇵🇦 Panama (popular)
- 🇳🇮 Nicaragua
- 🇬🇹 Guatemala
- 🇭🇳 Honduras
- 🇸🇻 El Salvador
- 🇧🇿 Belize

### North America
- 🇲🇽 Mexico (popular)
- 🇺🇸 United States (popular)
- 🇨🇦 Canada

### South America
- 🇨🇴 Colombia
- 🇻🇪 Venezuela
- 🇪🇨 Ecuador (popular)
- 🇵🇪 Peru
- 🇧🇷 Brazil (popular)
- 🇦🇷 Argentina (popular)
- 🇨🇱 Chile

### Caribbean
- 🇨🇺 Cuba
- 🇩🇴 Dominican Republic
- 🇯🇲 Jamaica
- 🇧🇸 Bahamas (popular)

## How to Run

### Prerequisites
- Backend should be stopped
- Database connection configured
- Backup recommended (though migration is designed to be safe)

### Execution

**Option 1: Via Neon SQL Editor**
1. Go to https://console.neon.tech
2. Select your database
3. Open SQL Editor
4. Copy and paste the entire `migrate_to_international_locations.sql` file
5. Click "Run"

**Option 2: Via psql**
```bash
psql "postgresql://user:password@host/database?sslmode=require" -f database/migrate_to_international_locations.sql
```

**Option 3: Via Node.js Script**
```bash
node database/run-migration.js
```

## Expected Output

```
NOTICE:  Migrated 7 provincias to zones
NOTICE:  Migrated 8 locations to zones
NOTICE:  Migrated tour references to new zone system
NOTICE:  ============================================================
NOTICE:  MIGRATION SUMMARY
NOTICE:  ============================================================
NOTICE:  Countries created: 21
NOTICE:  Zones created: 15
NOTICE:  Tours migrated: 9
NOTICE:  ============================================================
NOTICE:  Migration completed successfully!
NOTICE:  Old tables (provincias, locations) have been removed.
NOTICE:  System is now ready for international expansion.
NOTICE:  ============================================================
```

## Verification

After migration, verify:

1. **Countries loaded**
   ```sql
   SELECT code, name, is_popular FROM countries ORDER BY continent, name;
   ```

2. **Zones created**
   ```sql
   SELECT z.name, z.zone_type, c.name as country
   FROM zones z
   INNER JOIN countries c ON z.country_id = c.id
   ORDER BY c.name, z.zone_type, z.name;
   ```

3. **Tours updated**
   ```sql
   SELECT title, country_id, zone_id FROM tours LIMIT 5;
   ```

4. **View works**
   ```sql
   SELECT title, country_name, zone_name FROM vw_tours_complete LIMIT 5;
   ```

## API Impact

### Backend (Already Compatible!)
The backend is already configured for this system:
- ✅ `/api/locations/countries` - Lists all countries
- ✅ `/api/locations/countries/:id/zones` - Lists zones by country
- ✅ `/api/locations/zones` - Lists all zones

### Frontend (No Changes Needed!)
The frontend already uses these endpoints:
- ✅ `getCountries()` in `lib/api.js`
- ✅ `getZonesByCountry()` in `lib/api.js`
- ✅ Captain dashboard form already expects this structure

## Rollback (If Needed)

This migration is **destructive** (drops old tables). If you need to rollback:

1. You would need to restore from a database backup
2. Or manually recreate the old schema from `neon_setup.sql`

**Recommendation:** Test in a development/staging environment first!

## What's Next

After migration:

1. **Test the system**
   - Start backend: `cd backendrepo && npm run dev`
   - Start frontend: `cd pescandocostarica && npm run dev`
   - Visit captain dashboard
   - Try creating a tour with country/zone selection

2. **Add more zones**
   - Add popular fishing destinations in each country
   - Add beaches, marinas, cities for new countries

3. **Future expansion**
   - Add more countries as needed
   - Add continents: Europe, Asia, Africa, Oceania

## Benefits

- ✅ **Scalable**: Ready for worldwide expansion
- ✅ **Hierarchical**: Zones can have parent zones (Province → City → Marina)
- ✅ **Flexible**: `zone_type` allows different location types
- ✅ **Clean**: Removes Costa Rica-specific limitations
- ✅ **Professional**: Uses ISO country codes and standards
- ✅ **SEO Friendly**: Country flags, native names for better UX

## Questions?

If you encounter any issues:
1. Check the migration output for errors
2. Verify your database connection
3. Check that all referenced tables exist
4. Ensure you have proper database permissions
