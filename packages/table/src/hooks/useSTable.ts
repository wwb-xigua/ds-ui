import { STableProps, TableActionType, UseTableReturnType } from '../types';
import { getDynamicProps, isProdMode } from '../../../form/src/utils';
import { nextTick, onUnmounted, ref, unref, watch } from 'vue';
import type { TableProps } from 'naive-ui';

export function useSTable(props?: STableProps): UseTableReturnType {
  const tableRef = ref<Nullable<TableActionType>>(null);

  async function getTable() {
    const table = unref(tableRef);
    if (!table) {
      console.error(
        'The table instance has not been obtained, please make sure that the form has been rendered when performing the form operation!',
      );
    }
    await nextTick();
    return table as TableActionType;
  }

  function register(instance: TableActionType) {
    isProdMode() &&
      onUnmounted(() => {
        tableRef.value = null;
      });
    if (isProdMode() && instance === unref(tableRef)) return;

    tableRef.value = instance;

    watch(
      () => props,
      () => {
        props && instance.setProps(getDynamicProps(props));
      },
      {
        immediate: true,
        deep: true,
      },
    );
  }

  const methods: TableActionType = {
    setProps: async (tableProps: Partial<TableProps>) => {
      const table = await getTable();
      await table.setProps(tableProps);
    },
    loadData: async (params, reset?: boolean) => {
      const table = await getTable();
      await table.loadData(params, reset);
    },
    getTbFilterData: () => {
      const table = unref(tableRef);
      return table?.getTbFilterData();
    },
    getTbFilterDataWithoutFormAndFilters: () => {
      const table = unref(tableRef);
      return table?.getTbFilterDataWithoutFormAndFilters();
    },
    refreshCurrentPage: () => {
      const table = unref(tableRef);
      return table?.refreshCurrentPage();
    },
    getTableTotal: () => {
      const table = unref(tableRef);
      return table?.getTableTotal();
    },
  };

  return [register, methods];
}
