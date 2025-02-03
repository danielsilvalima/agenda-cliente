import DataService from "../../services/DataService";

export default {
  namespaced: true,
  // Store (exemplo Vuex)
  state: {
    servico: null,
  },
  getters: {
    getServico: (state) => state.servico,
  },
  mutations: {
    setServico(state, servico) {
      state.servico = servico;
    },
  },
  actions: {
    async buscarServico({ commit }, {id, email, empresa_recurso_id}) {
      try {
        const response = await DataService.getServicoByIDempresa(id, email, empresa_recurso_id);
        commit("setServico", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data || error);
        commit("setServico", null);
        throw error;
      }
    },
  },
};
