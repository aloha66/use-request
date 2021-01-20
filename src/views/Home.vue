<template>
  <div class="home">
    use-request
    <div>
      突变
      {{ swrRequestData?.ttt }}
      <button @click="mutessss">突变</button>
    </div>
    <div>
      swr 时间:{{ swrRequestData?.data?.create_at }}
      <button @click="swrRequest.run">发送</button>
    </div>
    <div>
      refreshDeps
      <select v-model="selected">
        <option disabled value="">Please select one</option>
        <option>A</option>
        <option>B</option>
        <option>C</option>
      </select>
      <select v-model="selected2">
        <option disabled value="">Please select one</option>
        <option>J</option>
        <option>K</option>
        <option>L</option>
      </select>
    </div>
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
import { defineComponent, ref, watchEffect } from 'vue';
import { useRequest } from '@/use';

export default defineComponent({
  name: 'Home',
  setup() {
    const selected = ref('');
    const selected2 = ref('');
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

    // refreshDeps 开始
    // 可能就是这样实现
    // 我看效果就是某个state变化了,然后再触发某个请求
    const reRequest = useRequest('https://cnodejs.org/api/v1/user/alsotang', {
      refreshDeps: [selected, selected2],
    });

    // refreshDeps 结束

    // swr开始

    function swrFunc() {
      const obj = {
        0: '5ff48c825393a53d15546b7d',
        1: '575c0f3a2ad3c06f1aa3d5ed',
        2: '545249abd0c2f0fe2f533ad6',
        3: '590d3b633504ce1c2ac45904',
        4: '5ff2df1e5393a512755468b4',
        5: '5ff17dff5393a578ff5465a7',
      };
      const inx = Math.floor(Math.random() * 6);
      // @ts-ignore
      return 'https://cnodejs.org/api/v1/topic/' + obj[inx];
    }

    const swrRequest = useRequest(() => swrFunc(), {
      cacheKey: 'swr',
    });

    // swr结束

    // 突变
    const mutessss = () => {
      swrRequest.mutate({ ttt: 2222222222222 });
    };

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
      selected,
      selected2,
      swrRequestFetch: swrRequest.fetches,
      swrRequest,
      mutessss,
      swrRequestData: swrRequest.data,
      pollreqLoading: pollreq.loading,
      pollreqComputed: pollreq.data, //如果再用?.获取data后面的值会没有数据 估计也是跟响应式结构有关(待考究)
    };
  },
  components: {},
});
</script>
