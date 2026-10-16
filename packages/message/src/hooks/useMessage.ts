/*
 * @Description: useMessage 二次函数封装
 * @Author: DJF
 * @LastEditors: Duan Jiefei
 * @Date: 2023-08-29 10:57:04
 * @LastEditTime: 2024-05-10 17:53:54
 */
import { createDiscreteApi } from 'naive-ui';

const { message } = createDiscreteApi(['message'], {});
import Message from '../index.vue';
import { h } from 'vue';

const renderMessage = (props) => {
  const { type, content } = props;
  return h(Message, {
    type: type,
    onClose: props.onClose,
    content: content,
  });
};

export function useMessage() {
  function destroyAll() {
    message?.destroyAll();
  }

  function create(content, option?) {
    message?.create(content, option);
  }

  function error(content, option?) {
    message?.error(content, {
      render: renderMessage,
      keepAliveOnHover: true,
      ...option,
    });
  }

  function info(content, option?) {
    message?.info(content, {
      render: renderMessage,
      keepAliveOnHover: true,
      ...option,
    });
  }

  function loading(content, option?) {
    message?.loading(content, {
      render: renderMessage,
      keepAliveOnHover: true,
      ...option,
    });
  }

  function success(content, option?) {
    message?.success(content, {
      render: renderMessage,
      keepAliveOnHover: true,
      closable: true,
      ...option,
    });
  }

  function warning(content, option?) {
    message?.warning(content, {
      render: renderMessage,
      keepAliveOnHover: true,
      ...option,
    });
  }

  return {
    destroyAll,
    create,
    error,
    info,
    loading,
    success,
    warning,
  };
}
