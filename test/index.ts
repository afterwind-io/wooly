import { CoolDown, Engine } from "../src/index";
import { expect } from "chai";

// TODO
import { Timer } from "../src/buildin/timer";

const mockCanvas = {} as HTMLCanvasElement;
// const engine = new Engine(mockCanvas, "2d");

describe.skip("test", () => {
  describe("CoolDown", () => {
    it("Basic usage", () => {
      const cd = new CoolDown(10);
      cd.Activate();
      cd.Cool(7);

      // @ts-ignore
      expect(cd.timer).equal(3);
    });

    it("Cooled for a duration larger then interval", () => {
      const cd = new CoolDown(10);
      cd.Activate();

      cd.Cool(13);
      // @ts-ignore
      expect(cd.timer).equal(7);
      expect(cd.isCooling).equal(false);

      cd.Activate();
      cd.Cool(3);
      // @ts-ignore
      expect(cd.timer).equal(4);
      expect(cd.isCooling).equal(true);

      cd.Cool(100);
      // @ts-ignore
      expect(cd.timer).equal(4);
      expect(cd.isCooling).equal(false);
    });

    // expect(1).Throw();
  });

  // describe("Timer", () => {
  //   it("", () => {
  //     const timer = new Timer(10);
  //     engine.SetRoot(timer);

  //     //   engine.
  //   });
  // });
});
