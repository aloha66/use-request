import { inject } from 'vue';
import { CombineService, OptionsWithFormat, BaseResult, BaseOptions } from './types';
import useAsync from './useAsync';

// 方法重载
// <T = any> 泛型，等于号右边指定默认类型
// <P extends any[]> extends 继承any数组
export function useRequest<R = any, P extends any[] = any, U = any, UU extends U = any>(
  service: CombineService<R, P>,
  options: OptionsWithFormat<R, P, U, UU>,
): BaseResult<U, P>;
export function useRequest<R = any, P extends any[] = any>(
  service: CombineService<R, P>,
  options?: BaseOptions<R, P>,
): BaseResult<R, P>;

export function useRequest(service: any, options: any = {}): any {
  // 拿到全局配置的内容
  const contextConfig = inject('UseRequestConfigContext', {});

  const finalOptions = { ...contextConfig, ...options };
  //   TODO paginated, loadMore,
  const { requestMethod } = finalOptions;

  const fetchProxy = (...args: any[]) =>
    // @ts-ignore
    fetch(...args).then((res: Response) => {
      if (res.ok) {
        return res.json();
      }
      throw new Error(res.statusText);
    });
  //   默认使用原生的fetch
  const finalRequestMethod = requestMethod || fetchProxy;

  let promiseService: () => Promise<any>;
  switch (typeof service) {
    case 'string': {
      // url
      promiseService = () => finalRequestMethod(service);
      break;
    }
    case 'object': {
      // 传入对象
      const { url, ...rest } = service;
      //   这里需要兼容fetch写法
      //   fetch(url,options)
      promiseService = () => (requestMethod ? requestMethod(service) : fetchProxy(url, rest));
      break;
    }
    default:
      // 一个函数
      promiseService = (...args: any[]) =>
        new Promise((reslove, reject) => {
          const s = service(...args);
          let fn = s;
          //   如果不是promsie（TODO）需要调用请求方法
          if (!s.then) {
            //   判断函数返回值类型
            switch (typeof s) {
              case 'string': {
                fn = finalRequestMethod(s);
                break;
              }
              case 'object': {
                const { url, ...rest } = s;
                fn = requestMethod ? requestMethod(s) : fetchProxy(url, rest);
              }
            }
          }
          fn.then(reslove).catch(reject);
        });
  }

  return useAsync(promiseService, finalOptions);
}

export default useRequest;
