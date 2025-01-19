<template>
  <v-app>
    <v-main>
      <div id="app">
        <!-- Progress Circular Overlay -->
        <div v-if="isLoading" class="overlay">
          <v-progress-circular
            color="primary"
            indeterminate
            size="64"
          ></v-progress-circular>
        </div>
      </div>
      <router-view />
    </v-main>
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
