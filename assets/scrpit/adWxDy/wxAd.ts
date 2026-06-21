import { _decorator, Component, Node } from 'cc';
import { adConfig } from './adConfig';
const { ccclass, property } = _decorator;
const wx = window['wx'];
@ccclass('wxAd')
export class wxAd extends Component {
    // 广告实例
    private bannerAd: any = null;
    private videoAd: any = null;
    private interstitialAd: any = null;
    // 单例
    static _ins: wxAd;
    static get ins() {
        if (this._ins) {
            return this._ins;
        }
        this._ins = new wxAd();
        return this._ins;
    }
    /**
  * 打开右上角转发功能
  */
    topFenXiang() {
        wx.showShareMenu({
            withShareTicket: true,
            menus: ['shareAppMessage', 'shareTimeline']
        })
    }
    /**
   * 转发
   */
    fenXiang() {
        wx.shareAppMessage({
            title: '眼力手速双重挑战，通关全靠反应快！',
            imageUrlId: 'ZoUB9DzRT16pBPUHCiia8A==',
            imageUrl: 'https://mmocgame.qpic.cn/wechatgame/xlgib1gtlzVPgnib302Z28edGu909U2biaNhKwYHLqpGgPXudP6PAsxqRRIkxd75XaI/0',
        });
    }

    /**
     * 触发设备短震动
     */
    zhenDong() {
        wx.vibrateShort(null)
        console.log('震动');
    }

    /**
     * banner广告
     */
    //创建banner广告
    createBannerAd() {
        // 获取屏幕宽高
        let { screenWidth, screenHeight } = wx.getSystemInfoSync();
        // 创建 Banner 广告实例，提前初始化
        this.bannerAd = wx.createBannerAd({
            adUnitId: adConfig.wxBannerId,
            adIntervals: 30,
            style: {
                left: 0,
                top: 0,
                width: 350,
            },

        });
        // 广告位置
        this.bannerAd.onResize((res) => {
            this.bannerAd.style.left = (screenWidth - res.width) / 2;
            this.bannerAd.style.top = screenHeight - res.height;
            // this.bannerAd.style.width = screenWidth;
        });
        // 监听 banner 广告错误事件
        this.bannerAd.onError((err) => {
            console.error(err.errMsg);
        });
    }

    // 显示banner广告
    showBanner() {
        if (!this.bannerAd) {
            this.createBannerAd()
        }
        // 监听广告加载成功
        this.bannerAd.show().then(() => console.log('banner 广告显示'))
    }
    // 隐藏banner广告
    hideBanner() {
        if (this.bannerAd) {
            this.bannerAd.hide();
        }
    }
    /**
     * 插屏广告
     */
    // 创建插屏广告
    createChapingAd() {
        // 如果createInterstitialAd方法存在，创建插屏广告实例
        if (wx.createInterstitialAd) {
            this.interstitialAd = wx.createInterstitialAd({
                adUnitId: adConfig.wxChaPingId
            })
        }
    }
    // 显示插屏广告
    showChapingAd() {
        if (!this.interstitialAd) {
            this.createChapingAd()
        }
        console.log('插屏广告', this.interstitialAd);
        // 在适合的场景显示插屏广告
        if (this.interstitialAd) {
            this.interstitialAd.show().catch((err) => {
                console.error('插屏广告显示失败', err)
            })
        }
    }
    /**
    * 激励视频广告
    */
    // 创建激励视频广告
    createVideoAd() {
        // 创建激励视频广告实例，提前初始化
        this.videoAd = wx.createRewardedVideoAd({
            adUnitId: adConfig.wxVideoId
        });
        // 加载广告
        this.videoAd.onLoad(() => {
            console.log('激励视频 广告加载成功');
        });
        // 监听广告加载失败
        this.videoAd.onError((err) => {
            console.log(err);
        });
    }
    // 显示激励视频广告
    showVideoAd() {
        return new Promise((resolve, reject) => {
            if (!this.videoAd) {
                this.createVideoAd()
            }
            // 用户触发广告后，显示激励视频广告
            this.videoAd.show().catch(() => {
                // 失败重试
                this.videoAd
                    .load()
                    .then(() => this.videoAd.show())
                    .catch((err) => {
                        console.error('激励视频 广告显示失败', err);
                        reject(err);
                    });
            });
            this.videoAd.onClose((res) => {
                if (!this.videoAd) return;
                this.videoAd.offClose();
                // 用户点击了【关闭广告】按钮
                if ((res && res.isEnded) || res === undefined) {
                    // 正常播放结束，可以下发游戏奖励
                    resolve(true)
                } else {
                    // 播放中途退出，不下发游戏奖励
                    resolve(false)
                }
            });
        })
    }
}


