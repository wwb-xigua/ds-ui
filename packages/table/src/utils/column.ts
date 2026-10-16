import type { VNodeChild } from 'vue';
import type { DataTableBaseColumn } from 'naive-ui';

/** 表头自定义渲染，仅用于表格列头；列展示等 UI 仍使用 title */
export type STableTitleRender = string | ((column: DataTableBaseColumn) => VNodeChild) | false;

export function hasTitleRender(column: { titleRender?: STableTitleRender }): boolean {
  const titleRender = column.titleRender;
  return titleRender !== false && titleRender !== undefined && titleRender !== null;
}

/** 解析传给 n-data-table 的 title */
export function resolveTableColumnTitle(column: {
  title?: unknown;
  titleRender?: STableTitleRender;
}): unknown {
  if (hasTitleRender(column)) {
    return column.titleRender;
  }
  return column.title;
}

/** 列展示面板等场景使用的纯文本标题（不使用函数类型的 title / titleRender） */
export function getColumnDisplayTitle(column: {
  title?: unknown;
  titleRender?: STableTitleRender;
  key?: string | number;
}): string {
  if (typeof column.title === 'string') {
    return column.title;
  }
  if (typeof column.titleRender === 'string') {
    return column.titleRender;
  }
  if (column.key != null && column.key !== '') {
    return String(column.key);
  }
  return '';
}

export function omitTitleRender<T extends { titleRender?: STableTitleRender }>(
  column: T,
): Omit<T, 'titleRender'> {
  const { titleRender: _titleRender, ...rest } = column;
  return rest;
}
