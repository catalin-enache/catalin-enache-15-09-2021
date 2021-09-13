export const formatNumber =
  (precision: number = 0) =>
  (num: number | string) => {
    const [int, dec] = (+num).toFixed(precision).split(".");
    // https://stackoverflow.com/questions/2901102/how-to-print-a-number-with-commas-as-thousands-separators-in-javascript
    const formattedInt = int.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return formattedInt + (dec ? `.${dec}` : "");
  };
