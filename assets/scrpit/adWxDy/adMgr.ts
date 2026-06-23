import { _decorator, Component, Node } from 'cc';
import { gameData } from '../configs/gameData';
import { pingtai } from '../configs/pathName';
import { gameMoshi } from '../configs/gameMoshi';
import { wxAd } from './wxAd';
import { adConfig } from './adConfig';
import { dyAd } from './dyAd';
import { tishiMgr } from '../managers/tishiMgr';
const { ccclass, property } = _decorator;
const log = 'adMgr'
@ccclass('adMgr')
export class adMgr extends Component {
    // 上一次插屏展示的时间戳（用于频控）
    private static _lastChaPingTime = 0

    /**
     * 当前平台的插屏广告位 ID（未配置时返回空字符串）
     */
    private static curChaPingId(): string {
        switch (gameData.pingtai) {
            case pingtai.wx: return adConfig.wxChaPingId
            case pingtai.dy: return adConfig.dyChaPingId
            default: return ''
        }
    }
    /**
     * 当前平台的激励视频广告位 ID（未配置时返回空字符串）
     */
    private static curVideoId(): string {
        switch (gameData.pingtai) {
            case pingtai.wx: return adConfig.wxVideoId
            case pingtai.dy: return adConfig.dyVideoId
            default: return ''
        }
    }
    /**
     * 文字提示（广告失败/未看完时给玩家反馈）。无可用节点时静默。
     */
    private static tip(msg: string) {
        const node = gameData.game || gameData.main
        if (node) tishiMgr.titleTips(node, msg)
    }

    /**
* 创建banner广告
*/
    static createBannerAd() {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                if (!adConfig.wxBannerId) return
                wxAd.ins.createBannerAd()
                break;
            // 如果是抖音平台
            case pingtai.dy:
                break;
        }
    }
    /**
     * 显示banner广告
     */
    static showBanner() {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                if (!adConfig.wxBannerId) return
                wxAd.ins.showBanner()
                break;
            // 如果是抖音平台
            case pingtai.dy:
                break;
        }
    }
    /**
     * 隐藏banner广告
     */
    static hideBanner() {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                wxAd.ins.hideBanner()
                break;
            // 如果是抖音平台
            case pingtai.dy:
                break;
        }

    }
    /**
     * 创建插屏广告
     */
    static createChaPingAd() {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        if (!this.curChaPingId()) return
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                wxAd.ins.createChapingAd()
                break;
            // 如果是抖音平台
            case pingtai.dy:
                dyAd.ins.createChapingAd()
                break;
            default:
                break;
        }
    }
    /**
  * 显示插屏广告（带频控 + 新手保护）
  */
    static showChaPing() {
        if (!adConfig.isShowAd) return
        if (!this.curChaPingId()) return
        // 新手保护：普通模式前 N 关不弹插屏，保次留
        if (gameData.moshi === gameMoshi.putong && gameData.putongLevel <= adConfig.chaPingFreeLevels) {
            return
        }
        // 频控：两次插屏间隔需 ≥ chaPingCdMs（平台要求 ≥30s）
        const now = Date.now()
        if (now - this._lastChaPingTime < adConfig.chaPingCdMs) {
            console.log(log, '插屏处于冷却中，跳过本次展示')
            return
        }
        this._lastChaPingTime = now
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                wxAd.ins.showChapingAd()
                break;
            // 如果是抖音平台
            case pingtai.dy:
                dyAd.ins.showChapingAd()
                break;
            default:
                break;
        }

    }
    /**
     * 创建视频广告
     */
    static createVideoAd() {
        if (!adConfig.isShowAd) return
        if (!this.curVideoId()) return
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                wxAd.ins.createVideoAd()
                break;
            // 如果是抖音平台
            case pingtai.dy:
                dyAd.ins.createVideoAd()
                break;
            default:
                break;
        }
    }
    /**
* 显示视频激励广告
* @param callback 仅在「广告正常看完」时执行，用于下发奖励
*/
    static async showVideo(callback?: Function) {
        // 广告总开关关闭、或当前平台未配置激励视频位时，直接发奖（不阻塞玩法）
        if (!adConfig.isShowAd || !this.curVideoId()) {
            callback && callback()
            return
        }
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                try {
                    const isCompleted = await wxAd.ins.showVideoAd()
                    if (isCompleted) {
                        callback && callback()
                    } else {
                        // 用户中途退出：不发奖 + 提示
                        this.tip('需看完广告才能领取奖励哦~')
                    }
                } catch (err) {
                    // 广告拉取/播放失败：不发奖 + 提示
                    console.log(log, '视频广告播放失败:', err);
                    this.tip('广告加载失败，请稍后再试')
                } finally {
                    // 预加载下一条，提升下次填充率
                    wxAd.ins.preloadVideo()
                }
                break;
            // 如果是抖音平台
            case pingtai.dy:
                try {
                    const isCompleted = await dyAd.ins.showVideoAd()
                    if (isCompleted) {
                        callback && callback()
                    } else {
                        this.tip('需看完广告才能领取奖励哦~')
                    }
                } catch (err) {
                    console.log(log, '视频广告播放失败:', err);
                    this.tip('广告加载失败，请稍后再试')
                } finally {
                    dyAd.ins.preloadVideo()
                }
                break;
            default:
                callback && callback()
                break;
        }
    }
}
