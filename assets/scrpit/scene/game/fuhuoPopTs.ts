import { _decorator, Component, director, Label, Node } from 'cc';
import { gameData } from '../../configs/gameData';
import { gameMoshi } from '../../configs/gameMoshi';
import { eventType } from '../../configs/pathName';
import { poolMgr } from '../../managers/poolMgr';
import { adMgr } from '../../adWxDy/adMgr';
const { ccclass, property } = _decorator;

@ccclass('fuhuoPopTs')
export class fuhuoPopTs extends Component {
    // 倒计时结束复活的提示文本
    @property(Label)
    tip: Label = null;
    // 挤满卡槽失败
    @property(Node)
    man: Node = null;
    // 时间结束失败
    @property(Node)
    time: Node = null;
    start() {
        this.init()
    }

    init() {
        // 暂停游戏
        gameData.zanting = true;
        // 隐藏所有子节点
        this.time.active = false;
        this.man.active = false;
        // 根据失败类型显示对应的子节点
        switch (gameData.shibaiType) {
            case 1:
                this.time.active = true;
                break;
            case 2:
                this.man.active = true;
                break;
            default:
                console.warn("未知失败类型:", gameData.shibaiType);
                break;
        }
        // 根据游戏难度和模式设置复活加时时间
        const time: number = this.zhuamaoLevel || gameData.moshi === gameMoshi.tiaozhan ? 2 : 1
        // 调度一个一次性任务，在一段时间后执行回调函数
        this.scheduleOnce(() => {
            // 更新提示标签的文本，显示复活并加时的时间
            this.tip.string = `复活并加时${time}分钟`
        })
    }
    public get zhuamaoLevel(): boolean {
        return gameData.putongLevel > 1 && gameData.putongLevel % 5 === 0
    }
    /**
    * 关闭弹窗
    */
    onGuanbi() {
        gameData.zanting = false;
        this.node.destroy()
        // 打开失败界面
        poolMgr.ins.getPoolNode('shibaiPop', gameData.game)
    }
    /**
   * 复活按钮
   */
    onFuhuo() {
        adMgr.showVideo(() => {
            gameData.zanting = false;
            this.node.destroy()
            director.emit(eventType.fuhuo, gameData.shibaiType)
        })
    }
}


