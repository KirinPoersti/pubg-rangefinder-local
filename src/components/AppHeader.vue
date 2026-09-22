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
    <nav class="navbar__maps" aria-label="PUBG maps">
      <button
        v-for="map in mapList"
        :key="map"
        type="button"
        class="navbar__btn"
        :class="{ active: (this.$store.state.currentMap == map) }"
        @click="$router.push(`/${map}`)"
      >
        <span class="navbar_text">{{ map.toUpperCase() }}</span>
      </button>
    </nav>
  </div>
</div>
</template>

<style scoped>
.navbar {
  height: var(--header-height);
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
  align-items: center;
  width: 100%;
  min-width: 0;
}
.navbar__logo {
  flex: 0 0 auto;
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
.navbar__maps {
  display: flex;
  align-items: center;
  gap: 40px;
  min-width: 0;
  overflow-x: auto;
  scrollbar-width: none;
  font-size: large;
}
.navbar__maps::-webkit-scrollbar {
  display: none;
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
  flex: 0 0 auto;
  min-height: 44px;
  padding: 0;
  border: 0;
  background: transparent;
  font: inherit;
  cursor: pointer;
  font-weight: 600;
  color: #ffd24a;
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

@media (max-width: 700px) {
  .navbar {
    padding: 0;
    align-items: stretch;
  }
  .navbar__menu {
    flex-direction: column;
    align-items: stretch;
  }
  .navbar__logo {
    height: 46px;
    margin: 0;
    padding: 0 14px;
    display: flex;
    align-items: center;
    font-size: 1rem;
  }
  .navbar__maps {
    height: 48px;
    gap: 8px;
    padding: 0 8px;
    border-top: 1px solid #2d2d2d;
    font-size: 0.88rem;
    scroll-snap-type: x proximity;
  }
  .navbar__btn {
    padding: 0 10px;
    scroll-snap-align: center;
  }
}
</style>
