import type { ToggleGroupRootProps, WithElementRef } from "bits-ui";
import type { Component } from "svelte";

export type Props = WithElementRef<ToggleGroupRootProps, HTMLDivElement>;

declare const Root: Component<Props>;
export default Root;
