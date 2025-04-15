export default {
  namespaced: true,
  state: {
    loading: false,
  },
  mutations: {
    setLoading(state, status) {
      state.loading = status;
    },
  },
  actions: {
    showLoading({ commit }) {
      commit("setLoading", true);
    },
    hideLoading({ commit }) {
      commit("setLoading", false);
    },
  },
};
