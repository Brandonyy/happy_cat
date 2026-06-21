import { _decorator, Component, director, EventTouch, Node, Vec3 } from 'cc';
import { ballDto } from '../../dto/ballDto';
import { gameData } from '../../configs/gameData';
import { gameConfig } from '../../configs/gameConfig';
import { musicMgr } from '../../managers/musicMgr';
import { eventType } from '../../configs/pathName';
import { poolMgr } from '../../managers/poolMgr';
import { apiMgr } from '../../adWxDy/apiMgr';
const { ccclass, property } = _decorator;

@ccclass('ballTs')
export class ballTs extends Component {
    // 元素球的信息
    ballData: ballDto = null
    // 是否被被选中的状态
    isSelect: boolean = false
    protected onEnable(): void {
        // 当手指触点落在目标节点区域内时
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
    }
    /**
     * 处理球被点击选中的逻辑
     * 如果当前选中的球的数量小于槽位的数量，则执行选中操作
     * 否则，输出警告信息
     */
    onTouchStart(event: EventTouch) {
        // 检查当前选中的球的数量是否小于槽位的数量
        if (gameData.selectBallIdArr.length >= gameConfig.chacaoNum) {
            // 如果槽位已满，输出警告信息
            console.log('itemTs', '槽位已满，无法继续');
            return
        }
        // 如果槽位未满，执行选中操作
        if (gameData.zanting) return
        // 播放点击消除物的音效
        musicMgr.ins.playSound('点击消除物')
        // 震动设备
        apiMgr.zhenDong()
        // 设置球为选中状态
        this.isSelect = true
        // 获取球在世界坐标系中的位置
        const worldPos: Vec3 = this.node.getWorldPosition()
        // 发送选中球事件，传递球的世界位置和角度和球的数据
        director.emit(eventType.selectBall, worldPos, this.node.angle, this.ballData)
        // 销毁球节点
        this.node.destroy()
    }
}
