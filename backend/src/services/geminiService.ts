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

interface BowelMovementData {
  visitTimestamps: string[]; // ISO date strings
  totalVisits: number;
  visitsPerWeek: number;
  averageTimeBetweenVisits: number; // hours
  consistencyScore: number; // 0-1, how regular the pattern is
  timeOfDayDistribution: {
    morning: number;
    afternoon: number;
    evening: number;
    night: number;
  };
  dayOfWeekDistribution: {
    monday: number;
    tuesday: number;
    wednesday: number;
    thursday: number;
    friday: number;
    saturday: number;
    sunday: number;
  };
}

export const analyzeBowelHealth = async (movementData: BowelMovementData): Promise<{ 
  regularity: 'regular' | 'irregular' | 'needs_attention';
  analysis: string;
  recommendations: string[];
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Format timestamps for analysis
    const timestampList = movementData.visitTimestamps
      .slice(0, 50) // Limit to last 50 visits for prompt size
      .map(ts => new Date(ts).toLocaleString())
      .join('\n');

    const prompt = `You are a health advisor analyzing bowel movement patterns. Analyze the following data and provide health recommendations.

Bowel Movement Data:
- Total visits recorded: ${movementData.totalVisits}
- Average visits per week: ${movementData.visitsPerWeek.toFixed(1)}
- Average time between visits: ${movementData.averageTimeBetweenVisits.toFixed(1)} hours
- Consistency score: ${(movementData.consistencyScore * 100).toFixed(1)}% (higher = more regular pattern)

Time of Day Distribution:
- Morning (6am-12pm): ${movementData.timeOfDayDistribution.morning} visits
- Afternoon (12pm-6pm): ${movementData.timeOfDayDistribution.afternoon} visits
- Evening (6pm-10pm): ${movementData.timeOfDayDistribution.evening} visits
- Night (10pm-6am): ${movementData.timeOfDayDistribution.night} visits

Day of Week Distribution:
- Monday: ${movementData.dayOfWeekDistribution.monday} visits
- Tuesday: ${movementData.dayOfWeekDistribution.tuesday} visits
- Wednesday: ${movementData.dayOfWeekDistribution.wednesday} visits
- Thursday: ${movementData.dayOfWeekDistribution.thursday} visits
- Friday: ${movementData.dayOfWeekDistribution.friday} visits
- Saturday: ${movementData.dayOfWeekDistribution.saturday} visits
- Sunday: ${movementData.dayOfWeekDistribution.sunday} visits

Recent Visit Timestamps (last 50):
${timestampList}

Based on this data, determine:
1. Regularity status: "regular" (consistent pattern, healthy), "irregular" (inconsistent but manageable), or "needs_attention" (highly irregular, may indicate issues)
2. A brief analysis (2-3 sentences) explaining the pattern
3. 3-5 specific, actionable recommendations to improve bowel health

Consider:
- Regular bowel movements typically occur 1-3 times per day or every other day
- Consistency in timing suggests a healthy routine
- Irregular patterns may indicate diet, hydration, or lifestyle issues
- Very frequent visits (>5/day) or very infrequent (<3/week) may need attention

Respond in JSON format:
{
  "regularity": "regular" | "irregular" | "needs_attention",
  "analysis": "brief explanation of the pattern",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();
    
    // Try to parse JSON response
    let parsed;
    try {
      // Remove markdown code blocks if present
      const cleanedText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', text);
      // Fallback to simple analysis
      return getBowelHealthFallback(movementData);
    }

    // Validate response structure
    if (!parsed.regularity || !parsed.analysis || !Array.isArray(parsed.recommendations)) {
      return getBowelHealthFallback(movementData);
    }

    return {
      regularity: parsed.regularity as 'regular' | 'irregular' | 'needs_attention',
      analysis: parsed.analysis,
      recommendations: parsed.recommendations.slice(0, 5) // Limit to 5 recommendations
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return getBowelHealthFallback(movementData);
  }
};

const getBowelHealthFallback = (movementData: BowelMovementData): { 
  regularity: 'regular' | 'irregular' | 'needs_attention';
  analysis: string;
  recommendations: string[];
} => {
  const { visitsPerWeek, consistencyScore, averageTimeBetweenVisits } = movementData;
  
  let regularity: 'regular' | 'irregular' | 'needs_attention' = 'regular';
  let analysis = '';
  const recommendations: string[] = [];

  // Determine regularity
  if (visitsPerWeek < 3) {
    regularity = 'needs_attention';
    analysis = 'Your bowel movement frequency is lower than typical. This may indicate constipation or dietary issues.';
    recommendations.push('Increase fiber intake through fruits, vegetables, and whole grains');
    recommendations.push('Drink more water throughout the day (aim for 8+ glasses)');
    recommendations.push('Consider adding more physical activity to your routine');
  } else if (visitsPerWeek > 21) {
    regularity = 'needs_attention';
    analysis = 'Your bowel movement frequency is higher than typical. This may indicate digestive sensitivity or dietary triggers.';
    recommendations.push('Keep a food diary to identify potential triggers');
    recommendations.push('Consider reducing processed foods and artificial sweeteners');
    recommendations.push('Consult with a healthcare provider if this persists');
  } else if (consistencyScore < 0.5) {
    regularity = 'irregular';
    analysis = 'Your bowel movement pattern shows some inconsistency. Establishing a more regular routine could improve digestive health.';
    recommendations.push('Try to establish a consistent daily routine');
    recommendations.push('Eat meals at regular times');
    recommendations.push('Create a relaxing bathroom routine');
  } else {
    regularity = 'regular';
    analysis = 'Your bowel movement pattern appears regular and healthy. Keep up the good habits!';
    recommendations.push('Maintain your current diet and hydration habits');
    recommendations.push('Continue with regular physical activity');
  }

  // Add general recommendations
  if (averageTimeBetweenVisits < 4) {
    recommendations.push('Space out your meals to allow proper digestion');
  }

  return { regularity, analysis, recommendations };
};

export { PERSONALITY_DESCRIPTIONS, PERSONALITY_TYPES };
