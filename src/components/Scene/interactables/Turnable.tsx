import { Sphere, Wireframe } from "@react-three/drei";
import { Object3DNode, useFrame } from "@react-three/fiber";
import { Interactive, XRController } from "@react-three/xr";
import { FC, useRef, useState } from "react";
import { Group, Mesh, Vector3, XRTargetRaySpace } from "three";
import useGlobalState from "../../../GlobalState";
import { v2a } from "../../../Helper";

interface TurnableProps {
    axis?: Vector3;
    children?: any | any[];
    position?: Vector3;
    scale?: number;
}
const DEFAULT_AXIS = new Vector3(0, 1, 0);
const NO_POSITION = new Vector3(0, 0, 0);

export const Turnable: FC<TurnableProps> = ({ children, axis, scale, position }) => {
    const childrenGroup = useRef<Group>();
    const left = useRef<Mesh>();
    const [isDragging, setIsDragging] = useState(false);
    const [isHover, setIsHover] = useState(false);
    const [controller, setController] = useState<XRTargetRaySpace | undefined>(undefined);

    scale = scale ?? 1;
    position = position ?? NO_POSITION;

    useFrame(() => {
        if (!isDragging || !controller) {
            return;
        }
        const p = controller.position;
        const n = axis || DEFAULT_AXIS;
        const o = position!;
        const po = p.clone().sub(o);
        const npo = n.clone().multiply(po);
        const result = p.clone().sub(npo);
        childrenGroup!.current!.lookAt(result.add(position!));
    });
    return <group position={position}>
        <Interactive
            onSelectStart={(ev) => {
                setIsDragging(true);
                setController(ev.target.controller);
                console.log('SELECT');
            }}
            onSelectEnd={(ev) => {
                setIsDragging(false);
                setController(undefined);
                console.log('DROP');
            }}
            onHover={() => {
                setIsHover(true)
            }}
            onBlur={() => {
                setIsHover(false)
            }}
        >
            <Sphere scale={[scale, scale, scale]} visible={isHover}>
                <meshPhongMaterial color="#ff0000" opacity={0.1} transparent />
            </Sphere>
        </Interactive>
        <group position={position} ref={childrenGroup as any}>
            {children}
        </group>
    </group>
}