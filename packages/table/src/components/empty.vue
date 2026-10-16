<template>
  <div class="empty">
    <component v-if="bgIcon" :is="bgIcon" />

    <img v-else :src="emptyIconUrl" class="empty-img" alt="暂无内容" />
    <slot />
  </div>
</template>

<script setup lang="ts">
  import { type Component } from 'vue';
  import emptyIconUrl from '../icons/empty.svg?url';
  defineProps<{
    bgIcon?: Component;
  }>();
</script>

<style scoped lang="less">
  .empty {
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    font-size: 12px;
    text-align: center;
    color: #999;
  }

  .empty-img {
    width: 140px;
    height: 140px;
    object-fit: contain;
    margin-bottom: 8px;
  }
</style>
