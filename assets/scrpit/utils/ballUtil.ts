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
        // 根据球的 ID 获取球的数据
        const data: ballDto = ballConfig[ballId]
        // 根据球的 ID 获取球的数据
        if (!data) return false
        // 根据球的 ID 获取球的数据
        return data.type == type
    }

    /**
       * 获取普通球的数组
       */
    static getPutongBall(): ballDto[] {
        // 使用 filter 方法过滤出类型不等于 BallType.Pig(不是猫) 的球
        const putongBall: ballDto[] = ballConfig.filter((v) => {
            return v.type != ballType.cat
        })
        // 返回过滤后的球数组
        return putongBall
    }
    /**
   * 根据指定的球类型获该类型的所有求
   */
    static getTypeBall(type): ballDto[] {
        // 使用 filter 方法过滤出类型等于指定类型的球
        const typeBall: ballDto[] = ballConfig.filter((val) => {
            return val.type == type
        })
        // 使用 filter 方法过滤出类型等于指定类型的球
        return typeBall
    }
}


