import debounce from 'lodash.debounce';
import throttle from 'lodash.throttle';
import { onMounted, ref, reactive, toRefs, watch, watchEffect, computed, toRef } from 'vue';
import {
  noop,
  Subscribe,
  // OptionsWithFormat,
  // BaseResult,
  // BaseOptions,
  Service,
  // Options,
  Fetches,
  FetchConfig,
  FetchResult,
} from './types';
import { isDocumentVisible } from './utils';
import subscribeVisible from './utils/windowVisible';

const DEFAULT_KEY = 'AHOOKS_USE_REQUEST_DEFAULT_KEY';

function useAsync(service: any, options: any) {
  const _options = options || {};
  const {
    // refreshDeps = [],
    manual = false,
    onSuccess = () => {},
    onError = () => {},

    defaultLoading = false,
    loadingDelay,

    // pollingInterval = 0,
    // pollingWhenHidden = true,

    // defaultParams = [],
    // refreshOnWindowFocus = false,
    // focusTimespan = 5000,
    fetchKey,
    // cacheKey,
    // cacheTime = 5 * 60 * 1000,
    // staleTime = 0,
    debounceInterval,
    throttleInterval,
    initialData,
    ready = true,
    throwOnError = false,
  } = _options;

  const newstFetchKey = ref(DEFAULT_KEY);

  let formatResult: any;
  if ('formatResult' in _options) {
    formatResult = _options.formatResult;
  }

  // 参数定义开始
  let count = 0;
  let loadingDelayTimer: number;
  const unmountedFlag = false;

  // 参数定义结束

  // 缓存或者并行请求需要记录所有请求
  // const fetches = ref<any>({});
  const fetches = reactive<any>({
    [DEFAULT_KEY]: {},
  });

  // const subscribe = ((key: string, data: any) => {
  //   fetches.value[key] = data;
  // }) as any;

  const _run = (...args: any) => {
    count += 1;
    // 同步计数,如果计数不等会抛弃请求 cancel的时候会count自动加一
    const currentCount = count;
    // fetches[newstFetchKey.value] = {
    //   loading: !loadingDelay,
    //   params: args,
    // };
    fetches[newstFetchKey.value].loading = !loadingDelay; // 没有设置loadingDelay，默认立马loading
    fetches[newstFetchKey.value].params = args;
    if (loadingDelay) {
      loadingDelayTimer = setTimeout(() => {
        fetches[newstFetchKey.value].loading = true;
      }, loadingDelay);
    }

    // 抛弃该次请求结果
    const shoundAbandon = () => unmountedFlag || currentCount !== count;

    return service(...args)
      .then((res: any) => {
        if (shoundAbandon()) return;
        if (loadingDelayTimer) {
          clearTimeout(loadingDelayTimer);
        }
        const formattedResult = formatResult ? formatResult(res) : res;
        fetches[newstFetchKey.value].loading = false;
        fetches[newstFetchKey.value].data = formattedResult;
        fetches[newstFetchKey.value].error = undefined;

        // fetches[newstFetchKey.value] = {
        //   loading: false,
        //   error: undefined,
        //   data: formattedResult,
        // };
        if (onSuccess) {
          onSuccess(formattedResult, args);
        }
        return formattedResult;
      })
      .catch((error: any) => {
        if (shoundAbandon()) return;
        if (loadingDelayTimer) {
          clearTimeout(loadingDelayTimer);
        }

        fetches[newstFetchKey.value].loading = false;
        fetches[newstFetchKey.value].data = undefined;
        fetches[newstFetchKey.value].error = error;
        // currentFetch.data = currentFetch.error = error;
        // currentFetch.loading = false;
        if (onError) {
          onError(error, args);
        }
        if (throwOnError) {
          throw error;
        }
        console.error(error);
        return Promise.reject(
          'useRequest has caught the exception, if you need to handle the exception yourself, you can set options.throwOnError to true.',
        );
      })
      .finally(() => {
        if (shoundAbandon()) return;
        // TODO POll
      });
  };
  // 节流
  const throttleRun = throttleInterval ? throttle(_run, throttleInterval) : undefined;
  // 防抖
  const debounceRun = debounceInterval ? debounce(_run, debounceInterval) : undefined;

  const run = (...args: any) => {
    // 并行请求(可能叫并发请求比较合适)
    if (fetchKey) {
      const key = fetchKey(...args);
      newstFetchKey.value = key === undefined ? DEFAULT_KEY : key;

      const currentFetchKey = newstFetchKey.value;
      if (!fetches[currentFetchKey]) {
        fetches[currentFetchKey] = {
          loading: (ready && !manual) || defaultLoading,
          data: initialData,
          error: undefined,
          params: [],
        };
      }
    }

    // 节流
    if (throttleRun) {
      throttleRun(...args);
      return Promise.resolve(null as any);
    }
    // 防抖
    if (debounceRun) {
      debounceRun(...args);
      // ahooks原话
      // TODO 如果 options 存在 debounceInterval，或 throttleInterval，则 run 和 refresh 不会返回 Promise。 带类型需要修复后，此处变成 return;。
      return Promise.resolve(null as any);
    }
    return _run(args);
  };

  onMounted(() => {
    if (!manual) {
      run();
    }
  });

  // const cur = computed(() => {
  //   if (fetches[newstFetchKey.value]) {
  //     return toRefs(reactive({ ...fetches[newstFetchKey.value] }));
  //   }
  //   return {};
  // });

  // 不能直接return fetches[newstFetchKey.value]
  // 类型是proxy 没办法做响应式
  // return内容需要响应式的话必须是ref或者reactive (reactive的computed不能作为响应式  存疑待考究)
  // reactive需要解构保持响应式的话需要调用toRefs方法
  // 所有基本字段最好预先声明 否则可能会监控不了
  const currentFetch = reactive<any>({
    loading: (ready && !manual) || defaultLoading,
    data: initialData,
    error: undefined,
    params: [],
  });

  const cancel = () => {
    // 节流防抖的cancel还在想
    // 复位延迟加载
    if (loadingDelayTimer) {
      clearTimeout(loadingDelayTimer);
    }
    // 核心代码
    // 通过计数的方式判断是否抛弃接收这次的请求并复位当前请求的内容
    // 只是不接收请求的返回结果,并不是实际意义上的取消请求
    // 实际意义的取消请求需与请求库做一定的配合
    // 计划将在外层的业务处理封装
    count += 1;
    // 复位当前请求
    currentFetch.loading = false;
    // 复位请求列表对应的请求
    fetches[newstFetchKey.value].loading = false;
  };

  // 要让watchEffect生效必须具体到监控的属性
  watchEffect(() => {
    if (fetches[newstFetchKey.value]) {
      currentFetch.loading = fetches[newstFetchKey.value].loading;
      currentFetch.data = fetches[newstFetchKey.value].data;
      currentFetch.error = fetches[newstFetchKey.value].error;
      currentFetch.params = fetches[newstFetchKey.value].params;
      // 这种写法目前是不行的 会出现所有属性是undefined
      // currentFetch = reactive({ ...fetches[newstFetchKey.value] });
    }
  });

  return {
    ...toRefs(currentFetch),
    fetches,
    run,
    cancel,
  };
}

export default useAsync;
