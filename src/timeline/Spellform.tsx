import React, { useState } from "react";
import type { FormEvent } from "react";
import type { Spell } from "./types";
import { createId, ROW_COUNT } from "./timelineUtils";

type SpellFormProps = {
  spells: Spell[];
  onCreate: (spell: Spell) => void;
};

export default function SpellForm({ spells, onCreate }: SpellFormProps) {
  const [name, setName] = useState("");
  const [duration, setDuration] = useState("1.5");
  const [cooldown, setCooldown] = useState("0");
  const [error, setError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError("");

    const cleanName = name.trim();
    const parsedDuration = Number(duration);
    const parsedCooldown = Number(cooldown);

    if (!cleanName) {
      setError("Please enter a spell name.");
      return;
    }

    if (
      !Number.isFinite(parsedDuration) ||
      parsedDuration <= 0 ||
      !Number.isFinite(parsedCooldown) ||
      parsedCooldown < 0
    ) {
      setError(
        "Duration must be greater than 0 and cooldown cannot be negative.",
      );
      return;
    }

    const uniqueNames = new Set(spells.map((spell) => spell.name));

    if (!uniqueNames.has(cleanName) && uniqueNames.size >= ROW_COUNT) {
      setError("All 8 rows are in use. Choose an existing spell name.");
      return;
    }

    onCreate({
      id: createId(),
      name: cleanName,
      duration: parsedDuration,
      cooldown: parsedCooldown,
    });

    setName("");
    setDuration("1.5");
    setCooldown("5");
  };

  return (
    <form className="spell-form" onSubmit={handleSubmit}>
      <h3>Create a Spell</h3>

      <div className="form-grid">
        <label>
          <span>Name</span>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Fireball"
            maxLength={40}
            required
          />
        </label>

        <label>
          <span>Duration (seconds)</span>
          <input
            type="number"
            value={duration}
            onChange={(event) => setDuration(event.target.value)}
            min="1.5"
            step="0.5"
            required
          />
        </label>

        <label>
          <span>Cooldown (seconds)</span>
          <input
            type="number"
            value={cooldown}
            onChange={(event) => setCooldown(event.target.value)}
            min="0"
            step="0.5"
            required
          />
        </label>

        <button type="submit" className="create-spell-button">
          Create Spell
        </button>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <p className="form-hint">
        Spells with the same name share a row. Up to 8 unique spell names can be
        used.
      </p>
    </form>
  );
}
