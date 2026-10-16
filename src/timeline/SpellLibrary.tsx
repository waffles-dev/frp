import React from "react";
import type { Spell } from "./types";

type SpellLibraryProps = {
  spells: Spell[];
  onAdd: (spell: Spell) => void;
};

export default function SpellLibrary({ spells, onAdd }: SpellLibraryProps) {
  return (
    <section className="spell-library">
      <div className="section-heading">
        <div>
          <h3>Spell Library</h3>
          <p>Click a spell to add it to its row at the next valid time.</p>
        </div>

        <span className="spell-count">
          {spells.length} {spells.length === 1 ? "spell" : "spells"}
        </span>
      </div>

      {spells.length === 0 ? (
        <div className="empty-library">
          No spells created yet. Create one below to get started.
        </div>
      ) : (
        <div className="spell-library-list">
          {spells.map((spell) => (
            <div className="library-spell" key={spell.id}>
              <div className="library-spell-info">
                <span className="library-spell-name">{spell.name}</span>

                <span className="library-spell-stats">
                  {spell.duration}s duration · {spell.cooldown}s cooldown
                </span>
              </div>

              <button
                type="button"
                className="add-spell-button"
                onClick={() => onAdd(spell)}
              >
                + Add
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
