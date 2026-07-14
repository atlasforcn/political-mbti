const test = require("node:test");
const assert = require("node:assert/strict");
const discussion = require("../discussion-profile");

const dimensions = {
  role: { label: "公共角色" },
  change: { label: "改革步調" }
};
const issues = {
  role: { welfare: { label: "社會保護" } },
  change: { reform: { label: "制度重設" } }
};
const questions = [
  { id: "R01", dimension: "role", issue: "welfare", topic: "醫療", direction: 1, text: "政府應保障醫療。" },
  { id: "R02", dimension: "role", issue: "welfare", topic: "市場", direction: -1, text: "政府應少介入。" },
  { id: "C01", dimension: "change", issue: "reform", topic: "修法", direction: 1, text: "制度應快速改革。" }
];

test("builds a memorable archetype and detects the answer that breaks the overall pattern", () => {
  const result = { scores: { role: { leftPercentage: 88 }, change: { leftPercentage: 62 } } };
  const profile = discussion.analyze(questions, [5, 5, 4], result, dimensions, issues);
  assert.equal(profile.archetype, "安全網編織者");
  assert.equal(profile.heat, 67);
  assert.equal(profile.rebel.question.id, "R02");
  assert.equal(profile.prompts[0].answer, "非常同意");
});

test("handles an all-uncertain response without dividing by zero", () => {
  const result = { scores: { role: { leftPercentage: 50 }, change: { leftPercentage: 50 } } };
  const profile = discussion.analyze(questions, [3, 3, 3], result, dimensions, issues);
  assert.equal(profile.heat, 0);
  assert.equal(profile.rebel, null);
  assert.deepEqual(profile.prompts, []);
});
