# 命名空间

注:以易信JsBridge为例，命名空间window.YxJsBrige

bridge 实现文件由客户端注入或者 webview 提供

### 代码参考
用WKWebView和第三方库WebViewJavascriptBridge注入js如下：

```
;(function(){
    if(window.YxJsBrige){
        return;
    }

    function setupWebViewJavascriptBridge(callback) {
        if (window.WebViewJavascriptBridge) { return callback(WebViewJavascriptBridge); }
        if (window.WVJBCallbacks) { return window.WVJBCallbacks.push(callback); }
        window.WVJBCallbacks = [callback];
        var WVJBIframe = document.createElement('iframe');
        WVJBIframe.style.display = 'none';
        WVJBIframe.src = 'https://__bridge_loaded__';
        document.documentElement.appendChild(WVJBIframe);
        setTimeout(function() { document.documentElement.removeChild(WVJBIframe) }, 0)
    }

    setupWebViewJavascriptBridge(function(bridge) {

        var YxJsBrige = {};
        var YxJsEvents = {};

        YxJsBrige.on = function(event,callback) {
            document.addEventListener(event,callback,false);
            YxJsEvents[event] = 1;
        }

        YxJsBrige.off = function(event) {
            document.removeEventListener(event);
            delete YxJsEvents[event];
        }
        
        YxJsBrige.call = function(method,data,responseCallback) {
            bridge.callHandler(method,data,responseCallback);
        }
  
        YxJsBrige.invoke = function(method,data,responseCallback) {
            bridge.callHandler(method,data,responseCallback);
        }

        YxJsBrige.emit = function(name,detail) {
            var ev = document.createEvent('Event');
            ev.initEvent(name, true, true);
            ev.detail = detail;
            document.dispatchEvent(ev);
        }

        window.YxJsBrige = YxJsBrige;
        window.YxJsEvents = YxJsEvents;
    })

})();

```

# 需要实现接口列表

## 1. setTitle
用于显示 webview 的 topbar 标题动态设置
### 参数 
- text：String

### 代码参考
```
- (void)handle:(NSDictionary *)param
      callback:(WVJBResponseCallback)callback
{
    NSString *text = [param objectForKey:@"text"];
    [self.webViewController setTitle:text];
}
```

## 2. closeWindow
用于关闭webview窗口

### 代码参考
```
- (void)handle:(NSDictionary *)param
      callback:(WVJBResponseCallback)callback
{
    if (self.webViewController.navigationController.topViewController == webViewController)
    {
        [self.webViewController.navigationController popViewControllerAnimated:YES];
    }
    else if(self.webViewController.presentingViewController != nil)
    {
        [self.webViewController dismissViewControllerAnimated:YES
                                              completion:nil];
    }
}
```


## 3. browseImg
用于全屏幕预览图片
### 参数 
- imgInfos：Array<String>，需要预览的图片地址列表
- current: Int，初始化预览第几张

### 代码参考
```
- (void)handle:(NSDictionary *)param
      callback:(WVJBResponseCallback)callback
{
    NSArray *imgInfos = [param objectForKey:@"imgInfos"];
    NSInteger currentIndex = [[param objectForKey:@"current"] integerValue];

    if ([imgInfos isKindOfClass:[NSArray class]]) {
        NSMutableArray *tmpArr = [NSMutableArray array];
        for (NSString *urlString in imgInfos) {
            NEGCShowLargeImageModel *largeImageModel = [[NEGCShowLargeImageModel alloc] init];
            largeImageModel.imageUrl = urlString;
            [tmpArr addObject:largeImageModel];
        }
        [[NEGCShowGalleryHelper shared] showGalleryWithImageView:nil imageList:tmpArr index:currentIndex];
    }
}

```

## 4. openVideo
用于全屏幕观看视频
### 参数 
- videoUrl：String，视频地址
- title: String，播放时顶部标题显示

### 例子
```
- (void)handle:(NSDictionary *)param
      callback:(WVJBResponseCallback)callback
{
    NSString *videoUrl =  [param objectForKey:@"videoUrl"];
    NSString *title =  [param objectForKey:@"title"];
    if (videoUrl != nil)
    {
        NSURL * url = [NSURL URLWithString:videoUrl];
        if (url != nil)
        {
            NEGCVideoPlayerConfig *config = [NEGCVideoPlayerConfig new];
            config.mutePlay = NO;
            NEGCVideoPlayViewController* videoPlayerVC = [[NEGCVideoPlayViewController alloc] initWithURL:url playConfig:config];
            if(title != nil)
            {
                videoPlayerVC.title = title;
            }
            [self.webViewController presentViewController:videoPlayerVC animated:YES completion:nil];
        }
    }
}

```

