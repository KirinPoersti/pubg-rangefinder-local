<script>
import MapCanvas from "@/components/MapCanvas.vue";

export default {
  components: {
    MapCanvas
  },
  props: {
    mapName: {
      type: String,
      required: true,
    }
  },
  mounted() {
    this.$store.commit('changeCurrentMap', this.mapName);
  }
}
</script>

<template>
  <div class="page__wrapper">
    <map-canvas 
      :mapName="mapName"
    />
  </div>
</template>  

<style scoped>
.page__wrapper {
  flex: 1 0 auto;
  height: calc(100vh - var(--header-height));
  height: calc(100dvh - var(--header-height));
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
</style>
