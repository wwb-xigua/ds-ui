<template>
  <n-form v-bind="getBindValue" :model="formModel" ref="formElRef">
    <n-grid v-bind="getGrid">
      <n-gi
        v-bind="schema.giProps"
        v-for="schema in getSchema"
        :key="schema.field"
        :span="getHidden(schema) ? 0 : schema.giProps?.span || 1"
      >
        <n-form-item
          v-bind="getFormItem(schema)"
          :label="schema.label"
          :path="schema.field"
          :showFeedback="schema.showFeedback"
          v-if="!getHidden(schema)"
        >
          <!--标签名右侧温馨提示-->
          <template #label>
            <span class="label">
              {{ schema.label }}
              <n-tooltip
                trigger="hover"
                :style="schema.labelMessageStyle"
                v-if="schema.labelMessage"
              >
                <template #trigger>
                  <img :src="info" class="info-icon" />
                </template>
                {{ schema.labelMessage }}
              </n-tooltip>
              <span v-if="getProps.showColon && schema.label">：</span>
            </span>
          </template>

          <!--判断插槽-->
          <template v-if="schema.slot">
            <slot
              :name="schema.slot"
              :model="formModel"
              :field="schema.field"
              :value="formModel[schema.field]"
            ></slot>
          </template>

          <!--NCheckbox-->
          <template v-else-if="schema.component === 'NCheckbox'">
            <n-checkbox-group
              v-bind="getSpecComponentProps(schema)"
              v-model:value="formModel[schema.field]"
            >
              <n-space>
                <n-checkbox
                  v-for="item in schema.componentProps?.options"
                  :key="item.value"
                  :value="item.value"
                  :label="item.label"
                />
              </n-space>
            </n-checkbox-group>
          </template>

          <!--NText-->
          <template v-else-if="schema.component === 'Text'">
            <div class="text">
              {{ formModel[schema.field] }}
            </div>
          </template>

          <!--NRadioGroup-->
          <template v-else-if="schema.component === 'NRadioGroup'">
            <n-radio-group
              v-bind="getSpecComponentProps(schema)"
              v-model:value="formModel[schema.field]"
            >
              <n-space>
                <n-radio
                  v-for="item in schema.componentProps?.options"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </n-radio>
              </n-space>
            </n-radio-group>
          </template>

          <!-- valueFormat NDatePicker -->
          <template v-else-if="schema.component === 'NDatePicker'">
            <n-date-picker v-model:value="formModel[schema.field]" v-bind="schema.componentProps" />
          </template>

          <template v-else-if="schema.component === 'NDatePickerFormatted'">
            <n-date-picker
              v-model:formatted-value="formModel[schema.field]"
              v-bind="schema.componentProps"
            />
          </template>

          <!-- valueFormat NTimePicker -->
          <template
            v-else-if="schema.component === 'NTimePicker' && schema.componentProps?.valueFormat"
          >
            <n-time-picker
              v-model:formatted-value="formModel[schema.field]"
              v-bind="schema.componentProps"
            />
          </template>

          <!--动态渲染表单组件-->
          <component
            v-else
            v-bind="getComponentProps(schema)"
            :is="(schema as any).component"
            v-model:value="formModel[schema.field]"
            :class="{ isFull: schema.isFull != false && getProps.isFull }"
          />
          <!--组件后面的内容-->
          <template v-if="schema.suffix">
            <slot
              :name="schema.suffix"
              :model="formModel"
              :field="schema.field"
              :value="formModel[schema.field]"
            ></slot>
          </template>
        </n-form-item>
      </n-gi>
      <!--按钮组区-->
      <n-gi
        :suffix="isInline && getProps.suffix ? true : false"
        :span="isInline ? 1 : 24"
        #="{ overflow }"
        v-if="getProps.showActionButtonGroup"
      >
        <n-space align="center" :justify="getProps.justify">
          <slot name="prefixFooter"></slot>
          <!-- 查询/提交 -->
          <n-button
            v-if="getProps.showSubmitButton"
            v-bind="getSubmitBtnOptions"
            @click="handleSubmit"
            :loading="loadingSub"
            >{{ getProps.submitButtonText }}</n-button
          >
          <!-- 重置 -->
          <n-button
            v-if="getProps.showResetButton"
            v-bind="getResetBtnOptions"
            @click="resetFields"
            >{{ getProps.resetButtonText }}</n-button
          >
          <slot name="suffixFooter"></slot>
          <!-- 展开/收起 -->
          <n-button
            style="display: flex; align-items: center"
            type="primary"
            text
            icon-placement="right"
            v-if="isInline && getProps.showAdvancedButton"
            @click="unfoldToggle"
          >
            <!-- <img :src="overflow ? down : up" /> -->
            <s-icon
              :icon="overflow ? 'down' : 'up'"
              :size="20"
              :color="getProps?.advancedButtonColor"
              style="width: 15px; height: 15px"
            />
          </n-button>
        </n-space>
      </n-gi>
    </n-grid>
  </n-form>
</template>

