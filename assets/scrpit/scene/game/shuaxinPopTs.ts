import { _decorator, Component, director, Node } from 'cc';
import { gameData } from '../../configs/gameData';
const { ccclass, property } = _decorator;

@ccclass('shuaxinPopTs')
export class shuaxinPopTs extends Component {
    protected onEnable(): void {
        // 游戏暂停
        gameData.zanting = true;
    }
    /**
    * 重置关卡
    */
    onChongzhi() {
        this.node.destroy();
        // 重新加载关卡
        director.loadScene("game")
    }
    /**
     * 继续游戏
     */
    onJiXu() {
        // 游戏继续
        gameData.zanting = false;
        this.node.destroy();
    }

}


