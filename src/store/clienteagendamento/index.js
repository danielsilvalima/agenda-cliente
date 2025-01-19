import DataService from "../../services/DataService";

export default {
  namespaced: true,
  // Store (exemplo Vuex)
  state: {
    clienteAgendamento: null,
  },
  getters: {
    getClienteAgendamento: (state) => state.clienteAgendamento,
  },
  mutations: {

    setClienteAgendamento(state, clienteAgendamento) {
      state.clienteAgendamento = clienteAgendamento;
    },
  },
  actions: {
    async consultarAgenda({ commit }, {id, data, servico} ) {
      try {
        const response = await DataService.getAgenda(id, data, servico);

        return response.data;
      } catch (error) {
        console.error("Erro ao buscar a agenda", error);
        throw error;
      }
    },
    async confirmarAgendamento({ commit }, agendamento ) {
      try {
        const response = await DataService.createAgenda(agendamento);

        if (response.data && Object.keys(response.data).length > 0) {
          commit("setClienteAgendamento", response.data);
        }else{
          commit("setClienteAgendamento", null);
        }
      } catch (error) {
        console.error("Erro ao buscar a agenda", error);
        throw error;
      }
    },
  },
};
