<template>
  <v-snackbar
    v-model="snackbar"
    :timeout="timeout"
  >
  {{ alertTitle }}

    <template v-slot:actions>
      <v-btn size="small"
        color="blue"
        variant="text"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
  <div class="login-screen">
    <div class="login-container">
      <!-- Título e Subtítulo -->
      <h1 class="login-title text-caption">Bem-vindo ao seu Painel de Agendamentos</h1>
      <p class="login-subtitle text-caption">
        Gerencie seus agendamentos e clientes de forma prática e eficiente
      </p>

      <!-- Botão de Login com o Google -->
      <div v-if="!loggedIn">
        <div class="google-login-wrapper">
          <GoogleLogin
            :callback="handleLoginCallback"
            prompt
            auto-login
            class="google-login-btn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from "vuex";
import {decodeCredential} from 'vue3-google-login';
export default {
  data(){
    return {
      loggedIn:false,
      user:null,
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
    }
  },
  created() {
    // Verifica se há um token no localStorage ao carregar o componente
    const storedCredential = localStorage.getItem("googleUserCredential");
    if (storedCredential) {
      const decodedUser = JSON.parse(storedCredential);
      this.user = decodedUser;
      this.loggedIn = true;
      const id = this.$route.params.id;
      this.$store.dispatch("empresa/loginUsuario", { id, credencial: storedCredential })
        .then(() => {
          this.$router.push(`/home/${id}`);
        })
        .catch(error => {
          console.error("ERRO AO VERIFICAR USUÁRIO:", error);
          this.alertTitle = 'ERRO AO VERIFICAR USUÁRIO: ' + error;
          this.snackbar = true;
        });
    }
  },
  methods: {
    ...mapActions("empresa",["loginUsuario"]),
    async handleLoginCallback(response) {
      const decodedUser = decodeCredential(response.credential);
      this.user = decodedUser;

      // Armazena o token no localStorage
      localStorage.setItem("googleUserCredential", JSON.stringify(decodedUser));
      try {
        await this.$store.dispatch("empresa/loginUsuario", {
          id: this.$route.params.id, credencial: JSON.stringify(decodedUser)
        });
        this.loggedIn = true;
        this.$router.push(`/home/${this.$route.params.id}`);
      } catch (error) {
        console.error("ERRO AO FAZER LOGIN:", error);
        this.alertTitle = 'ERRO AO FAZER LOGIN: ' + error;
        this.snackbar = true;
      }
    },
  }
};
</script>

<style scoped>
/* Tela de fundo */
.login-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #f3f4f6, #e9ecef);
  font-family: 'Roboto', sans-serif;
  color: #333;
  padding: 20px;
  text-align: center;
}

/* Container do login */
.login-container {
  max-width: 400px;
  width: 100%;
  background: white;
  padding: 30px 20px;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
}

/* Título */
.login-title {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 10px;
  color: #2c3e50;
}

/* Subtítulo */
.login-subtitle {
  font-size: 16px;
  margin-bottom: 20px;
  color: #7f8c8d;
}

/* Wrapper para o botão */
.google-login-wrapper {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center; /* Centraliza verticalmente */
}

/* Botão do Google */
.google-login-btn {
  display: inline-block;
  width: 100%;
  max-width: 269px; /* Largura máxima para centralizar bem */
  font-size: 16px;
  font-weight: bold;
  text-align: center;
  background: none;
  color: white;
  padding: 12px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.google-login-btn:hover {
  background: #357ae8;
}
</style>
