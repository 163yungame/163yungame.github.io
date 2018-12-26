# 网易易游SDK接入文档

### 快速使用

#### 资源引入
1. 将gamesdk-x.x.x.jar引入项目
2. `若游戏打包方式无法将gamesdk-x.x.x.jar中的assets文件夹下内容打包到apk，请手动将assets复制到项目的assets文件夹下`

#### 参数配置
##### AndroidManifest配置
1. `versionName` 需要保证为三段式 `x.x.x` (例1.2.3)
2. GameID, GameSecret 配置再application标签下，例如
```xml
<application
    android:label="@string/app_name"
    android:icon="@mipmap/ic_launcher"
    android:theme="@style/AppTheme"
    android:name=".DemoApp">
    <meta-data
        android:name="YX_GAME_ID"
        android:value="${YX_GAME_ID}"/>

    <meta-data
        android:name="YX_GAME_SECRET"
        android:value="${YX_GAME_SECRET}"/>
</application>
```
2. 权限配置
```xml
<uses-permission android:name="android.permission.INTERNET"/>
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"/>
<uses-permission android:name="android.permission.READ_PHONE_STATE"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE"/>
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE"/>
<uses-permission android:name="android.permission.READ_PHONE_STATE"/>
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE"/>
<uses-permission android:name="android.permission.ACCESS_FINE_LOCATION"/>
<uses-permission android:name="android.permission.GET_TASKS"/>
<uses-permission android:name="android.permission.CALL_PHONE"/>
```
3. 其他配置
```xml
<activity
    android:name="im.yixin.gamesdk.activity.YXComponentActivity"
    android:configChanges="keyboardHidden|orientation|screenSize"
    android:theme="@android:style/Theme.Translucent.NoTitleBar">
</activity>

<activity
    android:name="xx.xx.xx.xx.yxapi.YXEntryActivity"
    android:configChanges="keyboardHidden|orientation|screenSize"
    android:excludeFromRecents="true"
    android:exported="true"
    android:launchMode="singleTask"/>
<receiver
    android:name="xx.xx.xx.xx..yxapi.AppRegister"
    android:permission="im.yixin.sdk.permission.YIXIN_SDK_MESSAGE">
    <intent-filter>
        <action android:name="im.yixin.sdk.api.Intent.ACTION_REFRESH_YXAPP"/>
    </intent-filter>
</receiver>

```
`YXEntryActivity` 和 `AppRegister` 中的xx.xx.xx.xx.替换为游戏中的`真实路径`

#### 初始化SDK
在`Application`中初始化  
重要：`如果项目中使用了多进程，请只在主进程中初始化，否则可能会导致意想不到的问题`
```java
public class xxxApp extends Application {

    private YXGameApi gameApi;

    @Override
    public void onCreate() {
        super.onCreate();
        gameApi = YXGameApiFactory.init(this, new YXGameCallbackListener<Void>() {
            @Override
            public void callback(int status, Void aVoid) {
                if (status == YXGameStatusCode.INIT_SUCCESS) {
                    //SDK初始化成功
                } else if (status == YXGameStatusCode.INIT_ERROR) {
                    //SDK初始化失败

                } else if (status == YXGameStatusCode.LOGIN_SUCCESS) {
                    //调用login后，用户登陆成功
                } else if (status == YXGameStatusCode.ACCOUNT_CHANGE) {
                    //切换用户
                } else if (status == YXGameStatusCode.LOGOUT) {
                    //悬浮窗内退出账户
                }
            }
        });
    }

    public YXGameApi yxGameApi() {
        return gameApi;
    }
}
```
init接口回调参数说明
| 参数           | 说明                                             |
| -------------- | ------------------------------------------------ |
| INIT_SUCCESS   | SDK初始化成功                                    |
| INIT_ERROR     | SDK初始化失败                                   |
| LOGOUT         | 悬浮窗内退出账户                                 |
| LOGIN_SUCCESS  | 用户登陆成功                                     |
| ACCOUNT_CHANGE | 该次登陆的用户与之前缓存的用户信息不是同一个用户 |

#### 注册全局监听器（可选）
可在需要的地方注册全局状态监听器，来监听账户改变，回调参数通init接口中的一致
```java
yxGameApi().registerGameMonitor(new YXGameCallbackListener<Void>() {
            @Override
            public void callback(int status, Void aVoid) {
                if (status == YXGameStatusCode.LOGIN_SUCCESS) {
                    //调用login后，用户登陆成功
                } else if (status == YXGameStatusCode.ACCOUNT_CHANGE) {
                    //切换用户
                } else if (status == YXGameStatusCode.LOGOUT) {
                    //悬浮窗内退出账户
                }
            }
        });
```

#### 登录
在需要登录的时刻调用login接口
```java
yxGameApi().login(activity)
```
登录结果会回调到初始化和全局监听器注册的回调

#### YXEntryActivity，AppRegister
该两个文件，请直接复制Demo中的代码

#### 接口调用
1. 获取token
```java
String token = yxGameApi().getToken()
```
在`登录成功`后可调用，获取到的token一定是有效的token，可以直接给服务器使用，服务器校验token有效性，请参考服务器文档

2. 获取用户信息
```java
try {
    yxGameApi().getAccountInfo(new YXGameCallbackListener<GameAccount>() {
        @Override
        public void callback(int status, GameAccount account) {
            if (status != YXGameStatusCode.SUCCESS || account == null) {
                return;
            }
            System.out.println(account.getAccountId());
        }
    });
} catch (Exception e) {
    e.printStackTrace();
}
```

3. 通知SDK登出账户
```java
yxGameApi().logout();
```
登出结果会回调到初始化和全局监听器注册的回调

4. 退出游戏
```java
yxGameApi().exit(this, new YXGameCallbackListener<Boolean>() {
            @Override
            public void callback(int status, Boolean exit) {
                if (exit) {
                    //退出游戏
                    finish();
                } else {
                    //不退出
                }
            }
        });
```

#### 支付
```java
YXTrade trade = new YXTrade();
trade.setId(tradeId);
trade.setGateUrl(payGateUrl);
trade.setResult(YXTrade.RESULT_OK);
new YXPayApi(PayActivity.this, new YXPayDelegate() {
                @Override
                public void onTradeComplete(int resultCode) {
                    // 注意回调在UI主线程中，对http请求需要异步调用
                    if (resultCode == YXPayResultCode.SUCCESS) {
                        //支付成功
                    } else if (resultCode == YXPayResultCode.USER_CANCEL) {
                        //用户取消支付
                    } else {
                        //支付异常
                    }
                }
            }).pay(trade);
```
`tradeId`和`payGateUrl`从游戏自己服务器下单后获取，具体请参考服务器支付文档

#### 混淆
```java
proguard 不要混淆sdk，相关代码 如下
-keep class com.squareup.** {*;}
-dontwarn com.squareup.**
-keep class im.yixin.** {*;}
-dontwarn im.yixin.**

```
