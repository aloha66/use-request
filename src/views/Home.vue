<template>
  <div class="home">
    use-request
    {{ value }}
    <button @click="click(11111111)">111111</button>
    <button @click="click(22222)">22222222222</button>
    <div>{{ loading }}</div>
    <div style="margin:10px" v-for="(item, i) in data?.data" :key="i">
      {{ item.title }}

      <div>
        <button @click="click(item.id)">按钮</button>
        {{ fetches?.[item.id]?.loading ? 'loading' : '加载完成' }}
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { useRequest, useToggle } from '@/use';
// import { useAxios } from '@vueuse/integrations';
// import { useAxios } from '@vue-composable/axios';

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

    // const { loading, run, data, fetches, params } = useRequest(
    const detail = useRequest(
      {
        url: 'https://cnodejs.org/api/v1/topic/5ffe6b57a2a213311bf6e137',
        methods: 'get',
      },
      { loadingDelay: 100, manual: true, fetchKey: id => id },
    );

    const click = (id: string) => {
      detail.run(id);
    };

    // const { data, finished } = useAxios('https://cnodejs.org/api/v1/topics');
    // console.log('data', data.value);
    // console.log(' finished', finished.value);

    // const { data, loading, exec, error, status } = useAxios();
    // console.log('data, loading, exec, error, status', data, loading, exec, error, status);
    // console.log('loading', loading.value);
    // console.log('data', data.value);

    // exec({
    //   method: 'GET',
    //   url: 'https://cnodejs.org/api/v1/topics',
    // });
    //   const bb = useRequest({
    //     url: 'https://cnodejs.org/api/v1/topic_collect/alsotang',
    //     methods: 'get',
    //     params: { aa: 2 },
    //   }, {
    //   ready: !!userIdRequest.data,
    // });

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
