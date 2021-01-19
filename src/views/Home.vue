<template>
  <div class="home">
    use-request
    {{ value }}
    <button @click="getList()">getList</button>
    <button @click="cancel">cancelGetList</button>
    <div>{{ loading }}</div>
    <div style="margin:10px" v-for="(item, i) in data?.data" :key="i">
      {{ item.title }}

      <div>
        <button @click="click(item.id)">按钮</button>
        作者:
        {{
          detailFetches?.[item.id]?.loading
            ? 'loading'
            : detailFetches?.[item.id]?.data?.data?.author?.loginname
        }}
        <button v-if="detailFetches?.[item.id]?.loading" @click="cancelCur">取消当前请求</button>
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
    const { loading, run, data, params, fetches, cancel } = useRequest(
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

    const getList = () => {
      run();
    };

    const click = (id: string) => {
      detail.run(id);
    };

    const cancelCur = () => {
      detail.cancel();
    };

    return {
      data,
      run,
      loading,
      fetches,
      detailFetches: detail.fetches,
      params,
      // detail,
      detailData: detail.data,
      click,
      cancel,
      getList,
      cancelCur,
    };
  },
  components: {},
});
</script>
