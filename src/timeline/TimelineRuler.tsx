import React from "react";
import { PIXELS_PER_SECOND } from "./timelineUtils";

type TimelineRulerProps = {
  width: number;
  endSeconds: number;
};

export default function TimelineRuler({
  width,
  endSeconds,
}: TimelineRulerProps) {
  return (
    <div className="timeline-ruler">
      <div className="row-label ruler-label">Spell</div>

      <div className="ruler-track" style={{ width }}>
        {Array.from({ length: endSeconds + 1 }, (_, second) => (
          <div
            className="ruler-tick"
            key={second}
            style={{
              left: second * PIXELS_PER_SECOND,
            }}
          >
            <span>{second}s</span>
          </div>
        ))}
      </div>
    </div>
  );
}
