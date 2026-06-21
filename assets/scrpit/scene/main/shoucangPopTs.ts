import { _decorator, Component, director, Node } from 'cc';
import { gameData } from '../../configs/gameData';
import { tishiMgr } from '../../managers/tishiMgr';
import { eventType } from '../../configs/pathName';
import { bendiUtil } from '../../utils/bendiUtil';
import { poolMgr } from '../../managers/poolMgr';
import { apiMgr } from '../../adWxDy/apiMgr';
const { ccclass, property } = _decorator;

@ccclass('shoucangPopTs')
export class shoucangPopTs extends Component {
    // 添加到我的小程序回调
    onAddToMiniFun() {
        gameData.jingpinArr = [{
            itemId: 2,
            cnt: 1
        }, {
            itemId: 3,
            cnt: 1
        },]
        poolMgr.ins.getPoolNode('huoquJiangliPop', gameData.tcNode)
        bendiUtil.setItem('isAddToMini', true)
        director.emit(eventType.addToMini)
        // 添加成功
        this.node.destroy()
    }
    /**
 * 收藏有礼
 */
    onAddToMini() {
        // 监听添加到我的小程序
        apiMgr.addToMini(this.onAddToMiniFun.bind(this), this.addMiniShibai.bind(this), this.addMiniQuxiao.bind(this))
    }

    // 添加到我的小程序失败回调
    addMiniShibai() {
        // 显示添加失败提示
        tishiMgr.titleTips(gameData.main, '请添加到[我的小程序]')
    }
    // 添加到我的小程序取消回调
    addMiniQuxiao() {
        // 显示取消添加提示
        tishiMgr.titleTips(gameData.main, '取消添加')
    }

    /**
     * 关闭弹窗
     */
    onGuanbi() {
        this.node.destroy()
    }
}


