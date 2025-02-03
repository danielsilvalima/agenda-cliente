import { createStore } from 'vuex';
import storeEmpresa from './empresa';
import storeClienteAgendamento from './clienteagendamento';
import storeServico from './servico';
import storeCliente from './cliente';

export default createStore({
  modules: {
    empresa: storeEmpresa,
    clienteAgendamento: storeClienteAgendamento,
    servico: storeServico,
    cliente: storeCliente,
  },
});
