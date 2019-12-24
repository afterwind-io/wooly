import { expect } from "chai";
import { LinkedList } from "./linkedList";
import { LinkedNode } from "./linkedNode";

describe("LinkedList", () => {
  describe(".Has", () => {
    it("should works fine", () => {
      const list = new LinkedList<string, number>();
      list.Push("a", 10);
      list.Push("b", 12);
      list.Push("c", 14);

      expect(list.Has(12)).eq(true);
      expect(list.Has(16)).eq(false);
    });
  });

  describe(".GetByKey", () => {
    it("Should works fine", () => {
      const list = new LinkedList<string, number>();
      list.Push("a", 10);
      list.Push("b", 12);
      list.Push("c", 14);

      expect(list.GetByKey(12)).eq("b");
      expect(list.GetByKey(16)).eq(null);
    });
  });

  describe(".Traverse", () => {
    it("should traverse all non-empty nodes", () => {
      const list = new LinkedList<string, number>();
      list.Traverse(() => {
        throw "Should not get called.";
      });

      list.Push("a", 10);
      list.Push("b", 12);
      list.Push("c", 14);

      let index = 0;
      list.Traverse(() => {
        index++;
      });
      expect(index).eq(3);
    });
  });

  describe(".Push", () => {
    it("should success with the very first node", () => {
      const list = new LinkedList<string, number>();
      list.Push("a", 10);

      expect(list.Head.value).eq("a");
      expect(list.Head.key).eq(10);
      expect(list.Head).eq(list.Tail);

      expect(list["cursor"]).eq(list.Head.next);
      expect(list["cursor"]!.IsEmpty()).eq(true);

      expect(list.GetLength()).eq(1);
      expect(list.GetRawLength()).eq(2);
    });

    it("should success with multiple nodes", () => {
      const list = new LinkedList<string, number>();
      list.Push("a", 10);
      list.Push("b", 12);
      list.Push("c", 14);

      expect(list.Head.value).eq("a");
      expect(list.Head.key).eq(10);

      expect(list.Head.next!.value).eq("b");
      expect(list.Head.next!.key).eq(12);
      expect(list.Tail!.prev!.value).eq("b");
      expect(list.Tail!.prev!.key).eq(12);

      expect(list.Tail!.value).eq("c");
      expect(list.Tail!.key).eq(14);

      expect(list["cursor"]).eq(list.Tail!.next);
      expect(list["cursor"]!.IsEmpty()).eq(true);

      expect(list.GetLength()).eq(3);
      expect(list.GetRawLength()).eq(4);
    });
  });

  describe(".Peek", () => {
    it("should return null if list is empty", () => {
      const list = new LinkedList<string, number>();
      const value = list.Peek();

      expect(value).eq(null);
    });

    it("should return last value of the list", () => {
      const list = new LinkedList<string, number>();
      list.Push("a", 10);

      const value = list.Peek();
      expect(value).eq("a");
    });

    it("should not alter the tail cursor", () => {
      const list = new LinkedList<string, number>();
      list.Push("a", 10);

      list.Peek();
      expect(list.GetLength()).eq(1);
      expect(list.GetRawLength()).eq(2);
    });
  });

  describe(".Pop", () => {
    it("should return null if list is empty", () => {
      const list = new LinkedList<string, number>();
      const value = list.Pop();

      expect(value).eq(null);
    });

    it("should return last value of the list", () => {
      const list = new LinkedList<string, number>();
      list.Push("a", 10);

      const value = list.Pop();
      expect(value).eq("a");
    });

    it("should alter the tail cursor", () => {
      const list = new LinkedList<string, number>();
      list.Push("a", 10);
      list.Pop();

      expect(list.GetLength()).eq(0);
      expect(list.GetRawLength()).eq(2);
    });
  });

  describe(".Clear", () => {
    const list = new LinkedList<string, number>();
    list.Push("a", 10);
    list.Push("b", 12);
    list.Push("c", 14);

    list.Clear();

    it("should clear keys and values of all the nodes", () => {
      let node: LinkedNode<string, number> | null = list.Head;

      while (node != null) {
        expect(node.value).eq(null);
        expect(node.key).eq(null);

        node = node.next;
      }
    });

    it("should cache extra empty `continer`s", () => {
      expect(list.GetLength()).eq(0);
      expect(list.GetRawLength()).eq(4);
    });
  });

  describe("Cache Test", () => {
    it("should make use of empty nodes when possible", () => {
      const list = new LinkedList<string, number>();
      list.Push("a", 10);
      list.Push("b", 12);

      list.Clear();
      list.Push("d", 16);

      expect(list.Tail!.value).eq("d");
      expect(list.Tail!.key).eq(16);

      expect(list["cursor"]).eq(list.Head.next);
      expect(list["cursor"].prev).eq(list.Head);

      expect(list.GetLength()).eq(1);
      expect(list.GetRawLength()).eq(3);

      list.Push("e", 18);

      expect(list.Tail!.value).eq("e");
      expect(list.Tail!.key).eq(18);

      expect(list["cursor"]).eq(list.Tail!.next);
      expect(list["cursor"].prev).eq(list.Tail);

      expect(list.GetLength()).eq(2);
      expect(list.GetRawLength()).eq(3);

      list.Push("f", 20);

      expect(list.Tail!.value).eq("f");
      expect(list.Tail!.key).eq(20);

      expect(list.GetLength()).eq(3);
      expect(list.GetRawLength()).eq(4);
    });
  });
});
