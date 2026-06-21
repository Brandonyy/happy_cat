import { _decorator, Component, director, Node } from 'cc';
import { gameData } from '../../configs/gameData';
import { musicMgr } from '../../managers/musicMgr';
import { poolMgr } from '../../managers/poolMgr';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;

@ccclass('shibaiPopTs')
export class shibaiPopTs extends Component {
    onLoad() {
        gameData.zanting = true
        musicMgr.ins.stopMusic()
        musicMgr.ins.playSound('a通关失败')
        // 显示广告
        adMgr.showChaPing()
    }
    onTuichu() {
        // 暂停结束
        musicMgr.ins.stopMusic()
        gameData.zanting = false
        poolMgr.ins.huiShouNode(this.node)
        director.loadScene('main')
    }
    onChongxin() {
        // 暂停结束
        gameData.zanting = false
        poolMgr.ins.huiShouNode(this.node)
        director.loadScene('game')
    }
}


