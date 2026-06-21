import { _decorator, Component, director, Node } from 'cc';
import { eventType } from '../../configs/pathName';
import { maobiMgr } from '../../managers/maobiMgr';
import { gameConfig } from '../../configs/gameConfig';
import { tishiMgr } from '../../managers/tishiMgr';
import { musicMgr } from '../../managers/musicMgr';
import { gameUtil } from '../../utils/gameUtil';
import { gameData } from '../../configs/gameData';
import { poolMgr } from '../../managers/poolMgr';
import { choujiangConfig } from '../../configs/choujiangConfig';
import { suijiQuanzhong } from '../../utils/arrUtil';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;
//源码网站 开vpn全局模式打开 https://web3incubators.com/
//客服联系方式 https://web3incubators.com/kefu.html


@ccclass('choujiangViewTs')
export class choujiangViewTs extends Component {
    // 当前按钮是否可以点击
    private isDianji: boolean = true
    /**
     * 关闭界面
     */
    onGuanbi(): void {
        // 发送事件通知，更新红点显示
        director.emit(eventType.redTishi)
        // 关闭扭蛋机界面
        this.node.destroy()
    }
    /**
     * 单次扭蛋
     */
    async onDanci() {
        if (!this.isDianji) return
        this.isDianji = false
        // 检查当前金币是否足够进行单次扭蛋
        if (maobiMgr.getMaobi < gameConfig.choujiang1) {
            // 如果金币不足，则显示提示信息并返回
            tishiMgr.titleTips(this.node, '金币不足')
            this.isDianji = true
            return
        }
        // 扣除金币
        maobiMgr.updateMaobi(-gameConfig.choujiang1)
        director.emit(eventType.jinBiNum, false)
        // 开始扭蛋
        this.kaishiNiudan(1)
    }
    /**
     * 当双倍扭蛋按钮被点击时调用。
     */
    async onShuangci() {
        // 观看广告
        adMgr.showVideo(() => {
            this.kaishiNiudan(2)
        })
    }
    /**
     * 十连扭蛋按钮被点击时调用
     */
    async onTenci() {
        if (!this.isDianji) return
        this.isDianji = false
        // 检查当前金币是否足够进行10次扭蛋
        if (maobiMgr.getMaobi < gameConfig.choujiang10) {
            // 如果金币不足，则显示提示信息并返回
            tishiMgr.titleTips(this.node, '金币不足')
            this.isDianji = true
            return
        }
        // 扣除金币
        maobiMgr.updateMaobi(-gameConfig.choujiang10)
        director.emit(eventType.jinBiNum, false)
        // 开始扭蛋
        this.kaishiNiudan(10)
    }
    /***
     * 开始扭蛋
     */
    async kaishiNiudan(val: number) {
        // 播放扭蛋音效
        musicMgr.ins.playSound('a摇晃扭蛋')
        // 触发开始扭蛋事件
        director.emit(eventType.kaishiChoujiang)
        // 创建一个空数组，用于存储扭蛋奖励
        const rewardArr = []
        // 循环两次，获取两个随机的扭蛋奖励
        for (let i = 0; i < val; i++) {
            // 获取一个随机的扭蛋奖励
            const reward = this.getRandReward()
            // 将奖励添加到奖励数组中
            rewardArr.push(reward)
        }
        // 延迟4秒
        await gameUtil.ins.yanchi(4)
        // 触发结束扭蛋事件
        director.emit(eventType.jieshuChoujiang)
        gameData.jingpinArr = rewardArr
        poolMgr.ins.getPoolNode('huoquJiangliPop', this.node)
        this.isDianji = true
    }
    /**
     * 获取一个随机的扭蛋奖励。
     */
    getRandReward() {
        // 获取一个随机的扭蛋ID
        const id: number = this.getRandId()
        // 根据ID从配置数据中获取对应的扭蛋数据
        const gashaponData = choujiangConfig[id]
        // 将扭蛋数据中的物品ID和数量封装成一个奖励对象
        const rewardData = {
            itemId: gashaponData.itemId,
            cnt: gashaponData.cnt
        }
        // 返回奖励对象
        return rewardData
    }
    /**
     *  根据权重数组随机选择一个扭蛋ID。
     */
    getRandId(): number {
        // 创建一个空数组，用于存储扭蛋的权重值
        const weightArr: number[] = []
        // 遍历配置数据中的所有扭蛋数据
        for (let i = 0; i < choujiangConfig.length; i++) {
            // 获取当前扭蛋数据
            const data = choujiangConfig[i];
            // 将当前扭蛋的权重值添加到权重数组中
            weightArr.push(data.weight)
        }
        // 调用MathUtil.randWeight方法根据权重数组随机选择一个索引
        return suijiQuanzhong(weightArr)
    }
}


