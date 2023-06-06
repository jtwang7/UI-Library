import type { Meta, StoryObj } from "@storybook/react";
import InputTag from "./index";
import React from "react";

const meta: Meta<typeof InputTag> = {
  title: "InputTag",
  component: InputTag,
};

export default meta;
type Story = StoryObj<typeof InputTag>;

export const Primary: Story = {
  render: () => <InputTag />,
};

export const MaxCount: Story = {
  render: () => <InputTag maxCount={3} style={{ marginTop: 30 }} />,
};
