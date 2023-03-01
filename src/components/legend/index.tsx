import React, { useEffect, useMemo, useRef } from "react";
import _ from "lodash";
import * as PIXI from "pixi.js-legacy";

type Font = {
  size?: React.CSSProperties["fontSize"];
  weight?: React.CSSProperties["fontWeight"];
  family?: React.CSSProperties["fontFamily"];
};
type LegendItemProps = {
  width: number;
  height: number;
  color: React.CSSProperties["color"];
  text: string;
  font: Font;
};
function LegendItem(legendProps: LegendItemProps) {
  const props: LegendItemProps = legendProps;

  const PADDING = 10;
  const ORIGIN = [PADDING, PADDING];
  const rectHeight = props.height - PADDING * 2;
  const rectWidth = (5 / 3) * rectHeight;

  const ref = useRef<HTMLDivElement>(null!);
  useEffect(() => {
    const app = new PIXI.Application({
      width: props.width,
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

type LegendProps = {
  texts: (number | string)[];
  colors: React.CSSProperties["color"][];
  direction?: "row" | "column";
  font?: Font;
} & Pick<LegendItemProps, "width" | "height">;
export default function Legend(legendProps: LegendProps) {
  const props = useMemo(
    () =>
      _.defaultsDeep(legendProps, {
        direction: "column",
        font: {
          size: 20,
          weight: "normal",
          family: "sans-serif",
        },
      }) as LegendProps,
    [legendProps]
  );
  const { texts, colors, width, height, font, direction } = props;
  const pairs = _.zipObject<React.CSSProperties["color"]>(texts, colors);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: direction,
        alignItems: "center",
      }}
    >
      {Object.entries(pairs).map(([text, color]) => {
        return (
          <LegendItem
            width={width}
            height={height}
            color={color}
            text={text}
            font={font!}
          />
        );
      })}
    </div>
  );
}
