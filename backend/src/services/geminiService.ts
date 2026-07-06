/**
 * Gemini AI Service
 * ------------------
 * Thin wrapper around Google's Generative AI SDK (free-tier Gemini models).
 * All AI features in the app funnel through here so there's one place to
 * swap models, tune prompts, or add caching/rate-limiting later.
 *
 * If GEMINI_API_KEY is not set, functions gracefully fall back to simple
 * heuristics so the rest of the app still works in local/dev without a key.
 */
import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = process.env.GEMINI_API_KEY;
const modelName = process.env.GEMINI_MODEL || "gemini-1.5-flash";

const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

function getModel() {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: modelName });
}

async function generateJSON<T>(prompt: string, fallback: T): Promise<T> {
  const model = getModel();
  if (!model) return fallback;
  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    const cleaned = text.replace(/```json/gi, "").replace(/```/g, "").trim();
    return JSON.parse(cleaned) as T;
  } catch (err) {
    console.error("[Gemini] generateJSON failed, using fallback:", (err as Error).message);
    return fallback;
  }
}

async function generateText(prompt: string, fallback: string): Promise<string> {
  const model = getModel();
  if (!model) return fallback;
  try {
    const result = await model.generateContent(prompt);
    return result.response.text().trim();
  } catch (err) {
    console.error("[Gemini] generateText failed, using fallback:", (err as Error).message);
    return fallback;
  }
}

const DEFAULT_CATEGORIES = [
  "Food",
  "Travel",
  "Accommodation",
  "Shopping",
  "Fuel",
  "Activities",
  "Emergency",
  "Entertainment",
  "Miscellaneous",
];

export async function categorizeExpense(title: string, description = ""): Promise<string> {
  const lower = `${title} ${description}`.toLowerCase();
  const heuristicFallback = (() => {
    if (/uber|ola|taxi|flight|train|bus|cab/.test(lower)) return "Travel";
    if (/hotel|hostel|airbnb|resort|stay/.test(lower)) return "Accommodation";
    if (/food|restaurant|cafe|pizza|dinner|lunch|breakfast|mcdonald/.test(lower)) return "Food";
    if (/zara|mall|shopping|clothes|store/.test(lower)) return "Shopping";
    if (/petrol|diesel|fuel|gas station/.test(lower)) return "Fuel";
    if (/scuba|trek|activity|adventure|ticket/.test(lower)) return "Activities";
    if (/movie|club|party|game/.test(lower)) return "Entertainment";
    if (/hospital|medicine|emergency/.test(lower)) return "Emergency";
    return "Miscellaneous";
  })();

  const prompt = `Classify the following trip expense into exactly one of these categories: ${DEFAULT_CATEGORIES.join(
    ", "
  )}.
Expense title: "${title}"
Description: "${description}"
Respond with ONLY the category name, nothing else.`;

  const result = await generateText(prompt, heuristicFallback);
  const match = DEFAULT_CATEGORIES.find((c) => c.toLowerCase() === result.toLowerCase().trim());
  return match || heuristicFallback;
}

export async function generateTripSummary(tripContext: {
  tripTitle: string;
  totalSpent: number;
  budget: number;
  categoryBreakdown: Record<string, number>;
  topSpender?: string;
  mostExpensiveDay?: { date: string; amount: number };
  biggestExpense?: { title: string; amount: number };
}): Promise<string> {
  const overBudget = tripContext.totalSpent - tripContext.budget;
  const fallback = `On "${tripContext.tripTitle}", the group spent a total of ₹${tripContext.totalSpent.toFixed(
    2
  )} against a budget of ₹${tripContext.budget.toFixed(2)}. ${
    overBudget > 0
      ? `The trip exceeded its planned budget by ₹${overBudget.toFixed(2)}.`
      : `The trip stayed within budget, with ₹${Math.abs(overBudget).toFixed(2)} left unspent.`
  }`;

  const prompt = `You are a friendly trip-finance assistant. Write a short (3-5 sentence) natural-language
summary for a group trip called "${tripContext.tripTitle}".
Data:
- Total spent: ₹${tripContext.totalSpent}
- Budget: ₹${tripContext.budget}
- Category breakdown: ${JSON.stringify(tripContext.categoryBreakdown)}
- Top spender: ${tripContext.topSpender || "unknown"}
- Most expensive day: ${JSON.stringify(tripContext.mostExpensiveDay || {})}
- Biggest single expense: ${JSON.stringify(tripContext.biggestExpense || {})}
Mention which category dominated spending, call out the most expensive day if notable, and state
clearly whether the group went over or stayed under budget. Keep it conversational, no markdown.`;

  return generateText(prompt, fallback);
}

