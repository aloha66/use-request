// import debounce from 'lodash.debounce';
// import throttle from 'lodash.throttle';
import { onMounted, ref, reactive, toRefs } from 'vue';
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
  const fetches = ref<Fetches<any, any>>({});
  // const subscribe = ((key: string, data: any) => {
  //   fetches.value[key] = data;
  // }) as any;

  const currentFetch = reactive({
    loading: (ready && !manual) || defaultLoading,
    data: initialData,
    error: undefined,
    params: [],
  });

  const _run = (...args: any) => {
    count += 1;
    // 闭包存储当次请求的 count
    const currentCount = count;
    currentFetch.loading = !loadingDelay; // 没有设置loadingDelay，默认立马loading
    currentFetch.params = args;
    console.log('loadingDelay', loadingDelay, currentFetch.loading);
    if (loadingDelay) {
      loadingDelayTimer = setTimeout(() => {
        currentFetch.loading = true;
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
        currentFetch.data = formattedResult;
        currentFetch.error = undefined;
        currentFetch.loading = false;
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
        currentFetch.data = currentFetch.error = error;
        currentFetch.loading = false;
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
    _run(args);
  };

  onMounted(() => {
    if (!manual) {
      run();
    }
  });

  return {
    ...toRefs(currentFetch),
    run,
  };
}

export default useAsync;
