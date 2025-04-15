<template>
  <v-app>
    <v-snackbar
      v-model="$store.state.toast.toast.show"
      :color="$store.state.toast.toast.color"
    >
      {{ $store.state.toast.toast.message }}
    </v-snackbar>

    <v-overlay
      :model-value="$store.state.loading.loading"
      class="d-flex justify-center align-center"
    >
      <v-progress-circular indeterminate size="64" color="primary" />
    </v-overlay>

      <router-view />
  </v-app>
</template>

<script>
export default {
  data() {
    return {
      isLoading: false, // Estado para o progresso
    };
  },
  created() {
    // Escuta global para mudanças de rota
    this.$router.beforeEach((to, from, next) => {
      this.isLoading = true;
      next();
    });

    this.$router.afterEach(() => {
      this.isLoading = false;
    });
  },
  methods: {
    // Método para controle manual do estado de carregamento
    setLoadingState(state) {
      this.isLoading = state;
    },
  },
};
</script>

<style>
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(0, 0, 0, 0.5); /* Fundo semitransparente */
  z-index: 1000; /* Certifique-se de que está acima de outros elementos */
}
</style>
