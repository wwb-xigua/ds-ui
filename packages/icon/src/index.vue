<script setup lang="ts" name="Icon">
  import { NIcon } from 'naive-ui';
  import { shallowRef, watchEffect } from 'vue';

  const props = defineProps<{
    icon?: string;
    size?: number;
    color?: string;
  }>();

  const svgModules = import.meta.glob('./icons/*.svg', { import: 'default' });

  const IconComponent = shallowRef<any>(null);

  watchEffect(() => {
    if (!props.icon) {
      IconComponent.value = null;
      return;
    }

    const iconName = props.icon.toLowerCase();
    const path = `./icons/${iconName}.svg`;

    if (svgModules[path]) {
      svgModules[path]().then((mod: any) => {
        IconComponent.value = mod.default || mod;
      });
    } else {
      console.warn(`[SIcon] 找不到图标：${path}`);
      IconComponent.value = null;
    }
  });
</script>

<template>
  <n-icon :component="IconComponent" :size="size" :color="color" v-if="IconComponent" />
</template>
