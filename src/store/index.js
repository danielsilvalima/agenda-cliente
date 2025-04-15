import { createStore } from 'vuex';
import storeEmpresa from './empresa';
import storeClienteAgendamento from './clienteagendamento';
import storeServico from './servico';
import storeCliente from './cliente';
import storeToast from './toast';
import storeLoading from './loading';

export default createStore({
  modules: {
    empresa: storeEmpresa,
    clienteAgendamento: storeClienteAgendamento,
    servico: storeServico,
    cliente: storeCliente,
    toast: storeToast,
    loading: storeLoading,
  },
});
