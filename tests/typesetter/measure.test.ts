import { describe, expect, it } from "vitest";
import { measureNodes } from "../../src/lib/typesetter/core";

const mockRect = (height: number): DOMRect =>
  ({
    bottom: height,
    height,
    left: 0,
    right: 0,
    toJSON: () => ({}),
    top: 0,
    width: 0,
    x: 0,
    y: 0,
  }) as DOMRect;

const makeElement = (tag: string, height: number): HTMLElement => {
  const node = document.createElement(tag);
  node.getBoundingClientRect = () => mockRect(height);
  return node;
};

describe("typesetter measurement", () => {
  it("snaps baseline for text blocks and clamps column span", () => {
    const root = document.createElement("div");
    const heading = makeElement("h1", 25);
    const paragraph = makeElement("p", 24);
    const image = makeElement("img", 40);
    image.setAttribute("data-t8r-span", "6");
    root.append(heading, paragraph, image);

    const nodes = measureNodes(root, 24, 120, 4, 24, 100, 2);

    expect(nodes[0].heightPx).toBe(48);
    expect(heading.style.getPropertyValue("--t8r-snap")).toBe("23px");
    expect(paragraph.style.getPropertyValue("--t8r-snap")).toBe("");
    expect(nodes[2].gridColSpan).toBe(4);
    expect(heading.style.width).toBe("224px");
    expect(image.style.width).toBe("472px");
  });

  it("throws on invalid default column span", () => {
    const root = document.createElement("div");
    root.append(makeElement("p", 20));
    expect(() => measureNodes(root, 24, 120, 4, 24, 100, 0)).toThrow(
      "measureNodes: defaultColSpan must be a positive number.",
    );
  });
});
