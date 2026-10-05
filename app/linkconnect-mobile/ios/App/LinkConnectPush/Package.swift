// swift-tools-version: 5.9
import PackageDescription

let package = Package(
    name: "LinkConnectPush",
    platforms: [.iOS(.v14)],
    products: [
        .library(name: "LinkConnectPush", targets: ["LinkConnectPush"])
    ],
    dependencies: [
        .package(url: "https://github.com/firebase/firebase-ios-sdk.git", "11.15.0"..<"12.0.0")
    ],
    targets: [
        .target(
            name: "LinkConnectPush",
            dependencies: [
                .product(name: "FirebaseCore", package: "firebase-ios-sdk"),
                .product(name: "FirebaseMessaging", package: "firebase-ios-sdk")
            ]
        )
    ]
)
