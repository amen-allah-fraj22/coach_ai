import { mutation } from "./_generated/server.js";
import { requireCoach } from "./lib/auth.js";

// One-click demo dataset: a fictional Tunisian side, a full squad, a scouted
// opponent and a handful of played matches — enough to exercise the AI Coach
// end to end. Safe to skip if the club already has a team.

type Foot = "left" | "right" | "both";
type Avail = "available" | "injured" | "suspended" | "unavailable";

const PLAYERS: {
  name: string;
  position: string;
  foot: Foot;
  availability: Avail;
  tech: number;
  phys: number;
  tact: number;
  form: number;
  group: string;
  notes?: string;
}[] = [
  { name: "Youssef Mejri", position: "GK", foot: "right", availability: "available", tech: 6, phys: 7, tact: 7, form: 7, group: "Starting XI", notes: "Commanding in the air, shaky with the ball at his feet." },
  { name: "Aymen Dridi", position: "RB", foot: "right", availability: "available", tech: 6, phys: 8, tact: 6, form: 7, group: "Starting XI", notes: "Loves to overlap; leaves space in behind." },
  { name: "Hamza Ben Ali", position: "CB", foot: "right", availability: "available", tech: 6, phys: 7, tact: 8, form: 7, group: "Starting XI", notes: "Strong aerially, slow on the turn." },
  { name: "Nidhal Kefi", position: "CB", foot: "left", availability: "available", tech: 7, phys: 7, tact: 8, form: 6, group: "Starting XI" },
  { name: "Seif Gharbi", position: "LB", foot: "left", availability: "available", tech: 7, phys: 8, tact: 6, form: 8, group: "Starting XI", notes: "Quick, good 1v1 defender." },
  { name: "Omar Trabelsi", position: "DM", foot: "right", availability: "available", tech: 7, phys: 7, tact: 9, form: 7, group: "Starting XI", notes: "Excellent positioning, screens the back four." },
  { name: "Firas Chaabane", position: "CM", foot: "right", availability: "available", tech: 9, phys: 6, tact: 8, form: 8, group: "Starting XI", notes: "Best passer in the squad; low physical intensity." },
  { name: "Wael Hamdi", position: "CM", foot: "left", availability: "available", tech: 7, phys: 8, tact: 7, form: 7, group: "Starting XI" },
  { name: "Bilel Sassi", position: "RW", foot: "left", availability: "available", tech: 8, phys: 7, tact: 7, form: 8, group: "Starting XI", notes: "Technical, strong crossing from the right." },
  { name: "Khalil Mansour", position: "LW", foot: "right", availability: "available", tech: 8, phys: 9, tact: 6, form: 9, group: "Starting XI", notes: "Fast, direct, thrives in transition." },
  { name: "Ahmed Jebali", position: "ST", foot: "right", availability: "available", tech: 7, phys: 8, tact: 6, form: 7, group: "Starting XI", notes: "Quick but weak in the air." },

  { name: "Marwen Sakli", position: "GK", foot: "right", availability: "available", tech: 5, phys: 6, tact: 6, form: 6, group: "Bench" },
  { name: "Tarek Oueslati", position: "CB", foot: "right", availability: "injured", tech: 6, phys: 7, tact: 7, form: 4, group: "Bench", notes: "Hamstring; two weeks out." },
  { name: "Zied Bouzid", position: "RB", foot: "right", availability: "available", tech: 6, phys: 7, tact: 6, form: 6, group: "Bench" },
  { name: "Hedi Khelifi", position: "CM", foot: "right", availability: "available", tech: 7, phys: 7, tact: 7, form: 6, group: "Bench" },
  { name: "Rami Aouadi", position: "AM", foot: "left", availability: "available", tech: 8, phys: 6, tact: 7, form: 7, group: "Bench", notes: "Creative off the bench." },
  { name: "Sofiene Nasri", position: "ST", foot: "right", availability: "suspended", tech: 7, phys: 7, tact: 6, form: 6, group: "Bench", notes: "One-match ban (yellow accumulation)." },
  { name: "Walid Ferjani", position: "LW", foot: "right", availability: "available", tech: 7, phys: 8, tact: 6, form: 7, group: "Bench" },

  { name: "Anis Rekik", position: "CB", foot: "right", availability: "available", tech: 5, phys: 6, tact: 6, form: 5, group: "Reserves" },
  { name: "Mehdi Jlassi", position: "CM", foot: "left", availability: "available", tech: 6, phys: 6, tact: 6, form: 6, group: "Reserves" },
];

