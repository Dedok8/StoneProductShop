const chunk = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size),
  );

module.exports = {
  '*.ts': (files) =>
    chunk(files, 30).flatMap((part) => {
      const list = part.map((f) => `"${f}"`).join(' ');
      return [`eslint --fix ${list}`, `prettier --write ${list}`];
    }),
};
