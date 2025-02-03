import DataService from "../../services/DataService";

export default {
  namespaced: true,
  // Store (exemplo Vuex)
  state: {
    usuario: null,
    empresa: null,
  },
  getters: {
    getEmpresa: (state) => state.empresa,
  },
  mutations: {
    setUsuario(state, usuario) {
      state.usuario = usuario;
    },
    setEmpresa(state, empresa) {
      state.empresa = empresa;
    },
  },
  actions: {
    async buscarEmpresa({ commit }, {id, email}) {
      try {
        const response = await DataService.getEmpresaByIDEmail(id, email);
        commit("setEmpresa", response.data || null);
        return response.data;
      } catch (error) {
        console.error(error.response?.data || error);
        commit("setEmpresa", null);
        throw error;
      }
    },
  },
};
