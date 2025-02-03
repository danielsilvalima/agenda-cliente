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
  <SideMenu/>
    <v-breadcrumbs :items="items" class="text-caption">
    <template v-slot:divider>
      <v-icon icon="mdi-chevron-right"></v-icon>
    </template>
  </v-breadcrumbs>
    <v-expansion-panels><p class="text-caption text-red mb-2">PARA CANCELAR UM AGENDAMENTO, CLIQUE NO X</p>
      <v-expansion-panel
        v-for="(agendamento, index) in historicoAgendamentos"
        :key="agendamento.id"
      >
        <!-- Título do painel -->
        <v-expansion-panel-title>
          <div class="d-flex justify-space-between align-center">
            <div class="text-content" >
              <h3 class="primary-text text-caption">
                {{ getDescricaoServico(agendamento?.empresa_servico_id) }} - VALOR:
                <span class="font-weight-bold text-red" >
                  R$ {{ formatarValor(agendamento.vlr) }}
                </span></h3>

            </div>

          </div>
        </v-expansion-panel-title>

        <!-- Conteúdo do painel -->
        <v-expansion-panel-text>
            <v-list>
              <v-list-item>
                <v-list-item-content>
                  <v-list-item-subtitle class="text-caption">
                    <v-icon small color="black" class="mr-1">mdi-calendar</v-icon>
                    <strong>DATA:</strong>
                    {{ formatarData(agendamento.start_scheduling_at) }} ÀS
                    {{ formatarHorario(agendamento.start_scheduling_at) }}
                  </v-list-item-subtitle>

                  <v-list-item-subtitle class="text-caption">
                    <v-icon small color="black" class="mr-1">mdi-clock-outline</v-icon>
                    <strong>DURAÇÃO:</strong> {{ formatarDuracao(agendamento.duracao) }}
                  </v-list-item-subtitle>
                </v-list-item-content>
                <template v-slot:append>
                  <v-btn size="small"
                    :disabled="!podeCancelar(agendamento.start_scheduling_at)"
                    variant="elevated"
                    color="secondary"
                    @click="abrirModalConfirmacao(agendamento)">
                    <v-icon small>mdi-close-circle</v-icon>

                  </v-btn>
                </template>
              </v-list-item>
            </v-list>
        </v-expansion-panel-text>
      </v-expansion-panel>
    </v-expansion-panels>

    <v-dialog
      v-model="modalConfirmacao"
      persistent
      max-width="500px"
    >
      <v-card>
        <template v-slot:title>
          <span class="font-weight-black text-medium-emphasis ps-2 text-caption">CONFIRMAÇÃO DE CANCELAMENTO DE AGENDAMENTO</span>
        </template>
        <v-card-text>
          <p class="text-caption">
            VOCÊ ESTÁ PRESTES A CANCELAR O AGENDAMENTO DO SERVIÇO
            <strong>{{ getDescricaoServico(agendamentoSelecionado?.empresa_servico_id) || 'DESCONHECIDO' }}</strong>
            NO HORÁRIO DAS <strong>{{ formatarHorario(agendamentoSelecionado?.start_scheduling_at) }}</strong> HRS.
          </p>
          <p class="text-caption">
            O VALOR DO SERVIÇO É <strong>R$ {{ parseFloat(agendamentoSelecionado?.vlr || 0).toFixed(2).replace('.', ',') }}</strong>.
          </p>
          <br />
          <p class="text-primary text-caption">
            TEM CERTEZA DE QUE DESEJA CONFIRMAR O CANCELAMENTO?
          </p>
        </v-card-text>
        <v-card-actions>
          <v-btn size="small" text color="error" @click="fecharModalConfirmacao" class="text-caption">
            CANCELAR
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn size="small" text variant="elevated" color="success" :loading="loading" @click="cancelarAgendamento" class="text-caption">
            CONFIRMAR
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
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
      historicoAgendamentos: [],
      servicos: [],
      email: "",
      loading: false,
      modalConfirmacao : false,
      agendamentoSelecionado: null,
      items: [
        {
          title: 'HOME',
          disabled: false,
          href: `/home/${this.$route.params.id}`,
        },
        {
          title: 'AGENDA',
          disabled: false,
          href: `/agenda/${this.$route.params.id}`,
        },
        {
          title: 'AGENDAMENTO',
          disabled: true,
          href: `/agendamento/${this.$route.params.id}`,
        },
      ],
    };
  },
  computed: {
    ...mapGetters("empresa", ["getEmpresa"]), // Mapeia o getter para obter os dados da empresa
    empresa() {
      return this.getEmpresa; // Retorna os dados da empresa do estado global
    },
  },
  created() {
    this.carregarEmpresa();
    this.carregarAgendamentos();
  },
  methods:{
    async carregarEmpresa() {
      this.$root.setLoadingState(true);
      const storedCredential = localStorage.getItem("googleUserCredential");
      if (storedCredential) {
        try {
          const decodedUser = JSON.parse(storedCredential);
          this.email = decodedUser.email;
          await this.$store.dispatch("empresa/buscarEmpresa", {id: this.$route.params.id, email: decodedUser.email});
        } catch (error) {
          console.error("ERRO AO CARREGAR EMPRESA: ", error);
          this.alertTitle = "ERRO AO CARREGAR EMPRESA: " + error;
          this.snackbar = true;
        } finally {
          this.$root.setLoadingState(false);
        }
      }
    },
    async carregarAgendamentos() {
      try {
        const response = await this.$store.dispatch(
          "clienteAgendamento/consultarAgendamentos",
          { id: this.$route.params.id, email: this.email }
        );
        this.servicos = response.agenda_empresa_servicos;
        const cliente = response.agenda_clientes.find(
          (c) => c.email === this.email
        );
        if (cliente) {
          this.historicoAgendamentos = cliente.agenda_cliente_agendamentos;
        }
      } catch (error) {
        this.alertTitle = "Erro ao carregar agendamentos: " + error.message;
        this.snackbar = true;
      }
    },
    formatarData(data) {
      return new Date(data).toLocaleDateString("pt-BR");
    },
    formatarHorario(data) {
      return new Date(data).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    formatarValor(valor) {
      return parseFloat(valor || 0).toFixed(2).replace(".", ",");
    },
    getDescricaoServico(servicoId) {
      const servico = this.servicos.find((s) => s.id === servicoId);
      return servico ? servico.descricao : "Serviço não encontrado";
    },
    podeCancelar(startSchedulingAt) {
      const agendamentoData = new Date(startSchedulingAt);
      const agora = new Date();
      // Permitir cancelar apenas se a data atual for menor que a do agendamento
      return agora < agendamentoData;
    },
    abrirModalConfirmacao(agendamento) {
      this.agendamentoSelecionado = agendamento;
      this.modalConfirmacao = true;
    },
    fecharModalConfirmacao() {
      console.log('FECHOU');
      this.modalConfirmacao = false;
      this.agendamentoSelecionado = null;
    },
    async cancelarAgendamento() {
      this.loading = true;

      const storedCredential = localStorage.getItem("googleUserCredential");
      if (!storedCredential) {
        this.alertTitle = "NÃO FOI POSSÍVEL LOCALIZAR O E-MAIL";
        this.snackbar = true;
      }
      const decodedUser = JSON.parse(storedCredential);

      this.agendamentoSelecionado.hash = this.$route.params.id;
      this.agendamentoSelecionado.email = decodedUser.email;
      await this.$store
      .dispatch('clienteAgendamento/cancelarAgendamento', {agendamento: this.agendamentoSelecionado})
      .then(() => {
        //this.fecharModalConfirmacao();
        this.alertTitle = "AGENDAMENTO CANCELADO COM SUCESSO";
        this.snackbar = true;

        setTimeout(() => {
          this.$router.push(`/home/${this.$route.params.id}`);
        }, 2000);
      })
      .catch((error) => {
        console.error('ERRO AO CONFIRMAR AGENDAMENTO: ', error);
        this.alertTitle = "ERRO AO CONFIRMAR AGENDAMENTO: "+ error;
        this.snackbar = true;
      })
      .finally(()=>{
        this.loading = false;
      });
    },
    atualizarData(data) {
      try {
        // Verifica se é uma string e converte para o formato Date se necessário
        return new Date(data).toISOString().slice(0, 10);
      } catch (error) {
        console.error("ERRO AO ATUALIZAR DATA: ", error);
      }
    },
    formatarDuracao(duracao) {
    const [horas, minutos, segundos] = duracao.split(":").map(Number);
    if (horas > 0) {
      return `${horas}H:${minutos.toString().padStart(2, "0")}MIN`;
    } else {
      return `${minutos}MIN`;
    }
  },
  }
};
</script>
<style>

.primary-text {
  font-size: 16px;
  font-weight: bold;
}
.text-content {
  display: flex;
  flex-direction: column;
  align-items: flex-start; /* Garante alinhamento à esquerda */
}

.secondary-text {
  margin: 0; /* Remove margens desnecessárias */
  color: #6b6b6b; /* Ajuste a cor para algo suave */
  font-size: 14px; /* Ou ajuste conforme necessário */
}

</style>
