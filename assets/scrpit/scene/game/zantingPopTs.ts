import { _decorator, Component, Node, Toggle } from 'cc';
import { gameData } from '../../configs/gameData';
import { shezhiMgr } from '../../managers/shezhiMgr';
import { poolMgr } from '../../managers/poolMgr';
import { musicMgr } from '../../managers/musicMgr';
const { ccclass, property } = _decorator;

@ccclass('zantingPopTs')
export class zantingPopTs extends Component {
    // 音效复选框
    @property(Node)
    yinxiaoBtn: Node = null
    // 音效复选框
    @property(Node)
    yinyueBtn: Node = null
    // 震动复选框
    @property(Node)
    zhendongBtn: Node = null
    protected onEnable(): void {
        // 游戏暂停
        gameData.zanting = true
        this.btnZhuangtai()
    }
    initBtnStatus() {

    }
    /**
     * 点击音效
     */
    onYinxiaoBtn() {
        // 切换音效的启用状态
        shezhiMgr.YinxiaoEnabled = !shezhiMgr.YinxiaoEnabled
        this.btnZhuangtai()
        if (shezhiMgr.YinxiaoEnabled) {
            shezhiMgr.YinxiaoValue = 1
        } else {
            shezhiMgr.YinxiaoValue = 0
        }
    }
    /**
     * 点击音乐
     */
    OnyinyueBtn() {
        // 切换音效的启用状态
        shezhiMgr.YinyueEnabled = !shezhiMgr.YinyueEnabled
        this.btnZhuangtai()
        if (shezhiMgr.YinyueEnabled) {
            musicMgr.ins.setVolume(0.8)
            shezhiMgr.YinyueValue = 0.8
        } else {
            musicMgr.ins.setVolume(0)
            shezhiMgr.YinyueValue = 0
        }
    }
    /**
     * 震动
     */
    onZhendongBtn() {
        shezhiMgr.ZhendongEnabled = !shezhiMgr.ZhendongEnabled
        this.btnZhuangtai()
    }
    /**
     * 按钮状态
     */
    btnZhuangtai() {
        let yinxiaoKaiqi = shezhiMgr.YinxiaoEnabled
        let yinyueKaiqi = shezhiMgr.YinyueEnabled
        let zhendongKaiqi = shezhiMgr.ZhendongEnabled
        if (yinxiaoKaiqi) {
            this.yinxiaoBtn.getChildByName('kai').active = true
            this.yinxiaoBtn.getChildByName('guan').active = false
        } else {
            this.yinxiaoBtn.getChildByName('kai').active = false
            this.yinxiaoBtn.getChildByName('guan').active = true
        }
        if (yinyueKaiqi) {
            this.yinyueBtn.getChildByName('kai').active = true
            this.yinyueBtn.getChildByName('guan').active = false
        } else {
            this.yinyueBtn.getChildByName('kai').active = false
            this.yinyueBtn.getChildByName('guan').active = true
        }
        if (zhendongKaiqi) {
            this.zhendongBtn.getChildByName('kai').active = true
            this.zhendongBtn.getChildByName('guan').active = false
        } else {
            this.zhendongBtn.getChildByName('kai').active = false
            this.zhendongBtn.getChildByName('guan').active = true
        }

    }
    /**
       * 返回首页
       */
    onRenshu() {
        // 关闭弹窗
        poolMgr.ins.huiShouNode(this.node)
        poolMgr.ins.getPoolNode('shibaiPop', gameData.game)
    }
    /**
     * 继续游戏
     */
    onJixuGame() {
        // 游戏暂停
        gameData.zanting = false
        // 关闭弹窗
        poolMgr.ins.huiShouNode(this.node)
    }
}


