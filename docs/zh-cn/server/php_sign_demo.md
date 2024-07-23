# php 签名示例
```php
<?php

	$gameid = "";
	//网易云后台私钥
	$privateKey = "";

	//服务器接入文档上的支付平台公钥
	$publicKey = "";

	//订单数据
	$order = Array(
	    'v' => 13,
	    'thirdpart_orderid' => 123456,
	    'thirdpart_ordertime' => '2018-05-16 14:31:53',
	    'tradeName' => 'ProductName1',
	    'price' => 998.00,
	    'access_token' => 'f178d-fe93-4f9a-9383-19648dd',
	);
	$order['sign'] = getOrderSign($order, $privatekey);

	$url = "https://yixingame.cn/pay/games/{$gameid}/add/trades";
	$result = httpCurl($url ,$order);   // 生成订单接口
	$_rst = getVerifySign($result, $publicKey); //验证返回签名数据
	if($_rst) {
		//success 返回 trade_serialid 和 pay_url
		die('success');
	}



	//2.3.	PayServer异步通知   网易服务器通知支付结果
	$_signCheck = getVerifySign($data, $publicKey,true);
	if($_signCheck) {
		//success cp完成支付成功之后逻辑
		die('success');
	}

	// 生产签名
	function getOrderSign($data,$Key)
    {
        $sourcestr = '';
        foreach ($data as $key => $value) {
            if($key == 'price') continue;
            $sourcestr .= urlencode($value);
        }

        $devKey = base64_encode(hex2bin($Key));
        $begin_private_key = "-----BEGIN RSA PRIVATE KEY-----\n";
        $end_private_key = "-----END RSA PRIVATE KEY-----\n";

        $str = chunk_split($devKey, 64, "\n");

        $privateKey = $begin_private_key.$str.$end_private_key;

        $pkeyid = openssl_get_privatekey($privateKey);
        openssl_sign($sourcestr, $signature, $pkeyid,OPENSSL_ALGO_SHA1);
        openssl_free_key($pkeyid);
        return bin2hex($signature);
    }

    // 校验网易云签名
    function getVerifySign($data, $pubKey,$isEncode=false)
    {
        $content = '';
        foreach ($data as $key => $value) {

            if(($key == 'goodscount' && $value ==1) || $key == 'sign') continue;
            if($isEncode)
            	$content .= urlencode($value);
            else
            	$content .= $value;
        }

        $devKey = base64_encode(hex2bin($pubKey));
        $begin_public_key = "-----BEGIN PUBLIC KEY-----\n";
        $end_public_key = "-----END PUBLIC KEY-----\n";

        $str = chunk_split($devKey, 64, "\n");

        $publickey = $begin_public_key.$str.$end_public_key;

        $openssl_public_key = openssl_get_publickey($publickey);
        $ok = openssl_verify($content,hex2bin($data['sign']), $openssl_public_key, OPENSSL_ALGO_SHA1);
        openssl_free_key($openssl_public_key);
        return $ok;
    }

    //发送https请求
    function httpCurl($url, $postData = array(), $isSsl = 0,$timeout=5)
    {
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_TIMEOUT, $timeout);
        if (!empty($postData)) {
            if (is_array($postData)) {
                $data = urldecode(http_build_query($postData));
            } else {
                $data = $postData;
            }
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
            if (strpos($url, "?")) {
                $url .= "&" . $data;
            } else {
                $url .= "?" . $data;
            }
        }
        if ($isSsl > 0) {
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
        }
        $time = microtime(1);
        $result = curl_exec($ch);
        $time = microtime(1)-$time;
        if (curl_errno($ch)) {
            //错误日志
        } else {
            $res = is_array($result) ? var_export($result, true) : $result;
        }
        curl_close($ch);
        return $result;
    }
?>
```
