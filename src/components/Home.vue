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
  <SideMenu />
    <v-breadcrumbs :items="items" class="text-caption">
      <template v-slot:divider>
        <v-icon icon="mdi-chevron-right"></v-icon>
      </template>
    </v-breadcrumbs>
    <v-row dense>
      <v-col cols="12" md="12">
        <p class="secondary-text text-caption text-center">ESCOLHA O PROFISSIONAL DESEJADO ABAIXO:</p>
        <v-window v-model="window" show-arrows>
          <v-window-item v-for="(grupo, index) in recursosPaginados" :key="index">
            <v-container>
              <v-row justify="center" no-gutters >
                <v-slide-group show-arrows>
                  <v-slide-group-item v-for="recurso in grupo" :key="recurso.id">
                    <v-card
                      class="d-flex flex-column justify-center align-center pa-4 mx-2 text-center mb-2"
                      height="110px" width="100px"
                      elevation="2"
                      :class="{ 'selected': selectedRecurso === recurso }"
                      @click="selecionarRecurso(recurso)"
                    >
                      <v-img
                        :width="50"
                        :height="50"
                        aspect-ratio="16/9"
                        cover style="border-radius: 50%;"
                        :src="recurso.path">
                      </v-img>
                      <span class="text-caption font-weight-bold" style="white-space: normal; word-wrap: break-word;">
                        {{ recurso.descricao }}
                      </span>
                    </v-card>
                  </v-slide-group-item>
                </v-slide-group>
              </v-row>
            </v-container>
          </v-window-item>
        </v-window>
      </v-col>

    </v-row>
    <v-divider class="border-opacity-80" ></v-divider>
    <v-list>
      <v-card v-if="selectedRecurso !== null" class="mt-4 pa-4 " elevation="2" >
        <div class="d-flex align-center justify-space-between">
          <h3 class="text-h6 font-weight-bold text-caption">{{ titulo }}</h3>
          <!--<v-badge color="primary" content="{{ listaServicos.length }} SERVIÇOS DISPONÍVEIS" />-->
        </div>

        <p class="text-subtitle-2 mt-2 text-grey-darken-1 text-caption">
          SELECIONE UM SERVIÇO ABAIXO PARA CONTINUAR:
        </p>
      </v-card>
    </v-list>
      <v-list>
        <v-card
          v-for="(servico, index) in listaServicos"
          :key="servico.id"
          class="mb-4" elevation="2">
          <v-list-item
            color="primary"
            rounded="xl" @click="reservarServico(servico)"
            class="d-flex justify-space-between align-center">

              <v-list-item-content class="d-flex flex-column">
                <span class="font-weight-black text-caption">{{ servico.descricao }}</span>
              </v-list-item-content>

              <!-- Botão Reservar -->
              <template v-slot:append>
                <span class="font-weight-light text-caption">
                  <v-icon color="primary" small class="mr-1">mdi-clock-outline</v-icon>
                      {{ formatarDuracao(servico.duracao) }}
                    <v-icon color="success" small class="ml-1 mr-1">mdi-currency-usd</v-icon>
                      {{ parseFloat(servico.vlr || 0).toFixed(2).replace('.', ',') }}</span>
              </template>

          </v-list-item>
        </v-card>
      </v-list>

</template>

<script >
import { mapGetters } from "vuex";
import SideMenu from "@/components/SideMenu.vue";

