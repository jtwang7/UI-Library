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

  const [tags, setTags] = useState<TagType[]>([]);
  const [tag, setTag] = useState<string>();

  const addTag = (tag: string) => {
    if (tags.find((t) => t.value === tag)) {
      return;
    }
    setTags((prev) => [...prev, { id: uuid(), value: tag }]);
    setTag(undefined);
  };
  const removeTag = (tag: TagType) => {
    setTags((prev) => prev.filter((pt) => pt.id !== tag.id));
  };
  const clearTags = () => {
    setTags([]);
  };

  // 宽度计算逻辑
  const [getRefs, index] = useTags(tags, props.width, props.maxCount);

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
      {tags.slice(0, index).map((tag) => (
        <Tag
          key={uuid()}
          ref={getRefs}
          bordered
          closable
          onClose={(e) => {
            e.preventDefault();
            removeTag(tag);
          }}
        >
          {tag.value}
        </Tag>
      ))}
      {/* tag 隐藏部分 */}
      {/* 此处用 React.cloneElement 设置插槽，可传入 Popover，Tooltip 等组件 */}
      {props.wrapper && tags.slice(index).length
        ? React.cloneElement(
            props.wrapper(
              tags.slice(index).map((tag) => (
                <Tag
                  key={uuid()}
                  ref={getRefs}
                  bordered
                  closable
                  onClose={(e) => {
                    e.preventDefault();
                    removeTag(tag);
                  }}
                >
                  {tag.value}
                </Tag>
              ))
            )!,
            {
              children: (
                <Tag bordered closable={false}>{`+${tags.length - index}`}</Tag>
              ),
            }
          )
        : null}
      <Input
        ref={inputRef}
        placeholder="请输入..."
        style={{ minWidth: MIN_INPUT_WIDTH, flex: "1 1" }}
        bordered={false}
        value={tag}
        onChange={(e) => {
          setTag(e.target.value);
        }}
        onPressEnter={() => {
          tag && addTag(tag);
        }}
      />
      <CloseSquareOutlined
        rev={undefined}
        style={{ marginLeft: "auto" }}
        onMouseDown={(e) => {
          e.preventDefault();
          clearTags();
        }}
      />
    </div>
  );
};

export default React.forwardRef(InputTag);
