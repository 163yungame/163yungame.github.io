# 1. iOS SDK 使用文档

## SDK下载

[NCGSDK-1.0.0](http://nosdn-yx.127.net/yxgame/a22b064883d447b28816f2c0f6463ade.zip)

## 1.1. pod 依赖库
```
platform :ios, '9.0'
use_frameworks!
pod 'YYModel',              '= 1.0.4'
pod 'SDWebImage',           '= 4.4.2'
pod 'SDWebImage/GIF',       '= 4.4.2'
pod 'SDWebImage/WebP',      '= 4.4.2'
pod 'FLAnimatedImage',      '= 1.0.12'
pod 'Toast',                '= 4.0.0'
pod 'KVOController',        '= 1.2.0'
pod 'SVProgressHUD',        '= 2.2.5'
pod 'Reachability',         '= 3.2'
pod 'Masonry',              '= 1.1.0'
pod 'NELivePlayer',         '=1.9.1'
pod 'WebViewJavascriptBridge', '= 6.0.3'
pod 'Fabric',               '= 1.7.12'
```

## 1.2. 导入 SDK

将下载包里面 NEGCSDK.h, libNEGCSDK.a 以及含图片资源和JS文件的NEGCBundle.bundle添加到 App 项目中

## 1.3. 启用 API

在 *AppDelegate.m application:didFinishLaunchingWithOptions 方法中调用如下方法，参数依次为 app key，版本和来源渠道。

```
NSString *NEGCSDKClientId = @"mslNbTGLKdEsvZGpgZnk2XKZa1LzwoG9PeW9Qalxoj2YYYdvhawjztKs0EN5Vr1W";
NSString *NEGCSDKAppId = @"8a49e80a63d969580163f2be2235013a";
NSString *NEGCSDKChannelHubbleId = @"MA-84A2-97524E679B46";

[[NEGCSDK sharedSDK] registerClientId:NEGCSDKClientId channelAppId:NEGCSDKAppId channelHubbleId:NEGCSDKChannelHubbleId homeUrlString:NULL];
```

在带有包含navigationbar的viewController中调用如下方法，启动游戏中心页面。
*可以在Editor -> Embed in -> Navigation Controller，来为viewControllerj添加前置navigationbar
```
[[NEGCSDK sharedSDK]pushViewController:self];
```


## 1.4 自定义图片浏览和视频播放器

SDK默认带了一套图片浏览和视频器，如果需要自定义可以实现下面的delegate方法
```
@protocol NEGCSDKDelegate <NSObject>
@optional
- (void)NEGCSDKBrowseImages:(NSArray *_Nonnull)imageInfos
currentIndex:(NSInteger)currentIndex;
- (void)NEGCSDKBrowseVidel:(NSString *_Nonnull)videoUrl
title:(NSString *_Nullable)title;
@end
```
## 1.5 用户信息code获取

SDK需要app提供code来获取用户信息，code获取请参考服务器端的协议，请实现下面的delegate方法
```
@protocol NEGCSDKDelegate <NSObject>
@required
- (void)NEGCSDKGetCode:(void(^_Nonnull)(NSString *_Nullable codeString))handler;
@end
```
