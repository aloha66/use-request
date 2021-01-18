// import debounce from 'lodash.debounce';
// import throttle from 'lodash.throttle';
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
    // debounceInterval,
    // throttleInterval,
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
  const fetches = reactive<any>({});

  // const subscribe = ((key: string, data: any) => {
  //   fetches.value[key] = data;
  // }) as any;

  const _run = (...args: any) => {
    count += 1;
    // 闭包存储当次请求的 count
    const currentCount = count;
    fetches[newstFetchKey.value] = {
      loading: !loadingDelay,
      params: args,
    };
    // fetches[newstFetchKey.value].loading = !loadingDelay; // 没有设置loadingDelay，默认立马loading
    // fetches[newstFetchKey.value].params = args;
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
        // fetches[newstFetchKey.value].loading = false;
        // fetches[newstFetchKey.value].data = formattedResult;
        // fetches[newstFetchKey.value].error = undefined;

        fetches[newstFetchKey.value] = {
          loading: false,
          error: undefined,
          data: formattedResult,
        };
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

  const run = (...args: any) => {
    // 并行请求
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
    _run(args);
  };

  onMounted(() => {
    if (!manual) {
      run();
    }
  });

  watch(
    fetches,
    () => {
      // console.log('fetches', toRefs(fetches[newstFetchKey.value]));
      // console.log('fetches[newstFetchKey.value]', toRefs(reactive(fetches[newstFetchKey.value])));
    },
    { deep: true },
  );

  const cur = computed(() => {
    if (fetches[newstFetchKey.value]) {
      return toRefs(reactive({ ...fetches[newstFetchKey.value] }));
    }

    return {};
  });
  const currentFetch = reactive<any>({
    loading: (ready && !manual) || defaultLoading,
    data: initialData,
    error: undefined,
    params: [],
  });

  watchEffect(() => {
    if (fetches[newstFetchKey.value]) {
      console.log(4444444444);
      currentFetch.loading = fetches[newstFetchKey.value].loading;
      currentFetch.data = fetches[newstFetchKey.value].data;
      currentFetch.error = fetches[newstFetchKey.value].error;
      currentFetch.params = fetches[newstFetchKey.value].params;
    }
  });

  return {
    ...toRefs(currentFetch),
    // ...toRefs(cur.value),
    // ...fetches[newstFetchKey.value],
    // ...toRefs(currentFetch),
    // ...toRefs(fetches[newstFetchKey.value]),
    // ...reactive(fetches[newstFetchKey.value]),
    // ...toRefs(reactive(fetches[newstFetchKey.value])),
    fetches,
    run,
  };
}

export default useAsync;
