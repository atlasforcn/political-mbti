const test = require("node:test");
const assert = require("node:assert/strict");
const types = require("../personality-types");

test("all sixteen profiles include a complete intellectual-neighbor reading", () => {
  assert.equal(Object.keys(types).length, 16);
  Object.entries(types).forEach(([code, profile]) => {
    assert.ok(profile.thought, code + " is missing thought data");
    ["thinker", "field", "work", "question", "connection", "url"].forEach((key) => {
      assert.ok(profile.thought[key], code + " is missing " + key);
    });
    const search = new URL(profile.thought.searchUrl);
    assert.equal(search.hostname, "www.google.com");
    assert.equal(search.searchParams.get("q"), profile.thought.thinker + " " + profile.thought.work);
  });
});
