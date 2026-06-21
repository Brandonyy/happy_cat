import { _decorator, Component, director, Node } from 'cc';
import { musicMgr } from '../../managers/musicMgr';
import { gameData } from '../../configs/gameData';
import { maobiMgr } from '../../managers/maobiMgr';
import { gameConfig } from '../../configs/gameConfig';
import { eventType } from '../../configs/pathName';
import { gameUtil } from '../../utils/gameUtil';
const { ccclass, property } = _decorator;

@ccclass('tiaozhanShengliPopTs')
export class tiaozhanShengliPopTs extends Component {
    // 当前按钮是否可以点击
    private isDianji: boolean = true
    protected onEnable(): void {
        // 游戏暂停
        gameData.zanting = true
        musicMgr.ins.stopMusic()
        // 播放胜利音效
        musicMgr.ins.playSound("a通关成功")
    }
    /**
     * 领取金币
     */
    async onLingqu() {
        if (!this.isDianji) return
        this.isDianji = false
        // 更新金币数量
        maobiMgr.updateMaobi(gameConfig.tiaozhanJinbi)
        director.emit(eventType.jinBiNum)
        // 延迟2秒，
        await gameUtil.ins.yanchi(2)
        // 游戏暂停
        // 可以点击
        this.isDianji = true
        // 返回首页
        this.node.destroy()
        director.loadScene("main")
    }
}


