export default {
  namespaced: true,
  state: {
    toast: {
      show: false,
      message: "",
      color: "",
    },
  },
  mutations: {
    setToast(state, toast) {
      state.toast = toast;
    },
  },
  actions: {
    showToast({ commit }, toast) {
      commit("setToast", { ...toast, show: true });

      // Esconder o toast após 3 segundos
      setTimeout(() => {
        commit("setToast", { show: false, message: "", color: "" });
      }, 3000);
    },
  },
};
