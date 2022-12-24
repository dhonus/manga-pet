module.exports = {
  packagerConfig: {
    icon: 'src/256x256'
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      "config": {
        "name": "MangaPet",
        "iconUrl": "https://raw.githubusercontent.com/dhonus/manga-pet/main/src/256x256.ico",
        "setupIcon": "src/256x256.ico"
      }
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-flatpak',
        config: {
          options: {
            categories: ['Video'],
            mimeType: ['video/h264']
          }
        }
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