<script setup lang="ts" name="Form">
  import { NForm, NFormItem, NGi, NGrid, NTooltip } from 'naive-ui';
  import { reactive, ref, useAttrs, computed, unref, onMounted, watch } from 'vue';
  import { useFormEvents } from './hooks/useFormEvents';
  import { useFormValues } from './hooks/useFormValues';
  import { basicProps } from './props';
  import type { Ref } from 'vue';
  import type { GridProps } from 'naive-ui';
  import type { FormSchema, FormProps, FormActionType } from './types/form';
  import { deepMerge, isArray, isBoolean, isFunction } from './utils';
  import { onKeyStroke } from '@vueuse/core';
  import info from './icons/info.svg?url';

  const props = defineProps({ ...basicProps });
  const emit = defineEmits(['reset', 'submitForm', 'register', 'advanced', 'formDataUpdate']);
  const attrs = useAttrs();

  const defaultFormModel = ref<Recordable>({});
  const formModel = reactive<Recordable>({});
  const propsRef = ref<Partial<FormProps>>({});
  const schemaRef = ref<Nullable<FormSchema[]>>(null);
  const formElRef = ref<Nullable<FormActionType>>(null);
  const gridCollapsed = ref(!props.collapsed);
  const loadingSub = ref(false);
  const isUpdateDefaultRef = ref(false);
  const getSubmitBtnOptions = computed(() => {
    return Object.assign(
      {
        size: props.size,
        type: 'primary',
      },
      props.submitButtonOptions,
    );
  });

  const getResetBtnOptions = computed(() => {
    return Object.assign(
      {
        size: props.size,
        type: 'default',
      },
      props.resetButtonOptions,
    );
  });

  function getComponentProps(schema) {
    const compProps = schema.componentProps ?? {};
    return {
      clearable: true,
      ...compProps,
    };
  }

  function getSpecComponentProps(schema) {
    const compProps = schema.componentProps ?? {};
    return {
      ...compProps,
    };
  }

  function getHidden(schema): boolean {
    const hidden = schema.hidden;
    const field = schema.field;
    if (isBoolean(hidden)) return hidden;

    if (isFunction(hidden)) {
      const values = getFieldsValue();
      const status = hidden({ schema, values, model: formModel, field });
      return status;
    }
    return false;
  }

  const getProps = computed((): FormProps => {
    const formProps = { ...props, ...unref(propsRef) } as FormProps;
    const rulesObj = {
      rules: {},
    };
    const schemas = formProps.schemas || [];
    schemas.forEach((item) => {
      if (item.rules && isArray(item.rules)) {
        rulesObj.rules[item.field] = item.rules;
      }
    });
    return { ...formProps, ...unref(rulesObj) };
  });

  const isInline = computed(() => {
    const { layout } = unref(getProps);
    return layout === 'inline';
  });

  const getCollapsed = computed(() => {
    const { showAdvancedButton } = unref(getProps);
    return isInline.value && showAdvancedButton != false ? gridCollapsed.value : false;
  });

  const getGrid = computed((): GridProps => {
    const { gridProps } = unref(getProps);
    return {
      xGap: 20,
      cols: '1 450:2 750:2 1050:3 1350:4 1650:5 1950:6',
      responsive: 'self',
      ...gridProps,
      collapsed: getCollapsed.value,
    };
  });

  const getBindValue = computed(() => ({ ...attrs, ...props, ...unref(getProps) }) as Recordable);

  const getSchema = computed((): FormSchema[] => {
    const schemas: FormSchema[] = unref(schemaRef) || (unref(getProps).schemas as any);
    for (const schema of schemas) {
      const { defaultValue } = schema;
      // handle date type
      defaultValue && (schema.defaultValue = defaultValue);
    }
    return schemas as FormSchema[];
  });

  const { handleFormValues, initDefault } = useFormValues({
    defaultFormModel,
    getSchema,
    formModel,
  });

  const { handleSubmit, validate, resetFields, getFieldsValue, clearValidate, setFieldsValue } =
    useFormEvents({
      emit,
      getProps,
      formModel,
      getSchema,
      formElRef: formElRef as Ref<FormActionType>,
      defaultFormModel,
      loadingSub,
      handleFormValues,
    });

  function getFormItem(values: FormSchema) {
    return values as any;
  }

  function unfoldToggle() {
    gridCollapsed.value = !gridCollapsed.value;
    emit('advanced', gridCollapsed.value);
  }

  async function setProps(formProps: Partial<FormProps>): Promise<void> {
    propsRef.value = deepMerge(unref(propsRef) || {}, formProps);
  }

  async function setSchema(schemaProps: FormSchema[]): Promise<void> {
    schemaRef.value = schemaProps;
  }

  // 更新loading状态
  function setLoadingSub(status: boolean): void {
    loadingSub.value = status;
  }

  const formActionType: Partial<FormActionType> = {
    getFieldsValue,
    setFieldsValue,
    resetFields,
    validate,
    clearValidate,
    setProps,
    setSchema,
    setLoadingSub,
    submitForm: handleSubmit,
  };

  watch(
    () => getSchema.value,
    (schema) => {
      if (unref(isUpdateDefaultRef)) {
        return;
      }
      if (schema?.length) {
        initDefault();
        isUpdateDefaultRef.value = true;
      }
    },
  );

  watch(
    formModel,
    () => {
      emit('formDataUpdate', getFieldsValue());
    },
    { deep: true },
  );

  onMounted(() => {
    initDefault();
    emit('register', formActionType);
    // 回车 Submit
    props.isEnterSubmit && onKeyStroke('Enter', handleSubmit);
  });

  defineExpose({
    ...formActionType,
  });
</script>

<style lang="less" scoped>
  .isFull {
    width: 100%;
    justify-content: flex-start;
  }

  .unfold-icon {
    display: flex;
    align-items: center;
    height: 100%;
    margin-left: -3px;
  }

  .text {
    width: 100%;
    min-height: 34px !important;
    box-sizing: border-box;
    border: 1px solid rgb(224, 224, 230);
    background-color: rgba(250, 250, 252);
    border-radius: 3px;
    padding: 3px 14px;
    line-height: 26px;
    font-size: 14px;
    color: rgb(51, 54, 57);
  }

  .label {
    display: flex;
    align-items: center;
    img {
      cursor: pointer;
    }
  }
</style>
