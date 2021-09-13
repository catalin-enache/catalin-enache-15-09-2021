import { searchBin } from "../searchBin";

describe("searchBin", () => {
  it("returns index if needle found else -1", () => {
    const arr1 = [1, 5, 7, 9];
    const index1 = searchBin(arr1, 7, "ASC");
    expect(index1).toEqual(2);

    const arr2 = [1, 5, 7, 9];
    const index2 = searchBin(arr2, 6, "ASC");
    expect(index2).toEqual(-1);

    const arr3 = [9, 7, 5, 1];
    const index3 = searchBin(arr3, 7, "DESC");
    expect(index3).toEqual(1);

    const arr4 = [9, 7, 5, 1];
    const index4 = searchBin(arr4, 6, "DESC");
    expect(index4).toEqual(-1);
  });
});
