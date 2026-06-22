import { _decorator, Component, director, Node, tween, v3 } from 'cc';
import { gameData } from '../../configs/gameData';
import { musicMgr } from '../../managers/musicMgr';
import { gameConfig } from '../../configs/gameConfig';
import { maobiMgr } from '../../managers/maobiMgr';
import { eventType } from '../../configs/pathName';
import { gameUtil } from '../../utils/gameUtil';
import { adMgr } from '../../adWxDy/adMgr';
import { numAnimaTs } from '../../other/numAnimaTs';
const { ccclass, property } = _decorator;

@ccclass('shengliPopTs')
export class shengliPopTs extends Component {// 指针
    @property(Node)
    zhen: Node = null
    // 本关金币数量（当前展示值）
    private maobiNum = 0
    // 基础金币数量（未乘倍数）
    private baseMaobiNum = 0
    // 指针动画
    private dh = null
    // 是否已经领取
    private isLingqu: boolean = false
    // 当前按钮是否可以点击
    private isDianji: boolean = true
    // “点击领取”按钮
    private lingquBtn: Node = null
    // “加倍领取”按钮（复用原多倍领取样式）
    private jiabeiBtn: Node = null
    // 关闭按钮
    private closeBtn: Node = null
    // 本关金币数字动画
    private benguanNum: numAnimaTs = null
    protected start(): void {
        // 暂停游戏
        gameData.zanting = true
        //停止背景音乐
        musicMgr.ins.stopMusic()
        // 播放胜利音效
        musicMgr.ins.playSound("a通关成功")
        // 获取子节点引用
        const popUI = this.node.getChildByName('popUI')
        this.lingquBtn = popUI.getChildByName('putong')
        this.jiabeiBtn = popUI.getChildByName('shuangbei')
        this.closeBtn = popUI.getChildByName('closeBtn')
        this.benguanNum = popUI.getChildByName('benguanNum')?.getComponent(numAnimaTs)
        // 创建一个无限循环的指针动画，指针在指定位置之间来回移动
        this.dh = tween(this.zhen).sequence(
            tween(this.zhen).to(0.8, { position: v3(180, -170) }),
            tween(this.zhen).to(0.8, { position: v3(-180, -170) }),
        ).repeatForever().start()
        // 计算本关获得的默认金币数量
        this.baseMaobiNum = gameConfig.levelAddMaobiNum + (gameData.putongLevel - 1) * gameConfig.levelAddMaobiNum
        this.maobiNum = this.baseMaobiNum
        // 初始化本关金币展示
        this.benguanNum?.init(this.baseMaobiNum)
        // 初始按钮状态：只展示“点击领取”
        this.lingquBtn.active = true
        this.jiabeiBtn.active = false
        if (this.closeBtn) this.closeBtn.active = false
        // 显示广告
        adMgr.showChaPing()
    }
    /**
     * 根据指针所在的 x 位置获取对应倍数
     * 区间沿用原始指针落点设定：2x / 3x / 4x / 3x
     */
    private getBeishuByX(x: number): number {
        if (x < -8) return 2
        if (x < 85) return 3
        if (x < 145) return 4
        return 3
    }
    /**
     * 点击领取：指针停止，金币 = 基础 × 指针所在倍数
     */
    async onLingqu() {
        if (!this.isDianji || this.isLingqu) return
        this.isDianji = false
        this.isLingqu = true
        // 停止指针动画
        this.dh.stop()
        // 取指针所在倍数
        const bei = this.getBeishuByX(this.zhen.position.x)
        // 计算本关金币
        this.maobiNum = this.baseMaobiNum * bei
        // 等待两秒，让玩家看清指针落点
        await gameUtil.ins.yanchi(2)
        // 金币入账 + 顶部飞币动画
        maobiMgr.updateMaobi(this.maobiNum)
        director.emit(eventType.jinBiNum)
        // 本关金币数字滚动到新值
        this.benguanNum?.numAnima(this.maobiNum)
        // 按钮切换：隐藏“点击领取”，显示“加倍领取”与关闭按钮
        this.lingquBtn.active = false
        this.jiabeiBtn.active = true
        if (this.closeBtn) this.closeBtn.active = true
        this.isDianji = true
    }
    /**
     * 点击加倍领取：观看激励视频，成功后金币翻倍
     */
    onJiabei() {
        if (!this.isDianji) return
        // 观看广告
        adMgr.showVideo(() => {
            this.jiabei()
        })
    }
    async jiabei() {
        this.isDianji = false
        // 再补入一份金币（使总额变为两倍）+ 飞币动画
        maobiMgr.updateMaobi(this.maobiNum)
        director.emit(eventType.jinBiNum)
        // 本关金币翻倍并滚动
        this.maobiNum = this.maobiNum * 2
        this.benguanNum?.numAnima(this.maobiNum)
        // 加倍按钮消失
        this.jiabeiBtn.active = false
        // 等待飞币动画后自动进入下一关
        await gameUtil.ins.yanchi(2)
        director.emit(eventType.nextLevel)
    }
    /**
     * 点击关闭：关闭弹窗并进入下一关
     */
    async onClose() {
        if (!this.isDianji) return
        this.isDianji = false
        // 等待飞币动画
        await gameUtil.ins.yanchi(0.5)
        // 重置关卡（loadScene 会销毁本弹窗）
        director.emit(eventType.nextLevel)
    }
}
