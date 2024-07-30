const { pat } = require("../models");

module.exports = {
  findPATbyId: async (id) => {
    try {
      const result = await pat.findByPk(id);
      if (!result) throw new Error("PAT is tidak ditemukan !");
      return result;
    } catch (e) {
      throw new Error();
    }
  },
};
