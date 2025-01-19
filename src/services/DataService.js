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

  getServico() {
    return http_token.get(`/agenda/servico`)
  }

  getAgenda(id, data, servico){
    return http_token.get(`/agenda/empresa/cliente/agenda`, {
      params: { id, data, servico },
    });
  }

  createAgenda(data) {
    return http_token.post(`/agenda/empresa/cliente/agenda`, data);
  }

}

export default new DataService();
