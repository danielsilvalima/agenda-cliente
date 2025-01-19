<template>
  <v-snackbar
    v-model="snackbar"
    :timeout="timeout"
  >
  {{ alertTitle }}

    <template v-slot:actions>
      <v-btn
        color="blue"
        variant="text"
        @click="snackbar = false"
      >
        Close
      </v-btn>
    </template>
  </v-snackbar>
  <v-app>
    <SideMenu>
      <v-expansion-panels>
        <v-expansion-panel>
          <v-expansion-panel-title>
            <div class="text-content">
              <h3 class="primary-text">{{ titulo }}</h3>
              <p class="secondary-text">ESCOLHA O SERVIÇO DESEJADO ABAIXO:</p>
            </div>
          </v-expansion-panel-title>
          <v-expansion-panel-text>
            <v-list>
              <v-card
                v-for="(servico, index) in listaServicos"
                :key="servico.id"
                class="mb-4">
                <v-list-item
                  color="primary"
                  rounded="xl"
                  class="d-flex justify-space-between align-center">

                    <v-list-item-content class="d-flex flex-column">
                      <span class="font-weight-black text-body-2">{{ servico.agenda_servicos.descricao }}</span>
                      <span class="font-weight-light text-h8">
                        <v-icon color="primary" small class="mr-1">mdi-clock-outline</v-icon>
                          Duração: {{ servico.duracao }}
                          <v-icon color="success" small class="ml-3 mr-1">mdi-currency-usd</v-icon>
                          Valor: R$ {{ parseFloat(servico.vlr).toFixed(2) }}</span>
                    </v-list-item-content>

                    <!-- Botão Reservar -->
                    <template v-slot:append>
                      <v-btn
                        variant="elevated"
                        color="secondary"
                        @click="reservarServico(servico)">
                        <v-icon small class="mr-2">mdi-calendar-check</v-icon>
                        RESERVAR
                      </v-btn>
                    </template>

                </v-list-item>
              </v-card>
            </v-list>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </SideMenu>
  </v-app>
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
      titulo : 'SERVIÇOS DISPONÍVEIS',
      listaServicos: []
    };
  },
  computed: {
    ...mapGetters("empresa", ["getEmpresa"]), // Mapeia o getter para obter os dados da empresa
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
  },
  created() {
    this.$root.setLoadingState(true);
    this.listaServicos = [];
    this.carregarEmpresa();
  },
  methods:{
    async carregarEmpresa() {
      const storedCredential = localStorage.getItem("googleUserCredential");
      if (storedCredential) {
        try {
          const decodedUser = JSON.parse(storedCredential);
          let empresa = await this.$store.dispatch("empresa/buscarEmpresa", {id: this.$route.params.id, email: decodedUser.email});

          if (empresa && Object.keys(empresa).length > 0) {
            this.titulo = this.titulo + ': ' + empresa.agenda_empresa_servicos.length;
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
    async reservarServico(servico) {
      this.$store.commit("servico/setServico", JSON.stringify(servico) );
      this.$router.push({
        path: `/agenda/${this.$route.params.id}`,
      });
    },
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

</style>
