import React, { useMemo, useRef, useState } from "react";
import type { PointerEvent } from "react";
import type {
  DragState,
  PlacedSpell,
  PlacedSpellWithData,
  Spell,
} from "./types";

import TimelineRuler from "./TimelineRuler";
import TimelineRow from "./TimelineRow";
import SpellLibrary from "./SpellLibrary";
import SpellForm from "./Spellform";

import {
  PIXELS_PER_SECOND,
  ROW_COUNT,
  SNAP_SECONDS,
  buildPlacedSpellData,
  findNextAvailableStart,
  getRowNames,
  getTimelineEnd,
  hasConflict,
  snapTime,
} from "./timelineUtils";

import "./Timeline.css";

export default function Timeline() {
  const [spells, setSpells] = useState<Spell[]>([]);
  const [placed, setPlaced] = useState<PlacedSpell[]>([]);
  const [drag, setDrag] = useState<DragState | null>(null);
  const [error, setError] = useState("");

  // The ref lets pointer events access the latest drag state
  // without waiting for React to render.
  const dragRef = useRef<DragState | null>(null);

  const rowNames = useMemo(() => getRowNames(spells), [spells]);

  const placedWithSpells = useMemo(
    () => buildPlacedSpellData(placed, spells),
    [placed, spells],
  );

  const timelineEnd = useMemo(
    () => getTimelineEnd(placedWithSpells),
    [placedWithSpells],
  );

  const timelineWidth = timelineEnd * PIXELS_PER_SECOND;

  const handleCreateSpell = (spell: Spell) => {
    setSpells((current) => [...current, spell]);
    setError("");
  };

  const handleAddSpell = (spell: Spell) => {
    setError("");

    const start = findNextAvailableStart(spell, placedWithSpells);

    if (start === null) {
      setError("No available timeline slot was found.");
      return;
    }

    const instance: PlacedSpell = {
      id: crypto.randomUUID(),
      spellId: spell.id,
      start,
    };

    setPlaced((current) => [...current, instance]);
  };

  const handleRemoveSpell = (id: string) => {
    setPlaced((current) => current.filter((instance) => instance.id !== id));
  };

  const handleClearRow = (rowName: string) => {
    setPlaced((current) =>
      current.filter((instance) => {
        const spell = spells.find((item) => item.id === instance.spellId);

        return spell?.name !== rowName;
      }),
    );

    // Cancel an active drag if its spell belongs to this row.
    const currentDrag = dragRef.current;

    if (currentDrag) {
      const draggedInstance = placed.find(
        (item) => item.id === currentDrag.placedId,
      );

      const draggedSpell = spells.find(
        (item) => item.id === draggedInstance?.spellId,
      );

      if (draggedSpell?.name === rowName) {
        dragRef.current = null;
        setDrag(null);
      }
    }
  };

  const handleDragStart = (
    event: PointerEvent<HTMLButtonElement>,
    instance: PlacedSpellWithData,
  ) => {
    if (event.button !== 0) return;

    event.preventDefault();
    event.stopPropagation();

    const nextDrag: DragState = {
      placedId: instance.id,
      pointerId: event.pointerId,
      originX: event.clientX,
      originalStart: instance.start,
      currentStart: instance.start,
    };

    dragRef.current = nextDrag;
    setDrag(nextDrag);

    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDragMove = (event: PointerEvent<HTMLButtonElement>) => {
    const currentDrag = dragRef.current;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
      return;
    }

    const deltaSeconds =
      (event.clientX - currentDrag.originX) / PIXELS_PER_SECOND;

    const nextStart = snapTime(currentDrag.originalStart + deltaSeconds);

    const updatedDrag: DragState = {
      ...currentDrag,
      currentStart: nextStart,
    };

    dragRef.current = updatedDrag;
    setDrag(updatedDrag);
  };

  const handleDragEnd = (event: PointerEvent<HTMLButtonElement>) => {
    const currentDrag = dragRef.current;

    if (!currentDrag || currentDrag.pointerId !== event.pointerId) {
      return;
    }

    const instance = placedWithSpells.find(
      (item) => item.id === currentDrag.placedId,
    );

    if (instance) {
      const candidate: PlacedSpell = {
        id: instance.id,
        spellId: instance.spellId,
        start: currentDrag.currentStart,
      };

      const conflict = hasConflict(
        candidate,
        instance.spell,
        placedWithSpells,
        instance.id,
      );

      // Invalid placement is never committed.
      if (!conflict) {
        setPlaced((current) =>
          current.map((item) =>
            item.id === instance.id
              ? { ...item, start: candidate.start }
              : item,
          ),
        );
      }
    }

    dragRef.current = null;
    setDrag(null);
  };

  return (
    <div className="spell-timeline">
      <header className="timeline-header">
        <div>
          <h2>Spell Timeline</h2>
          <p>
            Drag blocks horizontally in 0.5-second increments. Click a block to
            remove it.
          </p>
        </div>

        <div className="timeline-legend">
          <span>
            <i className="legend-duration" />
            Duration
          </span>
          <span>
            <i className="legend-cooldown" />
            Remaining cooldown
          </span>
          <span>
            <i className="legend-conflict" />
            Conflict
          </span>
        </div>
      </header>

      <div className="timeline-scroll">
        <div className="timeline-canvas" style={{ width: timelineWidth }}>
          <TimelineRuler width={timelineWidth} endSeconds={timelineEnd} />

          <div className="timeline-body">
            {Array.from({ length: ROW_COUNT }, (_, rowIndex) => (
              <TimelineRow
                key={rowIndex}
                rowName={rowNames[rowIndex] ?? null}
                rowIndex={rowIndex}
                width={timelineWidth}
                spells={placedWithSpells}
                drag={drag}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onDragEnd={handleDragEnd}
                onRemove={handleRemoveSpell}
                onClearRow={handleClearRow}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="timeline-notes">
        <span>
          <strong>8 rows</strong> · {SNAP_SECONDS}s snap · 1.5s GCD
        </span>
        <span>Scroll horizontally to view more time →</span>
      </div>

      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      <SpellLibrary spells={spells} onAdd={handleAddSpell} />

      <SpellForm spells={spells} onCreate={handleCreateSpell} />
    </div>
  );
}
