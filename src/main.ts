const https = require('https');
const querystring = require('querystring');
import md5 = require('md5')
import { appId, appSecret } from './private';
export const translate = (word: string) => {

    const salt = Math.random()
    const sign = md5(appId + word + salt + appSecret)

    let from, to
    if (/[a-zA-Z]/.test(word[0])) {
        // 英翻译中
        from = 'en'
        to = 'zh'
    } else {
        // 中翻译英
        from = 'zh'
        to = 'en'
    }
    const query = querystring.stringify({
        q: word,
        from,
        to,
        appid: appId,
        salt: salt,
        sign: sign
    })

    const options = {
        hostname: 'fanyi-api.baidu.com',
        port: 443,
        path: `/api/trans/vip/translate?${query}`,
        method: 'GET'
    };
    type ErrorMap = {
        [key:string]:string
    }
    const errorMap:ErrorMap = {
        52000: '成功',
        52001: '请求超时',
        52002: '系统错误',
        52003: '未授权用户',
        54000: "必填参数为空",
        54001: "签名错误",
        54003: '访问频率受限',
        54004: "账户余额不足",
        54005: "长query请求频繁",
        58000: "客户端IP非法",
        58001: "译文语言方向不支持",
        58002: '服务当前已关闭',
        90107: '认证未通过或未生效',
        unknown: '服务器繁忙'
    }
    const request = https.request(options, (response:any) => {
        let chunks: Buffer[] = []
        response.on('data', (chunk: Buffer) => {
            chunks.push(chunk)
        });
        response.on('end', () => {
            let string = Buffer.concat(chunks).toString()

            type BaiduResult = {
                error_code: string;
                error_mgs: string;
                from: string;
                to: string;
                trans_result: {
                    src: string;
                    dst: string;
                }[];
            }
            const obj: BaiduResult = JSON.parse(string)
            if (obj.error_code) {
                console.log(errorMap[obj.error_code] || obj.error_mgs)
                process.exit(2)
            } else {
                obj.trans_result.map(list => {
                    console.log(list.dst)
                })
                process.exit(0)
            }
        })
    });

    request.on('error', (e:string) => {
        console.error(e);
    });
    request.end();
}