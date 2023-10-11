export const cleanNull = <T>(object: T): Partial<T> => {
  const filteredEntries = Object.entries(object).filter(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    ([_, value]) => value !== null,
  );
  return Object.fromEntries(filteredEntries) as Partial<T>;
};

export const setMeta = <T>({
  page,
  totalPage,
  data,
  totalAllData,
}: {
  page: number;
  totalPage: number;
  data: T[];
  totalAllData: number;
}) => {
  return {
    currentPage: totalAllData > 0 ? page ?? 1 : null,
    totalPage,
    totalData: data.length,
    totalAllData,
  };
};
