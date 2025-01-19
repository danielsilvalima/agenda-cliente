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
    async loginUsuario({ commit }, {id, credencial} ) {
      try {
        const credencialObj = JSON.parse(credencial);
        commit("setUsuario", credencialObj);

        const response = await DataService.getEmpresaByIDEmail(id, credencialObj.email);

        if (response.data && Object.keys(response.data).length > 0) {
          commit("setEmpresa", response.data);
        }else{
          commit("setEmpresa", null);
        }
      } catch (error) {
        console.error("Erro ao fazer login", error);
        throw error;
      }
    },
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
