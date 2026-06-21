import { _decorator, Component, director, math, Node, tween, v2, v3 } from 'cc';
import { gameData } from '../../configs/gameData';
import { musicMgr } from '../../managers/musicMgr';
import { gameConfig } from '../../configs/gameConfig';
import { suijiYuansu } from '../../utils/arrUtil';
import { maobiMgr } from '../../managers/maobiMgr';
import { eventType } from '../../configs/pathName';
import { gameUtil } from '../../utils/gameUtil';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;

@ccclass('shengliPopTs')
export class shengliPopTs extends Component {// 指针
    @property(Node)
    zhen: Node = null
    // 本关金币数量
    private maobiNum = 0
    // 指针动画
    private dh = null
    // 本局金币倍数
    private maobiBeishu = 1
    // 当前按钮是否可以点击
    private isDianji: boolean = true
    protected start(): void {
        // 暂停游戏
        gameData.zanting = true
        //停止背景音乐
        musicMgr.ins.stopMusic()
        // 播放胜利音效
        musicMgr.ins.playSound("a通关成功")
        // 创建一个无限循环的指针动画，指针在指定位置之间来回移动
        this.dh = tween(this.zhen).sequence(
            tween(this.zhen).to(0.8, { position: v3(180, -170) }),
            tween(this.zhen).to(0.8, { position: v3(-180, -170) }),
        ).repeatForever().start()
        // 计算本关获得的默认金币数量
        this.maobiNum = gameConfig.levelAddMaobiNum + (gameData.putongLevel - 1) * gameConfig.levelAddMaobiNum
        console.log("本来金币数量", this.maobiNum);
        // 显示广告
        adMgr.showChaPing()
    }
    /**
   * 普通领取
   */
    async onputong() {
        if (!this.isDianji) return
        this.isDianji = false
        // 更新金币数量
        maobiMgr.updateMaobi(this.maobiNum)
        director.emit(eventType.jinBiNum)
        // 等待两秒
        await gameUtil.ins.yanchi(2)
        // 重置关卡
        director.emit(eventType.nextLevel)
        this.isDianji = true
    }
    /**
     * 点击双倍按钮
     */
    onShuangbei() {
        // 观看广告
        adMgr.showVideo(() => {
            this.shuangbei()
        })
    }
    async shuangbei() {
        // 停止指针动画
        this.dh.stop()
        // 从数组中随机选择一个索引
        const index = suijiYuansu([0, 0, 0, 0, 0, 1, 2, 3])
        // 金币倍数
        const bei = [2, 3, 4, 3]
        this.maobiBeishu = bei[index]
        // 设置对应指针的位置范围
        const posArr = [
            v2(-180, -16),
            v2(0, 80),
            v2(90, 140),
            v2(150, 180)
        ]
        // 随机选择一个位置
        const poxRandom = posArr[index]
        // 在两个数值间的随机整数
        const x = math.randomRangeInt(poxRandom.x, poxRandom.y)
        // 设置指针的位置
        this.zhen.setPosition(v3(x, -170))
        // 计算翻倍后的金币数量
        this.maobiNum = this.maobiNum * this.maobiBeishu
        console.log("翻倍金币数量", this.maobiBeishu, this.maobiNum);
        // 更新金币数量
        maobiMgr.updateMaobi(this.maobiNum)
        director.emit(eventType.jinBiNum)
        // 等待两秒
        await gameUtil.ins.yanchi(2)
        // 重置关卡
        director.emit(eventType.nextLevel)
    }
}


