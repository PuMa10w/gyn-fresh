export const modernIPhoneDeviceNames = [
  'iPhone 15',
  'iPhone 15 Pro Max',
  'iPhone 16',
  'iPhone 16 Pro Max',
  'iPhone 17',
  'iPhone 17 Pro Max',
];

const baseUserAgent =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 26_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.0 Mobile/15E148 Safari/604.1';

const makeIPhone = (viewport, deviceScaleFactor = 3) => ({
  viewport,
  deviceScaleFactor,
  isMobile: true,
  hasTouch: true,
  defaultBrowserType: 'webkit',
  userAgent: baseUserAgent,
});

export const customModernIPhones = {
  'iPhone 16': makeIPhone({ width: 393, height: 852 }),
  'iPhone 16 Pro Max': makeIPhone({ width: 440, height: 956 }),
  'iPhone 17': makeIPhone({ width: 393, height: 852 }),
  'iPhone 17 Pro Max': makeIPhone({ width: 440, height: 956 }),
};

export const desktopBrowserProfiles = [
  { name: 'desktop-1280', options: { viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 } },
  { name: 'desktop-1440', options: { viewport: { width: 1440, height: 960 }, deviceScaleFactor: 1 } },
  { name: 'desktop-1728', options: { viewport: { width: 1728, height: 1117 }, deviceScaleFactor: 1 } },
];

export const installModernIPhoneDevices = (devices) => {
  Object.assign(devices, customModernIPhones);
  return modernIPhoneDeviceNames.filter((name) => devices[name]);
};
