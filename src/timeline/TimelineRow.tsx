import React from "react";
import type { PointerEvent } from "react";
import type { DragState, PlacedSpellWithData } from "./types";
import SpellBlock from "./SpellBlock";
import { PIXELS_PER_SECOND, hasConflict } from "./timelineUtils";

type TimelineRowProps = {
  rowName: string | null;
  rowIndex: number;
  width: number;
  spells: PlacedSpellWithData[];
  drag: DragState | null;
  onDragStart: (
    event: PointerEvent<HTMLButtonElement>,
    instance: PlacedSpellWithData,
  ) => void;
  onDragMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onDragEnd: (event: PointerEvent<HTMLButtonElement>) => void;
  onRemove: (id: string) => void;
  onClearRow: (rowName: string) => void;
};

export default function TimelineRow({
  rowName,
  rowIndex,
  width,
  spells,
  drag,
  onDragStart,
  onDragMove,
  onDragEnd,
  onRemove,
  onClearRow,
}: TimelineRowProps) {
  const rowSpells = spells.filter(
    (instance) => instance.spell.name === rowName,
  );

  return (
    <div className="timeline-row">
      <div className="row-label">
        <span className="row-number">
          {String(rowIndex + 1).padStart(2, "0")}
        </span>

        <span className="row-name">{rowName ?? "Empty row"}</span>

        <button
          type="button"
          className="row-clear-button"
          disabled={!rowName || rowSpells.length === 0}
          title={
            rowName
              ? `Remove all ${rowSpells.length} spells from ${rowName}`
              : "No spell assigned to this row"
          }
          aria-label={`Clear row ${rowIndex + 1}, ${rowSpells.length} spells`}
          onClick={() => {
            if (rowName && rowSpells.length > 0) {
              onClearRow(rowName);
            }
          }}
        >
          {rowSpells.length}
        </button>
      </div>

      <div
        className="row-track"
        style={{
          width,
          backgroundSize: `${PIXELS_PER_SECOND}px 100%`,
        }}
      >
        {rowSpells.map((instance) => {
          const isDragging = drag?.placedId === instance.id;

          const displayedStart = isDragging
            ? drag.currentStart
            : instance.start;

          const candidate = {
            ...instance,
            start: displayedStart,
          };

          const conflict = isDragging
            ? hasConflict(candidate, instance.spell, spells, instance.id)
            : false;

          return (
            <SpellBlock
              key={instance.id}
              spell={instance.spell}
              start={displayedStart}
              cooldownRemaining={Math.max(
                0,
                instance.spell.cooldown - instance.spell.duration,
              )}
              dragging={isDragging}
              conflict={conflict}
              onDragStart={(event) => onDragStart(event, instance)}
              onDragMove={onDragMove}
              onDragEnd={onDragEnd}
              onRemove={() => onRemove(instance.id)}
            />
          );
        })}
      </div>
    </div>
  );
}
