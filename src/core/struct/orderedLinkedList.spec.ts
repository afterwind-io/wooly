import { expect } from "chai";
import { OrderedLinkedList } from "./orderedLinkedList";

describe("OrderedLinkedList", () => {
  describe(".Insert", () => {
    it("should success insert the first node", () => {
      const list = new OrderedLinkedList<string>();
      list.Insert("a", 10);

      expect(list.Head.value).eq("a");
      expect(list.Head.key).eq(10);
    });

    it("bigger key should appears at the tail", () => {
      const list = new OrderedLinkedList<string>();
      list.Insert("a", 10);
      list.Insert("c", 12);
      list.Insert("b", 14);

      expect(list.Tail!.key).eq(14);
      expect(list.Tail!.value).eq("b");
    });

    it("smaller key should appears at the head", () => {
      const list = new OrderedLinkedList<string>();
      list.Insert("a", 10);
      list.Insert("c", 12);
      list.Insert("d", 8);

      expect(list.Head.key).eq(8);
      expect(list.Head.value).eq("d");
    });

    it("median key should appears at the right place", () => {
      const list = new OrderedLinkedList<string>();
      list.Insert("a", 10);
      list.Insert("c", 12);
      list.Insert("e", 11);

      expect(list.Head.next!.value).eq("e");
      expect(list.Head.next!.key).eq(11);
    });
  });
});