const MATCHES: {
  daysAgo: number;
  homeAway: "home" | "away";
  our: string;
  opp: string;
  gf: number;
  ga: number;
  possession: number;
  shots: number;
  sot: number;
}[] = [
  { daysAgo: 4, homeAway: "home", our: "4-3-3", opp: "4-4-2", gf: 2, ga: 1, possession: 58, shots: 14, sot: 6 },
  { daysAgo: 11, homeAway: "away", our: "4-3-3", opp: "4-2-3-1", gf: 0, ga: 2, possession: 44, shots: 8, sot: 2 },
  { daysAgo: 18, homeAway: "home", our: "4-3-3", opp: "3-5-2", gf: 3, ga: 0, possession: 61, shots: 17, sot: 9 },
  { daysAgo: 25, homeAway: "away", our: "4-2-3-1", opp: "4-3-3", gf: 1, ga: 1, possession: 49, shots: 11, sot: 4 },
  { daysAgo: 32, homeAway: "home", our: "4-3-3", opp: "4-4-2", gf: 1, ga: 2, possession: 55, shots: 12, sot: 5 },
];

function isoDaysAgo(days: number): string {
  const d = new Date(Date.now() - days * 86400000);
  return d.toISOString().slice(0, 10);
}

export const seedDemoData = mutation({
  args: {},
  handler: async (ctx) => {
    const coach = await requireCoach(ctx);

    const existingTeam = await ctx.db
      .query("teams")
      .withIndex("by_club", (q) => q.eq("clubId", coach.clubId))
      .first();
    if (existingTeam) {
      return { skipped: true as const };
    }

    const teamId = await ctx.db.insert("teams", {
      clubId: coach.clubId,
      name: "Étoile Démo",
      ageCategory: "Senior",
      competition: "Ligue 1",
      defaultFormation: "4-3-3",
    });

    let order = 0;
    let lastGroup = "";
    for (const p of PLAYERS) {
      if (p.group !== lastGroup) {
        order = 0;
        lastGroup = p.group;
      }
      await ctx.db.insert("players", {
        clubId: coach.clubId,
        teamId,
        name: p.name,
        position: p.position,
        preferredFoot: p.foot,
        availability: p.availability,
        technicalRating: p.tech,
        physicalRating: p.phys,
        tacticalRating: p.tact,
        formRating: p.form,
        coachNotes: p.notes,
        squadGroup: p.group,
        sortOrder: order++,
      });
    }

    const opponentId = await ctx.db.insert("opponents", {
      clubId: coach.clubId,
      teamName: "Club Sportif Rival",
      usualFormation: "4-2-3-1",
      alternativeFormations: ["4-4-2"],
      playingStyle: "Possession-oriented, patient build-up",
      pressingStyle: "High press in the opening 20 minutes, then drops off",
      buildUpStyle: "Short, through the goalkeeper and pivot",
      defensiveStyle: "Compact mid-block",
      strengths: "Strong central midfield; dangerous from set pieces",
      weaknesses: "Full-backs push high and leave space in behind; slow to recover in transition",
      setPieceNotes: "Near-post attacking corners; zonal marking at the back post",
    });

    for (const m of MATCHES) {
      await ctx.db.insert("matches", {
        clubId: coach.clubId,
        teamId,
        opponentId,
        matchDate: isoDaysAgo(m.daysAgo),
        homeAway: m.homeAway,
        competition: "Ligue 1",
        ourFormation: m.our,
        opponentFormation: m.opp,
        scoreFor: m.gf,
        scoreAgainst: m.ga,
        possessionPct: m.possession,
        shots: m.shots,
        shotsOnTarget: m.sot,
      });
    }

    return { skipped: false as const, teamId };
  },
});
