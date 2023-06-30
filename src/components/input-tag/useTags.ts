import { useLayoutEffect, useState } from "react";
import { TagType } from ".";

const TAG_MARGIN = 10;
const MIN_INPUT_WIDTH = 100;
export const useTags = <T extends HTMLElement>(
  tags: TagType[],
  maxWidth?: number,
  maxCount?: number
) => {
  // @tian: 始终获取最新的 tag refs
  const refs: T[] = [];
  // @tian: 暴露获取 tag refs 的接口
  const getRefs = (ref: T) => {
    refs.push(ref);
  };

  // @tian: 标记被隐藏的 tags 索引起始位置。(初始设为 Infinity，即全部展示)
  const [indexOfStartHidden, setIndexOfStartHidden] = useState(Infinity);

  // @tian: 在 dom 渲染到页面前执行宽度计算，判断是否超出设定阈值；同时，标记索引位置并触发重渲染。
  useLayoutEffect(() => {
    if (maxWidth || maxCount) {
      let width = 0;
      refs.forEach((ref, idx: number) => {
        width += ref.getBoundingClientRect().width + TAG_MARGIN;
        if (maxCount) {
          if (idx >= maxCount) {
            setIndexOfStartHidden(idx);
          }
        }
        if (maxWidth) {
          if (width + MIN_INPUT_WIDTH + 150 > maxWidth) {
            setIndexOfStartHidden(idx);
          }
        }
      });
    }
  }, [tags]);

  return [getRefs, indexOfStartHidden] as const;
};