export interface BudgetPlan {
  food: number;
  accommodation: number;
  travel: number;
  activities: number;
  emergencyFund: number;
}

export async function generateBudgetPlan(input: {
  destination: string;
  people: number;
  days: number;
  totalBudget: number;
}): Promise<BudgetPlan> {
  const fallback: BudgetPlan = {
    food: Math.round(input.totalBudget * 0.3),
    accommodation: Math.round(input.totalBudget * 0.35),
    travel: Math.round(input.totalBudget * 0.2),
    activities: Math.round(input.totalBudget * 0.1),
    emergencyFund: Math.round(input.totalBudget * 0.05),
  };

  const prompt = `Suggest a budget allocation for a trip to ${input.destination} with ${input.people} people
over ${input.days} days, total budget ₹${input.totalBudget}.
Respond with ONLY valid JSON in this exact shape (numbers only, they should sum to approximately the total budget):
{"food": number, "accommodation": number, "travel": number, "activities": number, "emergencyFund": number}`;

  return generateJSON<BudgetPlan>(prompt, fallback);
}

export async function generateCostOptimizationTips(tripContext: {
  tripTitle: string;
  categoryBreakdown: Record<string, number>;
  budget: number;
  totalSpent: number;
}): Promise<string[]> {
  const fallback = [
    `Spending is currently at ₹${tripContext.totalSpent.toFixed(2)} of your ₹${tripContext.budget.toFixed(
      2
    )} budget — keep an eye on the largest category to stay on track.`,
  ];

  const prompt = `Based on this trip's spending data, give 2-4 short, specific, actionable cost-optimization tips.
Trip: ${tripContext.tripTitle}
Category breakdown: ${JSON.stringify(tripContext.categoryBreakdown)}
Budget: ₹${tripContext.budget}, spent so far: ₹${tripContext.totalSpent}
Respond with ONLY a valid JSON array of strings, e.g. ["tip one", "tip two"]. No markdown.`;

  return generateJSON<string[]>(prompt, fallback);
}

export async function answerTravelAssistantQuestion(
  question: string,
  tripDataContext: string
): Promise<string> {
  const fallback =
    "I couldn't reach the AI service right now, but you can check the Expenses and Settlements tabs directly for that information.";

  const prompt = `You are TripSplit AI's travel assistant chatbot. Answer the user's question using ONLY
the trip data provided below. Be concise (1-3 sentences) and use actual numbers from the data.

TRIP DATA:
${tripDataContext}

QUESTION: ${question}`;

  return generateText(prompt, fallback);
}

export async function parseVoiceExpense(transcript: string): Promise<{
  title: string;
  amount: number | null;
  category: string;
  participantHints: string[];
}> {
  const fallback = {
    title: transcript.slice(0, 60),
    amount: null,
    category: "Miscellaneous",
    participantHints: [] as string[],
  };

  const prompt = `Extract structured expense data from this natural-language sentence spoken by a user
adding a trip expense: "${transcript}"
Respond with ONLY valid JSON in this shape:
{"title": string, "amount": number, "category": one of [${DEFAULT_CATEGORIES.join(
    ", "
  )}], "participantHints": string[] (names mentioned, excluding the speaker)}`;

  return generateJSON(prompt, fallback);
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
  estimatedCost: number;
}

export interface BudgetBreakdownItem {
  category: string;
  amount: number;
}

export interface TripPlan {
  suggestedDestination?: string;
  itinerary: ItineraryDay[];
  budgetBreakdown: BudgetBreakdownItem[];
  totalEstimatedCost: number;
  savingTips: string[];
}

/**
 * Trip Planner: given rough trip parameters (no destination required), generates
 * a full day-by-day itinerary, a category-wise budget estimate, and money-saving
 * tips. If a destination isn't provided, the AI suggests one that fits the motive
 * and budget. Powers the standalone "Trip Planner" page (used before a trip
 * even exists yet, to help a group decide what and where to plan).
 *
 * departureFrom + transportMode let the model reason about actual inter-city
 * travel cost (e.g. flight from a specific origin vs. a self-drive road trip)
 * instead of guessing a generic travel percentage.
 */
