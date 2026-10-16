/*
 * @Description: naive-ui 按需全局安装组件（手动）
 * @Author: DJF
 * @LastEditors: DJF
 * @Date: 2023-08-03 14:55:47
 * @LastEditTime: 2023-08-08 10:24:20
 */
import type { App } from 'vue';

import * as NaiveUI from 'naive-ui';

const naive = NaiveUI.create({
  components: [
    NaiveUI.NButton,
    NaiveUI.NEllipsis,
    NaiveUI.NSpace,
    NaiveUI.NModal,
    NaiveUI.NGi,
    NaiveUI.NTooltip,
    NaiveUI.NCheckbox,
    NaiveUI.NCheckboxGroup,
    NaiveUI.NRadio,
    NaiveUI.NRadioGroup,
    NaiveUI.NDatePicker,
    NaiveUI.NTimePicker,
    NaiveUI.NGrid,
    NaiveUI.NFormItem,
    NaiveUI.NForm,
    NaiveUI.NIcon,
    NaiveUI.NInput,
    NaiveUI.NInputNumber,
    NaiveUI.NSelect,
    NaiveUI.NCard,
    NaiveUI.NScrollbar,
    NaiveUI.NCollapseTransition,
    NaiveUI.NDrawer,
    NaiveUI.NDrawerContent,
    NaiveUI.NSpin,
    NaiveUI.NDataTable,
    NaiveUI.NFlex,
    NaiveUI.NPopover,
    NaiveUI.NTree,
    NaiveUI.NTreeSelect,
    NaiveUI.NProgress,
    NaiveUI.NTag,
    NaiveUI.NVirtualList,
  ],
});

export function setupNaive(app: App<Element>) {
  app.use(naive);
}
