import type { PlacedSpell, PlacedSpellWithData, Spell } from "./types";

export const ROW_COUNT = 8;
export const PIXELS_PER_SECOND = 40;
export const SNAP_SECONDS = 0.5;
export const PROTECTED_SECONDS = 1.5;
export const MIN_TIMELINE_SECONDS = 120;

export function createId(): string {
  return crypto.randomUUID();
}

export function snapTime(seconds: number): number {
  return Math.max(0, Math.round(seconds / SNAP_SECONDS) * SNAP_SECONDS);
}

export function getBlockedDuration(spell: Spell): number {
  return Math.max(spell.duration, spell.cooldown);
}

export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}

export function getRowNames(spells: Spell[]): (string | null)[] {
  const names = [...new Set(spells.map((spell) => spell.name))];

  return Array.from({ length: ROW_COUNT }, (_, index) => names[index] ?? null);
}

export function getTimelineEnd(placed: PlacedSpellWithData[]): number {
  const furthest = placed.reduce(
    (end, instance) =>
      Math.max(
        end,
        instance.start +
          Math.max(instance.spell.duration, instance.spell.cooldown),
      ),
    MIN_TIMELINE_SECONDS,
  );

  return Math.ceil((furthest + 5) / 5) * 5;
}

/**
 * Checks whether a spell placement violates scheduling rules.
 *
 * Same name:
 *   The full duration/cooldown windows cannot overlap.
 *
 * Different names:
 *   Neither spell's duration may overlap the other spell's
 *   first 1.5 seconds of duration.
 *
 * ignoreId excludes the spell currently being dragged.
 */
export function hasConflict(
  candidate: PlacedSpell,
  candidateSpell: Spell,
  allPlaced: PlacedSpellWithData[],
  ignoreId?: string,
): boolean {
  return allPlaced.some((other) => {
    if (other.id === ignoreId || other.id === candidate.id) {
      return false;
    }

    // Spells with the same name cannot overlap their
    // duration/cooldown windows.
    if (other.spell.name === candidateSpell.name) {
      return intervalsOverlap(
        candidate.start,
        candidate.start + getBlockedDuration(candidateSpell),
        other.start,
        other.start + getBlockedDuration(other.spell),
      );
    }

    // Different spells have a fixed 1.5-second cast time.
    // Only their cast-time intervals must not overlap.
    const candidateCastEnd = candidate.start + PROTECTED_SECONDS;

    const otherCastEnd = other.start + PROTECTED_SECONDS;

    return intervalsOverlap(
      candidate.start,
      candidateCastEnd,
      other.start,
      otherCastEnd,
    );
  });
}

/**
 * Finds the earliest valid placement in 0.5-second increments.
 */
export function findNextAvailableStart(
  spell: Spell,
  placed: PlacedSpellWithData[],
  maxSteps = 20000,
): number | null {
  const candidate: PlacedSpell = {
    id: createId(),
    spellId: spell.id,
    start: 0,
  };

  for (let step = 0; step <= maxSteps; step++) {
    candidate.start = step * SNAP_SECONDS;

    if (!hasConflict(candidate, spell, placed)) {
      return candidate.start;
    }
  }

  return null;
}

export function buildPlacedSpellData(
  placed: PlacedSpell[],
  spells: Spell[],
): PlacedSpellWithData[] {
  const spellMap = new Map(spells.map((spell) => [spell.id, spell]));

  return placed.flatMap((instance) => {
    const spell = spellMap.get(instance.spellId);

    return spell ? [{ ...instance, spell }] : [];
  });
}
