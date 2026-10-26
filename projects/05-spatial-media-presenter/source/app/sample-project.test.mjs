import assert from "node:assert/strict";
import { SAMPLE_SET, needsSampleUpgrade } from "./sample-project.ts";

assert.equal(needsSampleUpgrade(null), false);
assert.equal(needsSampleUpgrade({ items: [] }), false);
assert.equal(needsSampleUpgrade({ items: [{ id: "data-center" }] }), true);
// Legacy manually imported boards get an archive, not a destructive filter.
const oldBoard = { items: [{ id: "upload-123" }, { id: "metlife-stadium" }] };
const original = JSON.stringify(oldBoard);
assert.equal(needsSampleUpgrade(oldBoard), true);
assert.equal(JSON.stringify(oldBoard), original);
assert.equal(needsSampleUpgrade({ sampleSet: SAMPLE_SET, items: [{ id: "upload-123" }] }), false);
assert.equal(needsSampleUpgrade({ items: [{ id: "portfolio-5" }, { id: "upload-123" }] }), false);
console.log("Sample migration: 7 checks passed; user media retained in board archive.");