## 5. openURL
用于打开外部地址

### 参数 
- url：String，需要打开的地址
- method: Int，模式:
    - 0: 调用外部浏览器打开的
    - 2: 使用新建webview窗口打开以实现ios下的pop和push效果

### 例子
```
- (void)handle:(NSDictionary *)param
      callback:(WVJBResponseCallback)callback
{
    NSNumber *method =  [param objectForKey:@"method"];
    NSString *url =  [param objectForKey:@"url"];
    if(method != nil && url != nil) {
        UINavigationController *nav = self.webViewController.navigationController;
        if ([method integerValue] == 2)
        {
            [nav NEGC_pushURL:url
                     animated:YES];
        }
        else if ([method integerValue] == 0)
        {
            [[UIApplication sharedApplication]openURL:[NSURL URLWithString:url]];
        }
    }
}
```


## 6. getFreeTrafficState
用于返回当前 app 环境是否有免流

### 回调
- freeTraffic：Bool，是否有免流

### 例子
```
- (void)handle:(NSDictionary *)param
      callback:(WVJBResponseCallback)callback
{
    callback(@{@"freeTraffic": @NO});
}
```

## 7. requestlogin
获取手机端信息，后续拿code去向授权服务器换取token

### 回调
- code：String， 客户端登录之后分配给游戏中心用户的code
- idfa：String， 手机广告 id
- model：String， 手机硬件型号信息
- osVer：String， ios 版本号
- appId：String， 云游戏中心为你方分配的识别码
- hubbleId：String， hubble账号appid


## 8. share
获取手机端信息，后续拿code去向授权服务器换取token

### 参数 
- link：String， 分享内容点击的跳转地址
- title：String， 纯文字分享内容标题
- desc：String， 纯文字分享内容
- img_url：String， 图片分享的缩略图

### 例子
```
- (void)handle:(NSDictionary *)param
      callback:(WVJBResponseCallback)callback
{
    NEGCSharedWebDataModel *result = [NEGCSharedWebDataModel new];
    result.url   = param[@"link"];
    result.title = param[@"title"];
    result.desc  = param[@"desc"];
    result.iconURL = param[@"img_url"];
    
    NEGCWebViewController *viewController = self.webViewController;
    WKWebView *webView = viewController.webView;
    
    NEGCSharedWebViewContent *content = [[NEGCSharedWebViewContent alloc] initWithWebView:webView
                                                                                shareData:result];
    NEGCSharedController *vc = [[NEGCSharedController alloc] initWithContent:content];
    [vc showOnViewController:viewController];
}
```

## 9. enableWebviewBounce
是否启用 webview 的滑到底的回弹效果

### 参数 
- status：Bool，是否启用

### 例子
```
- (void)handle:(NSDictionary *)param
      callback:(WVJBResponseCallback)callback
{
    if (param && param[@"status"]) {
        [self.webViewController enableBounce:[param[@"status"]boolValue]];
    }
}
```

## 10. enablePopGesture
是否启用 webview 的左滑返回

### 参数 
- status：Bool，是否启用

### 例子
```
- (void)handle:(NSDictionary *)param
      callback:(WVJBResponseCallback)callback
{
    if (param && param[@"status"]) {
        [self.webViewController enablePopGesture:[param[@"status"]boolValue]];
    }
}
```

# 其他
## 拼接code和写入cookie
调用游戏中心地址前先获取code，地址拼接code，code和app信息写入cookie后再调用，当没有这些信息的时候，web页面会调用requestlogin再次获取。