export default {
  components: {
    SideMenu,
  },
  data() {
    return {
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
      titulo : "",
      listaServicos: [],
      listaRecursos: [],
      items: [
        {
          title: 'HOME',
          disabled: true,
          href: `/home/${this.$route.params.id}`,
        },
      ],
      selectedRecurso: null,
      window: 0,
    };
  },
  computed: {
    ...mapGetters("empresa", ["getEmpresa"]), // Mapeia o getter para obter os dados da empresa
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
    recursosPaginados() {
      if (!this.listaRecursos || this.listaRecursos.length === 0) return [];

      const itemsPerPage = 5; // Altere conforme necessário
      const paginas = [];

      for (let i = 0; i < this.listaRecursos.length; i += itemsPerPage) {
        paginas.push(this.listaRecursos.slice(i, i + itemsPerPage));
      }

      return paginas;
    }
  },
  created() {
    //this.carregarCliente();
  },
  watch: {
    empresa: {
      immediate: true, // Executa ao iniciar o componente
      handler(novaEmpresa) {
        if (novaEmpresa) {
          this.carregarCliente();
        }
      }
    }
  },
  methods:{
    async carregarCliente() {
      if(this.empresa?.expiration){
        this.alertTitle = this.empresa?.message;
        this.snackbar = true;
        return;
      }
      this.$root.setLoadingState(true);

      const storedCredential = localStorage.getItem("googleUserCredential");
      if (storedCredential) {
        try {
          const decodedUser = JSON.parse(storedCredential);
          let empresa = await this.$store.dispatch("cliente/buscarEmpresa", {id: this.$route.params.id, email: decodedUser.email});

          if (empresa && Object.keys(empresa).length > 0) {

            this.listaRecursos = empresa.agenda_empresa_recursos?.map((item) => ({
              id:item.id,
              descricao: item.descricao,
              path: `${import.meta.env.VITE_APP}/storage/${item.path}`
            }));
          }
        } catch (error) {
          console.error("ERRO AO CARREGAR EMPRESA: ", error);
          this.alertTitle = "ERRO AO CARREGAR EMPRESA: " + error;
          this.snackbar = true;
        } finally {
          this.$root.setLoadingState(false);
        }
      }
    },
    async reservarServico(servico) {
      this.$store.commit("servico/setServico", JSON.stringify(servico) );
      this.$router.push({
        path: `/agenda/${this.$route.params.id}`,
      });
    },
    selecionarRecurso(index) {
      this.carregarServico(index);

      this.selectedRecurso = index;
    },
    async carregarServico(recurso) {
      this.$root.setLoadingState(true);

      const storedCredential = localStorage.getItem("googleUserCredential");
      if (storedCredential) {
        try {
          const decodedUser = JSON.parse(storedCredential);
          let empresa = await this.$store.dispatch("servico/buscarServico", {id: this.$route.params.id, email: decodedUser.email, empresa_recurso_id: recurso.id});

          if (empresa && Object.keys(empresa).length > 0) {
            this.titulo = 'SERVIÇOS DISPONÍVEIS: ' + empresa.agenda_empresa_servicos.length;
            this.listaServicos = empresa.agenda_empresa_servicos;

          }
        } catch (error) {
          console.error("ERRO AO CARREGAR EMPRESA: ", error);
          this.alertTitle = "ERRO AO CARREGAR EMPRESA: " + error;
          this.snackbar = true;
        } finally {
          this.$root.setLoadingState(false);
        }
      }
    },
    formatarDuracao(duracao) {
      const [horas, minutos, segundos] = duracao.split(":").map(Number);
      if (horas > 0) {
        return `${horas}H:${minutos.toString().padStart(2, "0")}MIN`;
      } else {
        return `${minutos}MIN`;
      }
    }
  }
};
</script>
<style>
.text-content {
  text-align: left;
  margin-bottom: 16px;
}
.primary-text {
  font-size: 16px;
  font-weight: bold;
  margin: 0;
}
.secondary-text {
  font-size: 12px; /* Reduzi o tamanho */
  color: gray;
  margin: 4px 0 0;
}
.list-item {
  border-bottom: 1px solid #e0e0e0;
  padding: 8px 0;
}

.selected {
  border: 2px solid #1976d2; /* Cor azul do Vuetify */
  background-color: rgba(25, 118, 210, 0.2); /* Leve realce no fundo */
  transition: all 0.3s ease-in-out;
}

</style>
