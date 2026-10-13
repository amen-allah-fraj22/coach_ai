import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// CoachAI data model on Convex. Mirrors the entities from the cahier des
// charges (Section 8). There is no row-level security here: isolation is
// enforced in every function via requireCoach() + a clubId filter, so most
// tables carry clubId and index by it.

const coachLanguage = v.union(v.literal("fr"), v.literal("ar"), v.literal("en"));

export default defineSchema({
  clubs: defineTable({
    name: v.string(),
  }),

  coaches: defineTable({
    // The Clerk user id (identity.subject). One coach row per Clerk user.
    tokenIdentifier: v.string(),
    clubId: v.id("clubs"),
    role: v.union(v.literal("owner"), v.literal("member")),
    fullName: v.string(),
    preferredLanguage: coachLanguage,
    preferredFormation: v.optional(v.string()),
    playingStyle: v.optional(v.string()),
    riskTolerance: v.optional(
      v.union(v.literal("low"), v.literal("medium"), v.literal("high")),
    ),
  })
    .index("by_token", ["tokenIdentifier"])
    .index("by_club", ["clubId"]),

  clubInvites: defineTable({
    clubId: v.id("clubs"),
    email: v.string(),
    invitedBy: v.id("coaches"),
    token: v.string(),
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("revoked"),
    ),
    expiresAt: v.number(),
  })
    .index("by_token", ["token"])
    .index("by_club", ["clubId"]),

  teams: defineTable({
    clubId: v.id("clubs"),
    name: v.string(),
    ageCategory: v.optional(v.string()),
    competition: v.optional(v.string()),
    defaultFormation: v.optional(v.string()),
  }).index("by_club", ["clubId"]),

  players: defineTable({
    clubId: v.id("clubs"),
    teamId: v.id("teams"),
    name: v.string(),
    jerseyNumber: v.optional(v.number()),
    dateOfBirth: v.optional(v.string()),
    position: v.optional(v.string()),
    secondaryPosition: v.optional(v.string()),
    preferredFoot: v.optional(
      v.union(v.literal("left"), v.literal("right"), v.literal("both")),
    ),
    availability: v.union(
      v.literal("available"),
      v.literal("injured"),
      v.literal("suspended"),
      v.literal("unavailable"),
    ),
    technicalRating: v.optional(v.number()),
    physicalRating: v.optional(v.number()),
    tacticalRating: v.optional(v.number()),
    formRating: v.optional(v.number()),
    coachNotes: v.optional(v.string()),
    squadGroup: v.string(),
    sortOrder: v.number(),
  })
    .index("by_club", ["clubId"])
    .index("by_team", ["teamId"]),

  opponents: defineTable({
    clubId: v.id("clubs"),
    teamName: v.string(),
    usualFormation: v.optional(v.string()),
    alternativeFormations: v.array(v.string()),
    playingStyle: v.optional(v.string()),
    pressingStyle: v.optional(v.string()),
    buildUpStyle: v.optional(v.string()),
    defensiveStyle: v.optional(v.string()),
    strengths: v.optional(v.string()),
    weaknesses: v.optional(v.string()),
    setPieceNotes: v.optional(v.string()),
  }).index("by_club", ["clubId"]),

  matches: defineTable({
    clubId: v.id("clubs"),
    teamId: v.id("teams"),
    opponentId: v.optional(v.id("opponents")),
    matchDate: v.string(),
    kickoffTime: v.optional(v.string()),
    homeAway: v.union(v.literal("home"), v.literal("away")),
    competition: v.optional(v.string()),
    ourFormation: v.optional(v.string()),
    opponentFormation: v.optional(v.string()),
    scoreFor: v.optional(v.number()),
    scoreAgainst: v.optional(v.number()),
    possessionPct: v.optional(v.number()),
    shots: v.optional(v.number()),
    shotsOnTarget: v.optional(v.number()),
    corners: v.optional(v.number()),
    fouls: v.optional(v.number()),
    yellowCards: v.optional(v.number()),
    redCards: v.optional(v.number()),
    coachNotes: v.optional(v.string()),
  })
    .index("by_club", ["clubId"])
    .index("by_team", ["teamId"]),

  matchEvents: defineTable({
    clubId: v.id("clubs"),
    matchId: v.id("matches"),
    minute: v.number(),
    eventType: v.union(
      v.literal("goal"),
      v.literal("assist"),
      v.literal("substitution"),
      v.literal("yellow_card"),
      v.literal("red_card"),
      v.literal("injury"),
      v.literal("tactical_change"),
    ),
    side: v.union(v.literal("us"), v.literal("them")),
    playerId: v.optional(v.id("players")),
    description: v.optional(v.string()),
  })
    .index("by_club", ["clubId"])
    .index("by_match", ["matchId"]),

  aiRecommendations: defineTable({
    clubId: v.id("clubs"),
    coachId: v.id("coaches"),
    matchId: v.optional(v.id("matches")),
    recommendationType: v.string(),
    question: v.string(),
    language: coachLanguage,
    // The structured Match Plan (see convex/ai/recommendation.ts).
    recommendation: v.any(),
    reasoningContext: v.optional(v.any()),
  })
    .index("by_club", ["clubId"])
    .index("by_coach", ["coachId"]),

  coachFeedback: defineTable({
    clubId: v.id("clubs"),
    recommendationId: v.id("aiRecommendations"),
    coachId: v.id("coaches"),
    status: v.union(
      v.literal("accepted"),
      v.literal("modified"),
      v.literal("rejected"),
    ),
    comment: v.optional(v.string()),
    outcome: v.optional(v.string()),
  })
    .index("by_club", ["clubId"])
    .index("by_recommendation", ["recommendationId"]),
});
