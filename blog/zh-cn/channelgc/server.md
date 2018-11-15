# 云游戏渠道应用接入文档
## 文档版本更新记录
编号|修改描述|修订日期|版本号|修订人
----|-----|-----|-----|-----
1|创建文档|20180427|1.0|胡世长
2|修改文档，加入自动同步注册和红点同步及游戏中心的免登|20180522|1.1|胡世长 
3|修改文档，同步bima-oauth2的所有接口|20181011|1.2|何慧

## 渠道应用授权登陆流程及接入注意事项
### 下载
[Demo](http://nosdn-yx.127.net/yxgame/8a49e813671570e601671588cd5f0002.zip)

### 授权流程图
![授权流程图](http://nosdn-yx.127.net/yxgame/417bf23c05f64116b0ed079e2a616ddc.png)

### 角色说明

* `GAME`:接入云游戏的游戏方(例如第五人格)
* `WebView`: 接入渠道方的游戏中心Webview

	`GAME`与`Webview`都属于游戏中心的子应用
* `App`:接入云游戏的渠道方的App
* `AppServer`:接入云游戏的渠道方的Server
* `GameCenterServer`:云游戏的服务端

### oauth流程中的术语说明
* `appid`:接入授权的一个企业或者接入方
* `appSecret`:接入授权的接入方获取的appId对应的secret
* `clientId`:接入方在`appId`下生成的子应用
* `clientSecret`:接入方在`appId`下生成的子应用的secret
* `openId`:接入方在`appId`下的用户标识，关于`appId`唯一
* `code`:oauth第一步需要先获取一个过期时间较短的临时授权码，如微信是5分钟
* `accessToken`:oauth授权成功后拿到的用来鉴权的token信息，关于`clientId`和系统的`userId`唯一

### 接入重要注意事项

1. 接入并开启渠道授权后，需要第一时间联系运营在后台进行配置以下内容
	* `oauthAppId`和`oauthAppSecret`:渠道方分配给云游戏进行Oauth接入分配的`appId`和`secret`, 后续所有给云游戏分配的`clientId`都需要在这个`appId`的维度下，即同一用户使用同一个`appId`下不同的`clientId`授权，获取的`openId`是相同的。注意**<font color=red>这很关键</font>**，否则不同游戏映射出来的账号是不同的
	* `webClientId`和`webClientSecret`:渠道方在上方`oauthAppId`下给云游戏中心webview分配的`clientId`，在渠道的App内也会用到，渠道App进入游戏中心的时候需要获取code并作为参数附到链接后，后文会提到。
	* 提供的自动注册`ClientId`的接口，需要保证在前面的`oauthAppId`维度下进行。
	* 授权流程中的`code`换完一次`accessToken`后需要失效
	* 生成`accessToken`时，需要同时关联`clientId`与`userId`两个维度，即同一个用户在不同的`clientId`下获取到的`accessToken`是不同，并可以同时存在和使用，互不影响
	* 按照后文的各个必须的服务端接口，到后台配置接口url

## 服务端接口说明
**<font color=red>必须严格按照接口定义实现并将URL配置到后台</font>**

### 通用请求参数及签名
|参数|说明|
|:----|:----|
|appid|接入应用id|
|timestamp|unix时间戳(ms)|
|sign|签名|

#### 签名算法
1. 将url路径中的参数对，以参数名按字母序排列(不包含sign参数本身)
2. 排好的顺序基础上，将对应的参数值进行拼接(没有拼接符)
3. 将签名密钥（从后台拿到的GameCenterServer生成的私钥appSecret)加在拼接好的字符串头部
4. 对字符串进行sha1签名
5. 将sign参数加到url

##### 示例 
```
appsecret=key
appid=av
timestamp=1512970730186
p1=b1
p2=a2

CheckSum=sha1hex(keyavb1a21512970730186)=9040814fffef8b6367c71ff1748d4af56437308e 
```
* 有特别说明不需要携带签名的API,按接口说明要求调用即可。
* 没有特别说明不需要签名校验的均需要携带以下参数
	* appid
	* timestamp
	* sign

### 1、GameCenterServer自动向AppServer注册Game
   
`
/api/v1/oauth2/app/client/add
`

* 提供方:AppServer
* 调用方:GameCenterServer
* 请求方式:`POST`
* header:`content-type:application/json`
* 请求参数格式:`json`
* 返回数据格式:`json`
* 此接口不需要签名

#### 请求参数说明
参数|说明|类型(字符长度)|是否必须
----|-----|-----|-----|-----
appId|分配的oauthAppId,所有云游戏ClientId及webClientid属于这个oauthAppId|String|是
appSecret|分配oauthAppSecret|String|是
 
#### 请求示例

```
{
    "appId":"defte234213434354534",
    "appSecret":"12335435646546fdgser"
}
```
#### 返回数据说明
参数|说明|类型(字符长度)|是否必须
----|-----|-----|-----
code|返回码，成功code是200，失败是除成功200以外的值|int|是
msg|提示信息，成功是ok，失败是具体的错误提示|String|是
result|返回数据，正确的情况下包括clientId和clientSecret字段|Object|是
clientId|oauth分配的clientId|String|是 
clientSecret|oauth分配的clientSecret|String|是

#### 返回示例
``` 
{
    "code":"200",
    "msg":"ok",
    "result":{
    	"clientId":"123dsfweari2u34298fjedeiwj",
	  "clientSecret":"defefikjsdknv9e2934jife=="
    }
}
```

### 2、GameCenterServer同步红点给AppServer

`/api/v1/open/redDot/config`

* 提供方:AppServer
* 调用方:GameCenterServer
* 请求方式:`POST`
* header:`content-type:application/json`
* 请求参数格式:`json`
* 返回数据格式:`json`

#### 请求路径参数
参数|说明|类型(字符长度)|是否必须
----|-----|-----|-----
| appid | 应用id  | String  | 是 |
| timestamp | 时间戳  | Long  | 是  |
| sign | 签名，签名校验方式见签名算法 | String  | 是 |

#### 请求参数说明
参数|说明|类型(字符长度)|是否必须
----|-----|-----|-----
redDotSwitch|红点开关，true表示开启不开启就就不显示红点数据|boolean|是
os|操作系统，android和ios|String|是
context|红点文案|String|是
icon|红点图片|String|是
effectiveTime|有效开始时间|Long|是
expirationTime|有效结束时间|Long|是	
 
#### 请求示例

```
https://xxxxxxx/api/v1/oauth2/user/info?appid=APPID&timestamp=TIMESTAMP
```
```
{
    "redDotSwitch":true,
    "os":"ios",
    "context":"有一个新游戏",
    "icon":"http://一个图片.png",
    "effectiveTime":1538211191233,
    "expirationTime":1538211191233
}
```

#### 返回数据说明
参数|说明|类型(字符长度)|是否必须
----|-----|-----|-----
code|返回码，成功code是200，失败是除成功200以外的值|int|是
msg|提示信息，成功是ok，失败是具体的错误提示|String|是

#### 请求示例

``` 
{
    "code":"200",
    "msg":"ok"
}
```

### 3、请求code
`/api/v1/oauth2/code`

游戏中心WebView/Game 使用AppServer发放的appid请求对应的临时code.

* 提供方:AppServer
* 调用方:App客户端应用
* 请求方式:`GET`
* 返回数据格式:`json`

注意，如果是 Web 应用对应的 redirect_uri 有对应的域名限制（需要实现），必须跳转到后台登记的域名下的 url 地址。

#### 参数说明

##### Url参数
参数|说明|类型(字符长度)|是否必须
----|-----|-----|-----
| appid | biamServer应用id  | String  | 是 |
| timestamp | 时间戳  | Long  | 是  |
| sign | 签名，签名校验方式见签名算法 | String  | 是 |
| userId | 用户id | String  | 是 |

##### Body请求参数

参数|说明|类型(字符长度)|是否必须
----|-----|-----|-----
| appid | 第三方应用id  | String  | 是 |
| clientId | 子应用唯一标识，在开放平台提交子应用审核通过后获得 | String | 如果不存在子应用，则不需要|
| userId	|	用户id|String|是
| redirect_uri	|	请使用urlEncode对链接进行处理|String|否
| state	|	用于保持请求和回调的状态，授权请求后原样带回给第三方。该参数可用于防止csrf攻击（跨站请求伪造攻击），建议第三方带上该参数，可设置为简单的随机数session进行校验 | String | 否

 
#### 请求示例
```
curl -XPOST -H "Content-Type:application/json" 'xxx.xxx.com/api/v1/oauth2/code?appid=APP_ID&sign=SIGN&timestamp=TIME_STAMP&userId=USER_ID' -d '
 { 
  "userId": "USER_ID",
  "appId":"APP_ID",
  "clientId":"CLIENT_ID"
}'
```

#### 返回说明
参数|说明|类型(字符长度)|是否必须
----|-----|-----|-----
code|返回码，成功code是200，失败是除成功200以外的值|int|是
msg|提示信息，成功是ok，失败是具体的错误提示|String|是
result|返回数据，正确的情况下包括clientId和clientSecret字段|Object|是
openId|oauth分配的openId|String|是 
code|oauth分配的授权码|String|是
expireInMs|code的过期时间,ms|long|是

#### 返回示例
```
{
  "code": 10000,
  "msg": "ok",
  "result": {
    "openId": "65806",
    "code": "PfmXFUu1Ug",
    "expireInMs": 59312
  }
}
```

### 4、Code换取Token

`/api/v1/oauth2/access_token`

* 提供方:AppServer
* 调用方:GameCenterServer
* 请求方式:`GET`
* 返回数据格式:`json`

#### 参数说明

参数|说明|类型(字符长度)|是否必须
----|-----|-----|-----
| appid | 应用id  | String  | 是 |
| timestamp | 时间戳  | Long  | 是  |
| sign | 签名，签名校验方式见签名算法 | String  | 是 |
| code   | 授权流程中获得的临时授权码   | String | 是 |
| clientId | 子应用唯一标识，在开放平台提交子应用审核通过后获得 | String | 如果不存在子应用，则不需要|

#### 请求示例

```
https://xxxxxxx/api/v1/oauth2/access_token?appid=APPID&timestamp=TIMESTAMP&sign=SIGN&code=CODE&clientId=CLIENT_ID
```

#### 返回数据

| 参数         | 说明                                                                     | 类型(字符长度) | 是否必须 |
| ------------ | ------------------------------------------------------------------------ | -------------- | -------- |
| code         | 返回码，成功code是200，失败是除成功200以外的值                           | int            | 是       |
| msg          | 提示信息，成功是ok，失败是具体的错误提示                                 | String         | 是       |
| result       | 返回数据，包含accessToken,openId,expireIn,refreshToken                   | Object         | 是       |
| accessToken  | 授权流程返回的accessToken                                                | String         | 是       |
| openId       | 登陆用户的openId                                                         | String         | 是       |
| expireInMs    | accessToken的过期时间，单位毫秒                                          | Long           | 是       |
| refreshToken | accessToken过期后重新获取accessToken用(可以不实现刷新，具体看app方决定） | String         | 否       |

示例

```json
{
    "code":"200",
    "msg":"ok",
    "result":{
        "accessToken":"er8i9ryu283ifikfrjifiu",
        "openId":"deofi3ihjukfeiewfeofkj==",
        "expireInMs":6000000, // 单位秒
        "refreshToken":"de92378483ufh438yruhjf"
    }
}
```

注意：用于区分用户的 `openId` 并不是 `userId` ，请不要针对此使用。相见混淆 `userId` 章节。

### 5、通过Token获取用户信息

`/api/v1/oauth2/user/info`

* 提供方:AppServer
* 调用方:GameCenterServer
* 请求方式:`GET`
* 请求参数格式:`url parameter`
* 返回数据格式:`json`

##### 参数说明
| 参数         | 说明                          | 类型(字符长度) | 是否必须 |
| ------------ | ----------------------------- | -------------- | -------- |
| appid | 应用id  | String  | 是 |
| timestamp | 时间戳  | Long  | 是  |
| sign | 签名，签名校验方式见签名算法 | String  | 是 |
| accessToken  | code换取到的accessToken       | String         | 是       |

#### 请求示例
```
https://xxxxxxx/api/v1/oauth2/user/info?appid=APPID&timestamp=TIMESTAMP&sign=SIGN&accessToken=TOKEN
```

#### 数据说明

注意：根据渠道的用户模型来定义

| 参数      | 说明                                                   | 类型(字符长度) | 是否必须 |
| --------- | ------------------------------------------------------ | -------------- | -------- |
| code      | 返回码，成功code是200，失败是除成功200以外的值         | int            | 是       |
| msg       | 提示信息，成功是ok，失败是具体的错误提示               | String         | 是       |
| result    | 返回数据，包含accessToken,openId,expireIn,refreshToken | Object         | 是       |
| openId    | 授权流程中的openId,同一个oauthAppId下是相同的          | String         | 是       |
| nickname  | 用户昵称                                               | String         | 是       |
| avatarUrl | 头像                                                   | String         | 是       |
| mobile    | 手机号码，如有请提供，方便运营联系用户处理问题         | String         | 否       |
| gender    | 性别,未知0，男1，女2，如有请提供，方便做精细化运营     | Integer        | 否       |
| age       | 年龄，如有请提供，方便做精细化运营                     | Integer        | 否       |
| region    | 地区,包含省市，如有请提供，方便做精细化运营            | String         | 否       |


示例

```
{
    "code":"200",
    "msg":"ok",
    "result":{
        "openId":"deofi3ihjukfeiewfeofkj==",
        "mobile":"13812345678",
        "nickname":"昵称",
        "avatarUrl":"http://一个头像图片.png",
        "gender":1,
        "age":28,
        "region":"浙江省杭州市"
    }
}
```

### 客户端接入Webview
* 接入链接:http://open.game.163.com/dp-sdk/webview
* 提供方:GameCenterServer
* 调用者:App
* 注意事项:如App是登陆状态，任何进入游戏中心的入口，包括此入口和以后可能跳转的其他入口，都需要在链接上拼接`code`，如`http://open.game.163.com/dp-sdk/webview?code=deiudei928398`

### 附录
#### 生成和验证签名

把得到的参数添加到Map中，示例：

```
long timestamp = System.currentTimeMillis();
Map<String, String> params = new HashMap<>();
params.put("accessToken", accessToken);
params.put("timestamp",String.valueOf(timestamp));
params.put("appid", appId);
String sign = genSign(params, appSecret);
//使用计算得到的signature与参数中的signature进行相等比较
```

生成签名方法，示例：

```
/**
 * 生成签名信息
 * 
 * @param secretKey 游戏中心在渠道的appSecret
 *            
 * @param params
 *            接口请求参数名和参数值map，不包括signature参数名
 * @return
 */
public static String genSign(Map<String, String> paramsMap, String keySecret) {
		TreeMap<String, String> params = genAllParams(paramsMap);
		StringBuilder sb = new StringBuilder();
		sb.append(keySecret);
		for (Map.Entry<String, String> entry : params.entrySet()) {
			sb.append(entry.getValue());
		}
		return DigestUtils.sha1Hex(sb.toString());
	}

	private static TreeMap<String, String> genAllParams(Map<String, String> paramsMap) {
		TreeMap<String, String> params = new TreeMap<>();
		for (String key : paramsMap.keySet()) {
			String value = paramsMap.get(key);
			params.put(key, value);
		}
		return params;
	}
```


