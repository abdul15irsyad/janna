export const randomDate = (start: Date, end: Date) => {
  let isValidDate: boolean;
  let randomDate: Date;
  do {
    const randomMillis =
      start.getTime() +
      Math.floor(Math.random() * (end.getTime() - start.getTime()));
    randomDate = new Date(randomMillis);
    // Periksa apakah tanggal yang dihasilkan valid
    const year = randomDate.getFullYear();
    const month = randomDate.getMonth() + 1;
    const day = randomDate.getDate();
    isValidDate =
      year >= start.getFullYear() &&
      year <= end.getFullYear() &&
      month >= start.getMonth() + 1 &&
      month <= end.getMonth() + 1 &&
      day >= start.getDate() &&
      day <= end.getDate();
  } while (!isValidDate);

  return randomDate;
};
