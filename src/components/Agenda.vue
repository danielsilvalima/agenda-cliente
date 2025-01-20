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
          <h6 v-if="horariosDisponiveis?.length === 0" class="text-red">NÃO HÁ EXPEDIENTE PARA O DIA SELECIONADO</h6>
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
            block
            color="secondary"
            @click="abrirModalConfirmacao"
          >
            Confirmar Agendamento
          </v-btn>
        </v-col>

        <!-- Modal de Confirmação -->
        <v-dialog
          v-model="modalConfirmacao"
          persistent
          max-width="500px"
        >
          <v-card>
            <template v-slot:title>
              <span class="font-weight-black text-medium-emphasis ps-2">CONFIRMAÇÃO DE AGENDAMENTO</span>
            </template>
            <v-card-text >
              <p>
                VOCÊ ESTÁ PRESTES A AGENDAR O SERVIÇO
                <strong>{{ getDescricaoServico() }}</strong>
                NO HORÁRIO DAS <strong>{{ horarioSelecionado }}</strong> HRS.
              </p>
              <p>
                O VALOR DO SERVIÇO É <strong>R$ {{ parseFloat(getVlrServico() || 0).toFixed(2).replace('.', ',') }}</strong>.
              </p>
              <br/>
              <p class="text-primary">
                TEM CERTEZA DE QUE DESEJA CONFIRMAR O AGENDAMENTO?
              </p>
            </v-card-text>
            <v-card-actions>
              <v-btn text="Close" color="error"
              @click="modalConfirmacao = false">
                CANCELAR
              </v-btn>
              <v-spacer></v-spacer>
              <v-btn text="Save" variant="elevated" color="success"
                :loading="loading"
                @click="confirmarAgendamento">
                CONFIRMAR
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-dialog>

      </v-container>
    </SideMenu>
  </v-app>
</template>

<script >
import { mapGetters } from "vuex";
import SideMenu from "@/components/SideMenu.vue";
import { VDateInput } from 'vuetify/labs/VDateInput';
import format from "date-fns/format";

export default {
  components: {
    SideMenu,
    VDateInput
  },
  data() {
    return {
      snackbar: false,
      alertTitle: "",
      timeout: 3000,
      modalConfirmacao: false,
      dataSelecionada: new Date(),
      horariosDisponiveis: [],
      horarioSelecionado: null,
      expedienteSelecionado: null,
      titulo : '',
      loading: false
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
    if(!this.servico){
      this.$router.push(`/home/${this.$route.params.id}`);
    }else{
      this.carregarEmpresa();
      this.buscarHorarios();
      this.selecionarHorario();
    }
  },
  methods:{
    async carregarEmpresa() {
      this.$root.setLoadingState(true);
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
        }finally {
          this.$root.setLoadingState(false);
        }
      }
    },
    buscarHorarios() {
      this.$root.setLoadingState(true);
      // Chama o método da store para buscar os horários
      const data = this.atualizarData(this.dataSelecionada);
      //const data = this.dataSelecionada;
      this.titulo = this.getTitulo(this.getDescricaoServico());
      this.$store
        .dispatch('clienteAgendamento/consultarAgenda', {
          id: this.$route.params.id,
          data: data,
          servico: this.servico
        })
        .then((response) => {
          const horarios = response.horarios; // Lista de horários
          const expedienteId = response.empresa_expediente_id; // ID do expediente

          if (horarios && horarios.length > 0) {
            // Formata os horários para o formato HH:mm
            this.horariosDisponiveis = horarios.map(horario => {
              return horario.substring(11, 16); // Pega a hora e os minutos
            });

            // Define o expediente selecionado
            this.expedienteSelecionado = expedienteId; // Como o expediente é o mesmo para todos os horários
          } else {
            this.horariosDisponiveis = horarios;
          }
        })
      .catch((error) => {
        console.error('Erro ao buscar horários:', error);
      })
      .finally(() =>{
        this.$root.setLoadingState(false);
      });
    },
    selecionarHorario(horario) {
      this.horarioSelecionado = horario; // Define o horário selecionado
    },
    confirmarAgendamento() {
      this.loading = true;

      const storedCredential = localStorage.getItem("googleUserCredential");
      if (!storedCredential) {
        this.alertTitle = "NÃO FOI POSSÍVEL LOCALIZAR O E-MAIL";
        this.snackbar = true;
      }
      const decodedUser = JSON.parse(storedCredential);
      const dataAtualizada = this.atualizarData(this.dataSelecionada);
      //const dataAtualizada = this.dataSelecionada;
      const servicoJson = JSON.parse(this.servico);

      const agendamento = {
        id: this.$route.params.id,
        data: dataAtualizada,
        horario: this.horarioSelecionado,
        duracao: servicoJson.duracao,
        vlr: servicoJson.vlr,
        email: decodedUser.email,
        nome_completo: decodedUser.name,
        empresa_servico_id: servicoJson.id,
        empresa_expediente_id : this.expedienteSelecionado
      };

      this.$store
        .dispatch('clienteAgendamento/confirmarAgendamento', agendamento)
        .then(() => {
          this.alertTitle = "AGENDA CONFIRMADA COM SUCESSO";
          this.snackbar = true;

          setTimeout(() => {
            this.$router.push(`/home/${this.$route.params.id}`);
          }, 3000);
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
    abrirModalConfirmacao() {
      if (!this.horarioSelecionado) {
        this.alertTitle = "POR FAVOR, SELECIONE UM HORÁRIO ANTES DE CONFIRMAR";
        this.snackbar = true;
        return;
      }
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
      this.modalConfirmacao = true;
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
      return this.servico.descricao
    },
    getTitulo(descricao){
      return descricao
        ? "SELECIONE UMA DATA PARA: " + descricao
        : "SELECIONE UMA DATA PARA: SERVIÇO NÃO DISPONÍVEL";
    },
    getVlrServico(){
      return JSON.parse(this.servico).vlr;
    }
  },
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
