(function (root, factory) {
  const data = factory();
  if (typeof module === "object" && module.exports) module.exports = data;
  else root.PERSONALITY_TYPES = data;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";
  const role = { S: "公共", L: "自主" };
  const distribution = { E: "平權", F: "程序" };
  const change = { A: "改革", T: "穩健" };
  const agency = { R: "能動", C: "脈絡" };
  const suffix = { R: "實踐者", C: "協作者" };
  const types = {};

  Object.keys(role).forEach(function (r) {
    Object.keys(distribution).forEach(function (d) {
      Object.keys(change).forEach(function (c) {
        Object.keys(agency).forEach(function (a) {
          const code = r + d + c + a;
          const name = role[r] + distribution[d] + change[c] + suffix[a];
          types[code] = {
            name,
            summary: "你較重視" + role[r] + "取向的公共角色、" + distribution[d] + "導向的分配原則，並偏好" + change[c] + "的改變步調；判斷社會成果時，你更著重" + agency[a] + "因素。"
          };
        });
      });
    });
  });
  return types;
});
