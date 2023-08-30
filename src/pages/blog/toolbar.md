---
layout: "../../layouts/PostLayout.astro"
title: "Create an animated toolbar with JavaScript"
description: "A toolbar component that leverages React Hooks to scale icons as a fn of proximity."
pubDate: "Aug 28 2023"
heroImage: "/proximity-scaler.jpeg"
---

I recently built a suite of components and hooks in React that form an animated toolbar. The animation was inspired by the Mac OS dock at the bottom of the screen.

This was an unexpected challenge. I decided early on not to use an animation library like **Framer** because I wanted to flex some underused muscles.

At first, I thought the animation was a simple on hover scale. Upon closer inspection, I realized the icons adjacent to the hovered Icon also increased in size:

![Screenshot 2023-08-28 at 8.22.49 AM.png](/dock.png)

This scaling is a function of the mouse distance. Or, it would have to be in the web, at least. I knew I had a more complicated problem on my hands than I anticipated.

## Composition

I knew I wanted to practice composing reusable hooks and functions in addition to solving to problem, so I started with the first smallest unit of work that came to mind.

`useMousePosition`

I created a hook to detect the mouse position, since I knew this would be needed to determine the mouse’s distances from any given icon.

```tsx
import { useEffect, useState } from "react";

export const useMousePosition = () => {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const mouseMove = (e: MouseEvent) => {
    setMouse({ x: e.clientX, y: e.clientY });
  };

  const el = document;

  useEffect(() => {
    el.addEventListener("mousemove", mouseMove);
    return () => el.removeEventListener("mousemove", mouseMove);
  }, []);

  return mouse;
};
```

The next hook uses the mouse position to retrieve the mouse’s distance from a given object. The logic here looks complicated, but it is actually just an application of Pythagoras’s theorem.

The square of the mouse’s distance from an object is equal to the mouses distance on the x-axis squared + the distance on the y-axis squared. Then, to get the linear distance, you just use the square root of that value and you have the line.

```tsx
import { Ref, useEffect, useState } from "react";
import { useMousePosition } from "./use-mouse-position";

export const useMouseDistance: (selector: Ref<HTMLElement>) => number = (
  selector
) => {
  const mouse = useMousePosition();
  const [distance, setDistance] = useState(0);
  const el = selector.current;

  useEffect(() => {
    if (el) {
      const distanceX = Math.abs(
        el.getBoundingClientRect().x +
          el.getBoundingClientRect().width / 2 -
          mouse.x
      );

      const distanceY = Math.abs(
        el.getBoundingClientRect().y +
          el.getBoundingClientRect().height / 2 -
          mouse.y
      );

      const val = Math.floor(
        Math.sqrt(Math.pow(distanceX, 2) + Math.pow(distanceY, 2))
      );

      setDistance(val);
    }
  }, [mouse.x, mouse.y]);

  return distance;
};
```

Now that I had the mouse’s distance from a given object (selector), I just needed to create a hook that scales the same object.

To do this, I wanted to establish a range that the objects would scale, and a threshold beyond which they wouldn’t scale at all. I made these parameters arguments to the function itself.

```tsx
import { Ref, useEffect, useRef } from "react";
import { useMouseDistance } from "./use-mouse-distance";

function calculatePercentage(v1: number, v2: number) {
  return (v1 / v2) * 100;
}

export const useProximityScaler = (
  selector: Ref<HTMLElement>,
  threshold: number,
  increase: number,
  active: boolean
) => {
  const distance = useMouseDistance(selector);
  const dimensions = useRef([0, 0]);
  const frame = useRef(0);
  const el = selector?.current;

  const resetAnimation = () => {
    el.style.width = `${dimensions.current[0]}px`;
    el.style.height = `${dimensions.current[0]}px`;
  };

  const animate = () => {
    const percentage = 100 - calculatePercentage(distance, threshold),
      sizeIncrease = increase * (percentage / 100),
      newWidth = dimensions.current[0] + sizeIncrease,
      newHeight = dimensions.current[1] + sizeIncrease;

    el.style.width = `${newWidth}px`;
    el.style.height = `${newHeight}px`;
  };

  useEffect(() => {
    if (
      el &&
      dimensions.current &&
      dimensions.current[0] === 0 &&
      el.clientWidth > 0
    ) {
      dimensions.current = [el.clientWidth, el.clientHeight];
    }
    if (distance && distance < threshold && active) {
      frame.current = requestAnimationFrame(animate);
    } else {
      frame.current = requestAnimationFrame(resetAnimation);
    }
    return () => cancelAnimationFrame(frame.current);
  }, [distance]);
};
```

There is a lot of logic in this function, but it essentially calculates a percentage of the max size increase from the mouses distance within a threshold. Outside the threshold, it cancels the animation and resets it.

One other thing to note, is that the animation was originally very jumpy. To resolve, this I wrapped the animations in `requestAnimationFrame`. They immediately smoothed out in combination with a little css on the elements:

```css
.circle {
  height: 50px;
  width: 50px;
  background: rgb(33, 33, 33);
  cursor: pointer;
  border-radius: 100%;
  transition: 100ms linear;
}
```

Finally, I created a component that composes this logic and applies it to a child element.

```tsx
import React, { FC, ReactNode, Ref, useRef } from "react";
import { useProximityScaler } from "./hooks/use-proximity-scaler";

interface ProximityScalerProps {
  increase: number;
  children: ReactNode;
  threshold: number;
  active: boolean;
}

export const ProximityScaler: FC<ProximityScalerProps> = ({
  children,
  threshold,
  increase,
  active,
}) => {
  const ref = useRef(null);
  useProximityScaler(ref, threshold, increase, active);
  children = React.Children.only(children);
  children = React.cloneElement(children, { ref });
  return children;
};
```

This resulted in the toolbar below:

![Screenshot 2023-08-28 at 8.36.24 AM.png](/toolbar.png)

Take a look at the CodeSandbox to play with the [animation itself](https://codesandbox.io/p/sandbox/proximity-scaler-l4tmsq?file=/src/proximity-scaler.tsx:13,13)!
