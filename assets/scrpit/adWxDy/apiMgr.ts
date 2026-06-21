import { _decorator, Component, Node } from 'cc';
import { gameData } from '../configs/gameData';
import { pingtai } from '../configs/pathName';
import { wxAd } from './wxAd';
import { dyAd } from './dyAd';
import { shezhiMgr } from '../managers/shezhiMgr';
const { ccclass, property } = _decorator;
const wx = window['wx'];
const tt = window['tt'];
@ccclass('apiMgr')
export class apiMgr extends Component {
    // 上一次震动时间
    private static _lastVibrateTime: number = 0
    /**
     * 检查小程序是否被添加至 「我的小程序」
     */
    static addToMini(callback1?: Function, callback2?: Function, callback3?: Function, callback4?: Function,) {
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                wx.checkIsAddedToMyMiniProgram({
                    success: function (res) {
                        if (res.added) {
                            // 小程序已被添加到「我的小程序」
                            callback1 && callback1()
                        } else {
                            // 小程序未被添加到「我的小程序」
                            callback2 && callback2()
                        }
                    },
                    fail: function (err) {
                        // 调用失败
                        callback3 && callback3()
                    },
                    complete: function () {
                        // 调用完成
                        callback4 && callback4()
                    }
                });
                break;
            // 如果是抖音平台
            case pingtai.dy:
                break;
            default:
                break;
        }

    }
    /**
* 判断用户是否支持侧边栏进入功能，有些旧版的抖音没有侧边栏，
*/
    static checkSidebar(callback1?: Function, callback2?: Function, callback3?: Function, callback4?: Function,) {
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                break;
            // 如果是抖音平台
            case pingtai.dy:
                tt.checkScene({
                    scene: "sidebar",
                    success: (res) => {
                        console.log("check scene 成功: ", res.isExist);
                        if (res.isExist) {
                            callback1();
                        } else {
                            callback2();
                        }
                    },
                    fail: (res) => {
                        callback2();
                    }
                });
                break;
            default:
                break;
        }
    }
    /**
     * 顶部分享
     */
    static topFenXiang() {
        // 判断是否显示广告
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                wxAd.ins.topFenXiang()
                break;
            // 如果是抖音平台
            case pingtai.dy:
                break;
            default:
                break;
        }
    }
    /**
     *主动分享
     */
    static fenXiang() {
        // 判断是否显示广告
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                wxAd.ins.fenXiang()
                break;
            // 如果是抖音平台
            case pingtai.dy:
                dyAd.ins.fenXiang()
                break;
            default:
                break;
        }
    }
    /**
  *手机震动
  */
    static zhenDong() {
        // 检查设置中是否启用了震动功能，如果没有启用则直接返回
        if (!shezhiMgr.ZhendongEnabled) return
        // 判断是否显示广告
        switch (gameData.pingtai) {
            // 如果是微信平台
            case pingtai.wx:
                // 获取当前时间
                const now = Date.now()
                // 检查当前时间与上次震动时间的间隔是否大于100毫秒
                if (now - this._lastVibrateTime > 100) {
                    // 检查当前时间与上次震动时间的间隔是否大于100毫秒
                    this._lastVibrateTime = now
                    // 如果当前环境是微信，则调用微信的震动API
                    wxAd.ins.zhenDong()
                }
                break;
            // 如果是抖音平台
            case pingtai.dy:
                break;
            default:
                break;
        }
    }
}


