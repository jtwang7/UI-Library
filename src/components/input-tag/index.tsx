import React, {
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Input, Tag, InputRef, Popover } from "antd";
import { v4 as uuid } from "uuid";
import _ from "lodash";
import { CloseSquareOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import "./index.scss";
import cs from "classnames";
import { useTags } from "./useTags";

export type TagType = { id: string; value: string };
type InputTagProps = {
  style?: React.CSSProperties;
  width?: number;
  maxCount?: number; // 最多tag展示数
  maxWidth?: number;
  autoRest?: boolean; // 超出范围的tag自动折叠
  wrapper?: (Tags: React.ReactNode) => React.ReactElement;
};
const InputTag: React.ForwardRefRenderFunction<any, InputTagProps> = (
  $props,
  ref
) => {
  const props = _.defaults($props, { width: 400 });
  const MIN_INPUT_WIDTH = 100;

  const inputRef = useRef<InputRef>(null!);
  useImperativeHandle(
    ref,
    () => {
      return {
        focus() {
          inputRef.current.focus();
        },
        blur() {
          inputRef.current.blur();
        },
      };
    },
    []
  );

  // 宽度计算逻辑
  const {
    tagsOnShow,
    tagsOnHidden,
    getInputProps,
    getTagsOnShowProps,
    getTagsOnHiddenProps,
    getClearButtonProps,
  } = useTags({
    tagMargin: 10,
    maxWidth: props.maxWidth,
    maxCount: props.maxCount,
  });

  return (
    <div
      ref={ref}
      className={"tag-container"}
      style={{
        width: props.width,
        ...props.style,
      }}
    >
      {/* tag 展示部分 */}
      {tagsOnShow.map((tag, idx) => (
        <Tag bordered closable {...getTagsOnShowProps(tag, idx)}>
          {tag}
        </Tag>
      ))}
      {/* tag 隐藏部分 */}
      {/* 此处用 React.cloneElement 设置插槽，可传入 Popover，Tooltip 等组件 */}
      {props.wrapper && tagsOnHidden.length
        ? React.cloneElement(
            props.wrapper(
              tagsOnHidden.map((tag, idx) => (
                <Tag bordered closable {...getTagsOnHiddenProps(tag, idx)}>
                  {tag}
                </Tag>
              ))
            )!,
            {
              children: (
                <Tag bordered closable={false}>{`+${tagsOnHidden.length}`}</Tag>
              ),
            }
          )
        : null}
      <Input
        ref={inputRef}
        placeholder="请输入..."
        style={{ minWidth: MIN_INPUT_WIDTH, flex: "1 1" }}
        bordered={false}
        {...getInputProps()}
      />
      <CloseSquareOutlined
        rev={undefined}
        style={{ marginLeft: "auto" }}
        {...getClearButtonProps()}
      />
    </div>
  );
};

export default React.forwardRef(InputTag);
