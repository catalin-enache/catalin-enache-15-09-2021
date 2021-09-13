import { insertIntoSide } from "../helpers";
import { Side } from "../types";

describe.only("insertIntoSide", () => {
  describe("when ASKS", () => {
    it("shifts left and insert to the right when value > last value", () => {
      const arr1 = [1, 5];
      const { priceRemoved: priceRemoved1 } = insertIntoSide(
        arr1,
        6,
        Side.ASKS
      );
      expect(arr1).toEqual([5, 6]);
      expect(priceRemoved1).toEqual(1);
    });
    it("inserts in the middle and remove latest value when value in between", () => {
      const arr2 = [1, 5];
      const { priceRemoved: priceRemoved2 } = insertIntoSide(
        arr2,
        4,
        Side.ASKS
      );
      expect(arr2).toEqual([1, 4]);
      expect(priceRemoved2).toEqual(5);
    });
    it("shifts right and insert to the left when value < first value", () => {
      const arr3 = [1, 5];
      const { priceRemoved: priceRemoved3 } = insertIntoSide(
        arr3,
        0,
        Side.ASKS
      );
      expect(arr3).toEqual([0, 1]);
      expect(priceRemoved3).toEqual(5);
    });
  });

  describe("when BIDS", () => {
    it("shifts left and insert to the right when value < last value", () => {
      const arr4 = [5, 1];
      const { priceRemoved: priceRemoved4 } = insertIntoSide(
        arr4,
        0,
        Side.BIDS
      );
      expect(arr4).toEqual([1, 0]);
      expect(priceRemoved4).toEqual(5);
    });
    it("inserts in the middle and remove latest value when value in between", () => {
      const arr5 = [5, 1];
      const { priceRemoved: priceRemoved5 } = insertIntoSide(
        arr5,
        3,
        Side.BIDS
      );
      expect(arr5).toEqual([5, 3]);
      expect(priceRemoved5).toEqual(1);
    });
    it("shifts right and insert to the left when value > first value", () => {
      const arr6 = [5, 1];
      const { priceRemoved: priceRemoved6 } = insertIntoSide(
        arr6,
        7,
        Side.BIDS
      );
      expect(arr6).toEqual([7, 5]);
      expect(priceRemoved6).toEqual(1);
    });
  });
});
