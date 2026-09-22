<script>
import MapCard from "@/components/MapCard.vue";
import { getThumbnails } from '@/libs/mapsParams';
import bgImg from '@/assets/img/pubg-bg.jpg';

export default {
  data() {
    return {
      bgimg: `url(${bgImg})`,
      maps: getThumbnails(),
    };
  },
  components: {
    MapCard
  },
  mounted() {
    this.$store.commit('changeCurrentMap', '');
  }
}
</script>

<template>

<div class="main">
  <div class="main_cards">
    <map-card 
      v-for="map in maps" :key="map" 
        :map-img="map.thumb" 
        :map-name="map.name"
      @click="$router.push(`/${map.name.toLowerCase()}`)"
    />
  </div>
</div>

</template>

<style scoped>
.main{
  min-height: calc(100vh - var(--header-height));
  min-height: calc(100dvh - var(--header-height));
  background-color: black;
  background-image: v-bind(bgimg);
  background-size: cover;
  background-position: top;
  filter: brightness(0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
}
.main_cards{
  width: 100%;
  padding: clamp(180px, 27vh, 360px) 20px 40px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 250px));
  align-items: start;
  justify-content: center;
  gap: 20px;
}

@media (max-width: 700px) {
  .main {
    background-position: center top;
  }
  .main_cards {
    padding: clamp(120px, 23vh, 210px) 12px 24px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }
}

@media (max-width: 340px) {
  .main_cards {
    grid-template-columns: minmax(0, 250px);
  }
}
</style>
