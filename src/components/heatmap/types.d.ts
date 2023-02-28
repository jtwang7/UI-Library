import React from "react";
import { DeepPartial } from "../../common";

type Cell = {
  width: number;
  height: number;
  color:
    | string
    | Array<{
        index: number;
        rgb: [number, number, number] | [number, number, number, number];
      }>;
  border: {
    size: number;
    color: string;
  }
};
type FontStyle = {
  size: React.CSSProperties["fontSize"];
  weight: React.CSSProperties["fontWeight"];
};

type Options = {
  cell: Cell;
  font: FontStyle;
  padding: [number, number, number, number]; // [top, right, bottom, left]
  needTopBar: boolean;
  needRightBar: boolean;
  needColorBar: boolean;
  forceCanvas: boolean;
};

type HeatmapProps = {
  data: number[][]; // input data
  xs?: string[]; // xAxis label
  ys?: string[]; // yAxis label
  options?: DeepPartial<Options>; // config for render
};

export { HeatmapProps, Options };
