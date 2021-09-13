export function searchBin(list: number[], needle: number, dir: "ASC" | "DESC") {
  let low = 0;
  let high = list.length - 1;

  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (list[mid] === needle) return mid;
    const shouldContinue =
      dir === "ASC" ? needle > list[mid] : needle < list[mid];
    if (shouldContinue) {
      low = mid + 1;
    } else {
      high = mid - 1;
    }
  }

  return -1;
}
