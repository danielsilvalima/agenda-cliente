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
};
