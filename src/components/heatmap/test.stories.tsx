import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import Heatmap from "./index";

const TEST_DATA = [
  [
    0.16980247, 0.16366622, 0.15743771, 0.15166266, 0.14571382, 0.13954464,
    0.13311021, 0.12614505, 0.118344195, 0.109423, 0.098513566, 0.0852332,
    0.06723933, 0.041528545,
  ],
  [
    2.446079e-6, 0.0, 0.0, 3.6242032e-5, 3.9466373e-5, 0.0, 0.0, 0.0, 0.0, 0.0,
    1.6120064e-6, 0.0, 0.0, 0.0,
  ],
  [
    3.270644e-6, 0.0, 0.0, 5.034445e-5, 5.555617e-5, 0.0, 0.0, 0.0, 0.0, 0.0,
    2.5745967e-6, 0.0, 0.0, 0.0,
  ],
  [
    0.38968024, 0.3896869, 0.38977, 0.38974884, 0.38980606, 0.38993266,
    0.38999817, 0.39006913, 0.39014667, 0.39023948, 0.39034694, 0.39048585,
    0.39064878, 0.39090443,
  ],
  [
    0.4405115, 0.44664684, 0.4527923, 0.45850188, 0.46438512, 0.4705227,
    0.4768916, 0.4837858, 0.49150917, 0.50033754, 0.5111353, 0.52428097,
    0.5421119, 0.56756705,
  ],
];
const Xs = Array.from({ length: TEST_DATA[0].length }, (v, i) => String(i + 1));
const Ys = Array.from({ length: TEST_DATA.length }, (v, i) =>
  String(i + 1 + TEST_DATA[0].length)
).reverse();

//👇 This default export determines where your story goes in the story list
export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Heatmap",
  component: Heatmap,
} as ComponentMeta<typeof Heatmap>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof Heatmap> = (args) => (
  <Heatmap {...args} />
);

export const TestStory = Template.bind({});
TestStory.args = {
  /*👇 The args you need here will depend on your component */
  data: TEST_DATA,
  xs: Xs,
  ys: Ys,
  options: {
    cell: { width: 15, height: 15 },
    needTopBar: true,
    needRightBar: true,
    needColorBar: true,
    padding: [20, 40, 20, 20],
  },
};
