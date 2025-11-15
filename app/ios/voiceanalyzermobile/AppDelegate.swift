import UIKit
import React

@main
class AppDelegate: UIResponder, UIApplicationDelegate, RCTBridgeDelegate {
  var window: UIWindow?
  private var bridge: RCTBridge?

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]? = nil
  ) -> Bool {
    let enableTurboModules: Bool
    let enableFabric: Bool

    #if RCT_NEW_ARCH_ENABLED
      enableTurboModules = true
      enableFabric = true
    #else
      enableTurboModules = false
      enableFabric = false
    #endif

    RCTAppSetupPrepareApp(application, enableTurboModules)

    let bridge = RCTBridge(delegate: self, launchOptions: launchOptions)
    self.bridge = bridge

    guard let bridge = bridge else {
      return false
    }

    guard let rootView = RCTAppSetupDefaultRootView(
      bridge,
      "voiceanalyzermobile",
      nil,
      enableFabric
    ) else {
      return false
    }

    if #available(iOS 13.0, *) {
      rootView.backgroundColor = UIColor.systemBackground
    } else {
      rootView.backgroundColor = UIColor.white
    }

    let rootViewController = UIViewController()
    rootViewController.view = rootView

    let window = UIWindow(frame: UIScreen.main.bounds)
    window.rootViewController = rootViewController
    window.makeKeyAndVisible()
    self.window = window

    return true
  }

  func sourceURL(for bridge: RCTBridge) -> URL? {
#if DEBUG
    return RCTBundleURLProvider.sharedSettings()?.jsBundleURL(forBundleRoot: "index", fallbackResource: nil)
#else
    return Bundle.main.url(forResource: "main", withExtension: "jsbundle")
#endif
  }
}
