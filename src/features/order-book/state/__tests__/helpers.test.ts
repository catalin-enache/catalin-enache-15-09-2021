import { PriceSize, PriceObject, Side } from "../types";
import { mergeSlice, calculateSpreadAndMaxTotal } from "../helpers";

describe("mergeSlice", () => {
  it("returns an array not greater than numLevels", () => {
    // prettier-ignore
    const existingPrices1: PriceObject[] = [
      {price: 10, size: 10, total: 10},
      {price: 11, size: 20, total: 20},
    ];
    // prettier-ignore
    const messageEntries1: PriceSize[] = [[10, 0], [11, 40], [12, 50]];
    // prettier-ignore
    const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.ASKS, 2);
    // prettier-ignore
    expect(resultedPrices).toEqual([
      {price: 11, size: 40, total: 40},
      {price: 12, size: 50, total: 90},
    ]);
  });
  it("updates existing prices with new sizes when prices are the same", () => {
    // prettier-ignore
    const existingPrices1: PriceObject[] = [
      {price: 10, size: 10, total: 10},
      {price: 11, size: 20, total: 20},
    ];
    // prettier-ignore
    const messageEntries1: PriceSize[] = [[10, 20], [11, 40]];
    // prettier-ignore
    const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.ASKS, 25);
    // prettier-ignore
    expect(resultedPrices).toEqual([
      {price: 10, size: 20, total: 20},
      {price: 11, size: 40, total: 60},
    ]);
  });
  it("does nothing when message entries are empty", () => {
    const existingPrices1: PriceObject[] = [
      { price: 10, size: 10, total: 10 },
      { price: 20, size: 20, total: 30 },
      { price: 30, size: 30, total: 60 },
    ];
    // prettier-ignore
    const messageEntries1: PriceSize[] = [];
    // prettier-ignore
    const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.ASKS, 25);
    // prettier-ignore
    expect(resultedPrices).toEqual([
      { price: 10, size: 10, total: 10 },
      { price: 20, size: 20, total: 30 },
      { price: 30, size: 30, total: 60 },
    ]);
  });
  it("clears related entries from existing prices when new message entries are zeroed sizes", () => {
    const existingPrices1: PriceObject[] = [
      { price: 10, size: 10, total: 10 },
      { price: 20, size: 20, total: 30 },
      { price: 30, size: 30, total: 60 },
    ];
    // prettier-ignore
    const messageEntries1: PriceSize[] = [[10, 0], [15, 0]];
    // prettier-ignore
    const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.ASKS, 25);
    // prettier-ignore
    expect(resultedPrices).toEqual([
      { price: 20, size: 20, total: 20 },
      { price: 30, size: 30, total: 50 },
    ]);
  });

  describe("when ASKS", () => {
    describe("when message entries are smaller than existing prices", () => {
      it("inserts them into front", () => {
        // prettier-ignore
        const existingPrices1: PriceObject[] = [
          { price: 10, size: 10, total: 10 },
          { price: 11, size: 20, total: 20 },
        ];
        // prettier-ignore
        const messageEntries1: PriceSize[] = [[8, 30], [9, 40]];
        // prettier-ignore
        const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.ASKS, 25);
        // prettier-ignore
        expect(resultedPrices).toEqual([
          { price: 8, size: 30, total: 30 },
          { price: 9, size: 40, total: 70 },
          { price: 10, size: 10, total: 80 },
          { price: 11, size: 20, total: 100 },
        ]);
      });
    });
    describe("when message entries are greater than existing prices", () => {
      it("inserts them at the end", () => {
        // prettier-ignore
        const existingPrices1: PriceObject[] = [
          { price: 10, size: 10, total: 10 },
          { price: 11, size: 20, total: 20 },
        ];
        // prettier-ignore
        const messageEntries1: PriceSize[] = [[12, 30], [13, 40]];
        // prettier-ignore
        const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.ASKS, 25);
        // prettier-ignore
        expect(resultedPrices).toEqual([
          { price: 10, size: 10, total: 10 },
          { price: 11, size: 20, total: 30 },
          { price: 12, size: 30, total: 60 },
          { price: 13, size: 40, total: 100 },
        ]);
      });
    });
    describe("when message entries are in between existing prices", () => {
      it("inserts them in between", () => {
        // prettier-ignore
        const existingPrices1: PriceObject[] = [
          { price: 10, size: 10, total: 10 },
          { price: 20, size: 20, total: 30 },
        ];
        // prettier-ignore
        const messageEntries1: PriceSize[] = [[11, 30], [19, 40]];
        // prettier-ignore
        const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.ASKS,25
        );
        // prettier-ignore
        expect(resultedPrices).toEqual([
          { price: 10, size: 10, total: 10 },
          { price: 11, size: 30, total: 40 },
          { price: 19, size: 40, total: 80 },
          { price: 20, size: 20, total: 100 },
        ]);
      });
    });
    describe("when message entries are in between before and after existing prices", () => {
      it("inserts them everywhere", () => {
        const existingPrices1: PriceObject[] = [
          { price: 10, size: 10, total: 10 },
          { price: 20, size: 20, total: 30 },
        ];
        // prettier-ignore
        const messageEntries1: PriceSize[] = [[5, 20], [15, 40], [25, 60]];
        // prettier-ignore
        const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.ASKS,25);
        // prettier-ignore
        expect(resultedPrices).toEqual([
          { price: 5, size: 20, total: 20 },
          { price: 10, size: 10, total: 30 },
          { price: 15, size: 40, total: 70 },
          { price: 20, size: 20, total: 90 },
          { price: 25, size: 60, total: 150 },
        ]);
      });
    });
  });

  describe("when BIDS", () => {
    describe("when message entries are smaller than existing prices", () => {
      it("inserts them at the end", () => {
        // prettier-ignore
        const existingPrices1: PriceObject[] = [
          { price: 11, size: 20, total: 20 },
          { price: 10, size: 10, total: 30 },

        ];
        // prettier-ignore
        const messageEntries1: PriceSize[] = [[9, 30], [8, 40]];
        // prettier-ignore
        const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.BIDS, 25);
        // prettier-ignore
        expect(resultedPrices).toEqual([
          { price: 11, size: 20, total: 20 },
          { price: 10, size: 10, total: 30 },
          { price: 9, size: 30, total: 60 },
          { price: 8, size: 40, total: 100 },
        ]);
      });
    });
    describe("when message entries are greater than existing prices", () => {
      it("inserts them in front", () => {
        // prettier-ignore
        const existingPrices1: PriceObject[] = [
          { price: 11, size: 20, total: 20 },
          { price: 10, size: 10, total: 30 },

        ];
        // prettier-ignore
        const messageEntries1: PriceSize[] = [[13, 40], [12, 30]];
        // prettier-ignore
        const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.BIDS, 25);
        // prettier-ignore
        expect(resultedPrices).toEqual([
          { price: 13, size: 40, total: 40 },
          { price: 12, size: 30, total: 70 },
          { price: 11, size: 20, total: 90 },
          { price: 10, size: 10, total: 100 },
        ]);
      });
    });
    describe("when message entries are in between existing prices", () => {
      it("inserts them in between", () => {
        // prettier-ignore
        const existingPrices1: PriceObject[] = [
          { price: 20, size: 20, total: 20 },
          { price: 10, size: 10, total: 30 },
        ];
        // prettier-ignore
        const messageEntries1: PriceSize[] = [[19, 40], [11, 30]];
        // prettier-ignore
        const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.BIDS,25
        );
        // prettier-ignore
        expect(resultedPrices).toEqual([
          { price: 20, size: 20, total: 20 },
          { price: 19, size: 40, total: 60 },
          { price: 11, size: 30, total: 90 },
          { price: 10, size: 10, total: 100 },
        ]);
      });
    });
    describe("when message entries are in between before and after existing prices", () => {
      it("inserts them everywhere", () => {
        const existingPrices1: PriceObject[] = [
          { price: 20, size: 20, total: 20 },
          { price: 10, size: 10, total: 30 },
        ];
        // prettier-ignore
        const messageEntries1: PriceSize[] = [[25, 60], [15, 40], [5, 20]];
        // prettier-ignore
        const resultedPrices = mergeSlice(existingPrices1, messageEntries1, Side.BIDS,25);
        // prettier-ignore
        expect(resultedPrices).toEqual([
          { price: 25, size: 60, total: 60 },
          { price: 20, size: 20, total: 80 },
          { price: 15, size: 40, total: 120 },
          { price: 10, size: 10, total: 130 },
          { price: 5, size: 20, total: 150 },
        ]);
      });
    });
  });
});

describe("calculateSpreadAndMaxTotal", () => {
  it("calculates spread and max total", () => {
    const state = {
      prices: {
        bids: [{ price: 98, size: 100, total: 1000 }],
        asks: [{ price: 100, size: 100, total: 1100 }],
      },
      spread: { value: 0, percent: 0 },
      totals: { bids: 1000, asks: 1100 },
      maxTotal: 0,
    };
    calculateSpreadAndMaxTotal(state);
    expect(state).toEqual({
      prices: {
        bids: [{ price: 98, size: 100, total: 1000 }],
        asks: [{ price: 100, size: 100, total: 1100 }],
      },
      spread: { value: 2, percent: 0.02 },
      totals: { bids: 1000, asks: 1100 },
      maxTotal: 1100,
    });
  });
});
