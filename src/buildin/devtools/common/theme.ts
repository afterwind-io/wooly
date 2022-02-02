import { CreateWidgetContext } from "../../ui/foundation/context";

interface ThemeContext {
  backgroundL4: string;
  backgroundL3: string;
  backgroundL2: string;
  backgroundL1: string;
  colorTextNormal: string;
  colorTextInactive: string;
  borderNormal: string;
}

export const ThemeContext = CreateWidgetContext<ThemeContext>(
  {
    backgroundL4: "hsl(228deg 19% 16%)",
    backgroundL3: "hsl(224deg 22% 19%)",
    backgroundL2: "hsl(224deg 23% 26%)",
    backgroundL1: "hsl(225deg 9% 35%)",
    colorTextNormal: "rgba(255, 255, 255, 0.85)",
    colorTextInactive: "rgba(255, 255, 255, 0.25)",
    borderNormal: "black",
  },
  "Theme"
);
