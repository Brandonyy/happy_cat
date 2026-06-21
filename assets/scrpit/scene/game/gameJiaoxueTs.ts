import { _decorator, Component, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('gameJiaoxueTs')
export class gameJiaoxueTs extends Component {
    onGuanbi() {
        this.node.destroy()
    }
}