### 例子1
获取拼接code地址和cookie
```
- (NSString*)appendingCodeString:(NSString *)urlString code:(NSString *)codeString {
    if (([urlString rangeOfString:@"?code="].location != NSNotFound) || ([urlString rangeOfString:@"&code="].location != NSNotFound)) {
        return urlString;
    }
    if(codeString) {
        if (([urlString rangeOfString:@"?"].location != NSNotFound)) {
            return [urlString stringByAppendingString:[NSString stringWithFormat:@"&code=%@", codeString]];
        } else {
            return [urlString stringByAppendingString:[NSString stringWithFormat:@"?code=%@", codeString]];
        }
    } else {
        return urlString;
    }
}

- (void)getCodeUrl:(NSString *_Nonnull)url handler:(void(^_Nonnull)(NSString * _Nullable codeUrl, NSDictionary * _Nullable cookieDic,NSError * _Nullable error))handler {
    if([NEGCSDK isGameCenterUrl:url]) {
        __weak typeof(self) weakSelf = self;
        [self getOpenCode:^(NSDictionary * _Nullable codeDic, NSString * _Nullable codeString, NSError * _Nullable error) {
            __strong typeof(weakSelf) strongSelf = weakSelf;
            if(codeDic) {
                NSString *infoString = [NEGCSDK toJsonString:codeDic];
                NSData *infoData = [infoString dataUsingEncoding:NSUTF8StringEncoding];
                NSString *infoHash = [infoData base64EncodedStringWithOptions:0];
                if (infoHash) {
                    NSDictionary *cookieDic = [NSDictionary dictionaryWithObjectsAndKeys:infoHash,@"ncg_app_info", nil];
                    handler([strongSelf appendingCodeString:url code:codeString],cookieDic,nil);
                } else {
                    handler(nil,nil,error);
                }
            } else {
                handler(nil,nil,error);
            }
        }];
    } else {
        handler(nil,nil,nil);
    }
}
```
### 例子2
webView设置cookie

```
-(WKWebViewConfiguration *)config
{
    if (_config == nil)
    {
        _config = [[WKWebViewConfiguration alloc] init];
        WKUserContentController *userContentController = [[WKUserContentController alloc] init];
        for (NSString *key in _webConfig.cookieDic) {
            NSString *appendString = [NSString stringWithFormat:@"%@=%@", key, [_webConfig.cookieDic valueForKey:key]];
            NSString *setCookie = [NSString stringWithFormat:@"document.cookie='%@';", appendString];
            WKUserScript *cookieScript = [[WKUserScript alloc] initWithSource:setCookie injectionTime:WKUserScriptInjectionTimeAtDocumentStart forMainFrameOnly:YES];
            [userContentController addUserScript:cookieScript];
        }
        _config.userContentController = userContentController;
        _config.allowsInlineMediaPlayback = YES;
        _config.allowsAirPlayForMediaPlayback = YES;
        _config.preferences = [[WKPreferences alloc] init];
        _config.preferences.minimumFontSize = 0;
        _config.preferences.javaScriptEnabled = YES;
        _config.processPool = [[WKProcessPool alloc] init];
    }
    return _config;
}

- (void)webView:(WKWebView *)webView didFinishNavigation:(WKNavigation *)navigation
{
    if (_webConfig && _webConfig.cookieDic) {
        //为什么在完全加载完成后需要重新给WKWebView设置Cookie呢？
        //如果你不这样做的话很有可能因为a标签跳转，导致下一次跳转的时候Cookie丢失。
        NSString *JSFuncString =
        @"function setCookie(name,value,expires)\
        {\
        var oDate=new Date();\
        oDate.setDate(oDate.getDate()+expires);\
        document.cookie=name+'='+value+';expires='+oDate+';path=/'\
        }\
        function getCookie(name)\
        {\
        var arr = document.cookie.match(new RegExp('(^| )'+name+'=({FNXX==XXFN}*)(;|$)'));\
        if(arr != null) return unescape(arr[2]); return null;\
        }\
        function delCookie(name)\
        {\
        var exp = new Date();\
        exp.setTime(exp.getTime() - 1);\
        var cval=getCookie(name);\
        if(cval!=null) document.cookie= name + '='+cval+';expires='+exp.toGMTString();\
        }";
        NSMutableString *JSCookieString = JSFuncString.mutableCopy;
        for (NSString *key in _webConfig.cookieDic) {
            NSString *excuteJSString = [NSString stringWithFormat:@"setCookie('%@', '%@', 1);", key, [_webConfig.cookieDic valueForKey:key]];
            [JSCookieString appendString:excuteJSString];
        }
        [webView evaluateJavaScript:JSCookieString completionHandler:^(id obj, NSError * _Nullable error) {
            NSLog(@"%@",error);
        }];
    }
}
```
## 关闭webview前询问是否可以关闭
### 例子
```
- (void)canBackOrClose:(void(^_Nonnull)(BOOL canBack))handler {
    [self.webView evaluateJavaScript:@"window.hasOwnProperty('canCloseWebView') && window.canCloseWebView instanceof Function ? canCloseWebView() : true" completionHandler:^(id _Nullable result, NSError * _Nullable error) {
        if(error == nil && result != nil) {
            if([result boolValue]) {
                handler(YES);
            } else {
                handler(NO);
            }
        } else {
            handler(YES);
        }
    }];
}
```




