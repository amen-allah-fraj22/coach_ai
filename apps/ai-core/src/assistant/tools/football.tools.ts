import {
  optionalNumber,
  optionalString,
  stringArray,
  type AssistantTool,
} from './tool.types.js';

/**
 * Data tools. Every query filters on ctx.coach.clubId: the client is
 * service-role and bypasses RLS, so club scoping is this layer's job.
 *
 * These deliberately return raw rows rather than derived judgements — the
 * model reasons over the data, it doesn't get handed conclusions, and it
 * never computes statistics we could read from the database instead.
 */

const PLAYER_COLUMNS =
  'id, name, position, secondary_position, preferred_foot, availability, technical_rating, physical_rating, tactical_rating, form_rating, coach_notes, squad_group, date_of_birth, team_id';

const MATCH_COLUMNS =
  'id, match_date, home_away, competition, our_formation, opponent_formation, score_for, score_against, possession_pct, shots, shots_on_target, corners, fouls, yellow_cards, red_cards, coach_notes, team_id, opponent_id';

const OPPONENT_COLUMNS =
  'id, team_name, usual_formation, alternative_formations, playing_style, pressing_style, build_up_style, defensive_style, strengths, weaknesses, set_piece_notes';

export const listTeamsTool: AssistantTool = {
  name: 'list_teams',
  description:
    "Lists the club's teams with their age category, competition and default formation. Use this first when the coach hasn't said which team they mean.",
  parameters: { type: 'object', properties: {} },
  async run(_args, ctx) {
    const { data, error } = await ctx.db
      .from('teams')
      .select('id, name, age_category, competition, default_formation')
      .eq('club_id', ctx.coach.clubId)
      .order('created_at', { ascending: true });

    if (error) throw new Error(`list_teams failed: ${error.message}`);
    return { teams: data ?? [] };
  },
};

export const getSquadTool: AssistantTool = {
  name: 'get_squad',
  description:
    'Returns the players of a team with their ratings, positions, availability and the coach\'s own notes. Use this before naming any player.',
  parameters: {
    type: 'object',
    properties: {
      team_id: {
        type: 'string',
        description: 'Team id from list_teams. Omit to return all club players.',
      },
      only_available: {
        type: 'boolean',
        description: 'When true, excludes injured, suspended and unavailable players.',
      },
    },
  },
  async run(args, ctx) {
    let query = ctx.db
      .from('players')
      .select(PLAYER_COLUMNS)
      .eq('club_id', ctx.coach.clubId);

    const teamId = optionalString(args, 'team_id');
    if (teamId) query = query.eq('team_id', teamId);
    if (args.only_available === true) query = query.eq('availability', 'available');

    const { data, error } = await query
      .order('squad_group', { ascending: true })
      .order('sort_order', { ascending: true });

    if (error) throw new Error(`get_squad failed: ${error.message}`);
    return { players: data ?? [] };
  },
};

export const comparePlayersTool: AssistantTool = {
  name: 'compare_players',
  description:
    'Returns full profiles for specific players side by side, for selection or substitution decisions.',
  parameters: {
    type: 'object',
    properties: {
      player_ids: {
        type: 'array',
        items: { type: 'string' },
        description: 'Player ids from get_squad (2 or more).',
      },
    },
    required: ['player_ids'],
  },
  async run(args, ctx) {
    const ids = stringArray(args, 'player_ids');
    if (ids.length === 0) return { players: [] };

    const { data, error } = await ctx.db
      .from('players')
      .select(PLAYER_COLUMNS)
      .eq('club_id', ctx.coach.clubId)
      .in('id', ids);

    if (error) throw new Error(`compare_players failed: ${error.message}`);
    return { players: data ?? [] };
  },
};

