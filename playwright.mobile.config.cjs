module.exports = {
  testDir: './scripts',
  testMatch: /mobile-visual-audit\.spec\.js/,
  workers: 1,
  timeout: 90000,
  reporter: [['list']],
  use: {
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
};
