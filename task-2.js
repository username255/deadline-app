/**
 * Camera object interface: {
 *   dMin: number,  // min distance
 *   dMax: number,  // max distance
 *   lMin: number,  // min light
 *   lMax: number   // max light
 * }
 *
 * Check if the union of all cameras covers:
 *   [distanceMin, distanceMax] x [lightMin, lightMax].
 *
 * Returns true if fully covered, false otherwise.
 *
 * Usage:
 *
 * const cameras = [
 *  { dMin: 0,  dMax: 10, lMin: 0,  lMax: 5 },
 *  { dMin: 0,  dMax: 10, lMin: 5,  lMax: 10 },
 *  { dMin: 10, dMax: 20, lMin: 0,  lMax: 10 },
 * ];
 * Check coverage for [0..20] in distance x [0..10] in light:
 *    console.log(canCoverAll(0, 20, 0, 10, cameras)); // true (example)
 */
function canCoverAll(distanceMin, distanceMax, lightMin, lightMax, cameras) {
  // if there is nothing to intersect with, return true
  if (distanceMin === distanceMax && lightMin === lightMax) {
    return true;
  } else if (!cameras.length) {
    return false;
  }

  // 1) Filter + clamp cameras to the global distance range
  const validCams = [];
  cameras.forEach((cam) => {
    // Skip if no overlap with the target distance or no overlap with the target light
    if (
      cam.dMax >= distanceMin &&
      cam.dMin <= distanceMax &&
      cam.lMax >= lightMin &&
      cam.lMin <= lightMax
    ) {
      validCams.push({
        dMin: Math.max(distanceMin, cam.dMin),
        dMax: Math.min(distanceMax, cam.dMax),
        lMin: Math.max(lightMin, cam.lMin),
        lMax: Math.min(lightMax, cam.lMax),
      });
    }
  });

  if (!validCams.length) {
    return false; // No cameras to cover the range
  }

  // 2) Build events (distance dimension).
  // Each camera => two events: "add coverage" at dMin, "remove coverage" at dMax.
  // We'll also add boundary "check" events at distanceMin & distanceMax.
  const events = [];
  events.push({ dist: distanceMin, type: 0, lMin: 0, lMax: 0 });
  events.push({ dist: distanceMax, type: 0, lMin: 0, lMax: 0 });

  for (const cam of validCams) {
    events.push({
      dist: cam.dMin,
      type: +1, // +1 => add coverage
      lMin: cam.lMin,
      lMax: cam.lMax,
    });
    events.push({
      dist: cam.dMax,
      type: -1, // -1 => remove coverage
      lMin: cam.lMin,
      lMax: cam.lMax,
    });
  }

  // Sort events by distance
  events.sort((a, b) => a.dist - b.dist);

  // 3) Coordinate compression in the light dimension
  // Gather all lMin/lMax plus the global [lightMin, lightMax].
  const lightCoords = new Set([lightMin, lightMax]);

  validCams.forEach((cam) => {
    lightCoords.add(cam.lMin);
    lightCoords.add(cam.lMax);
  });

  const uniqueLightValues = Array.from(lightCoords).sort((a, b) => a - b);

  // Map each light value to an index in [0..(uniqueLightValues.length-1)]
  const lightIndex = new Map();
  uniqueLightValues.forEach((val, idx) => {
    lightIndex.set(val, idx);
  });

  // 4) Build a segment tree over these compressed light indices.
  // We have (uniqueLightValues.length - 1) intervals in the light dimension.
  const segTree = new SegmentTree(uniqueLightValues);

  // The total integer length to cover in the light dimension
  const totalLen = lightMax - lightMin;

  // 5) Sweep line over distance
  let prevDist = events[0].dist; // first event's distance
  for (let i = 0; i < events.length; i++) {
    const { dist, type, lMin, lMax } = events[i];

    // If there's a gap [prevDist, dist) in distance, check coverage in that interval
    if (dist > prevDist) {
      const left = Math.max(prevDist, distanceMin);
      const right = Math.min(dist, distanceMax);
      if (right > left) {
        // The set of active cameras in [left, right) hasn't changed
        // => check if we fully cover the light dimension
        const coveredLen = segTree.getCoveredLength();
        if (coveredLen < totalLen) {
          return false; // Not fully covered
        }
      }
    }

    // Now process the current event (if type != 0) - eg not boundary
    if (type !== 0) {
      // We add/remove coverage in the light dimension
      segTree.update(
        lightIndex.get(lMin),
        lightIndex.get(lMax),
        type > 0 ? 1 : -1
      );
    }

    prevDist = dist;
  }

  // If no gap was found, coverage is complete
  return true;
}

