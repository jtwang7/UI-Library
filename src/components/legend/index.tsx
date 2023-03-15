import React, { useEffect, useMemo, useRef } from "react";
import _ from "lodash";
import * as PIXI from "pixi.js-legacy";
import { DeepRequired } from "../../common";

type Font = {
  size: number;
  weight: string | number;
  family: string;
};
type LegendItemProps = {
  width: number;
  height: number;
  stageWidth: number;
  color: string;
  text: string;
  font?: Partial<Font>;
};
type LegendProps = {
  width: number;
  height: number;
  texts: (number | string)[];
  colors: string[];
  style?: any;
  padding?: [number, number, number, number];
  direction?: "row" | "column";
  item?: Partial<LegendItemProps>;
};

function LegendItem(props: LegendItemProps) {
  const ORIGIN = [0, 0];
  const rectHeight = props.height;
  const rectWidth = props.width;

  const ref = useRef<HTMLDivElement>(null!);
  useEffect(() => {
    const app = new PIXI.Application({
      width: props.stageWidth,
      height: props.height,
      backgroundColor: 0xffffff,
      forceCanvas: true,
      autoDensity: true,
      resolution: 2,
    });
    const rect = new PIXI.Graphics();
    rect.lineStyle(1);
    rect.beginFill(props.color, 1);
    rect.drawRect(ORIGIN[0], ORIGIN[1], rectWidth, rectHeight);
    rect.endFill();
    app.stage.addChild(rect);

    const textStyle = new PIXI.TextStyle({
      fontFamily: props.font!.family,
      fontSize: props.font!.size,
      fontWeight: props.font!.weight as PIXI.TextStyleFontWeight,
    });
    const text = new PIXI.Text(props.text, textStyle);
    text.anchor.set(0, 0.5);
    text.x = ORIGIN[0] + rectWidth + 15;
    text.y = props.height / 2;
    app.stage.addChild(text);

    ref.current.appendChild(app.view as any);

    return () => {
      app.destroy(true);
    };
  }, [props]);

  return <div ref={ref}></div>;
}

export default function Legend(legendProps: LegendProps) {
  const p = useMemo(() => _.cloneDeep(legendProps), [legendProps]);
  const props = useMemo<DeepRequired<LegendProps>>(
    () =>
      _.defaultsDeep(p, {
        direction: "column",
        padding: [10, 10, 10, 10],
        item: {
          width: 40,
          height: 20,
          font: {
            size: 20,
            weight: "normal",
            family: "sans-serif",
          },
        },
      }),
    [p]
  );

  const pairs = _.zipObject(props.texts, props.colors);

  return (
    <div
      style={{
        width: props.width,
        height: props.height,
        backgroundColor: "#fff",
        border: "1px solid #111",
        borderRadius: "5px",
        display: "flex",
        flexDirection: props.direction,
        alignItems: "center",
        justifyContent: "space-between",
        padding: `${props.padding[0]}px ${props.padding[1]}px ${props.padding[2]}px ${props.padding[3]}px`,
        ...props.style
      }}
    >
      {Object.entries(pairs).map(([text, color]) => {
        return (
          <LegendItem
            width={props.item!.width}
            height={props.item!.height}
            stageWidth={props.width - props.padding[1] - props.padding[3]}
            color={color}
            text={text}
            font={props.item!.font as Font}
          />
        );
      })}
    </div>
  );
}
