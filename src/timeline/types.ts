export type Spell = {
  id: string;
  name: string;
  duration: number;
  cooldown: number;
};

export type PlacedSpell = {
  id: string;
  spellId: string;
  start: number;
};

export type PlacedSpellWithData = PlacedSpell & {
  spell: Spell;
};

export type DragState = {
  placedId: string;
  pointerId: number;
  originX: number;
  originalStart: number;
  currentStart: number;
};
