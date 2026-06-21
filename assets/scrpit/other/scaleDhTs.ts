import { _decorator, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('scaleDhTs')
export class scaleDhTs extends Component {
    start() {
        tween(this.node).by(1, { scale: v3(0.11, 0.11, 0) }).by(1, { scale: v3(-0.11, -0.11, 0) }).union().repeatForever().start()
    }
}


