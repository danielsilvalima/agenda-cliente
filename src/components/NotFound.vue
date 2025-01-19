<template>
  <div class="fullscreen-container">
    <h3 class="mb-2 mx-2 title">Pagína não encontrada 🚧</h3>
    <v-img
      :width="300"
      aspect-ratio="16/9"
      cover
      :src="imageSrc">
    </v-img>
  </div>
</template>

<script >
import image from '@/assets/misc-under-maintenance.png';

export default {
  data() {
    return {
      imageSrc: image,
    };
  },
};
</script>



<style scoped>
.fullscreen-container {
  display: flex;
  flex-direction: column; /* Empilha o texto e a imagem */
  justify-content: center; /* Centraliza verticalmente */
  align-items: center; /* Centraliza horizontalmente */
  width: 100vw; /* Largura total da viewport */
  height: 100vh; /* Altura total da viewport */
  margin: 0; /* Remove margens padrão */
  overflow: hidden; /* Garante que nada extrapole a tela */
}

.title {
  margin-bottom: 20px; /* Espaçamento entre o texto e a imagem */
  font-size: 2rem; /* Tamanho da fonte ajustável */
  text-align: center; /* Centraliza o texto */
}

.fullscreen-image {
  width: 100%; /* Faz a imagem ocupar toda a largura */
  height: auto; /* Mantém a proporção da imagem */
  flex-grow: 1; /* Permite que a imagem expanda para preencher o espaço restante */
}
</style>
