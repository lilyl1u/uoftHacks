import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

interface UserVisitData {
  totalVisits: number;
  uniqueWashrooms: number;
  visitFrequency: number; // visits per week
  timePatterns: {
    morning: number; // 6am-12pm
    afternoon: number; // 12pm-6pm
    evening: number; // 6pm-10pm
    night: number; // 10pm-6am
  };
  locationDiversity: number; // unique locations / total visits (0-1)
  averageRating: number;
  reviewCount: number;
  mostVisitedWashroom: string | null;
  visitConsistency: number; // how consistent their schedule is (0-1)
}

const PERSONALITY_TYPES = [
  'Morning Pooper',
  'Night Owl',
  'Campus Nomad',
  'Home Base Loyalist',
  'Heavy Launcher',
  'Routine Master',
  'Quality Seeker'
];

const PERSONALITY_DESCRIPTIONS: Record<string, string> = {
  'Morning Pooper': 'You\'re an early riser who starts the day right! Your washroom visits happen primarily in the morning hours (6am-12pm), showing you\'re proactive and like to get things done early. You probably have a consistent morning routine and know exactly which washrooms are best before the crowds arrive.',
  'Night Owl': 'You thrive when the sun goes down! Most of your washroom visits happen during evening and night hours (6pm-6am). You\'re comfortable navigating campus after dark and probably know all the best late-night spots that stay open.',
  'Campus Nomad': 'You\'re an explorer at heart! You visit many different washrooms across campus, rarely sticking to the same spot. Your high location diversity shows you love discovering new places and aren\'t afraid to venture out of your comfort zone.',
  'Home Base Loyalist': 'You\'ve found your spot and you stick with it! You primarily visit the same 1-2 washrooms, showing you value consistency and familiarity. You know these washrooms inside and out, and they feel like your second home on campus.',
  'Heavy Launcher': 'You\'re a frequent visitor with a high visit frequency! You visit washrooms multiple times throughout the day, showing you\'re always on the go. Your active lifestyle means you\'ve probably tried more washrooms than most.',
  'Routine Master': 'You have a schedule and you stick to it! Your visits show a consistent pattern, whether it\'s the same time of day or same days of the week. You\'re organized, predictable, and probably never get caught off guard.',
  'Quality Seeker': 'You only settle for the best! You primarily visit and rate highly-rated washrooms, showing you have high standards. You\'d rather wait or travel further for a quality experience than settle for subpar facilities.'
};

export const analyzePersonality = async (visitData: UserVisitData): Promise<{ personality: string; description: string }> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `Analyze this user's washroom visit patterns and determine which personality type best fits them. 

User Data:
- Total visits: ${visitData.totalVisits}
- Unique washrooms visited: ${visitData.uniqueWashrooms}
- Visit frequency: ${visitData.visitFrequency} visits per week
- Time patterns:
  * Morning (6am-12pm): ${visitData.timePatterns.morning} visits
  * Afternoon (12pm-6pm): ${visitData.timePatterns.afternoon} visits
  * Evening (6pm-10pm): ${visitData.timePatterns.evening} visits
  * Night (10pm-6am): ${visitData.timePatterns.night} visits
- Location diversity: ${(visitData.locationDiversity * 100).toFixed(1)}% (higher = visits more different places)
- Average rating given: ${visitData.averageRating.toFixed(1)}/5.0
- Total reviews written: ${visitData.reviewCount}
- Most visited washroom: ${visitData.mostVisitedWashroom || 'N/A'}
- Visit consistency: ${(visitData.visitConsistency * 100).toFixed(1)}% (higher = more consistent schedule)

Personality Types Available:
1. Morning Pooper - Most visits in morning hours (6am-12pm)
2. Night Owl - Most visits in evening/night hours (6pm-6am)
3. Campus Nomad - High location diversity, visits many different washrooms
4. Home Base Loyalist - Low location diversity, visits same 1-2 washrooms repeatedly
5. Heavy Launcher - Very high visit frequency (multiple times per day)
6. Routine Master - High visit consistency, predictable schedule
7. Quality Seeker - Primarily visits highly-rated washrooms, gives high average ratings

Based on the data, determine the SINGLE best personality type that matches this user's patterns. Consider:
- If morning visits > 40% of total → Morning Pooper
- If evening/night visits > 40% of total → Night Owl
- If location diversity > 0.7 → Campus Nomad
- If location diversity < 0.3 AND unique washrooms <= 2 → Home Base Loyalist
- If visit frequency > 10 per week → Heavy Launcher
- If visit consistency > 0.7 → Routine Master
- If average rating > 4.0 AND review count > 5 → Quality Seeker

Respond with ONLY the personality type name (one of the 7 listed above), nothing else.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const personality = response.text().trim();

    // Validate the response is one of our personality types
    const validPersonality = PERSONALITY_TYPES.find(p => 
      personality.toLowerCase().includes(p.toLowerCase())
    ) || 'Campus Nomad'; // Default fallback

    return {
      personality: validPersonality,
      description: PERSONALITY_DESCRIPTIONS[validPersonality] || PERSONALITY_DESCRIPTIONS['Campus Nomad']
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    // Fallback to simple logic if API fails
    return getPersonalityFallback(visitData);
  }
};

const getPersonalityFallback = (visitData: UserVisitData): { personality: string; description: string } => {
  const totalTimeVisits = visitData.timePatterns.morning + visitData.timePatterns.afternoon + 
                         visitData.timePatterns.evening + visitData.timePatterns.night;
  
  if (totalTimeVisits === 0) {
    return {
      personality: 'Campus Nomad',
      description: PERSONALITY_DESCRIPTIONS['Campus Nomad']
    };
  }

  const morningRatio = visitData.timePatterns.morning / totalTimeVisits;
  const nightRatio = (visitData.timePatterns.evening + visitData.timePatterns.night) / totalTimeVisits;

  // Priority order based on strongest indicators
  if (visitData.visitFrequency > 10) {
    return { personality: 'Heavy Launcher', description: PERSONALITY_DESCRIPTIONS['Heavy Launcher'] };
  }
  if (visitData.locationDiversity < 0.3 && visitData.uniqueWashrooms <= 2) {
    return { personality: 'Home Base Loyalist', description: PERSONALITY_DESCRIPTIONS['Home Base Loyalist'] };
  }
  if (visitData.locationDiversity > 0.7) {
    return { personality: 'Campus Nomad', description: PERSONALITY_DESCRIPTIONS['Campus Nomad'] };
  }
  if (visitData.visitConsistency > 0.7) {
    return { personality: 'Routine Master', description: PERSONALITY_DESCRIPTIONS['Routine Master'] };
  }
  if (visitData.averageRating > 4.0 && visitData.reviewCount > 5) {
    return { personality: 'Quality Seeker', description: PERSONALITY_DESCRIPTIONS['Quality Seeker'] };
  }
  if (morningRatio > 0.4) {
    return { personality: 'Morning Pooper', description: PERSONALITY_DESCRIPTIONS['Morning Pooper'] };
  }
  if (nightRatio > 0.4) {
    return { personality: 'Night Owl', description: PERSONALITY_DESCRIPTIONS['Night Owl'] };
  }

  // Default
  return { personality: 'Campus Nomad', description: PERSONALITY_DESCRIPTIONS['Campus Nomad'] };
};

export { PERSONALITY_DESCRIPTIONS, PERSONALITY_TYPES };
