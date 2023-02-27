import React, { useCallback, useEffect, useMemo, useRef } from "react";
import * as PIXI from "pixi.js-legacy";
import _ from "lodash";
import colormap from "colormap";
import { HeatmapProps, Options } from "./types";
import { DeepRequired } from "../../common";

// Common Functions
function getColorRangeIndex(
  value: number,
  {
    minValue,
    maxValue,
    splits,
  }: { minValue: number; maxValue: number; splits: number }
) {
  const per = (maxValue - minValue) / (splits - 1);
  return Math.floor((value - minValue) / per);
}
function createGradient(width: number, height: number, colors: string[]) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (ctx) {
    const grd = ctx.createLinearGradient(0, height, 0, 0);
    for (let i = 0; i <= colors.length - 1; i++) {
      grd.addColorStop(i / colors.length, colors[i]);
    }
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, width, height);
  }
  return PIXI.Texture.from(canvas);
}

export default function Heatmap(props: HeatmapProps) {
  const { data, xs = [], ys = [], options = {} } = props;

  // default options
  const defaultOptions: DeepRequired<Options> = useMemo(
    () =>
      _.defaultsDeep(options, {
        cell: {
          width: 10,
          height: 10,
          color: "summer",
        },
        font: {
          size: 10,
          weight: "normal",
        },
        padding: [20, 20, 20, 20],
        needTopBar: false,
        needRightBar: false,
        needColorBar: true,
      } as DeepRequired<Options>),
    [options]
  );

  const common = useMemo(() => {
    const all = _.flattenDeep(data);
    return {
      rowsNum: data.length,
      colsNum: data[0].length,
      minValue: _.min(all)!,
      maxValue: _.max(all)!,
    };
  }, [data]);

  // 画布配置
  const pixiOptions = useMemo(() => {
    return {
      stage: {
        width:
          defaultOptions.padding[3] +
          defaultOptions.padding[1] +
          (defaultOptions.needRightBar
            ? (common.colsNum + 1) * defaultOptions.cell.width + 10
            : common.colsNum * defaultOptions.cell.width),
        height:
          defaultOptions.padding[0] +
          defaultOptions.padding[2] +
          (defaultOptions.needTopBar
            ? (common.rowsNum + 1) * defaultOptions.cell.height + 10
            : common.rowsNum * defaultOptions.cell.height),
      },
      // 坐标原点
      paintOrigin: [defaultOptions.padding[3], defaultOptions.padding[0]],
    };
  }, [common, defaultOptions]);

  // 颜色棒
  const colors = useMemo(() => {
    return colormap({
      colormap: defaultOptions.cell.color,
      nshades: 100,
      format: "hex",
      alpha: 1,
    }).reverse();
  }, []);

  // pixi.js 字体样式
  const textStyle = useMemo(
    () =>
      new PIXI.TextStyle({
        fontFamily: defaultOptions.font.weight as any,
        fontSize: defaultOptions.font.size as any,
        // fontWeight: 'bold',
      }),
    [defaultOptions]
  );

  // 绘制一个单元格
  const drawCell = useCallback(
    (g: any, pos: [number, number], fillColor: string) => {
      g.lineStyle(1);
      g.beginFill(fillColor, 1);
      g.drawRect(
        pos[0],
        pos[1],
        defaultOptions.cell.width,
        defaultOptions.cell.height
      );
    },
    [defaultOptions]
  );
  // 绘制
  const draw = useCallback(
    (g: any) => {
      g.clear();
      for (let i = 0; i < common.rowsNum; i++) {
        for (let j = 0; j < common.colsNum; j++) {
          const value = data[i][j];
          const [x, y] = [
            pixiOptions.paintOrigin[0],
            defaultOptions.needTopBar
              ? pixiOptions.paintOrigin[1] + defaultOptions.cell.height + 10
              : pixiOptions.paintOrigin[1],
          ];
          const color =
            colors[
              getColorRangeIndex(value, {
                minValue: common.minValue,
                maxValue: common.maxValue,
                splits: colors.length,
              })
            ];
          drawCell(
            g,
            [
              x + j * defaultOptions.cell.width,
              y + i * defaultOptions.cell.height,
            ],
            color
          );
        }
      }
      if (defaultOptions.needTopBar) {
        const [x, y] = [pixiOptions.paintOrigin[0], pixiOptions.paintOrigin[1]];
        const arr = [];
        for (let j = 0; j < common.colsNum; j++) {
          arr.push(_.sumBy(data, (o) => o[j]));
        }
        const min = _.min(arr)!;
        const max = _.max(arr)!;
        for (let j = 0; j < common.colsNum; j++) {
          const color =
            colors[
              getColorRangeIndex(arr[j], {
                minValue: min,
                maxValue: max,
                splits: colors.length,
              })
            ];
          drawCell(g, [x + j * defaultOptions.cell.width, y], color);
        }
      }
      if (defaultOptions.needRightBar) {
        const [x, y] = [pixiOptions.paintOrigin[0], pixiOptions.paintOrigin[1]];
        const arr = [];
        for (let i = 0; i < common.rowsNum; i++) {
          arr.push(_.sum(data[i]));
        }
        const min = _.min(arr)!;
        const max = _.max(arr)!;
        for (let i = 0; i < common.rowsNum; i++) {
          const color =
            colors[
              getColorRangeIndex(arr[i], {
                minValue: min,
                maxValue: max,
                splits: colors.length,
              })
            ];
          drawCell(
            g,
            [
              x + common.colsNum * defaultOptions.cell.width + 10,
              y +
                (defaultOptions.needTopBar
                  ? defaultOptions.cell.height + 10
                  : 0) +
                i * defaultOptions.cell.height,
            ],
            color
          );
        }
      }
      g.endFill();
    },
    [data, common, pixiOptions, defaultOptions, colors, drawCell]
  );
  // 绘制坐标刻度
  const drawAxisTexts = useCallback(
    (app: PIXI.Application<PIXI.ICanvas>) => {
      if (ys.length) {
        for (let i = 0; i < ys.length; i++) {
          const text = new PIXI.Text(ys[i], textStyle);
          text.anchor.set(1, 0);
          text.x = pixiOptions.paintOrigin[0] - 10;
          text.y =
            pixiOptions.paintOrigin[1] +
            defaultOptions.cell.height * (ys.length - i - 1) +
            (defaultOptions.needTopBar ? defaultOptions.cell.height + 10 : 0);
          app.stage.addChild(text);
        }
      }
      if (xs.length) {
        for (let i = 0; i < xs.length; i++) {
          const text = new PIXI.Text(xs[i], textStyle);
          text.anchor.set(0.5, 0);
          text.x =
            pixiOptions.paintOrigin[0] +
            defaultOptions.cell.width * i +
            defaultOptions.cell.width / 2;
          text.y =
            pixiOptions.paintOrigin[1] +
            defaultOptions.cell.height * ys.length +
            (defaultOptions.needTopBar ? defaultOptions.cell.height + 10 : 0) +
            10;
          app.stage.addChild(text);
        }
      }
    },
    [xs, ys, pixiOptions, defaultOptions, textStyle]
  );

  // 绘制图例
  const drawColorBar = useCallback(
    (app: PIXI.Application<PIXI.ICanvas>) => {
      if (defaultOptions.needColorBar) {
        const height = defaultOptions.cell.height * common.rowsNum;
        const width = defaultOptions.cell.width;
        const grd = createGradient(width, height, colors);
        const sprite = new PIXI.Sprite(grd);
        sprite.anchor.set(0, 1);
        const pos = {
          y:
            pixiOptions.paintOrigin[1] +
            common.rowsNum * defaultOptions.cell.height +
            (defaultOptions.needTopBar ? defaultOptions.cell.height + 10 : 0),
          x:
            pixiOptions.paintOrigin[0] +
            common.colsNum * defaultOptions.cell.width +
            (defaultOptions.needRightBar ? defaultOptions.cell.width + 10 : 0) +
            10,
        };
        sprite.position.set(pos.x, pos.y);
        sprite.width = width;
        sprite.height = height;
        app.stage.addChild(sprite);

        const minText = new PIXI.Text(
          common.minValue.toExponential(0),
          textStyle
        );
        minText.anchor.set(0.5, 0);
        minText.position.set(pos.x + defaultOptions.cell.width / 2, pos.y + 10);
        app.stage.addChild(minText);

        const maxText = new PIXI.Text(
          common.maxValue.toExponential(0),
          textStyle
        );
        maxText.anchor.set(0.5, 1);
        maxText.position.set(
          pos.x + defaultOptions.cell.width / 2,
          pos.y - height - 5
        );
        app.stage.addChild(maxText);
      }
    },
    [defaultOptions, common, colors, pixiOptions, textStyle]
  );

  const ref = useRef<HTMLDivElement>(null!);
  useEffect(() => {
    const app = new PIXI.Application({
      width: pixiOptions.stage.width,
      height: pixiOptions.stage.height,
      backgroundColor: 0xffffff,
      // preserveDrawingBuffer: true, // 开启 webgl 缓冲区保存
      forceCanvas: true, // only available in pixi.js-legacy
      resolution: 2,
      autoDensity: true,
    });

    const graphic = new PIXI.Graphics();
    draw(graphic);
    app.stage.addChild(graphic);

    drawAxisTexts(app);
    drawColorBar(app);

    ref.current.appendChild(app.view as any);

    return () => {
      app.destroy(true, true);
    };
  }, []);

  return <div ref={ref}></div>;
}
