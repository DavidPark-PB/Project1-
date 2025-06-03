const config = {
  appId: "com.ive.photocard",
  appName: "IVE 포토카드 꾸미기",
  webDir: "out",
  server: {
    androidScheme: "https",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: "#7c3aed",
      showSpinner: false,
    },
    StatusBar: {
      style: "light",
      backgroundColor: "#7c3aed",
    },
  },
}

export default config
