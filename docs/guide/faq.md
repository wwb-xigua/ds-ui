# 常见问题

## `NConfigProvider` 的主题对 ds-ui 无效

不应该发生。请检查：

1. 你的项目里 `naive-ui` 只有**一个**副本

   ```bash
   npm ls naive-ui
   ```

   如果出现多份，说明版本冲突被 npm 嵌套安装了。

2. 你导入的是 npm 上的包，而不是本地源码

   如果你是 fork 之后本地开发，dev server 可能加载的是源码而不是构建产物。源码和产物在依赖外置上的行为是一致的，但如果你改过 `vite.config.ts` 的 `external` 就不一定。

3. 重新安装依赖

   ```bash
   rm -rf node_modules package-lock.json && npm install
   ```

## 表格高度跳动 / 不自适应

`STable` 默认会按视口计算高度。有三种方式覆盖：

```js
useSTable({
  // 1. 指定最大高度
  maxHeight: 600,
  // 2. 指定固定高度
  fixedHeight: 600,
  // 3. 调整最小展示行数（默认 3 行）
  dynamicMinLines: 5,
  // 4. 微调底部预留距离
  dynamicCustomHeightDifference: 20,
});
```

如果表格嵌在可滚动容器里，用 `layoutShiftRefs` 传入那个容器：

```vue
<div ref="layoutShiftRef">
  <s-table @register="register" />
</div>
```

```js
useSTable({ api, columns, layoutShiftRefs: layoutShiftRef });
```

## 筛选后翻页错乱

`STable` 在每次筛选变更时会自动把页码重置为 1。如果你覆写了 `api`，注意不要自己再改页码。

## `columns` 可以传 `ref` 吗

可以。`columns` 和 `data` 都接受普通值或 `ref`，内部统一用 `unref` 解包：

```js
const columns = ref([...]);
useSTable({ api, columns });
```

## 在 Jest / SSR 里报错 `ERR_REQUIRE_ESM`

`ds-ui` 同时提供 ESM 和 CommonJS 两份产物。`require('ds-ui')` 走 `dist/ds-ui.cjs`。

如果你遇到了这个错误，通常是项目里的某个 ESM-only 依赖被带进了 CJS 产物。仓库里有 `npm run verify:build` 会扫描 CJS 产物里的每个 `require()` 并校验它们可解析，CI 会拦住这类回归。

## 怎么贡献

见 [CONTRIBUTING](https://github.com/your-org/ds-ui/blob/main/CONTRIBUTING.md)。最有价值的是**实际使用中的反馈** —— 哪怕只是"这个筛选器不好用"。

遇到安全问题请不要公开 issue，见 [SECURITY.md](https://github.com/your-org/ds-ui/blob/main/SECURITY.md)。
