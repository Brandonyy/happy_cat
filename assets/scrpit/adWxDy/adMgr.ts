import { _decorator, Component, Node } from 'cc';
import { gameConfig } from '../configs/gameConfig';
import { gameData } from '../configs/gameData';
import { pingtai } from '../configs/pathName';
import { wxAd } from './wxAd';
import { adConfig } from './adConfig';
import { dyAd } from './dyAd';
const { ccclass, property } = _decorator;
const log = 'adMgr'
@ccclass('adMgr')
export class adMgr extends Component {
    /**
* 创建banner广告
*/
    static createBannerAd() {
        // 判断是否显示广告
        if (!adConfig.isShowAd) return
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
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
  * 显示插屏广告
  */
    static showChaPing() {
        if (!adConfig.isShowAd) return
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
*/
    static async showVideo(callback?: Function) {
        if (adConfig.isShowAd) {
            switch (gameData.pingtai) {
                // 如果是微信平台
                case pingtai.wx:
                    try {
                        const isCompleted = await wxAd.ins.showVideoAd()
                        if (isCompleted) {
                            callback()
                        } else {
                            console.log(log, '视频广告未播放完成');
                        }
                    } catch (err) {
                        console.log(log, '视频广告播放失败:', err);
                    }
                    break;
                // 如果是抖音平台
                case pingtai.dy:
                    try {
                        const isCompleted = await dyAd.ins.showVideoAd()
                        if (isCompleted) {
                            callback()
                        } else {
                            console.log(log, '视频广告未播放完成');
                        }
                    } catch (err) {
                        console.log(log, '视频广告播放失败:', err);
                    }
                    break;
                default:
                    callback()
                    break;
            }
        } else {
            callback()
        }
    }
}


