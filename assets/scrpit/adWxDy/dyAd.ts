import { _decorator, Component, Node } from 'cc';
import { adConfig } from './adConfig';
import { gameData } from '../configs/gameData';
const { ccclass, property } = _decorator;
const tt = window['tt'];
@ccclass('dyAd')
export class dyAd extends Component {
    // 广告实例
    private videoAd: any = null;
    private interstitialAd: any = null;
    // 单例
    static _ins: dyAd;
    static get ins() {
        if (this._ins) {
            return this._ins;
        }
        this._ins = new dyAd();
        return this._ins;
    }
    /**
  * 转发
  */
    fenXiang() {
        tt.shareAppMessage({
            title: "开心抓猫猫",
            desc: "眼力手速双重挑战，通关全靠反应快！",
            imageUrl: "",
            query: "",
            success() {
                console.log("分享成功");
            },
            fail(e) {
                console.log("分享失败");
            },
        });
    }
    // 创建插屏广告
    createChapingAd() {
        // 创建插屏广告实例，提前初始化
        if (tt.createInterstitialAd && !this.interstitialAd) {
            this.interstitialAd = tt.createInterstitialAd({
                adUnitId: adConfig.dyChaPingId
            })
            // 监听插屏广告关闭事件。
            this.interstitialAd.onClose(res => {
                // 关闭插屏的时间，单位为毫秒，计算下次触发插屏间隔是否大于30s
                console.log('插屏关闭');
            })
            this.interstitialAd.onError(({ errCode, errMsg }) => {
                console.log('监听到插屏错误', errCode, errMsg)
            })
        }
    }
    /**
* 显示插屏广告
*/
    showChapingAd() {
        if (this.interstitialAd) {
            // 显示插屏广告
            this.interstitialAd.load()
                .then(() => {
                    this.interstitialAd.show().then(() => {
                        console.log("插屏广告展示成功");
                    });
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    }
    /**
     * 创建激励广告
     */
    createVideoAd() {
        this.videoAd = tt.createRewardedVideoAd({
            adUnitId: adConfig.dyVideoId,
            // 是否开启再得广告模式
            multiton: false,
            // 再得广告的奖励文案，玩家每看完一个广告都会展示
            multitonRewardMsg: ['更多奖励1', '更多奖励2', '更多奖励3'],
            // 额外观看广告的次数
            multitonRewardTimes: 3,
            // 是否开启进度提醒，开启时广告文案为【再看N个获得xx】
            progressTip: false,
        });
        //拉取异常处理
        this.videoAd.onError((err) => {
            console.log(err);
        })
    }
    /**
     * 播放激励视频广告
     */
    showVideoAd() {
        return new Promise((resolve, reject) => {
            // 用户触发广告后，显示激励视频广告
            this.videoAd.show().catch(() => {
                // 失败重试
                this.videoAd.load()
                    .then(() => this.videoAd.show())
                    .catch(err => {
                        reject(err);
                        console.log('激励视频 广告显示失败')
                    })
            })
            // 用户点击了【关闭广告】按钮
            this.videoAd.onClose((res) => {
                if (!this.videoAd) return;
                //需要清除回调，否则第N次广告会一次性给N个奖励
                this.videoAd.offClose();
                //关闭
                if (res && res.isEnded || res === undefined) {
                    //正常播放结束，需要下发奖励
                    resolve(true)
                } else {
                    //播放退出，不下发奖励
                    resolve(false)
                }
            })
        })
    }
}


