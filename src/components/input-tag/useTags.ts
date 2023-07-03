import { useLayoutEffect, useState } from "react";
import { useImmerReducer, ImmerReducer } from "use-immer";
import { v4 as uuid } from "uuid";

/**
 * 基于宽度阈值折叠 <Tag /> 的难点在于如何获取隐藏组件的宽度。
 * 我们可以通过 ref 或者 ref callback 轻松获取到已渲染的组件 DOM 实例，但对于未被渲染到视图的组件而言，我们无法获取其实例对象，react 并不会为这些在视图中不被渲染的节点创建真实 DOM，我们自然也无法获取到相应的宽高。
 *
 * 关于折叠 Tag 宽度计算的思路:
 * 1. 先将所有的 <Tag /> 渲染到视图中，这一步确保了真实 DOM 实例的生成，可通过 ref 获取相应的宽高。
 * 2. 在 useLayoutEffect 中对渲染进行拦截，在将 <Tag /> 真实渲染到视图前判断宽度阈值，隐藏超出部分的 <Tag /> (设置为 display:none) 并且标记折叠位置。
 * 3. 触发重渲染，中断本次的渲染。
 */

type StateType = {
  tag: string | undefined;
  tags: string[];
};
type ActionType =
  | { type: "setTag"; payload?: string }
  | { type: "addTag"; payload: string }
  | { type: "removeTag"; payload: number }
  | { type: "clearTags"; payload?: never };

export const useTags = ({
  tagMargin = 10,
  maxWidth,
  maxCount,
}: {
  tagMargin?: number;
  maxWidth?: number;
  maxCount?: number;
}) => {
  const initialState = {
    tag: undefined,
    tags: [],
  };
  const reducer: ImmerReducer<StateType, ActionType> = (state, action) => {
    const { type, payload } = action;
    switch (type) {
      case "setTag":
        state.tag = payload;
        break;
      case "addTag":
        state.tags.push(payload);
        break;
      case "removeTag":
        state.tags.splice(payload, 1);
        break;
      case "clearTags":
        state.tags.length = 0;
        break;
    }
  };
  const [state, dispatch] = useImmerReducer<StateType, ActionType>(
    reducer,
    initialState
  );

  const addTag = (tag: string) => {
    if (state.tags.every((t) => t !== tag)) {
      dispatch({ type: "addTag", payload: tag });
      dispatch({ type: "setTag", payload: undefined });
    }
  };

  const removeTag = (idx: number) => {
    dispatch({ type: "removeTag", payload: idx });
  };

  const clearTags = () => {
    dispatch({ type: "clearTags" });
  };

  // 始终获取最新的 Tag DOM 实例
  // @tian 此处不用记忆化存储的原因在于: <Tag /> 基于数组产出，其 ref 会在每次重渲染时更新，记忆化存储需要定义较多的依赖项，且在每次重渲染前清空，开发负担较重。
  const refs: any[] = [];
  const getRefs = (ref: any) => {
    refs.push(ref);
  };
  // 标记: 记录 <Tag /> 开始隐藏的索引位置。
  // @tian 此处用 useState 目的在于触发重渲染。
  const [startHiddenIndex, setStartHiddenIndex] = useState(Infinity);
  // 判断宽度是否超出阈值
  // @tian 每次重渲染均进行判断。
  // 优点: 能始终保持正确的样式，不需要考虑多种情况
  // 缺点: 随着 <Tag /> 数的增加，是否存在性能问题有待验证; useLayoutEffect 中调用了 setState，易发生死循环。
  useLayoutEffect(() => {
    if (refs.length) {
      let width = 0;
      let flag = true;
      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        // maxCount 优先
        if (maxCount) {
          if (i > maxCount - 1) {
            ref.style.display = "none";
            if (flag) {
              // 触发重渲染，确保正确展示视图。
              // @tian 注意: 触发重渲染后，必然会再执行一次 useLayoutEffect，会产生额外的性能开销且易发生死循环(此处不会)，待解决？
              setStartHiddenIndex(i);
              flag = false;
            }
          }
        } else if (maxWidth) {
          if (width > maxWidth) {
            // 超出阈值部分设置样式隐藏，且记录隐藏位置。
            ref.style.display = "none";
            if (flag) {
              setStartHiddenIndex(i);
              flag = false;
            }
          } else {
            // 累加宽度
            width += ref.getBoundingClientRect().width + tagMargin;
          }
        }
      }
    }
  });

  // @tian headless UI 思想: 将 state 和 logic 分离到 hooks 中导出，确保 UI 和状态逻辑的分离。
  return {
    // 状态
    tagsOnShow: state.tags,
    tagsOnHidden: state.tags.slice(startHiddenIndex),
    // 方法
    addTag,
    removeTag,
    clearTags,
    getInputProps: () => ({
      value: state.tag,
      onChange: (e: any) => {
        dispatch({ type: "setTag", payload: e.target.value });
      },
      onPressEnter: () => {
        state.tag && addTag(state.tag);
      },
    }),
    getTagsOnShowProps: (tag: string, idx: number) => ({
      key: uuid(),
      ref: getRefs,
      onClose: (e: any) => {
        e.preventDefault();
        removeTag(idx);
      },
    }),
    getTagsOnHiddenProps: (tag: string, idx: number) => ({
      key: uuid(),
      onClose: (e: any) => {
        e.preventDefault();
        removeTag(startHiddenIndex + idx);
      },
    }),
    getClearButtonProps: () => ({
      onMouseDown: (e: any) => {
        e.preventDefault();
        clearTags();
      },
    }),
  };
};
