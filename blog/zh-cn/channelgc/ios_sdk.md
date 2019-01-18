# 1. iOS SDK 使用文档

## SDK下载
[NCGSDK-1.0.2](http://nosdn-yx.127.net/yxgame/1126f6a28f504ecc8589454412b1f4b3.zip)

- 更新版本：v1.0.2
1. 对URLScheme调用做了判断，默认作为外部调用，忽略method==2的情况
2. 去掉默认的视频全屏幕播放支持，减少11MB容量，改为外部实现，请移除Pods配置内的NELivePlayer

[TOC]
# 1. iOS SDK 使用文档

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
pod 'WebViewJavascriptBridge', '= 6.0.3'
pod 'Fabric',               '= 1.7.12'
```

## 1.2. 导入 SDK

将下载包里面 NEGCSDK.h, libNEGCSDK_all.a 以及含图片资源和JS文件的NEGCBundle.bundle添加到 App 项目中

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
[NEGCSDK sharedSDK].delegate = self;
[[NEGCSDK sharedSDK]startGameCenter:self.navigationController animated:YES];
```

## 1.4 用户信息code获取

SDK需要app提供code来获取用户信息，code获取请参考服务器端的协议，请实现下面的delegate方法
```
@protocol NEGCSDKDelegate <NSObject>
@required
- (void)NEGCSDKGetCode:(void(^_Nonnull)(NSString *_Nullable codeString))handler;
@end
```

## 1.5 实现全屏幕的视频浏览
```
@protocol NEGCSDKDelegate <NSObject>
@required
- (void)NEGCSDKBrowseVideo:(NSString *_Nonnull)videoUrl title:(NSString *_Nullable)title;
@end
```

## 1.6 自定义图片浏览

SDK默认带了一套图片浏览，如果需要自定义可以实现下面的delegate方法
```
@protocol NEGCSDKDelegate <NSObject>
@optional
- (void)NEGCSDKBrowseImages:(NSArray *_Nonnull)imageInfos currentIndex:(NSInteger)currentIndex;
@end
```

## 1.7 自定义webViewVC

如果需要实现自定义UI，比如左右键，title文字，修改navBar的属性等，请实现下面的delegate方法
```
@protocol NEGCSDKDelegate <NSObject>
@optional
- (void)NEGCSDKPushViewController:(UIViewController<NEGCWebViewControllerProtocol> *)webViewController animated:(BOOL)animated;
@end

- (void)NEGCSDKPushViewController:(UIViewController<NEGCWebViewControllerProtocol> *)webViewController animated:(BOOL)animated {
    MyWebViewController * myWebVC = [[MyWebViewController alloc]init];
    myWebVC.childVC = webViewController;
    myWebVC.hidesBottomBarWhenPushed = YES;
    [self.navigationController pushViewController:myWebVC animated:animated];
}
```

并实现MyWebViewController
```
@interface MyWebViewController : UIViewController<NEGCWebViewControllerParentProtocol>
@property (nonatomic, strong) UIViewController<NEGCWebViewControllerProtocol> *childVC;
@end

@implementation MyWebViewController
- (void)viewDidLoad {
    [super viewDidLoad];
    [self addChildViewController:_childVC];
    [self.view addSubview:_childVC.view];
    _childVC.view.frame = self.view.frame;
    [_childVC didMoveToParentViewController:self];
    if (@available(iOS 11.0, *)) {
    } else {
        #pragma clang diagnostic push
        #pragma clang diagnostic ignored "-Wdeprecated-declarations"
        self.automaticallyAdjustsScrollViewInsets = NO;
        #pragma clang diagnostic pop
    }
    self.navigationItem.leftBarButtonItem = [[UIBarButtonItem alloc]initWithTitle:@"返回" style:UIBarButtonItemStylePlain target:self action:@selector(bima_backButtonPressed:)];
}
#pragma mark - NEGCWebViewControllerParentProtocol
-(void)setMenuInfo:(NSDictionary *)info {
    NSNumber *visible = [info objectForKey:@"visible"];
    NSString *text = [info objectForKey:@"text"];
    if(visible) {
    if([visible boolValue]) {
    if([text length]) {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc]initWithTitle:text style:UIBarButtonItemStylePlain target:self action:@selector(actionBtnClick:)];
    } else {
        self.navigationItem.rightBarButtonItem = [[UIBarButtonItem alloc]initWithImage:[UIImage imageNamed:@"webview_share"] style:UIBarButtonItemStylePlain target:self action:@selector(actionBtnClick:)];
    }
    } else {
        self.navigationItem.rightBarButtonItem = nil;
    }
    } else {
        self.navigationItem.rightBarButtonItem = nil;
    }
}
...
@end
```
