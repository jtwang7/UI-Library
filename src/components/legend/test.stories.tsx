import React from "react";
import { ComponentStory, ComponentMeta } from "@storybook/react";
import Legend from "./index";

const COLORS = [
  "#5B8FF9",
  "#61DDAA",
  "#65789B",
  "#F6BD16",
  "#7262fd",
  "#78D3F8",
  "#9661BC",
  "#F6903D",
  "#008685",
  "#F08BB4",
];
const TEXTS = ["a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "a10"];

//👇 This default export determines where your story goes in the story list
export default {
  /* 👇 The title prop is optional.
   * See https://storybook.js.org/docs/react/configure/overview#configure-story-loading
   * to learn how to generate automatic titles
   */
  title: "Legend",
  component: Legend,
} as ComponentMeta<typeof Legend>;

//👇 We create a “template” of how args map to rendering
const Template: ComponentStory<typeof Legend> = (args) => (
  <Legend {...args} />
);

export const TestStory = Template.bind({});
TestStory.args = {
  /*👇 The args you need here will depend on your component */
  texts: TEXTS,
  colors: COLORS,
  width: 150,
  height: 30,
  direction: 'column',
  font: {
    size: 15,
    weight: "normal",
    family: "sans-serif",
  },
};
