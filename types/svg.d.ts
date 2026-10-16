declare module '*.svg?url' {
  const src: string;
  export default src;
}

declare module '*.svg' {
  import type { DefineComponent } from 'vue';
  const component: DefineComponent<{}, {}, any>;
  export default component;
}
