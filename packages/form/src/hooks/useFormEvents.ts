import type { ComputedRef, Ref } from 'vue';
import type { FormProps, FormSchema, FormActionType } from '../types/form';
import { unref, toRaw } from 'vue';
import { getByPath, isDef, isFunction } from '../utils';

declare type EmitType = (event: string, ...args: any[]) => void;

interface UseFormActionContext {
  emit: EmitType;
  getProps: ComputedRef<FormProps>;
  getSchema: ComputedRef<FormSchema[]>;
  formModel: Recordable;
  formElRef: Ref<FormActionType>;
  defaultFormModel: Recordable;
  loadingSub: Ref<boolean>;
  handleFormValues: Function;
}

export function useFormEvents({
  emit,
  getProps,
  formModel,
  getSchema,
  formElRef,
  defaultFormModel,
  loadingSub,
  handleFormValues,
}: UseFormActionContext) {
  // 验证
  async function validate(keyList?: string[]) {
    return keyList
      ? unref(formElRef)?.validate(
          () => {},
          // @ts-ignore
          (rule) => {
            return keyList?.includes(rule?.key);
          },
        )
      : unref(formElRef)?.validate();
  }

  // 提交
  async function handleSubmit(e?: Event): Promise<object | boolean> {
    e && e.preventDefault();

    const { submitFunc } = unref(getProps);
    if (submitFunc && isFunction(submitFunc)) {
      await submitFunc();
      return false;
    }
    const formEl = unref(formElRef);
    if (!formEl) return false;
    try {
      await validate();
      const values = getFieldsValue();
      emit('submitForm', values);
      return values;
    } catch (error: any) {
      emit('submitForm', false);
      return false;
    }
  }

  // 清空校验
  async function clearValidate() {
    await unref(formElRef as any)?.restoreValidation();
  }

  // 重置
  async function resetFields(): Promise<void> {
    const { resetFunc, submitOnReset } = unref(getProps);
    resetFunc && isFunction(resetFunc) && (await resetFunc());
    const formEl = unref(formElRef);
    if (!formEl) return;
    Object.keys(formModel).forEach((key) => {
      formModel[key] = unref(defaultFormModel)[key] || null;
    });
    await clearValidate();
    const fromValues = handleFormValues(toRaw(unref(formModel)));
    emit('reset', fromValues);
    submitOnReset && (await handleSubmit());
  }

  //获取表单值
  function getFieldsValue(): Recordable {
    const formEl = unref(formElRef);
    if (!formEl) return {};
    return handleFormValues(toRaw(unref(formModel)));
  }

  //设置表单字段值
  function setFieldsValue(values: Recordable): void {
    const fields = unref(getSchema)
      .map((item) => item.field)
      .filter(Boolean);

    // 扁平 key，直接赋值
    Object.keys(values).forEach((key) => {
      if (fields.includes(key)) {
        formModel[key] = values[key];
      }
    });

    // 兼容 a.b.c 这类嵌套路径写法
    fields
      .filter((item) => String(item).indexOf('.') >= 0)
      .forEach((itemKey) => {
        const value = getByPath(values, String(itemKey));
        if (isDef(value)) {
          formModel[itemKey as string] = value;
        }
      });
  }

  function setLoadingSub(value: boolean): void {
    loadingSub.value = value;
  }

  return {
    handleSubmit,
    validate,
    resetFields,
    getFieldsValue,
    clearValidate,
    setFieldsValue,
    setLoadingSub,
  };
}
