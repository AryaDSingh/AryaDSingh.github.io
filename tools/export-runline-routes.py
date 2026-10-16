#!/usr/bin/env python3
"""Exports Runline's recorded rooftop routes for the case study's route viewer.

The traces are faith-runner's own test runs, recorded frame by frame
(tools/trace/make-traces.sh in the Runline repo); RunlineCore's tests replay
each through the C++ port and require bit-identical results. This keeps what
the page draws: the course boxes near the route, and per frame the feet
position, speed and movement state.

    python3 tools/export-runline-routes.py ../runline > assets/portfolio/runline-routes.json
"""
import json
import math
import pathlib
import sys

ROUTES = [
    ("r1_rail_skylight_pipe_gap", "Rail, skylight and pipe gap"),
    ("r2_billboard_wallrun", "Billboard wallrun"),
    ("r2_girder_walk", "Girder walk"),
    ("r3_climb_to_upper", "Climb to the upper roof"),
    ("r3_crate_route", "Crate route"),
    ("r4_slalom_and_girder", "Slalom and girder"),
    ("r5_drop_needs_roll", "A drop that needs a roll"),
    ("r6_duct_vents_climb_finish", "Ducts, vents, climb, finish"),
]
COURSE_HALF_WIDTH = 12.5  # boxes beyond this are backdrop buildings, not the course


def read(path):
    boxes, frames = [], []
    for line in path.read_text().splitlines():
        f = line.split(",")
        if f[0] == "box":
            boxes.append([float(v) for v in f[1:7]])
        elif f[0] == "out":
            x, y, z, vx, vy, vz = (float(v) for v in f[1:7])
            frames.append((x, y, z, math.hypot(vx, vz), f[9]))
    return boxes, frames


def main():
    root = pathlib.Path(sys.argv[1]) / "RunlineCore/tests/golden/traces"
    states, routes, course = [], [], None
    for key, title in ROUTES:
        boxes, frames = read(root / f"rooftops_tests__{key}__1.trace")
        if course is None:
            course = [b for b in boxes if b[0] > -200 and abs(b[0]) <= COURSE_HALF_WIDTH and abs(b[3]) <= COURSE_HALF_WIDTH]
        for *_, state in frames:
            if state not in states:
                states.append(state)
        routes.append({
            "key": key,
            "title": title,
            # x, y, z (metres, Y up), horizontal speed (m/s), state index; 60 frames a second
            "frames": [[round(x, 2), round(y, 2), round(z, 2), round(s, 2), states.index(st)] for x, y, z, s, st in frames],
        })
    json.dump({"states": states, "boxes": [[round(v, 2) for v in b] for b in course], "routes": routes},
              sys.stdout, separators=(",", ":"))


if __name__ == "__main__":
    main()
