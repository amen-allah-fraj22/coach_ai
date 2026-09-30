import { v } from "convex/values";

import {
  action,
  internalMutation,
  internalQuery,
  mutation,
  type ActionCtx,
} from "./_generated/server.js";
import { internal } from "./_generated/api.js";
import type { Doc, Id } from "./_generated/dataModel.js";
import { getProvider, type LlmMessage, type LlmToolCall } from "./aiLlm.js";
import { buildSystemPrompt, SUBMIT_TOOL } from "./aiPrompt.js";
import { recommendationSchema, type Recommendation } from "./aiRecommendation.js";
import { toolDefinitions } from "./aiTools.js";
import { requireCoach } from "./lib/auth.js";

const MAX_STEPS = 8;

interface AskResult {
  recommendationId: Id<"aiRecommendations">;
  recommendation: Recommendation;
  provider: string;
}

/** Resolves the authenticated coach for the action (auth is forwarded to
 *  internal queries run from within the action). */
export const coachForAction = internalQuery({
  args: {},
  handler: async (ctx) => requireCoach(ctx),
});

export const saveRecommendation = internalMutation({
  args: {
    clubId: v.id("clubs"),
    coachId: v.id("coaches"),
    matchId: v.optional(v.id("matches")),
    question: v.string(),
    language: v.union(v.literal("fr"), v.literal("ar"), v.literal("en")),
    recommendation: v.any(),
    providerId: v.string(),
  },
  handler: async (ctx, args) => {
    return ctx.db.insert("aiRecommendations", {
      clubId: args.clubId,
      coachId: args.coachId,
      matchId: args.matchId,
      recommendationType: "match_plan",
      question: args.question,
      language: args.language,
      recommendation: args.recommendation,
      reasoningContext: { provider: args.providerId },
    });
  },
});

async function dispatchTool(
  ctx: ActionCtx,
  coach: Doc<"coaches">,
  call: LlmToolCall,
): Promise<unknown> {
  const a = call.arguments;
  const clubId = coach.clubId;

  switch (call.name) {
    case "get_coach_profile":
      return {
        full_name: coach.fullName,
        preferred_formation: coach.preferredFormation ?? null,
        playing_style: coach.playingStyle ?? null,
        risk_tolerance: coach.riskTolerance ?? null,
        language: coach.preferredLanguage,
      };
    case "list_teams":
      return ctx.runQuery(internal.aiTools.listTeams, { clubId });
    case "get_squad":
      return ctx.runQuery(internal.aiTools.getSquad, {
        clubId,
        teamId: a.team_id as Id<"teams"> | undefined,
        onlyAvailable: a.only_available === true,
      });
    case "compare_players":
      return ctx.runQuery(internal.aiTools.comparePlayers, {
        clubId,
        playerIds: (Array.isArray(a.player_ids) ? a.player_ids : []) as Id<"players">[],
      });
    case "get_recent_matches":
      return ctx.runQuery(internal.aiTools.getRecentMatches, {
        clubId,
        teamId: a.team_id as Id<"teams"> | undefined,
        limit: typeof a.limit === "number" ? a.limit : undefined,
      });
    case "get_match_events":
      return ctx.runQuery(internal.aiTools.getMatchEvents, {
        clubId,
        matchId: a.match_id as Id<"matches">,
      });
    case "list_opponents":
      return ctx.runQuery(internal.aiTools.listOpponents, { clubId });
    case "get_opponent":
      return ctx.runQuery(internal.aiTools.getOpponent, {
        clubId,
        opponentId: a.opponent_id as Id<"opponents"> | undefined,
        teamName: typeof a.team_name === "string" ? a.team_name : undefined,
      });
    default:
      return { error: `Unknown tool: ${call.name}` };
  }
}

export const ask = action({
  args: {
    question: v.string(),
    matchId: v.optional(v.id("matches")),
  },
  handler: async (ctx, args): Promise<AskResult> => {
    const coach: Doc<"coaches"> = await ctx.runQuery(
      internal.ai.coachForAction,
      {},
    );
    const provider = getProvider();

    const toolDefs = [
      ...toolDefinitions,
      {
        name: SUBMIT_TOOL,
        description:
          "Deliver the final answer to the coach. Call exactly once, when you have gathered enough data. Do not answer in plain text.",
        parameters: recommendationSchema,
      },
    ];

    const messages: LlmMessage[] = [{ role: "user", text: args.question }];
    const system = buildSystemPrompt(coach);

    for (let step = 0; step < MAX_STEPS; step += 1) {
      const response = await provider.chat({
        system,
        messages,
        tools: toolDefs,
        temperature: 0.4,
      });

      if (response.kind === "text") {
        messages.push({ role: "assistant", text: response.text });
        messages.push({
          role: "user",
          text: `Deliver this via the ${SUBMIT_TOOL} tool, not as plain text.`,
        });
        continue;
      }

      const submit = response.calls.find((c) => c.name === SUBMIT_TOOL);
      if (submit) {
        const recommendation = submit.arguments as unknown as Recommendation;
        const recommendationId = await ctx.runMutation(
          internal.ai.saveRecommendation,
          {
            clubId: coach.clubId,
            coachId: coach._id,
            matchId: args.matchId,
            question: args.question,
            language: coach.preferredLanguage,
            recommendation,
            providerId: provider.id,
          },
        );
        return { recommendationId, recommendation, provider: provider.id };
      }

      messages.push({ role: "assistant_tool_calls", calls: response.calls });
      for (const call of response.calls) {
        let result: unknown;
        try {
          result = await dispatchTool(ctx, coach, call);
        } catch (e) {
          result = { error: e instanceof Error ? e.message : String(e) };
        }
        messages.push({ role: "tool_result", call, result });
      }
    }

    throw new Error(
      `Assistant did not produce a recommendation within ${MAX_STEPS} steps`,
    );
  },
});

export const recordFeedback = mutation({
  args: {
    recommendationId: v.id("aiRecommendations"),
    status: v.union(
      v.literal("accepted"),
      v.literal("modified"),
      v.literal("rejected"),
    ),
    comment: v.optional(v.string()),
    outcome: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const coach = await requireCoach(ctx);
    const rec = await ctx.db.get(args.recommendationId);
    if (!rec || rec.clubId !== coach.clubId) {
      throw new Error("Recommendation not found for this club");
    }

    const existing = await ctx.db
      .query("coachFeedback")
      .withIndex("by_recommendation", (q) =>
        q.eq("recommendationId", args.recommendationId),
      )
      .unique();

    const fields = {
      status: args.status,
      comment: args.comment,
      outcome: args.outcome,
    };
    if (existing) {
      await ctx.db.patch(existing._id, fields);
    } else {
      await ctx.db.insert("coachFeedback", {
        clubId: coach.clubId,
        recommendationId: args.recommendationId,
        coachId: coach._id,
        ...fields,
      });
    }
  },
});
