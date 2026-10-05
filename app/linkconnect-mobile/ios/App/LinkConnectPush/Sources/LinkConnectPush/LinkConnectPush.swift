import Foundation
import FirebaseCore
import FirebaseMessaging

/// 서버는 FCM HTTP v1 으로만 보내므로, APNs 토큰을 FCM 토큰으로 바꿔 Capacitor 에 넘긴다.
public enum LinkConnectPush {
    /// GoogleService-Info.plist 가 없으면 Firebase 를 켜지 않는다(없이 configure 하면 앱이 종료된다).
    public static func configureIfPossible() {
        guard FirebaseApp.app() == nil,
              Bundle.main.path(forResource: "GoogleService-Info", ofType: "plist") != nil else {
            return
        }
        FirebaseApp.configure()
    }

    /// Firebase 가 켜져 있으면 FCM 토큰 문자열, 아니면 원래 APNs 토큰을 돌려준다.
    public static func registrationToken(apnsToken: Data, completion: @escaping (Any) -> Void) {
        guard FirebaseApp.app() != nil else {
            completion(apnsToken)
            return
        }
        Messaging.messaging().apnsToken = apnsToken
        Messaging.messaging().token { token, error in
            if let token = token, !token.isEmpty {
                completion(token)
            } else {
                completion(error ?? NSError(domain: "LinkConnectPush", code: 1))
            }
        }
    }
}
