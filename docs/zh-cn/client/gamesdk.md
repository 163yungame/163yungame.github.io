## 游戏SDK接入文档

### 版本更新记录
更新内容|更新日期|版本号
-----|-----|-----
优化接口|2020.08.19|5.2.0
接口大改、订单改为游戏SDK发起生成|2020.12.30|5.3.0
初始化回调切到主线程|2021.03.04|5.3.1
中宣部实名、优化用户信息字段、接入情况检测、多处UI适配|2021.05.08|5.3.2
支持qq一键登录、游戏实名级别可控制|2021.09.15|5.4.0
修复部分机型上的闪退|2022.07.29|5.5.0
适配Android11|2023.11.29|5.6.0


### 1.项目准备及接入

#### 1.1 游戏配置ID申请
* 在[游戏后台](https://yixingame.cn/)申请游戏`GameId`及`GameSecret`

#### 1.2 urs签名备案
* 从5.3.0版本开始，需下载[urs签名获取工具](https://nos.netease.com/yxgame/bf3af30b5b34e6c14754fe8683e58602.apk)获取游戏apk签名(注意：这个工具和别的签名获取工具不一样)，将签名发给商务同学进入签名备案流程，
备案通过后才能使用手机号、邮箱、QQ、微博4种登录方式（未备案会出现"初始化失败，请重试"的提示），在这之前可以先用其他方式授权登录测试。
    
    注意：此签名只用于备案，不能填写在后台。

    只有第一次对接的游戏需要备案，备案过的游戏无需再备案。

#### 1.3 依赖库及资源文件导入
1. 将`yx_game_x.x.x.zip`中的所有`aar`引入项目

#### 1.4 Application配置（必接）
* 游戏的`Application`必须继承自`im.yixin.gamesdk.base.YXApplication`。
* 如果游戏重写了生命周期回调，必须通过`super`调用对应的父类实现。
> 示例
```java
public class XXGameApp extends YXApplication{
    //...
    @Override
    public void onCreate() {
        super.onCreate();
        //游戏添加自己的逻辑
    }
}
```

#### 1.5 闪屏Activity配置（必接）
* 游戏闪屏`Activity`必须继承自`im.yixin.gamesdk.base.YXSplashActivity`，对于没有闪屏页的游戏需先新建闪屏`Activity`
> 示例
```java
public class XXGameSplashActivity extends YXSplashActivity {
    @Override
    public int getBackgroundColor() {
        //返回默认背景色
        return Color.WHITE;
    }

    @Override
    public void onSplashStop() {
        //闪屏页结束回调，在此启动游戏主页面
    }
}
```

#### 1.6 清单文件 AndroidManifest 配置（必接）
1. versionName

`versionName` 需要保证为三段式 `x.x.x` (例如：1.2.3)

2. 配置 `GameID, GameSecret` 在`application`标签下。
> 示例
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
3. 权限配置
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.CHANGE_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

#### 1.7 targetSdkVersion
`targetSdkVersion = 30`

#### 1.8 签名
只能使用v2签名，不能用v1签名。

### 2.中宣部实名
游戏SDK提供实名认证功能，游戏方无需进行实名认证。

该功能采用中宣部提供的服务，请游戏方通过服务端获取中宣部返回的pi等实名信息。

游戏方需要使用这个pi完成中宣部要求的游戏用户行为数据上报工作。

注意：首次接入时游戏方需先在中宣部后台关联我们，然后联系商务同学进行游戏备案码关联才能实名成功。

### 3.接入情况检测
为保证游戏方接入完整，游戏SDK将会在游戏方开发阶段进行接入情况检测。

该检测在调用支付接口时触发，如果接入不完整，将会弹窗提示并中止支付。

游戏方应按照提示完成接入，并在支付前上报角色、回到桌面再进入游戏以通过接口检测。

### 4.接口文档

#### 4.1 SDK初始化（必接）
* im.yixin.gamesdk.base.YXSDK.init(Activity activity)
    * 入参
        * activity | 类型Activity| **必传**
    * 描述：通过添加初始化监听器异步监听初始化结果，在游戏主Activity的onCreate()方法中调用（其他时机调用将导致未知问题！）
> 调用示例
```java
//step1.添加初始化监听
YXSDK.get().getInitMonitor().setInitCallback(new IInitMonitor.InitCallback() {
    @Override
    public void onInitSuccess() {
        //初始化成功回调
    }

    @Override
    public void onInitFailure(String code, String message) {
        //初始化失败回调
    }
});
//step2.执行sdk初始化
YXSDK.get().init(activity);
```

#### 4.2 用户登录（必接）
* im.yixin.gamesdk.base.intef.IAuthMonitor.login(Activity activity)
    * 入参
        * activity | 类型Actiivty| **必传**
    * 描述：
        * 调用登录，返回游戏用户信息(不包含实名信息，请游戏方通过服务端获取实名信息)。每次应用新启动都需要执行
        * 需要预先添加回调监听器
> 调用示例
```java

YXSDK.get().getAuthMonitor().setLoginCallback(new IAuthMonitor.LoginCallback() {
    @Override
    public void onLoginSuccess(GameUserInfo info) {
        //用户登录成功，返回GameUserInfo
    }

    @Override
    public void onLoginCancel() {
        //用户取消登录回调
    }

    @Override
    public void onLoginFailure(String code, String message) {
        //用户登录失败回调
    }
});
YXSDK.get().getAuthMonitor().login(activity);
```

#### 4.3 用户注销（必接）
* im.yixin.gamesdk.base.intef.IAuthMonitor.logout(Activity activity)
    * 入参
        * activity | 类型Acitivty| **必传**
    * 描述：
        * 用于游戏注销用户前调用，在回调成功之后再执行游戏的用户注销
        * 需要预先添加回调监听器
> 调用示例
```java

YXSDK.get().getAuthMonitor().setLogoutCallback(new IAuthMonitor.LogoutCallback() {
    @Override
    public void onLogoutSuccess() {
       //用户注销成功回调
    }

    @Override
    public void onLogoutFailure(String code, String message) {
        //用户注销失败回调
    }
});
YXSDK.get().getAuthMonitor().logout(activity);
```

#### 4.4 用户切换（必接）
* im.yixin.gamesdk.base.intef.IAuthMonitor.switchAccount(Activity activity)
    * 入参
        * activity | 类型Acitivty| **必传**
    * 描述：
        * 用于游戏切换用户前调用，在回调成功之后再执行游戏的用户切换
        * 需要预先添加回调监听器
> 调用示例
```java

YXSDK.get().getAuthMonitor().setSwitchAccountCallback(new IAuthMonitor.SwitchAccountCallback() {
    @Override
    public void onSwitchSuccess(GameUserInfo info) {
        //切换用户成功，返回新用户的userInfo
    }

    @Override
    public void onSwitchCancel() {
        //用户取消切换的回调
    }

    @Override
    public void onSwitchFailure(String code, String message) {
        //用户切换失败回调
    }
});
YXSDK.get().getAuthMonitor().switchAccount(activity);
```

#### 4.5 退出SDK（必接）
* im.yixin.gamesdk.base.intef.IInitMonitor.exit(Activity activity)
    * 入参
        * activity | 类型Acitivty| **必传**
    * 描述：
        * 用于游戏退出应用前调用，清理sdk内部资源，在回调成功之后再执行游戏app退出操作
        * 需要预先添加回调监听器
> 调用示例
```java
YXSDK.get().getInitMonitor().setSDKExitCallback(new IInitMonitor.SDKExitCallback() {
    @Override
    public void onExitSuccess() {
        //返回成功之后，退出app
    }

    @Override
    public void onExitFailure(String code, String message) {
        //退出sdk失败回调
    }
});

YXSDK.get().getInitMonitor().exit(activity)
```

#### 4.6 保存游戏角色信息（必接）
* im.yixin.gamesdk.base.intef.IAuthMonitor.saveGameInfo(Activity activity, GameRoleInfo info, int type)
    * 入参
        * activity | 类型Acitivty| **必传**
        * info | 类型GameRoleInfo | **必传** | 参考 <a href="#define">章节5. 对象类型定义</a>
        * type | 类型int | 保存时机 | **必传**
            * 0: 创建游戏角色
            * 1: 游戏角色登录
            * 2: 游戏角色退出
            * 3: 游戏角色升级
    * 描述：
        * 用于游戏实时保存游戏角色数据
        * 需要预先添加回调监听器
> 调用示例
```java
GameRoleInfo info = new GameRoleInfo();
    info.gameRoleId = "123456000"; //角色id，必传，非空非null
    info.gameRoleName = "Diablo";  //角色名称，必传，非空非null
    info.gameRoleLevel = "57"; //角色等级，必传，非空非null
    info.serverId = "12345890"; //服务器id，整型字符串，必传，非空非null
    info.serverName = "奥格瑞玛"; //服务器名称，必传，非空非null
    
    info.vipLevel = "3"; //用户vip等级，整型字符串，非必传
    info.gameBalance = "9999"; //角色金额，整型字符串，非必传
    info.experience = "1000001"; //角色经验，非必传
    info.roleCreateTime = 1608463800; //角色创建时间，从1970年到现在的时间，单位秒，非必传
    info.roleLevelUpTime = 1608463800; //角色升级时间，从1970年到现在的时间，单位秒，非必传
    info.partyId = "100"; //公会id，整型字符串，非必传
    info.partyName = "复仇者联盟"; //公会名称，非必传
    info.partyMasterID = "001"; //公会会长ID，非必传
    info.partyMasterName = "乔峰"; //公会会长名称，非必传
    info.roleGender = "男"; //角色性别，非必传
    info.rolePower = "10"; //战力，整型字符串，非必传
    info.partyRoleId = "101"; //角色在帮派中的id，非必传
    info.partyRoleName = "yixin"; //角色在帮派中的名称，非必传
    info.professionId = "40"; //角色职业id，非必传
    info.profession = "法师"; //角色职业名称，非必传
    info.friendList = ""; //好友关系列表，有值传入json数组字符串，没有填写“无”，非必传
//此接口不提供回调监听
YXSDK.get().getAuthMonitor().saveGameInfo(info, 0);
```

#### 4.7 支付（必接）
* im.yixin.gamesdk.base.intef.IPayMonitor.pay(Activity activity, GamePaymentInfo payment)
    * 入参
        * activity | 类型Acitivty| **必传**
        * payment | 类型GamePaymentInfo | **必传** | 参考 <a href="#define">章节5. 对象类型定义</a>
    * 描述：
        * 用于游戏内进行支付调用
        * 需要预先添加回调监听器
> 调用示例
```java
//构造订单对象
GamePaymentInfo payment = new GamePaymentInfo();
payment.orderId = "123456000"; //游戏方生成的订单id，必传，非空非null

//支付总金额 = price * goodsCount
payment.price = 1.00d; //商品单价（单位：元）|double|必传，非空非null
payment.goodsCount = 1; //商品数量|int|必传

payment.orderTime = System.currentTimeMillis(); //下单时间，单位ms
payment.goodsName = "coin"; //商品名称，必传非null
payment.goodsCode = "coin"; //商品名称，必传非null（是的，这里没有写错）
payment.goodsDesc = "coin"; //商品描述，必传非null
payment.serverId = "1234500"; //所在服务器id，必传非null
payment.serverName = "奥格瑞玛"; //所在服务器名称，必传非null
payment.gameRoleId = "1239000"; //角色id，必传非null
payment.gameRoleName = "Diablo"; //角色名称，必传非null

payment.roleLevel = ""; //角色等级，非必传
payment.vipLevel = ""; //角色vip等级，非必传

YXSDK.get().getPayMonitor().setPayCallback(new IPayMonitor.PayCallback() {
    @Override
    public void onPaySuccess(String orderId, String cpOrderId) {
        //支付成功回调，返回游戏SDK新生成的orderId + 游戏初始cpOrderId
    }

    @Override
    public void onPayFailure(String cpOrderId, String code, String message) {
        //支付失败，返回游戏初始cpOrderId
    }
});

YXSDK.get().getPayMonitor().pay(DemoPayActivity.this, payment);
```

#### 4.8 Activity生命周期回调（必接）
* 对于游戏内的主Activity，需调用sdk监听器内的各回调方法
* 生命周期监听器，可以通过`YXSDK.get().getLifecycleMonitor()`获取
> 调用示例
```java
public class GameBaseActivity extends Activity {

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        YXSDK.get().getLifecycleMonitor().onCreate(this);
    }

    @Override
    protected void onStart() {
        super.onStart();
        YXSDK.get().getLifecycleMonitor().onStart(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        YXSDK.get().getLifecycleMonitor().onResume(this);
    }

    @Override
    protected void onPause() {
        super.onPause();
        YXSDK.get().getLifecycleMonitor().onPause(this);
    }

    @Override
    protected void onStop() {
        super.onStop();
        YXSDK.get().getLifecycleMonitor().onStop(this);
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        YXSDK.get().getLifecycleMonitor().onDestroy(this);
    }

    @Override
    public void onConfigurationChanged(@NonNull Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        YXSDK.get().getLifecycleMonitor().onConfigurationChanged(getApplication(), newConfig);
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        YXSDK.get().getLifecycleMonitor().onWindowFocusChanged(hasFocus);
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        YXSDK.get().getLifecycleMonitor().onRequestPermissionsResult(this, requestCode, permissions, grantResults);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        YXSDK.get().getLifecycleMonitor().onActivityResult(this, requestCode, resultCode, data);
    }
}
```

### 5.对象类型定义

> GameUserInfo: 游戏用户信息|登录、切换用户成功、实名认证成功之后回调

| 字段名 | 类型 | 描述 |
| :-- | :-- | :-- |
| uid | string | 用户id |
| userName | string | 用户名 |
| token | string | 用户令牌 |

> GamePaymentInfo: 游戏支付信息

| 字段名 | 类型 | 描述 | 必传 |
| :-- | :-- | :-- | :-- |
| orderId | string | 游戏订单id，由游戏方生成, 非空非null | Yes |
| price | double | 商品单价（单位：元），必传 | Yes |
| orderTime | long | 下单时间，单位ms | No |
| goodsCount | int | 商品数量，非null | Yes |
| goodsName | string | 商品名称，非null | Yes |
| goodsDesc | string | 商品描述，非null | Yes |
| goodsCode | string | 商品名称，必传非null（是的，这里没有写错） | Yes |
| serverId | string | 角色服务器id，非null | Yes |
| serverName | string | 角色服务器名称，非null | Yes |
| gameRoleId | string | 角色id，非null | Yes |
| gameRoleName | string | 角色名字，非null | Yes |
| roleLevel |string | 角色等级 | No |
| vipLevel | string | 用户vip等级 | No |


> GameRoleInfo: 游戏角色信息

| 字段名 | 类型 | 描述 | 必传 |
| :-- | :-- | :-- | :-- |
| gameRoleId | string | 用户角色id，非空非null | Yes |
| gameRoleName | string | 用户角色名字，非空非null | Yes |
| gameRoleLevel | string | 用户角色等级，非空非null | Yes |
| gameRoleLevel | string | 用户角色等级，非空非null | Yes |
| serverId | string | 所在服务器id | Yes |
| serverName | string | 所在服务器名称 | Yes |
| vipLevel | string | 角色vip等级 | No |
| gameBalance | string | 角色当前余额 | No |
| experience | string | 角色经验值 | No |
| roleCreateTime | long | 角色创建时间 | No |
| roleLevelUpTime | long | 角色升级时间 | No |
| partyId | string | 公会id | No |
| partyName | string | 公会名称 | No |
| partyMasterID | string | 公会会长ID | No |
| partyMasterName | string | 公会会长名称 | No |
| roleGender | string | 角色性别 | No |
| rolePower | string | 战力 | No |
| partyRoleId | string | 角色在帮派中的id | No |
| partyRoleName | string | 角色在帮派中的名称 | No |
| professionId | string | 角色职业id | No |
| profession | string | 角色职业名称 | No |
| friendList | string | 好友关系列表 | No |


### 6.混淆规则

> 游戏方需添加以下混淆规则
```
-keep class im.yixin.** {*;}
-dontwarn im.yixin.**
-keep class android.app.** {*;}
-keep class com.squareup.** {*;}
-dontwarn com.squareup.**
-dontwarn okio.**
-keep class okhttp3.**{ *;}
-keep class com.google.gson.**{*;}
-keep class com.alipay.** {*;}
-keep class com.ta.** {*;}
-keep class com.ut.** {*;}
-keep class com.netease.** {*;}
-keep class ray.toolkit.pocketx.** {*;}
-keep class com.beust.** {*;}
-keep class com.meituan.** {*;}