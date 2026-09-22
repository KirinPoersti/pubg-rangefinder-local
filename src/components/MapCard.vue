<script>
export default {
  props: {
    mapName: {
      type: String,
      required: true,
    },
    mapImg: {
      type: String,
      required: true,
    }
  },
  data() {
    return {
      thumb: this.mapImg,
      name: this.mapName
    }
  }
}
</script>

<template>
<div class="card">
  <div class="img__wrapper">
    <img :src="thumb" :alt="name" class="card__img">
  </div>
  <div class="text_wrapper">
    <p>{{ name }}</p>
  </div>
</div>
</template>

<style scoped>
.card{
  width: 100%;
  max-width: 250px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  background-color: #151515;
  color: #ffd24a;
  border: 1px solid #2d2d2d;
  border-radius: 5px;
  cursor: pointer;
  box-shadow: 0 3px 10px rgb(0 0 0 / 45%);
  transition: transform 250ms ease, border-color 250ms ease, box-shadow 250ms ease;
}
.img__wrapper {
  aspect-ratio: 1;
  overflow: hidden;
}
.card__img{
  display: block;
  padding: 3px;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.text_wrapper{
  padding: 10px 8px 12px;
  text-align: center;
  font-size: x-large;
  font-weight: 800;
  text-transform: uppercase;
}
.text_wrapper p {
  margin: 0;
}

@media (hover: hover) and (pointer: fine) {
  .card:hover{
    transform: scale(1.08);
    border-color: #ffd24a;
    box-shadow: 0 0 14px rgb(255 210 74 / 35%);
  }
}

.card:active {
  transform: scale(0.98);
  border-color: #ffd24a;
}

@media (max-width: 700px) {
  .text_wrapper {
    padding: 8px 5px 10px;
    font-size: 0.92rem;
  }
}
</style>
