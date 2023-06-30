import type { Meta, StoryObj } from "@storybook/react";
import InputTag from "./index";
import React from "react";
import { Popover, Tooltip } from "antd";

const meta: Meta<typeof InputTag> = {
  title: "InputTag",
  component: InputTag,
};

export default meta;
type Story = StoryObj<typeof InputTag>;

export const Primary: Story = {
  render: () => <InputTag width={500} />,
};

export const MaxCount: Story = {
  args: {
    maxCount: 3,
    width: 500,
    wrapper: (Tags) => <Popover content={Tags} />,
  },
};

export const MaxWidth: Story = {
  render: () => (
    <InputTag
      autoRest
      width={500}
      wrapper={(Tags) => <Tooltip color="#fff" title={Tags} />}
    />
  ),
};
