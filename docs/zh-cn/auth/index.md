# 接入指引
##### 防沉迷系统需要游戏方服务器对接本渠道服务器。
![实名认证接入说明](http://res.yixinyouxi.cn/yxgame/d97c2defabad4f81a6571f745ee7e38f1583742624.jpg)
##### 使用场景：本渠道会在用户登录完成后强制未实名用户进行实名信息注册。游戏方可以不定时调用本渠道接口查询认证信息，并根据业务需求进行防沉迷系统处理。
备注：sdk5.3.2版本及以上接入了中宣部的实名认证，实名信息的查询接口发生了变更，返回参数中新增了中宣部的pi值
## 实名认证接入文档

<font color=red>5.3.2及以上的请求地址</font>
```json
 http://yixingame.cn/sdk/user/center/info
``` 

#### 请求方式
GET
#### 输入参数说明
| 参数            | 描述                                             | 是否必须           | 类型           |                                  
| -------------- | ------------------------------------------------ | --------------    |-------------- |
| sdkUid         | 渠道账号唯一标识                                   |   是                  |String      |
| timestamp      | 当前时间戳（毫秒为单位） 5分钟有效                   |   是                  |Long        |
| nonce          | 请求唯一值 使用uuid                                |   是                  |String      |
| signature      | 参数摘要                                          |   是                   |String     |
| gameId         | 游戏id号                                          |   是                   |String     |

#### 返回数据

| 返回值            | 描述                                             |                                      
| -------------- | ------------------------------------------------ |
| code         | 返回状态 200 请求成功                                  | 
| msg      | 返回状态描述                  |  
| result.verify_status      | 验证结果 1-未验证 2-验证通过                                          |   
| result .id         | 证件号码                                          |   
| result.age         | 年龄                                          |   
| result.birthday        | 出生日期                                          |   
| result.realName        | 姓名                                          |   
| result.pi | 中宣部pi值  |

#### 返回示例
```json
{    
  "code": 200,
  "msg": "请求成功",
  "result": {
     "verify_status":2,
     "id":"30230103021",
     "age":19,
     "realName":"张三",
     "birthday":"20010102",
     "pi":"1he722ny7qg3rx1y5r7wakpwl6m9uz43z1a8ba"
  }
}
```
#### 异常示例
```json
{    
  "code":401,
  "msg":"参数错误" 
}
```


#### code码状态
| code码            | 描述                                             |                                      
| -------------- | ------------------------------------------------ |
| 200         | 返回成功                                  | 
| 401      | 参数错误，检查各个参数是否正确                  |  
| 403          | 禁止操作                               |   
| 500      | 服务器异常                                         |   

##### 提醒:

1. 游戏方必须保存用户的标识字段

2. gameId和secretKey必须配套使用

3. timestamp是以毫秒为单位的13位时间戳

4. 开发者最好在状态码为401、403状态下，服务宕机情况下，默认设置为通过，并根据实际情况设定相关的预警机制。
具体问题请咨询行者之地平台。


## 附录
生成signature签名，示例:

签名所需参数

secretKey: 对应开发者后台的gameSecret

timestamp: 当前时间戳（毫秒为单位）

nonce: 请求唯一标识

sdkuid: 渠道账号唯一标识

```java
public static String genSign(String sdkuid, String secretKey) { 
    String nonce = UUIDUtils.createId();
    long timestamp = System.currentTimeMillis(); 
    StringBuilder params = new StringBuilder(sdkuid);   
    params.append(timestamp);  
    params.append(nonce);  
    params.append(secretKey);   
    String md5Hex = DigestUtils.md5Hex(params.toString().getBytes(StandardCharsets.UTF_8)); 
    return md5Hex；
}
```


