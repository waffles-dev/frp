import React, { useRef } from "react";
import type { PointerEvent } from "react";
import type { Spell } from "./types";
import { PIXELS_PER_SECOND } from "./timelineUtils";

type SpellBlockProps = {
  spell: Spell;
  start: number;
  cooldownRemaining: number;
  dragging: boolean;
  conflict: boolean;
  onDragStart: (event: PointerEvent<HTMLButtonElement>) => void;
  onDragMove: (event: PointerEvent<HTMLButtonElement>) => void;
  onDragEnd: (event: PointerEvent<HTMLButtonElement>) => void;
  onRemove: () => void;
};

export default function SpellBlock({
  spell,
  start,
  cooldownRemaining,
  dragging,
  conflict,
  onDragStart,
  onDragMove,
  onDragEnd,
  onRemove,
}: SpellBlockProps) {
  // Prevent the click generated after a drag from removing the spell.
  const movedRef = useRef(false);
  const pointerOriginRef = useRef<{ x: number; y: number } | null>(null);

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    if (event.button !== 0) return;

    movedRef.current = false;
    pointerOriginRef.current = {
      x: event.clientX,
      y: event.clientY,
    };

    onDragStart(event);
  };

  const handlePointerMove = (event: PointerEvent<HTMLButtonElement>) => {
    const origin = pointerOriginRef.current;

    if (origin) {
      const dx = event.clientX - origin.x;
      const dy = event.clientY - origin.y;

      if (Math.hypot(dx, dy) > 3) {
        movedRef.current = true;
      }
    }

    onDragMove(event);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLButtonElement>) => {
    onDragEnd(event);
    pointerOriginRef.current = null;
  };

  const handleClick = () => {
    if (movedRef.current) {
      movedRef.current = false;
      return;
    }

    onRemove();
  };

  return (
    <>
      <button
        type="button"
        className={[
          "spell-block",
          dragging ? "is-dragging" : "",
          conflict ? "has-conflict" : "",
        ]
          .filter(Boolean)
          .join(" ")}
        style={{
          left: start * PIXELS_PER_SECOND,
          width: Math.max(12, spell.duration * PIXELS_PER_SECOND),
          zIndex: dragging ? 5 : 2,
        }}
        title={`${spell.name}: ${spell.duration}s duration, ${spell.cooldown}s cooldown. Click to remove.`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onClick={handleClick}
      >
        <span className="spell-block-name">{spell.name}</span>
        <span className="spell-block-duration">{spell.duration}s</span>
      </button>

      {cooldownRemaining > 0 && (
        <div
          className="cooldown-line"
          style={{
            left: (start + spell.duration) * PIXELS_PER_SECOND,
            width: cooldownRemaining * PIXELS_PER_SECOND,
          }}
          title={`${cooldownRemaining}s remaining cooldown`}
        />
      )}
    </>
  );
}
