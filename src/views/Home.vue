<template>
  <div class="home">
    use-request
    <div>
      <button @click="handleReady">ready</button>
      <button @click="secondRequest.refresh">secondRequest Refresh</button>
    </div>
    <div>
      轮询
      <div v-if="pollreqLoading">loading...</div>
      <div v-else>{{ pollreqComputed?.data?.visit_count }}</div>
      <button @click="pollreq.run">轮询开始</button>
      <button @click="pollreq.cancel">轮询结束</button>
    </div>
    <button @click="getList">getList</button>
    <button @click="refresh">refreshGetList</button>
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
import { defineComponent, Ref, watchEffect } from 'vue';
import { useRequest } from '@/use';

export default defineComponent({
  name: 'Home',
  setup() {
    // https://cnodejs.org/api/v1/user/alsotang
    // https://cnodejs.org/api/v1/topic/5fe2b84498427e7b936a9f8c
    // https://cnodejs.org/api/v1/topic/60017de35d04acb8ec217193
    // https://cnodejs.org/api/v1/topic/5ff48c825393a53d15546b7d
    const { loading, run, data, params, fetches, cancel, refresh } = useRequest(
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

    const pollreq = useRequest(
      {
        url: 'https://cnodejs.org/api/v1/topic/5ff48c825393a53d15546b7d',
        methods: 'get',
        params: { aa: 2 },
      },
      {
        loadingDelay: 100,
        manual: true,
        pollingInterval: 4000,
        pollingWhenHidden: false,
      },
    );

    const getList = () => {
      run();
    };

    const click = (id: string) => {
      detail.run(id);
    };

    const cancelCur = () => {
      detail.cancel();
    };

    function firstParam(id: string) {
      return 'https://cnodejs.org/api/v1/topic/' + id;
    }

    // 依赖请求开始(和react的渲染不一样,vue的setup只会执行一次,不需要ready属性)
    const { data: firstRequestData, params: firstPa, ...firstRequest } = useRequest(
      id => firstParam(id),
      {
        manual: true,
      },
    );

    function secondParam(params: string) {
      return {
        url: 'https://cnodejs.org/api/v1/topic/5fe2b84498427e7b936a9f8c',
        methods: 'get',
        params,
      };
    }

    const secondRequest = useRequest(params => secondParam(params), { manual: true });

    watchEffect(() => {
      if (firstRequestData.value) {
        secondRequest.run(firstPa.value[0]);
      }
    });

    const handleReady = () => {
      firstRequest.run('60017de35d04acb8ec217193');
    };

    // 依赖请求结束

    return {
      data,
      run,
      loading,
      fetches,
      refresh,
      detailFetches: detail.fetches,
      params,
      // detail,
      detailData: detail.data,
      click,
      cancel,
      getList,
      cancelCur,
      handleReady,
      firstRequestData,
      secondRequest,
      pollreq,
      pollreqLoading: pollreq.loading,
      pollreqComputed: pollreq.data, //如果再用?.获取data后面的值会没有数据 估计也是跟响应式结构有关(待考究)
    };
  },
  components: {},
});
</script>
