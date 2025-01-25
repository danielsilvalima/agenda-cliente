<template>
  <v-card>
    <v-layout >
      <v-app-bar
        color="primary"
        prominent rounded
      >
        <v-app-bar-nav-icon variant="text" @click.stop="drawer = !drawer"></v-app-bar-nav-icon>

        <v-toolbar-title>
          {{ empresa?.razao_social}}
        </v-toolbar-title>

        <v-spacer></v-spacer>

        <v-btn
          variant="elevated"
          color="secondary"
          @click="meusAgendamentos"
        >
          <v-icon small class="mr-2">mdi-calendar-text</v-icon>
          MEUS AGENDAMENTOS
        </v-btn>

      </v-app-bar>

      <!-- Menu lateral -->
      <v-navigation-drawer v-model="drawer" temporary app>
        <v-list>
          <v-list-item @click="navigateHome()">Home</v-list-item>
        </v-list>

        <v-spacer></v-spacer>
        <div class="text-center">
          <v-btn variant="elevated" style="width: 80%;" color="primary"  @click="logout" >
            SAIR
          </v-btn>
      </div>
      </v-navigation-drawer>

      <!-- Conteúdo principal -->
      <v-main style="display: flex;  justify-content: center;" >
        <v-container >
          <template v-if="$route.path === '/home'">
            <div v-if="empresa === null">
              <v-card elevation="2" class="pa-4 text-center">
                <p class="mb-4">Você ainda não possui uma empresa cadastrada.</p>
                <v-btn variant="elevated" color="primary" @click="redirectToEmpresa">
                  CADASTRAR EMPRESA
                </v-btn>
              </v-card>
            </div>

            <div v-else style="display: flex;  justify-content: center; height: 100vh;">
              <p>{{ message }}</p>
            </div>
          </template>

          <!-- Slot para renderizar o conteúdo de outras rotas -->
          <template v-else>
            <slot />
          </template>
        </v-container>
      </v-main>
    </v-layout>
  </v-card>
</template>

<script>
import {googleLogout} from 'vue3-google-login';
import router from "@/router";
import { mapActions, mapGetters } from "vuex";

export default {
  name: "SideMenu",
  data() {
    return {
      drawer: false,
      group: null,
      message : ''
    };
  },
  created() {
    const storedCredential = localStorage.getItem("googleUserCredential");
    if (storedCredential) {
      const decodedUser = JSON.parse(storedCredential);
      this.$store.dispatch("empresa/buscarEmpresa", {id: this.$route.params.id, email: decodedUser.email})
        .then((empresa) => {
          if (!empresa || Object.keys(empresa).length === 0) {
            this.$store.commit("empresa/setEmpresa", null);
          }
          if(empresa.message){
            this.message = empresa.message;
          }else{
            this.message = 'BEM-VINDO À SUA DASHBOARD! AQUI VOCÊ PODE ACESSAR SUAS FUNCIONALIDADES.';
          }
        })
        .catch((error) => {
          console.error("ERRO AO CARREGAR EMPRESA:", error);
        });
    } else {
      // Se não houver credenciais, redirecione para login
      this.$router.push(`/login/${this.$route.params.id}`);
    }
  },
  computed: {
    ...mapGetters("empresa",["getEmpresa"]),
    empresa() {
      return this.getEmpresa;
    },
  },
  watch: {
    group () {
      this.drawer = false;
    },
    },
  methods: {
    ...mapActions("empresa",["saveEmpresa"]),
    navigateTo(route) {
      this.$router.push(route);
    },
    redirectToEmpresa() {
      router.push(`/empresa/${this.$route.params.id}`);
    },
    logout(){
      googleLogout()
      localStorage.removeItem("googleUserCredential");
      this.$store.commit("empresa/setUsuario", null);
      router.push(`/login/${this.$route.params.id}`);
    },
    navigateHome(){
      router.push(`/home/${this.$route.params.id}`)
    },
    meusAgendamentos() {
      this.$router.push({ path: `/agendamento/${this.$route.params.id}` });
    }
  },
};
</script>

<style scoped>
/* Personalize o estilo conforme necessário */
</style>
