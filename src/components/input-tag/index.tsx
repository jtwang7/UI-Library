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

export type TagType = { id: string; value: string };
type InputTagProps = {
  style?: React.CSSProperties;
  width?: number;
  maxCount?: number; // 最多tag展示数
  autoRest?: boolean; // 超出范围的tag自动折叠
};
const InputTag: React.ForwardRefRenderFunction<any, InputTagProps> = (
  $props,
  ref
) => {
  const props = _.defaults($props, { width: 400 });
  const MIN_INPUT_WIDTH = 100;
  const TAG_MARGIN = 10;

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

  // @tian: 始终同步最新的 ref 对象
  const refs: any[] = [];
  const saveRefs = (ref: any) => {
    if (ref) {
      refs.push(ref);
    }
  };
  // @tian: tag状态
  const [status, setStatus] = useState<boolean[]>([]);
  // @tian:
  // 1. 当固定宽度且开启“超出宽度自动折叠tag”时，计算 tags 总占用宽度与阈值间的关系，隐藏超出部分的 tags。
  // 2. 当固定数目时，判断 tags 当前展示的数目，隐藏超出的 tags。
  useLayoutEffect(() => {
    if ("width" in props && props.autoRest) {
      const status: boolean[] = [];
      let width = 0;
      refs.forEach((ref: any, idx: number) => {
        width +=
          (ref as HTMLDivElement).getBoundingClientRect().width + TAG_MARGIN;
        // TODO: 150 是预留空间
        if (width + MIN_INPUT_WIDTH + 150 <= props.width) {
          status.push(true);
        } else {
          status.push(false);
        }
      });
      setStatus(status);
    } else if (props.maxCount) {
      const status = tags.map((tag, idx) => idx + 1 <= props.maxCount!);
      setStatus(status);
    } else {
      setStatus(Array.from({ length: tags.length }, () => true));
    }
  }, [tags]);

  const tagsOnHidden = useMemo(() => {
    const target = tags.filter((t, i) => {
      return !status[i];
    });
    return target;
  }, [tags, status]);

  return (
    <div
      ref={ref}
      className={"tag-container"}
      style={{
        width: props.width,
        ...props.style,
      }}
    >
      {tags.map((tag, i) => (
        <Tag
          key={uuid()}
          ref={saveRefs}
          className={cs(status[i] ? "tag-visible" : "tag-hidden")}
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
        <Popover
          content={tagsOnHidden.map((tag, idx) => (
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
        >
          <Tag bordered closable={false}>{`+${tagsOnHidden.length}`}</Tag>
        </Popover>
      ) : null}
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
