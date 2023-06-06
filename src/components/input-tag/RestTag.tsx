import { useRef, useState } from "react";
import { v4 as uuid } from "uuid";
import { Tag, Popover } from "antd";
import { TagType } from ".";

export interface RestTagProps {
  tags: TagType[];
  onTagClose?: (
    tag: TagType,
    idx: number,
    e: React.MouseEvent<HTMLElement, MouseEvent>
  ) => Promise<any> | void;
}
const RestTag = (props: RestTagProps) => {
  const restCount = props.tags.length;

  return restCount === 0 ? null : (
    <Popover
      content={props.tags.map((tag, idx) => (
        <Tag
          key={uuid()}
          bordered
          closable
          onClose={(e) => {
            e.preventDefault();
            props.onTagClose?.(tag, idx, e);
          }}
        >
          {tag.value}
        </Tag>
      ))}
    >
      <Tag bordered closable={false}>{`+${restCount}`}</Tag>
    </Popover>
  );
};

export default RestTag;
