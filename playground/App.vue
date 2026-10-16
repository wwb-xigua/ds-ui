<template>
  <div class="box-wrap">
    <div class="box">
      <n-tabs type="segment" animated v-model:value="tabName" class="custom-tabs">
        <n-tab name="available" key="available">正常使用</n-tab>
        <n-tab name="all" key="all">全部专家</n-tab>
      </n-tabs>

      <div class="table-wrap">
        <s-table @register="register" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
  import { computed, h, onMounted, ref, watch } from 'vue';
  import { useSTable } from '../packages';
  import { NButton, NSpace, NTabs, NTab } from 'naive-ui';

  // 当前 Tab
  const tabName = ref<'available' | 'all'>('available');

  // 动态列配置：正常使用多一列操作时间；全部专家多一列专家地址
  const columns = computed(() => {
    const baseColumns: any[] = [
      {
        title: '序号',
        key: 'index',
        align: 'center',
        render: (_: object, rowIndex: number) => rowIndex + 1,
        width: 60,
        fixed: 'left',
        show: true,
      },
      {
        title: '专家名称',
        key: 'name',
        width: 120,
        align: 'center',
        show: true,
      },
      {
        title: '专家卡ID',
        key: 'expertNo',
        width: 150,
        align: 'center',
        show: true,
      },
    ];

    if (true) {
      baseColumns.push(
        {
          title: '单位类型',
          key: 'unitType',
          width: 100,
          align: 'center',
          show: true,
        },
        {
          title: '所属单位',
          key: 'unitName',
          width: 200,
          align: 'center',
          show: true,
        },
      );
    }

    // 公共字段
    baseColumns.push(
      {
        title: '可用截止时间',
        key: 'asOfDate',
        width: 200,
        align: 'center',
        show: true,
      },
      {
        title: '专家状态',
        key: 'enterStatus',
        width: 150,
        align: 'center',
        show: true,
      },
    );

    // 根据 Tab 追加不同的列
    if (tabName.value === 'available') {
      baseColumns.push({
        title: '操作时间',
        key: 'operateTime',
        width: 180,
        align: 'center',
        show: true,
      });
    }

    if (tabName.value === 'all') {
      baseColumns.push({
        title: '专家地址',
        key: 'expertAddress',
        width: 220,
        align: 'center',
        show: true,
      });
    }

    // 操作列
    baseColumns.push({
      title: '操作',
      key: 'action',
      width: 120,
      fixed: 'right',
      align: 'center',
      show: true,
      render: (row: any) =>
        h(NSpace, {}, () => [
          h(
            NButton,
            {
              text: true,
              type: 'primary',
              size: 'small',
              onClick: () => {
                console.log('查看', row);
              },
            },
            () => '查看',
          ),
        ]),
    });

    return baseColumns;
  });

  const Columndata = computed(() => {
    return columns.value;
  });

  const [register, { loadData }] = useSTable({
    columns: Columndata,
    dynamicMinLines: 3,
    autoLoad: false,
    autoScrollX: true,
    pageField: 'current',
    pageSizeField: 'size',
    rowKey: (row: any) => row.id,
    notNull: false,
    tbPadding: 2,
    api: async () => {
      // 根据 Tab 返回不同 mock 数据
      if (tabName.value === 'available') {
        return {
          records: [
            {
              id: 1,
              name: '张三',
              expertNo: 'E2025001',
              unitType: '科研单位',
              unitName: '某研究所A',
              asOfDate: '2026-12-31',
              enterStatus: '正常',
              operateTime: '2026-01-20 09:30:00',
            },
            {
              id: 2,
              name: '李四',
              expertNo: 'E2025002',
              unitType: '高校',
              unitName: '某大学B',
              asOfDate: '2026-06-30',
              enterStatus: '正常',
              operateTime: '2026-01-19 15:10:00',
            },
          ],
          total: 2,
          current: 1,
          size: 10,
          pages: 1,
        };
      }

      // 全部专家
      return {
        records: [
          {
            id: 1,
            name: '张三',
            expertNo: 'E2025001',
            unitType: '科研单位',
            unitName: '某研究所A',
            asOfDate: '2026-12-31',
            enterStatus: '正常',
            expertAddress: '北京市海淀区',
          },
          {
            id: 2,
            name: '李四',
            expertNo: 'E2025002',
            unitType: '高校',
            unitName: '某大学B',
            asOfDate: '2026-06-30',
            enterStatus: '暂停',
            expertAddress: '上海市浦东新区',
          },
        ],
        total: 2,
        current: 1,
        size: 10,
        pages: 1,
      };
    },
    toolbarConfig: {
      refresh: false,
      custom: true,
      reset: false,
    },
  } as any);

  // 切换 Tab 时重新加载数据
  watch(
    () => tabName.value,
    () => {
      loadData(undefined);
    },
  );

  onMounted(() => {
    // 首次加载当前 tab 数据
    loadData(undefined);
  });
</script>

<style lang="less" scoped>
  .box-wrap {
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .box {
    width: 80%;
    height: 80%;
    display: flex;
    flex-direction: column;
  }

  .custom-tabs {
    margin-bottom: 12px;
  }

  .table-wrap {
    flex: 1;
  }
</style>
