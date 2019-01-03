import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import 'whatwg-fetch'; // fetch polyfill
import path from 'path';
import Language from '../../components/language';
import Header from '../../components/header';
import Bar from '../../components/bar';
import jsrsasign from "jsrsasign";
import './index.scss';
import { Button, Card, Input, Form, DatePicker, Row, Col } from 'antd';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 3 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

const tailFormItemLayout = {
  wrapperCol: {
    xs: {
      span: 24,
      offset: 3,
    },
    sm: {
      span: 24,
      offset: 3,
    },
  },
};

class Utils extends Language {

  static propTypes = {
    headerKey: PropTypes.string
  };
  static defaultProps = {
    headerKey: ''
  };

  constructor(props) {
    super(props);
    this.state = {
      __html: '',
    };
  }

  sign = () => {
    const { getFieldsValue } = this.props.form;
    const { privKeyHex, v, thirdpart_orderid, thirdpart_ordertime
      , tradeName, access_token, goodscount } = getFieldsValue();
    let signSrc = v + thirdpart_orderid + thirdpart_ordertime.format('YYYY-MM-DD HH:mm:ss') + tradeName + access_token;
    if (goodscount && goodscount > 1) {
      signSrc += goodscount;
    }
    signSrc = encodeURIComponent(signSrc).replace('%20', '+');
    const privKey = `-----BEGIN PRIVATE KEY-----
    ${jsrsasign.hex2b64(privKeyHex)}
    -----END PRIVATE KEY-----`;
    let rsa = jsrsasign.KEYUTIL.getKey(privKey);
    // 创建Signature对象，设置签名编码算法
    let sig = new jsrsasign.KJUR.crypto.Signature({ "alg": "SHA1withRSA", "prov": "cryptojs/jsrsa", "prvkeypem": privKey });
    // 初始化
    sig.init(rsa);
    // 传入待加密字符串
    sig.updateString(signSrc);
    // 生成密文

    this.setState({
      signResult: sig.sign()
    })
  }

  renderForm = () => {
    const { getFieldDecorator } = this.props.form;
    return <Form>
      <Form.Item {...formItemLayout} label="私钥">
        {getFieldDecorator('privKeyHex', {
          rules: [{
            required: true, message: '请输入私钥',
          }],
        })(
          <Input />
        )}
      </Form.Item>
      <Form.Item {...formItemLayout} label="v">
        {getFieldDecorator('v', {
          rules: [{
            required: true, message: '请输入接口版本号',
          }],
        })(
          <Input />
        )}
      </Form.Item>
      <Form.Item {...formItemLayout} label="第三方唯一订单id">
        {getFieldDecorator('thirdpart_orderid', {
          rules: [{
            required: true, message: '请输入第三方唯一订单id',
          }],
        })(
          <Input />
        )}
      </Form.Item>
      <Form.Item {...formItemLayout} label="下单时间">
        {getFieldDecorator('thirdpart_ordertime', {
          rules: [{
            required: true, message: '请输入下单时间',
          }],
        })(
          <DatePicker showTime format="YYYY-MM-DD HH:mm:ss" />
        )}
      </Form.Item>
      <Form.Item {...formItemLayout} label="商品名称">
        {getFieldDecorator('tradeName', {
          rules: [{
            required: true, message: '请输入商品名称',
          }],
        })(
          <Input />
        )}
      </Form.Item>
      <Form.Item {...formItemLayout} label="oauth token">
        {getFieldDecorator('access_token', {
          rules: [{
            required: true, message: '请输入oauth token',
          }],
        })(
          <Input />
        )}
      </Form.Item>
      <Form.Item {...formItemLayout} label="购买数量">
        {getFieldDecorator('goodscount', {
        })(
          <Input />
        )}
      </Form.Item>
      <Form.Item {...tailFormItemLayout}>
        <Button type="primary" onClick={this.sign}>签名</Button>
      </Form.Item>
    </Form>
  }

  render() {
    const language = this.getLanguage();
    const { signResult } = this.state;
    return (
      <div className="util-page">
        <Header
          currentKey='util'
          type="normal"
          language={language}
        />
        <Bar img="/img/system/docs.png" text={"工具"} />
        <section className="content-section">
          <Card
            title="签名验证"
          >
            {this.renderForm()}
            {
              signResult && 
              <Row>
                <Col span={3} style={{textAlign:'end'}} className='ant-form-item-label'>
                  <label title="签名结果">签名结果</label>
                </Col>
                <Col span={16}>
                  <p style={{width: '100%', wordWrap: 'break-word', wordBreak: 'break-all'}}>{signResult}</p>
                </Col>
              </Row>
            }
          </Card>
        </section>
      </div>
    );
  }
}
const WrappedUtilsForm = Form.create()(Utils);

document.getElementById('root') && ReactDOM.render(<WrappedUtilsForm />, document.getElementById('root'));

export default WrappedUtilsForm;
