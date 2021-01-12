[important]: http://nosdn-yx.127.net/yxgame/d90c6c4f9c6d4f668739eb8f40b34e4a.png

# 云游戏服务端接入文档
## 0.版本变更记录
修订内容描述|修订日期|版本号
-----|-----|-----
创建文档|20140130|1.0
去掉goodscount参数|20140221|1.1
重构文档|20140226|1.2
增加手机话费支付更新商品信息说明。|20140311|1.3
增加Android客户端集成支付SDK|20140312|1.4
修改Android客户端集成支付SDK说明|20150527|1.5
增加文字描述|20150909|1.6
更新银联SDK|20150916|1.7
新增网易支付SDK|20160504|1.8
新增微信支付SDK|20160605|1.9
更新网易支付SDK|20160711|2.0
添加透传机制|20161226|2.1
增加获取用户信息接口|20170915|2.2
增加支付流程角色说明|20170917|2.3
梳理异常和签名错误FAQ|20171010|2.4
文档markdown，删除无用信息|20180813|2.5
支付流程变更 | 20210104|  3.0

## 1.支付流程
### 1.1 支付中各角色交互说明
![支付中各角色交互说明](https://nosdn-yx.127.net/yxgame/067e22fdee9d2839b24efd1b99bfbd87.jpg)

**参与支付流程交互的角色有：**

+ **游戏APP（以下也称第三方App）**：需要集成易信游戏SDK
	- 调用游戏Server接口生成订单
	- 调用SDK接口进行支付
+ **游戏Server（以下也称第三方服务器）**：
	- 负责生成订单，并将订单信息持久化到第三方服务器
	- 负责接收易信游戏Server支付回调，处理发货逻辑
+ **易信游戏Server（以下也称PayServer）**
	- 根据游戏Server订单，生成订单信息（Trade信息），返回给游戏App
	- 接收支付工具Server（如支付宝、微信等）的回调，并回调游戏Server接口


从上面的描述中，第三方游戏接入易信游戏仅需要关心以下部分流程:

1.	游戏App向游戏Server发起生成订单
1.	游戏App调用易信游戏SDK接口发起支付
1.	游戏Server接收易信游戏Server异步支付成功回调

### 1.2 完整交易流程
![](https://nosdn-yx.127.net/yxgame/9f90aedb103cdde8459dcd908662b138.jpg)

**流程说明**

由流程图可知

1. `第三方APP`负责调用`第三方Server``生成订单1.1`，并处理返回值、调用支付接口。用户支付完成后，`SDK`回调`接口返回支付结果2.7`给`第三方APP`
1. `第三方Server`负责生成订单，并将订单信息持久化到数据库。
1. `第三方Server`负责处理支付通知，并对支付成功的订单进行发货、更改数据库状态，在支付成功后，`PayServer`通过`异步发送支付通知4.1`通知`第三方Server`发货，`第三方Server`自行进行发货。

**<code>流程注意点</code>**

1. 调用支付接口时都![][important]`必须`![][important]传递用户的access_token，用于提取用户名、验证。
1. ![][important]`任一步`![][important]都可能中断，要保证最终数据的一致性、正确。比如悬挂订单最终要超时。
1. ![][important]`任一步`![][important]都要签名，防篡改、欺骗、重放。
1. ![][important]`任一步`![][important]都有可能多次重复调用，被调用者负责去重。

## 2.服务端接口
服务器端接口包括`第三方Server`、`PayServer`提供给对方和Android客户端的接口。主要包括订单生成、支付通知两类接口。考虑到安全性，除了用户输入、UI交互接口需要在Android端完成，其他跟支付有关的接口必须在服务器端进行调用。签名由服务器端进行，公钥不要暴露在Android端。
### 2.1 接口约定
#### 2.1.1 订单信息持久化
`第三方Server`需要对订单信息包括订单id、支付状态、各类时间戳等信息、接口参数使用数据库进行持久化用来对账。
#### 2.1.2 支付通知并发
支付完成后`Payserver`调用`第三方Server`接口通知发货，相同订单支付通知接口可能被调用多次，需要去重并避免重复发货等问题。如更新数据库时可以使用类似的SQL:

```sql
update Trade set PayState=Payed where PayState=UnPay and Id=?;
```

#### 2.1.3 两个公钥，一个私钥![][important]`很重要`![][important]
易信游戏需要两个公钥一个私钥。请`谨记`括号里面的名字。

1. 游戏方接入方公钥及私钥请联系贵方商务或运营从开发者后台获取。(以下称![][important]`游戏方公钥`![][important]或![][important]`游戏方私钥`![][important])
![游戏方接入方公私钥获取](http://nosdn-yx.127.net/yxgame/0be8e326369a4f64a44b03c193faf243.jpg)
1. 平台公钥(以下称![][important]`平台公钥`![][important])

```
30819f300d06092a864886f70d010101050003818d0030818902818100ac1b8d63bcaf49cdd0d1e79c916aba0250421b3ee8eaf134f80843c5033e30a150b9e26e78025fde8e52538d4beb572940966b0c80460d90a26c9119a0d28c4277024dbeb20e31403360aeca70da506a19d89e95512e5347be0eae9b2c49da3150a93e3bc80817fa9a1d8170555e6117c86f84f13afc39944fb6bdfc85e3723b0203010001
```

#### <h4 id='sign'>2.1.4 签名校验及参数值编码</h4>
![][important]`非常重要`![][important]绝大部分平台接入失败都卡在签名这一步，请仔细阅读下面各点。

##### 2.1.4.1 注意点
1. 拼接在请求URL上的参数，需要进行URLEncode, 如`String param = URLEncoder.encode("2014-01-01 12:12:12", "UTF-8");`, 输出为`2014-01-01+12%3A12%3A12`
1. `第三方Server`接收`PayServer`的支付通知回调接口的`sign签名`字段操作
	+ 将参与签名的参数进行`字符串拼接` (参与签名计算的参数会在每个接口中进行说明)
	+ ![][important]`需要、需要、需要`![][important]进行`URLEncode`
	+ 使用`Android Demo`工程的类`im.yixin.game.demo.rsa.RSA`中的`RSA.verify()`接口和![][important]`平台公钥`![][important]以及上述拼接字符串验证`sign`参数是否正确，正确再执行业务逻辑
##### 2.1.4.2 生成和验证签名Java Demo
[在线验证签名](https://163yungame.github.io/zh-cn/util/index.html)

* 生成签名流程
```java
// 生成签名 需要哪些参数请仔细看每个接口的说明
StringBuilder signSrcSb = new StringBuilder();
signSrcSb.append(v);
signSrcSb.append(thirdpart_orderid);
signSrcSb.append(thirdpart_ordertime);
signSrcSb.append(tradeName);
signSrcSb.append(access_token);
// 如果goodscount为1或不传则不需要添加此项
if (goodscount > 1L) {
    signSrcSb.append(goodscount);
}
// 需不需要Encode，参考每个接口的说明，每个都不一样，请仔细看，不需要的话直接用
// String signSrc = signSrcSb.toString(); 即可
String signSrc = URLEncoder.encode(signSrcSb.toString(), "UTF-8");
// 注意看接口说明，一般情况生成签名用privateKey，验证签名用publicKey
PrivateKey privateKey = RSA.getPrivateKey("游戏方私钥");
String sign = RSA.sign(privateKey, signSrc);
```
* 验证签名流程
```java
// 验证签名 具体需要拼接哪些参数，请查看后续接口文档
StringBuilder signSrcSb4Ret = new StringBuilder();
signSrcSb4Ret.append(retMap.get("v"));
signSrcSb4Ret.append(retMap.get("thirdpart_orderid"));
signSrcSb4Ret.append(retMap.get("thirdpart_ordertime"));
signSrcSb4Ret.append(retMap.get("result"));
signSrcSb4Ret.append(retMap.get("trade_serialid"));
signSrcSb4Ret.append(retMap.get("goodsprice"));
signSrcSb4Ret.append(retMap.get("goodsamount"));
signSrcSb4Ret.append(retMap.get("pay_url"));
if (goodscount > 1L) {
    signSrcSb4Ret.append(goodscount);
}
//
PublicKey publicKey = RSA.getPublicKey("平台公钥")
// signSrcSb4Ret.toString() 查看接口文档决定此处是否需要URLEncode
// 验证失败则抛出异常
RSA.verify(publicKey, sign, signSrcSb4Ret.toString());
```


### 2.2 返回异常说明
异常码|说明|用户页面提示文案
-----|-----|-----
-1|服务器内部异常。未知异常，或无需详细说明的一般性异常。|支付请求失败，请重试
-2|登陆账号异常|账号登录失败，请重试
-3|生成签名失败|生成签名失败，请重试
-4|验证签名失败|验证签名失败，请重试
-5|商品不存在|商品不存在，请重试
-6|订单不存在|订单不存在，请重试
-7|支付方式错误|支付方式错误，请重试
-8|参数非法|参数非法
-9|支付超时|支付超时，请重新支付
-10|更新支付类型失败(已经有支付类型或者已经支付)|更新支付类型失败
-31|第三方订单号重复|订单重复
-51|支付工具通知的支付状态非法|无效订单
-101|服务器内部错误，数据库异常|支付数据请求失败，请重试
-1001|渠道游戏的状态为停用，无法下单|无效订单


### 2.3 PayServer异步支付通知
本接口为流程图中的`异步发送支付通知 4.1`接口。Android页面通知可能因为网络故障导致通知失败，需要`PayServer`多次异步通知来保证通知到`第三方Server`。

1. `第三方Server`可以将此接口和Android页面通知接口在同一个接口中合并处理，此接口增加了`notifyid`、`notifytime`两个参数，并且`from`值不一样。
1. `第三方Server`需要去重，可能会重复通知，避免多次发货
1. 当`第三方Server`响应`success`字符串时，`PayServer`停止异步通知，否则按如下时间间隔不断通知直到收到`success`：40秒、2分钟、5分钟、10分钟、30分钟、1小时、2小时、6小时、15小时，超过以上时间后，即使没接收到`success`也不再通知。

#### 2.3.1 接口定义
+ URL: `第三方Server`定义并填写到开发者后台的对应游戏配置中
+ 提供方: `第三方Server`
+ 调用方: `PayServer`
+ 请求方式: `POST`

#### 2.3.2 请求参数
![][important]`拼接在URL中`![][important]

参数|参数名称(FulfillWithEngCharacter)|参数说明|类型(字符长度)
-----|-----|-----|-----
v|接口版本号||String
thirdpart_orderid|第三方唯一订单id||String
thirdpart_ordertime|第三方订单下单时间||String
tradeName|商品名称||String
result|返回结果|正常0、异常时返回异常号。返回异常时其他字段可能不返回。|int
trade_serialid|支付平台订单序列号||String
goodsprice|商品单价|单位元，精确到分，如0.01元|String
goodsamount|支付金额|单位元，精确到分，如0.01元|String
paystatus|支付结果|支付状态：0未支付1已支付成功2关闭。result返回0时才有此字段。|int
paytime|付款时间||long
paytooltype|支付工具类型||int
notifyid|通知内部id|用于校验|long
notifytime|通知时间戳||long
from|来源参数|值固定为`backend`|String
sign|签名|请先阅读[2.1.4 签名校验及参数值编码](#sign),参与签名的参数![][important]严格![][important]依照以下顺序，中间的`+`表示前后字符串直接拼接，不要把`+`加到字符串中，拼接后![][important]`需要URLEncode`![][important], `v+thirdpart_orderid+thirdpart_ordertime+tradeName+result+trade_serialid+goodsprice+goodsamount+paystatus+paytime+paytooltype+notifyid+notifytime+from`,使用![][important]`平台公钥`![][important]进行签名验证计算|String
#### 2.3.3 返回值
成功处理则返回`success`这7个字符，失败返回`fail`。
### 2.4 获取用户信息
获取用户信息，校验access_token有效性, 本接口无签名校验
#### 2.4.1 接口定义
+ URL: `https://open.game.163.com/api/user/info`
+ 提供方: `PayServer`
+ 调用方: `第三方Server`
+ 请求方式: `GET`

#### 2.4.2 请求参数
拼接在URL中

参数|参数名称(FulfillWithEngCharacter)|参数说明|类型(字符长度)
-----|-----|-----|-----
access_token|token值|从客户端获取的token值|String

#### 2.4.3 返回值
+ 返回值格式: `JSON`
+ 异常返回格式: `非1`的`code`值都是异常返回，`code`一定有，`errorMsg`可能没有

```json
{
	"code": 400,
	"errorMsg": "access_token is illegal,oauthUserApp is empty"
}
```
+ 正常返回时，`code`值为`1`

参数|参数名称(FulfillWithEngCharacter)|参数说明|类型
-----|-----|-----|-----
code|响应码|响应码，1为正确，其他都是异常|int
userinfo|用户信息|code为1时有|Object
accountId|支付方用户账号|包含在userinfo内，支付方用户账号|String
nick|用户昵称|包含在userinfo内，用户昵称|String
icon|用户头像|包含在userinfo内，用户头像|String
registerUser|为用户是否在支付方已经实名认证|包含在userinfo内，是否在支付方已经实名认证|boolean
示例

```json
{
	"userinfo": {
		"accountId": "7a950a752ca8bef6",
		"nick": "yazhitest",
		"icon": "http://nos.netease.com/yixinpublic/pr_tp8qsfuk8xlsyhj98qooeq==_1422263772_13102",
		"registerUser": true
	},
	"code": 1
}
```
