# use-request

## Project setup

```
npm install
```

### Compiles and hot-reloads for development

```
npm run serve
```

### Compiles and minifies for production

```
npm run build
```

### Run your unit tests

```
npm run test:unit
```

### Lints and fixes files

```
npm run lint
```

### 问题

配置`.prettierrc`优先度大于项目或 ide 的格式化预设

### 功能

- ~~默认请求~~
- ~~手动触发~~
- ~~轮询~~
- ~~并行请求~~
- ~~防抖/节流~~
- ~~延迟加载~~
- ~~依赖请求(vue 在业务代码用 watchEffect 实现即可)~~
- ~~refreshDeps~~
- ~~缓存 & SWR~~
- 预加载
- 优化修复错误
- 突变
- 屏幕聚焦重新请求

### 参考

- [ahooks](https://github.com/alibaba/hooks/tree/master/packages/use-request)
- [vue-composable/makeAxios](https://github.com/pikax/vue-composable/blob/master/packages/axios/src/makeAxios.ts)
- [vueuse/useAxios](https://github.com/vueuse/vueuse/blob/master/packages/integrations/useAxios/index.ts)
- [ahooks-vue/useRequest](https://github.com/dewfall123/ahooks-vue/blob/master/packages/vhooks/src/useRequest/index.ts)
