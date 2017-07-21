
/**
 * Utils 工具箱
 *
 * @namespace JC.Utils
 */
export const Utils = {
  merge: function(master, branch) {
    if (!branch) return master;
    for (const key in branch) {
      if (branch[key] !== undefined) {
        master[key] = branch[key];
      }
    }
    return master;
  },
};