/**
 * Segment Tree for integer-based coverage in the light dimension.
 * - We do coordinate compression of the unique light coordinates.
 * - coverCount[node] tracks how many cameras currently cover that segment.
 * - coveredLen[node] tracks how many *integer units* of that segment are covered.
 */
class SegmentTree {
  /**
   * coords = sorted unique integer light coords, e.g. [2, 5, 7, 10].
   * We'll store coverage for intervals between consecutive coords:
   *    [2..5), [5..7), [7..10).
   * There are (coords.length - 1) intervals.
   */
  constructor(coords) {
    this.coords = coords;
    this.n = coords.length - 1; // number of intervals
    this.coverCount = new Array(4 * this.n).fill(0);
    this.coveredLen = new Array(4 * this.n).fill(0);
    // Build the tree with a helper (though for coverage, an empty build is okay).
    this._build(1, 0, this.n - 1);
  }

  _build(idx, left, right) {
    if (left > right) return;
    if (left === right) {
      // single interval [coords[left]..coords[left+1]) => length:
      this.coveredLen[idx] = 0; // not covered initially
      return;
    }
    const mid = (left + right) >> 1;
    this._build(idx << 1, left, mid);
    this._build((idx << 1) | 1, mid + 1, right);
    this.coveredLen[idx] = 0;
  }

  /**
   * Update coverage in [uLeft..uRight) in compressed indices
   * by adding +1 or -1 to coverCount.
   * Because we store intervals as [i..i+1) in index space,
   * use updateRange(..., uRight - 1).
   */
  update(uLeft, uRight, delta) {
    if (uLeft > uRight) return;
    // The segment tree node covers intervals from uLeft..uRight-1 inclusive
    // so we pass uRight-1 for the upper boundary in _updateRange.
    this._updateRange(1, 0, this.n - 1, uLeft, uRight - 1, delta);
  }

  _updateRange(idx, left, right, ql, qr, delta) {
    if (ql > right || qr < left) {
      // no overlap
      return;
    }
    if (ql <= left && right <= qr) {
      // fully in query range
      this.coverCount[idx] += delta;
    } else {
      // partial overlap
      const mid = (left + right) >> 1;
      this._updateRange(idx << 1, left, mid, ql, qr, delta);
      this._updateRange((idx << 1) | 1, mid + 1, right, ql, qr, delta);
    }

    // Recompute coveredLen for this node
    if (this.coverCount[idx] > 0) {
      // If coverCount > 0, entire segment is covered
      this.coveredLen[idx] = this.coords[right + 1] - this.coords[left];
    } else if (left === right) {
      // Leaf node, coverCount=0 => no coverage
      this.coveredLen[idx] = 0;
    } else {
      // Internal node => sum from children
      this.coveredLen[idx] =
        this.coveredLen[idx << 1] + this.coveredLen[(idx << 1) | 1];
    }
  }

  /**
   * Return how many integer units in [lightMin..lightMax] are covered
   * by at least one camera.
   */
  getCoveredLength() {
    // The root of the tree covers the entire compressed range
    return this.coveredLen[1];
  }
}

// -----------------------------------------------------------
// Example usage (with integer ranges):

const cameras = [
  { dMin: 0, dMax: 10, lMin: 0, lMax: 5 },
  { dMin: 0, dMax: 10, lMin: 5, lMax: 10 },
  { dMin: 10, dMax: 20, lMin: 0, lMax: 10 },
];
// Check coverage for [0..20] in distance x [0..10] in light.
console.log(canCoverAll(0, 20, 0, 10, cameras)); // true
console.log(canCoverAll(0, 0, 0, 0, cameras), "nothing to cover case"); // true
console.log(canCoverAll(0, 10, 0, 10, []), "no cameras"); // false
console.log(canCoverAll(8, 50, 0, 10, cameras), "cameras are out of range"); // false
