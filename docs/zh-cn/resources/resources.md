# 接入指引

## 资源下载

#### AndroidSDK下载
[GameSDK-4.13.0](http://nosdn-yx.127.net/yxgame/8a49e80d66af99ce0166bec4872100d0.zip)

#### 签名工具
[下载地址](http://nosdn-yx.127.net/yxgame/8a49e8136628c152016628c152460000.apk)

##### 如何使用签名工具
1. 使用游戏`线上keystore`对游戏进行签名
2. 在安卓机上安装已签名的游戏
3. 在安卓机上安装GetSignature.apk
4. 运行GetSignature.apk，填入游戏包名，生成签名，配置到网易云游戏后台对应的游戏下面

#### 自测文档
[下载地址](http://nosdn-yx.127.net/yxgame/8a49e8136628c1520166291f78bb0001.xlsx)

## 注意事项
1. 先申请GameID，GameSecret，交给对应开发
2. 为保证授权，支付等可以正常调试，调试前请确认后台相关包名，签名是否配置正确
3. 包名后缀cloudgame (例com.netease.yys.cloudgame)
4. APK不需要角标，不需要闪屏
