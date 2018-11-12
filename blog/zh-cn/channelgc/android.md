## NCGSDK开发文档

`NCGSDK`是一个为方便独立App快速接入云游戏分发平台的移动端`Web`游戏中心的`SDK`库，`SDK`提供`App`授权登录、游戏下载等等通用`API`接口，开发者可以方便快捷的根据自己需求进行开发实现。

### SDK下载
必选 [NCGSDK-1.4.9](http://nosdn-yx.127.net/yxgame/46077fe49b06436d8b9281f530183f4b.aar)   
可选 [NCGDownloadSDK-1.3.3](http://nosdn-yx.127.net/yxgame/2ae72116b62c4b1faab080528708164a.aar)

### 快速使用
#### 参数配置
在`AndroidManifest`中配置云游戏平台分配给接入`App`的`appId`数据，`SDK`初始化时使用。

```xml
 <meta-data android:name="ncg_app_id" 
 android:value="<云游戏平台分配的appid，唯一标示App>"/>
 <meta-data android:name="ncg_web_id" 
 android:value="<接入方自己分配的id，用于web游戏中心换取token>"/>
 <meta-data
 android:name="ncg_hub_id"
 android:value="<申请的Hubble Data的产品Id，用于下载相关数据包统计>"/>

```
#### 初始化SDK环境
 在`Application`中初始化

```java
public class xxxApp extends Application {
    @Override
    public void onCreate() {
        super.onCreate();
        //DemoNCGCenterModule由接入方实现NCGModule接口
        NCGCenter.init(this, DemoNCGCenterModule.class);
    }
}
```
```java
public class DemoNCGCenterModule implements NCGModule {

    @Override
    public void apply(Context context, NCGCenter.NCGCenterBuilder builder) {
        //使用云游戏提供的下载模块，所需要的配置信息，不使用可不调用
        builder.setConfig(new GameDownloadConfig());
        //为SDK配置图片加载器
        builder.setImageLoader(new DemoImageLoader());
        //云游戏提供的游戏授权模块依赖接口
        builder.setAuth(new DemoAuth());
    }
}
```

#### 登录授权模块

游戏调用App授权，需App提供对应代码实现，示例如下：

`AndroidMainfest`配置

```xml
<activity
	android:name="com.netease.cg.center.sdk.auth.NCGAuthActivity"
    android:configChanges="keyboardHidden|orientation|screenSize"
    android:screenOrientation="portrait"
    android:exported="true"
    android:launchMode="singleTop"/>
```

授权依赖接口实现

```java
public class DemoAuth implements NCGAuth {

    private UserRepo repo;

    public static NCGCallback<Boolean> callback;

    public DemoAuth() {
        this.repo = GlobalInfo.getApp().getUserRepo();
    }

    /**
     * @param callback 回调是否是已登录状态
     * */
    @SuppressLint("CheckResult")
    @Override
    public void isLogin(final NCGCallback<Boolean> callback) {
        repo.getUserInfo().compose(RxUtil.<UserInfoEntry>workMaybeScheduler())
            .subscribe(new Consumer<UserInfoEntry>() {
                @Override
                public void accept(UserInfoEntry userInfo) {
                    callback.callback(userInfo != null);
                }
            }, new Consumer<Throwable>() {
                @Override
                public void accept(Throwable throwable) {
                    callback.callback(false);
                }
            });
    }

    /**
     * 跳转到App登录界面，并回调登录结果
     * */
    @Override
    public void login(Context context, NCGCallback<Boolean> callback) {
        this.callback = callback;
        LoginActivity.startForAuth(context);
    }

    /**
     * @return 获取App当前登录用户信息
     * @see NCGUserInfo
     * */
    @Override
    public NCGUserInfo getUserInfo() {
        NCGUserInfo userInfo = new NCGUserInfo();
        return userInfo;
    }

    /**
     * App根据clientId和当前用户，生成用来换取access_token的临时code
     * */
    @SuppressLint("CheckResult")
    @Override
    public void getCode(String clientId, final NCGCallback<String> callback) {
        if (callback == null) {
            return;
        }
        //请求app服务器授权，返回code
        repo.getCode(clientId).map(new Function<AuthCodeEntity, String>() {
            @Override
            public String apply(AuthCodeEntity authCodeEntity) {
                return authCodeEntity == null ? "" : authCodeEntity.getCode();
            }
        }).compose(RxUtil.<String>workMaybeScheduler()).subscribe(new Consumer<String>() {
            @Override
            public void accept(String code) {
                callback.callback(code);
            }
        }, new Consumer<Throwable>() {
            @Override
            public void accept(Throwable throwable) {
                callback.callback("");
            }
        });
    }
}

```

图片加载器实现

```java
public class DemoImageLoader implements NCGImageLoader {
    @Override
    public void showImage(Context context, ImageView view, String url) {
        Glide.with(view).load(url).into(view);
    }
}
```

  

#### 配置下载模块（可选）

若不需要云游戏提供的下载模块，则略过。否则需要用户实现该接口，示例如下：

```java
public class GameDownloadConfig implements NCGDownLoadConfig {

  public String getFileProviderAuthority() {
        return "com.netease.cg.filedownload.share.fileprovider";
    }

    public String getGameStoragePath() {
        return Environment.getExternalStorageDirectory().getPath() + File.separator + GlobalInfo.getApp().getPackageName() + File.separator + "download";
    }

    @Override
    public int getMaxParallelTask() {
        return 3;
    }

    @Override
    public Class getNotificationBarClass() {
        return null;
    }
}
```

下载模块配置接口如下：

```java
public interface NCGDownLoadConfig {

   /**
     * 获取FileProvider的Authority值,若返回为空，在7.0以上版本可能引起未知问题
     *
     * @return FileProvider的Authority值
     */
    String getFileProviderAuthority();

    /**
     * 设置下载文件存储目录
     *
     * @return 存储目录全路径
     */
    String getGameStoragePath();

    /**
     * 设置下载并行数量，若返回值小于1,则默认1；返回值过大，则取线程池最大值
     *
     * @return 返回并行任务数量
     */
    int getMaxParallelTask();

    /**
     * 自定义通知栏等类，需要提供无参构造函数以及实现接口NCGProgressNotifiable
     *
     * @return 返回自定义通知栏等类
     */
    Class getNotificationBarClass();
```


##### 自定义通知栏
在下载配置接口`NCGDownLoadConfig`的`getNotificationBarClass()`方法中，可以选择返回自定义的状态栏，如果返回null，则将采用模块自带的默认实现。

```java
public interface NCGProgressNotifiable {

    /**
     * 文件下载任务开始，通知栏开始显示进度条视图以及相应处理逻辑
     *
     * @param downloadInfo 文件的下载信息，包括下载进度，状态，游戏信息等
     */
    void notifyNotificationStart(DownloadInfo downloadInfo);

    /**
     * 下载任务进行中，通知栏更新进度条视图以及相应处理逻辑
     *
     * @param downloadInfo 文件的下载信息，包括下载进度，状态，游戏信息等
     */
    void notifyNotificationUpdate(DownloadInfo downloadInfo);

    /**
     * 文件下载任务出错，通知栏显示下载失败视图以及相应处理逻辑
     *
     * @param downloadInfo 文件的下载信息，包括下载进度，状态，游戏信息等
     */
    void notifyNotificationError(DownloadInfo downloadInfo);

    /**
     * 文件下载任务暂停，通知栏显示暂停视图以及相应处理逻辑
     *
     * @param downloadInfo 文件的下载信息，包括下载进度，状态，游戏信息等
     */
    void notifyNotificationPause(DownloadInfo downloadInfo);

    /**
     * 文件下载任务完成，通知栏显示下载完成视图以及相应处理逻辑
     *
     * @param downloadInfo 文件的下载信息，包括下载进度，状态，游戏信息等
     */
    void notifyNotificationComplete(DownloadInfo downloadInfo);

    /**
     * 取消通知栏显示操作
     */
    void notifyNotificationCancel();
}
```


#### 游戏中心接口互调模块
##### 1、游戏中心Js调用`Native`方法
- 实现`NCGJSCall`接口，目的是游戏中心调用`Native`方法

```java
public interface NCGJSCall {
    /**
     * 开始下载游戏
     *
     * @param gameInfo 游戏基本信息
     */
    void onStartDownloadGame(NCGGameInfo gameInfo);

    /**
     * 暂停游戏下载
     *
     * @param gameInfo 游戏基本信息
     */
    void onPauseDownloadGame(NCGGameInfo gameInfo);

    /**
     * 开始安装游戏
     *
     * @param gameInfo 游戏基础信息
     */
    void onInstallGame(NCGGameInfo gameInfo);

    /**
     * 打开已经安装的游戏
     *
     * @param gameInfo 游戏基础信息
     */
    void onOpenGame(NCGGameInfo gameInfo);

    /**
     * 设置UI界面标题
     *
     * @param title 标题信息，来源于前端数据
     */
    void onSetPageTitle(String title);

    /**
     * 在浏览器中打开指定url地址
     *
     * @param url 跳转链接地址
     * @return true：已处理  false：未处理，执行前端默认处理逻辑
     */
    boolean onOpenURL(String url);

    /**
     * 打开游戏中心提供的视频源数据
     *
     * @param url   数据源地址
     * @param title 视频标题信息，可以传空值
     * @return true：已处理  false：未处理，执行前端默认处理逻辑
     */
    boolean onOpenVideo(String url, String title);

    /**
     * 打开指定图片数组
     *
     * @param urls    图片地址数组
     * @param current 需要打开指定图片在数组中的索引
     * @return true：已处理  false：未处理，执行前端默认处理逻辑
     */
    boolean onOpenImages(String[] urls, int current);

    /**
     * 查询游戏的状态，如下载、安装、更新状态等等
     *
     * @param gameInfo 游戏信息
     */
    NCGGameStatusInfo onGetGameStatusInfo(NCGGameInfo gameInfo);
    
    /**
     * 从游戏中心界面发起内容分析，调用native接口
     *
     * @param content 分享的内容
     * @param cb      分享结果异步回调到前端
     */
    void onShare(NCGShareContent content, NCGCallback<NCGShareResult> cb);
}
```
  例如示例App中的实现类`NCGJSCallImpl`

```java
public class NCGJSCallImpl implements NCGJSCall {

    private Context mContext;

    public NCGJSCallImpl(Context context) {
        mContext = context;
    }

    public void onStartDownloadGame(NCGGameInfo gameInfo) {
        BaseMultiDownloader.getInstance().downloadSchedule(gameInfo);
    }

    public void onPauseDownloadGame(NCGGameInfo gameInfo) {
        BaseMultiDownloader.getInstance().pauseDownload(gameInfo);
    }
    ......
    ......
}
```


- 在`WebView`所在`UI`界面注册接口

```java
public class WebViewActivity extends AppCompatActivity {
 @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_web_view);
        ......
        //注册游戏中心相关方法调用回调
        NCGCenter.get().getBridgeManager().registerNCGJSCall(new NCGJSCallImpl(this), webView);
    }
    ......
}
```

##### 2、Native方法调用前端Js方法

首先需要通过`NCGCenter.get().getBridgeManager()`方法获取`NCGJSBridgeManager`对象，然后调用对应方法，目前定义的方法如下。
    
```java
    /**
     * 通知app主题改变
     */
    public void notifyThemeChange(){...}
    
    /**
     * 通知游戏中心所在UI界面暂停状态
     */
    public void notifyUIPause() {...}

    /**
     * 通知游戏中心所在UI界面暂停状态
     */
    public void notifyUIPause() {...}
    
    /**
     * 通知游戏中心所在UI揭界面重新恢复
     */
    public void notifyUIResume() {...}
    
    /**
     * webview所在界面销毁时调用
     */
    public void notifyUIDestroy(){...}
    
    /**
     * 更新游戏状态以及进度条（若在下载中）
     * webview可见时，通知前端更新下载状态；webview不可见时，无需调用
     *
     * @param gameId 游戏id
     * @param status 游戏状态
     * @param progress 下载进度条
     */
     
    public void updateGameStatusInfo(String gameId, NCGGameStatusInfo.GameStatus status, int progress) {...}
    
     /**
     * 更新游戏状态
     * webview可见时，通知前端更新下载状态；webview不可见时，无需调用
     *
     * @param gameId 游戏id
     * @param status 游戏状态
     */
    public void updateGameStatusInfo(String gameId, NCGGameStatusInfo.GameStatus status)
  
```

其中，游戏状态定义如下

```java
public enum GameStatus {

    /**
     * 未下载且未安装
     */
    GameUnInstalledStatus(0),
    /**
     * 已安装
     */
    GameInstalledStatus(1),
    /**
     * 正在下载中
     */
    GameDownloadingStatus(2),
    /**
     * 下载完成
     */
    GameDownloadedStatus(3),
    /**
     * 正在安装
     */
    GameInstallingStatus(4),
    /**
     * 有更新包
     */
    GameHasNewUpdateStatus(5),

    /**
     * 下载暂停
     */
    GameDownloadPauseStatus(201),
    /**
     * 下载失败
     */
    GameDownloadFailedStatus(202);
    ...
    }
```

#### 其他注意事项
* 游戏中心不包含导航条，因此，Webview的页面的管理需要app自己负责，比如返回上一个界面，可以复写`onBackPressed()`等；
* 在某些场景下需要通过Webview打开包含云游戏域名的H5页面，且界面有交互操作，都要通过`public void registerNCGJSCall(NCGJSCall call, WebView webView)`方法进行注入，不然无法进行交互通信。

### 集成

```groovy
repositories {
   
    Release稳定版本
    maven {
        url "http://mvn.hz.netease.com/artifactory/libs-releases/"
    }
}
```

```groovy
implementation 'com.netease.cloudgame:center-sdk:1.3.3'

//下载模块要求center-sdk版本是1.3.x及以上
implementation 'com.netease.cloudgame:filedownload-sdk:1.2.2' 

```

### 混淆

```
-keep class com.netease.cg.** { *; }
-dontwarn com.netease.cg.**
```
