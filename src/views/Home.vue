<template>
  <div class="home">
    use-request
    {{ value }}
    <button @click="click(111)">111111</button>
    <button @click="click(222)">22222222222</button>
    <div>{{ loading }}</div>
    <div style="margin:10px" v-for="(item, i) in data?.data" :key="i">
      {{ item.title }}

      <div>
        <button @click="click(item.id)">按钮</button>
        作者:
        {{
          fetches?.[item.id]?.loading
            ? 'loading'
            : fetches?.[item.id]?.data?.data?.author?.loginname
        }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useRequest } from '@/use';

export default defineComponent({
  name: 'Home',
  setup() {
    // https://cnodejs.org/api/v1/user/alsotang
    // https://cnodejs.org/api/v1/topic/5fe2b84498427e7b936a9f8c
    // https://cnodejs.org/api/v1/topic/60017de35d04acb8ec217193
    // https://cnodejs.org/api/v1/topic/5ff48c825393a53d15546b7d
    const { loading, run, data, params } = useRequest(
      {
        url: 'https://cnodejs.org/api/v1/topics',
        methods: 'get',
        params: { aa: 2 },
      },
      { loadingDelay: 100 },
    );

    function getUserId(id: string) {
      return {
        url: 'https://cnodejs.org/api/v1/topic/' + id,
        methods: 'get',
      };
    }

    // const { loading, run, data, fetches, params } = useRequest(
    const detail = useRequest(id => getUserId(id), {
      loadingDelay: 100,
      manual: true,
      fetchKey: id => id,
    });

    const click = (id: string) => {
      detail.run(id);
    };

    return {
      data,
      run,
      loading,
      fetches: detail.fetches,
      params,
      // detail,
      detailData: detail.data,
      click,
    };
  },
  components: {},
});
</script>
