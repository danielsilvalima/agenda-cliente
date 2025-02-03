import http_token from "/http-token";

class DataService {
  getEmpresaByIDEmail(id, email) {
    return http_token.get(`/agenda/empresa/cliente`, {
      params: { id, email },
    });
  }

  create(data) {
    return http_token.post(`/agenda/empresa`, data);
  }

  getHorarioExpediente() {
    return http_token.get(`/agenda/horario-expediente`)
  }

  getAgenda(id, data, servico){
    return http_token.get(`/agenda/empresa/cliente/agenda`, {
      params: { id, data, servico },
    });
  }

  createAgenda(data) {
    return http_token.post(`/agenda/empresa/cliente/agenda`, data);
  }

  deleteAgenda(agendamento) {
    return http_token.delete(`/agenda/empresa/cliente/agenda`, {
      data: agendamento
    });
  }

  getAgendamentos(id, email) {
    return http_token.get(`/agenda/empresa/cliente/agenda/agendamento`, {
      params: { id, email },
    });
  }

  getServicoByIDempresa(id, email, empresa_recurso_id){
    return http_token.get(`/agenda/empresa/cliente/servico`, {
      params: { id, email, empresa_recurso_id },
    });
  }

}

export default new DataService();
