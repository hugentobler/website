import type { ToggleGroupItemProps, WithElementRef } from "bits-ui";
import type { Component } from "svelte";

export type Props = WithElementRef<ToggleGroupItemProps, HTMLButtonElement>;

declare const Item: Component<Props>;
export default Item;
