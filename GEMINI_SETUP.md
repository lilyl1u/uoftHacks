# Gemini API Setup

## Getting Your API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

## Adding to Backend

Add your Gemini API key to `backend/.env`:

```
GEMINI_API_KEY=your_api_key_here
```

## How It Works

The Gemini API analyzes user visit patterns to determine their personality type:

- **Time patterns**: Analyzes when users visit (morning, afternoon, evening, night)
- **Location diversity**: How many different washrooms they visit
- **Visit frequency**: How often they visit
- **Rating patterns**: What they value in washrooms
- **Consistency**: How predictable their schedule is

## Personality Types

1. **Morning Pooper** - Most visits in morning hours (6am-12pm)
2. **Night Owl** - Most visits in evening/night hours (6pm-6am)
3. **Campus Nomad** - High location diversity, visits many different washrooms
4. **Home Base Loyalist** - Low location diversity, visits same 1-2 washrooms repeatedly
5. **Frequent Flyer** - Very high visit frequency (multiple times per day)
6. **Routine Master** - High visit consistency, predictable schedule
7. **Quality Seeker** - Primarily visits highly-rated washrooms, gives high average ratings

## Usage

Users can generate their personality by clicking the "Generate Personality" button on their profile page. The system will:
1. Collect all their visit and review data
2. Send it to Gemini API for analysis
3. Return a personality type and description
4. Update their profile with the personality