export const getRecentMatchesTool: AssistantTool = {
  name: 'get_recent_matches',
  description:
    'Returns the most recent matches with result, formations and basic statistics, newest first.',
  parameters: {
    type: 'object',
    properties: {
      team_id: { type: 'string', description: 'Restrict to one team.' },
      limit: {
        type: 'number',
        description: 'How many matches to return (default 5, max 20).',
      },
    },
  },
  async run(args, ctx) {
    const limit = Math.min(optionalNumber(args, 'limit') ?? 5, 20);

    let query = ctx.db
      .from('matches')
      .select(MATCH_COLUMNS)
      .eq('club_id', ctx.coach.clubId);

    const teamId = optionalString(args, 'team_id');
    if (teamId) query = query.eq('team_id', teamId);

    const { data, error } = await query
      .order('match_date', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`get_recent_matches failed: ${error.message}`);
    return { matches: data ?? [] };
  },
};

export const getMatchEventsTool: AssistantTool = {
  name: 'get_match_events',
  description:
    'Returns the logged events of one match (goals, cards, substitutions, injuries, tactical changes) in minute order.',
  parameters: {
    type: 'object',
    properties: {
      match_id: { type: 'string', description: 'Match id from get_recent_matches.' },
    },
    required: ['match_id'],
  },
  async run(args, ctx) {
    const matchId = optionalString(args, 'match_id');
    if (!matchId) return { events: [] };

    const { data, error } = await ctx.db
      .from('match_events')
      .select('id, minute, event_type, side, player_id, description')
      .eq('club_id', ctx.coach.clubId)
      .eq('match_id', matchId)
      .order('minute', { ascending: true });

    if (error) throw new Error(`get_match_events failed: ${error.message}`);
    return { events: data ?? [] };
  },
};

export const listOpponentsTool: AssistantTool = {
  name: 'list_opponents',
  description: 'Lists scouted opponents by name with their usual formation.',
  parameters: { type: 'object', properties: {} },
  async run(_args, ctx) {
    const { data, error } = await ctx.db
      .from('opponents')
      .select('id, team_name, usual_formation')
      .eq('club_id', ctx.coach.clubId)
      .order('team_name', { ascending: true });

    if (error) throw new Error(`list_opponents failed: ${error.message}`);
    return { opponents: data ?? [] };
  },
};

export const getOpponentTool: AssistantTool = {
  name: 'get_opponent',
  description:
    "Returns one opponent's full scouting profile: formation, styles, strengths, weaknesses and set-piece notes.",
  parameters: {
    type: 'object',
    properties: {
      opponent_id: { type: 'string', description: 'Opponent id from list_opponents.' },
      team_name: {
        type: 'string',
        description: 'Opponent name, if the id is unknown (case-insensitive match).',
      },
    },
  },
  async run(args, ctx) {
    let query = ctx.db
      .from('opponents')
      .select(OPPONENT_COLUMNS)
      .eq('club_id', ctx.coach.clubId);

    const opponentId = optionalString(args, 'opponent_id');
    const teamName = optionalString(args, 'team_name');

    if (opponentId) query = query.eq('id', opponentId);
    else if (teamName) query = query.ilike('team_name', teamName);
    else return { opponent: null, note: 'Provide opponent_id or team_name.' };

    const { data, error } = await query.maybeSingle();
    if (error) throw new Error(`get_opponent failed: ${error.message}`);
    return { opponent: data ?? null };
  },
};

export const getCoachProfileTool: AssistantTool = {
  name: 'get_coach_profile',
  description:
    "Returns the coach's own stated philosophy: preferred formation, playing style and risk tolerance. Recommendations should not contradict it without saying so.",
  parameters: { type: 'object', properties: {} },
  async run(_args, ctx) {
    return {
      full_name: ctx.coach.fullName,
      preferred_formation: ctx.coach.preferredFormation,
      playing_style: ctx.coach.playingStyle,
      risk_tolerance: ctx.coach.riskTolerance,
      language: ctx.coach.language,
    };
  },
};

export const footballTools: AssistantTool[] = [
  listTeamsTool,
  getSquadTool,
  comparePlayersTool,
  getRecentMatchesTool,
  getMatchEventsTool,
  listOpponentsTool,
  getOpponentTool,
  getCoachProfileTool,
];
