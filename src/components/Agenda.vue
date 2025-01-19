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
      <v-container>
        <v-row dense>
          <v-col cols="12" md="12">
            <v-date-input
              v-model="dataSelecionada"
              :label="titulo"
              prepend-icon=""
              prepend-inner-icon="$calendar"
              variant="solo"
              placeholder="DD/MM/AAAA"
              @update:model-value="buscarHorarios"
            ></v-date-input>
          </v-col>
        </v-row>

        <v-col cols="12">
          <h4>SELECIONE O HORÁRIO DE INÍCIO</h4>
          <div class="horarios-container">
            <v-btn
              v-for="(horario, index) in horariosDisponiveis"
              :key="index"
              :class="{'selected': horario === horarioSelecionado}"
              class="horario-btn"
              @click="selecionarHorario(horario)"
            >
              {{ horario }}
            </v-btn>
          </div>
        </v-col>

        <v-col cols="12" class="text-center">
          <v-btn
            color="secondary"
            @click="confirmarAgendamento"
          >
            Confirmar Agendamento
          </v-btn>
        </v-col>
      </v-container>
    </SideMenu>
  </v-app>
</template>

<script >
import { mapGetters } from "vuex";
import SideMenu from "@/components/SideMenu.vue";
import { VDateInput } from 'vuetify/labs/VDateInput'

export default {
  components: {
    SideMenu,
    //VCalendar,
    VDateInput
  },
  data() {
    return {
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
      dataSelecionada: new Date(),//.toISOString().slice(0, 10),
      horariosDisponiveis: [],
      horarioSelecionado: null,
      titulo : ''
    };
  },
  computed: {
    ...mapGetters("empresa", ["getEmpresa"]), // Mapeia o getter para obter os dados da empresa
    ...mapGetters("servico", ["getServico"]),
    empresa() {
      return this.getEmpresa;
    },
    servico() {
      return this.getServico;
    },
  },
  created() {
    this.$root.setLoadingState(true);

    if(!this.servico){
      this.$router.push(`/home/${this.$route.params.id}`);
    }
    this.carregarEmpresa();
    this.buscarHorarios();
    this.selecionarHorario();

    this.$root.setLoadingState(false);
  },
  methods:{
    async carregarEmpresa() {
      const storedCredential = localStorage.getItem("googleUserCredential");
      if (storedCredential) {
        try {
          const decodedUser = JSON.parse(storedCredential);
          let empresa = await this.$store.dispatch("empresa/buscarEmpresa", {id: this.$route.params.id, email: decodedUser.email});

          /*if (empresa && Object.keys(empresa).length > 0) {

          }*/
        } catch (error) {
          console.error("ERRO AO CARREGAR EMPRESA: ", error);
          this.alertTitle = "ERRO AO CARREGAR EMPRESA: " + error;
          this.snackbar = true;
        }
      }
    },
    buscarHorarios() {
      // Chama o método da store para buscar os horários
      const data = this.atualizarData(this.dataSelecionada);
      this.titulo = this.getDescricaoServico();
      this.$store
        .dispatch('clienteAgendamento/consultarAgenda', {
          id: this.$route.params.id,
          data: data,
          servico: this.servico
        })
        .then((horarios) => {
          this.horariosDisponiveis = horarios.map(horario => {

            return horario.substring(11, 16);
          });
        })
      .catch((error) => {
        console.error('Erro ao buscar horários:', error);
      });
    },
    selecionarHorario(horario) {
      this.horarioSelecionado = horario; // Define o horário selecionado
    },
    confirmarAgendamento() {
      // Lógica para confirmar o agendamento
      if(!this.empresa){
        this.alertTitle = "NÃO FOI POSSÍVEL LOCALIZAR A EMPRESA";
        this.snackbar = true;
        return;
      }
      if(!this.servico){
        this.alertTitle = "NÃO FOI POSSÍVEL LOCALIZAR O SERVIÇO";
        this.snackbar = true;
        return;
      }
      if(!this.horarioSelecionado){
        this.alertTitle = "HORÁRIO NÃO FOI SELECIONADO";
        this.snackbar = true;
        return;
      }

      const storedCredential = localStorage.getItem("googleUserCredential");
      if (!storedCredential) {
        this.alertTitle = "NÃO FOI POSSÍVEL LOCALIZAR O E-MAIL";
        this.snackbar = true;
      }
      const decodedUser = JSON.parse(storedCredential);
      const dataAtualizada = this.atualizarData(this.dataSelecionada);

      const jsonServico = JSON.parse(this.servico)
      console.log(jsonServico.id);
      const agendamento = {
        id: this.$route.params.id,
        data: dataAtualizada,
        horario: this.horarioSelecionado,
        duracao: jsonServico.duracao,
        email: decodedUser.email,
        servico_id: jsonServico.agenda_servicos.id,
        empresa_servico_id: jsonServico.id
      };

      this.$store
        .dispatch('clienteAgendamento/confirmarAgendamento', agendamento)
        .then(() => {
          this.$router.push(`/agenda/${this.$route.params.id}`);
        })
        .catch((error) => {
          console.error('ERRO AO CONFIRMAR AGENDAMENTO: ', error);
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
    getDescricaoServico() {
      const jsonServico = JSON.parse(this.servico);
      const agendaServicos = jsonServico.agenda_servicos;

      return this.servico && agendaServicos && jsonServico.agenda_servicos.descricao
        ? "SELECIONE UMA DATA PARA: " + jsonServico.agenda_servicos.descricao
        : "SELECIONE UMA DATA PARA: SERVIÇO NÃO DISPONÍVEL";
    },
  }
};
</script>
<style>
.text-content {
  text-align: left;
  margin-bottom: 16px;
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

.horarios-container {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.horario-btn {
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 16px;
  cursor: pointer;
}

.horario-btn.selected {
  background-color: #1976d2;
  color: white;
}

</style>
