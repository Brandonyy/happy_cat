import { _decorator, Component, Node, tween, v3 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('fudongDhTs')
export class fudongDhTs extends Component {
    floatTime: number = 0.5;
    floatDJuli: number = 11;
    protected onEnable(): void {
        tween(this.node).by(this.floatTime, { position: v3(0, this.floatDJuli, 0) }).by(this.floatTime, { position: v3(0, -this.floatDJuli, 0) }).union().repeatForever().start()
    }
}


