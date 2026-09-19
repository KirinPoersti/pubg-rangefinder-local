<script>
import { mapList } from '@/libs/mapsParams';

export default {
  data() {
    return {
      mapList
    }
  }
}

</script>

<template>
<div class="navbar">
  <div class="navbar__menu">
    <div class = "navbar__logo" @click="$router.push('/')">[PUBG] RangeFinder</div>
    <div 
      class="navbar__btns"
      v-for="map in mapList"
      :key="map"
    >
      <div 
        class = "navbar__btn" 
        :class="{ active: (this.$store.state.currentMap == map) }"

        @click="$router.push(`/${map}`)"
        >
          <span class="navbar_text">{{ map.toUpperCase() }}</span>
      </div>
    </div>
  </div>
</div>
</template>

<style scoped>
.navbar {
  height: 50px;
  background: #151515;
  color: #f4f7f9;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 15px;
  border-bottom: 1px solid #2d2d2d;
  box-shadow: 0 3px 10px rgb(0 0 0 / 45%);
  z-index: 1;
  transition-duration: 250ms;
}
.navbar__menu {
  display: flex;
}
.navbar__logo {
  margin-right: 40px;
  cursor: pointer;
  color: #ffffff;
  font-size: large;
  font-weight: 700;
  display: inline-block;
  transition-duration: 250ms;
}
.navbar__logo:hover {
  color: #ffd24a;
  transform: scale(1.04);
}
.navbar__btns {
  margin-left: 20px;
  display: flex;
  font-size: large;
}
.navbar_text {
  text-decoration: inherit;
  font-weight: inherit;
  color: inherit;
  display: inline-block;
  padding-bottom: 3px;
  border-bottom: 3px solid transparent;
  transition: color 180ms ease, border-color 180ms ease, text-shadow 180ms ease;
}
.navbar_text:hover {
  color: #ffffff;
}
.navbar__btn {
  margin-left: 20px;
  cursor: pointer;
  font-weight: 600;
  color: #c9d2d9;
}
.active{
  color: #ffd24a;
  text-decoration: none;
  font-weight: 800;
}
.active .navbar_text {
  color: #ffd24a;
  border-bottom-color: #ffd24a;
  text-shadow: 0 0 10px rgb(255 210 74 / 35%);
}
</style>
