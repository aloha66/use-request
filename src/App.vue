<template>
  <div id="nav">
    <router-link to="/">Home</router-link> |
    <router-link to="/about">About</router-link>
  </div>
  <router-view />
</template>
<script lang="ts">
import { defineComponent } from "vue";
import globalProvide from "./globalProvide";

export default defineComponent({
  name: "App",
  setup() {
    // 预留全局配置
    globalProvide();
  },
  components: {}
});
</script>