export async function generateTripPlan(input: {
  destination?: string;
  people: number;
  days: number;
  motive: string;
  budget?: number;
  departureFrom?: string;
  transportMode?: string;
}): Promise<TripPlan> {
  const { destination, people, days, motive, budget, departureFrom, transportMode } = input;

  // Rough per-person round-trip cost by mode, used only for the offline fallback
  // (used when there's no Gemini key). Gemini itself reasons about the actual
  // origin-destination distance when a key is present.
  const TRANSPORT_COST_PER_PERSON: Record<string, number> = {
    Flight: 6000,
    Train: 1800,
    Bus: 1200,
    "Car (Self-drive)": 2500,
    Bike: 1000,
  };
  const travelCostPerPerson = transportMode ? TRANSPORT_COST_PER_PERSON[transportMode] ?? 2000 : 2000;
  const travelTotal = travelCostPerPerson * people;

  const fallbackDailyNonTravelCost = budget ? Math.round((budget - travelTotal) / days) : 1800 * people;
  const fallbackItinerary: ItineraryDay[] = Array.from({ length: days }, (_, i) => {
    const dayNum = i + 1;
    const isFirst = dayNum === 1;
    const isLast = dayNum === days;
    return {
      day: dayNum,
      title: isFirst
        ? `Departure from ${departureFrom || "home"} & Arrival`
        : isLast
        ? "Departure Day"
        : `Exploring & ${motive || "Activities"}`,
      activities: isFirst
        ? [
            departureFrom ? `Depart from ${departureFrom} via ${transportMode || "your chosen transport"}` : "Travel to destination",
            "Check into accommodation",
            "Nearby local dinner",
            "Early rest for next day",
          ]
        : isLast
        ? ["Breakfast and pack up", "Last-minute local shopping", `Head back to ${departureFrom || "home"}`]
        : ["Breakfast at stay", `Morning ${motive || "sightseeing"} activity`, "Local lunch", "Afternoon exploration", "Group dinner"],
      estimatedCost: isFirst || isLast ? Math.round(fallbackDailyNonTravelCost + travelTotal / 2) : fallbackDailyNonTravelCost,
    };
  });
  const fallbackNonTravelTotal = fallbackDailyNonTravelCost * days;
  const fallbackTotal = fallbackNonTravelTotal + travelTotal;
  const fallback: TripPlan = {
    suggestedDestination: destination || undefined,
    itinerary: fallbackItinerary,
    budgetBreakdown: [
      { category: "Travel", amount: Math.round(travelTotal) },
      { category: "Accommodation", amount: Math.round(fallbackNonTravelTotal * 0.45) },
      { category: "Food", amount: Math.round(fallbackNonTravelTotal * 0.33) },
      { category: "Activities", amount: Math.round(fallbackNonTravelTotal * 0.15) },
      { category: "Emergency Fund", amount: Math.round(fallbackNonTravelTotal * 0.07) },
    ],
    totalEstimatedCost: Math.round(fallbackTotal),
    savingTips: [
      transportMode === "Flight"
        ? "Book flights 3-4 weeks ahead and compare weekday fares — they're often 20-30% cheaper than weekends."
        : "Book tickets in advance for better fares, and travel overnight where possible to save on a night's accommodation.",
      "Travel in a group to split cab/auto fares and get group discounts on activities.",
      "Prefer local eateries over touristy restaurants for meals to cut food costs significantly.",
    ],
  };

  const prompt = `You are a trip-planning assistant. Create a detailed day-by-day itinerary and budget
estimate for a group trip with these parameters:
- Departure city: ${departureFrom || "not specified"}
- Destination: ${destination || "not specified — suggest a suitable destination based on the motive and budget"}
- Preferred mode of transport: ${transportMode || "not specified — recommend the most sensible option"}
- Number of people: ${people}
- Duration: ${days} days
- Motive/purpose of the trip: ${motive}
- Approximate total budget: ${budget ? `₹${budget}` : "not specified — estimate a reasonable one"}

Use the departure city and transport mode to realistically estimate the actual round-trip travel
cost per person (accounting for approximate distance and typical fares for that mode), rather than
a generic guess. Reflect the outbound and return journey in the first and last itinerary days.

Respond with ONLY valid JSON in exactly this shape, no markdown, no commentary:
{
  "suggestedDestination": string (only include if destination was not specified),
  "itinerary": [
    { "day": number, "title": string, "activities": string[] (3-5 concrete activities), "estimatedCost": number }
  ],
  "budgetBreakdown": [ { "category": string, "amount": number } ] (covering travel, accommodation, food, activities, emergency fund),
  "totalEstimatedCost": number,
  "savingTips": string[] (3-5 specific, actionable money-saving tips relevant to this trip and transport mode)
}
Make the itinerary realistic and specific to the destination and motive, not generic filler.`;

  return generateJSON<TripPlan>(prompt, fallback);
}
