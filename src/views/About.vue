<template>
  <div class="about">
    <h1>This is an about page</h1>
    <div>foo{{ foo }}</div>
    <div>bar{{ bar }}</div>
    <div>test{{ test }}</div>
    <div>fooComputed{{ fooComputed }}</div>
  </div>
</template>
<script lang="ts">
import { computed, defineComponent, reactive, toRefs } from 'vue';
function useFeatureX() {
  const state = reactive({
    foo: 1,
    bar: 2,
  });

  // 逻辑运行状态

  // 返回时转换为ref
  return toRefs(state);
}

export default defineComponent({
  name: 'About',
  setup() {
    const { foo, bar } = useFeatureX();
    const test = useFeatureX();

    const fooComputed = computed(() => {
      return test.foo;
    });

    return {
      foo,
      bar,
      test, // 此时的test用devtool工具查看会发现不是响应式类型
      // 解决方案在下面
      testFoo: test.foo,
      fooComputed, // 用computed出来的数据好像略显诡异 毕竟不是响应式的来源
    };
  },
});
</script>
