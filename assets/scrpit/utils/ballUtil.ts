import { _decorator, Component, Node } from 'cc';
import { ballDto } from '../dto/ballDto';
import { ballConfig } from '../configs/ballConfig';
import { ballType } from '../configs/pathName';
const { ccclass, property } = _decorator;

@ccclass('ballUtil')
export class ballUtil extends Component {
    /**
     * 判断一个球是否属于指定类型
     * @param ballId - 球的 ID
     * @param type - 要检查的球类型
     * @returns 如果球属于指定类型，返回 true，否则返回 false
     */
    static isBallType(ballId: number, type): boolean {
        const data: ballDto = ballConfig[ballId];
        if (!data) return false;
        return data.type == type;
    }

    /**
     * 获取普通球的数组
     */
    static getPutongBall(): ballDto[] {
        return ballConfig.filter((ball) => ball.type != ballType.cat);
    }

    /**
     * 获取指定类型的所有球
     */
    static getTypeBall(type): ballDto[] {
        return ballConfig.filter((ball) => ball.type == type);
    }
}
