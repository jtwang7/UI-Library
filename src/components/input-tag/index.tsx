import React, { useImperativeHandle, useMemo, useRef, useState } from "react";
import { Input, Tag, InputRef } from "antd";
import { v4 as uuid } from "uuid";
import _ from "lodash";
import { CloseSquareOutlined } from "@ant-design/icons";
import "antd/dist/reset.css";
import RestTag from "./RestTag";

export type TagType = { id: string; value: string };
type InputTagProps = {
  style?: React.CSSProperties;
  width?: number;
  maxCount?: number; // 最多tag展示数
};
const InputTag: React.ForwardRefRenderFunction<any, InputTagProps> = (
  $props,
  ref
) => {
  const props = _.defaults({ width: 400 }, $props);

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

  const [tagsOnShow, tagsOnHidden] = useMemo(() => {
    // if (props.maxShowWidth) {
    //   let currentWidth = 0;
    //   const [showLists, hiddenLists]: [string[], string[]] = [[], []];
    //   for (const tag of tagLists) {
    //     currentWidth += calTagWidth(tag);
    //     if (currentWidth < (props.width ?? defaultProps.width - 130)) {
    //       showLists.push(tag);
    //     } else {
    //       hiddenLists.push(tag);
    //     }
    //   }
    //   return [showLists, hiddenLists];
    // }
    if (props.maxCount) {
      return [tags.slice(0, props.maxCount), tags.slice(props.maxCount)];
    } else {
      return [tags, []];
    }
  }, [tags, props.maxCount]);

  return (
    <div
      ref={ref}
      style={{
        display: "flex",
        alignItems: "center",
        border: "1px solid gray",
        padding: "0px 5px",
        width: props.width,
        ...props.style,
      }}
    >
      {tagsOnShow.map((tag) => (
        <Tag
          key={uuid()}
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
      {tagsOnHidden.length ? (
        <RestTag
          tags={tagsOnHidden}
          onTagClose={(tag) => {
            removeTag(tag);
          }}
        />
      ) : null}
      <Input
        ref={inputRef}
        placeholder="请输入..."
        style={{ minWidth: 100 }}
        bordered={false}
        value={tag}
        onChange={(e) => {
          setTag(e.target.value);
        }}
        onPressEnter={() => {
          tag && addTag(tag);
        }}
        // onBlur={() => {
        //   tag && addTag(tag);
        // }}
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
