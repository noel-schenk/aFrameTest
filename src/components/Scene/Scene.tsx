import {
    FC, Suspense, useEffect, useRef,
    useState
} from 'react'
import { SceneWrapper } from './Scene.styled'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, Plane, Sphere, Text } from '@react-three/drei'
import {
    Controllers,
    Hands,
    Interactive, VRButton,
    XR, useController
} from '@react-three/xr'
import { Physics, RapierRigidBody, RigidBody } from '@react-three/rapier'
import {
    BufferGeometry,
    Mesh,
    NormalBufferAttributes,
    Vector3
} from 'three'
import useGlobalState from '../../GlobalState'
import { v2a } from '../../Helper'
import { Turnable } from './interactables/Turnable'

interface SceneProps {}

const PhysicsBox = () => {
    const globalState = useGlobalState()

    const boxRigidBody = useRef<RapierRigidBody>(null)
    const [boxColor, setBoxColor] = useState('blue')
    const [position] = useState(new Vector3(0, 0.3, 0))
    const [isDragging, setIsDragging] = useState(false)
    const [test, setTest] = useState(false)

    useFrame(() => {
        const controllerRight = globalState['controller-right']
        console.log(
            'pressed',
            controllerRight.inputSource?.gamepad?.buttons[0].pressed
        )

        if (!isDragging) {
            setTest(false);
            boxRigidBody.current?.setEnabled(true)
            return
        }

        if (!controllerRight.inputSource?.gamepad?.buttons[0].pressed) {
            setIsDragging(false)
            return
        }

        setBoxColor('red')
        boxRigidBody.current?.setEnabled(false)
        boxRigidBody.current?.setTranslation(
            controllerRight.controller.position,
            true
        )
    })

    return (
        <Interactive onHover={() => {setTest(true); setIsDragging(true); }}>
            <RigidBody ref={boxRigidBody}>
                <Text color="green" position={[1, 1, 1]} fontSize={0.1}>
                    Test: {JSON.stringify(test)} Position is set to {position} and test: and gs:
                </Text>
                <Box args={[0.2, 0.2, 0.2]} position={position}>
                    <meshStandardMaterial color={boxColor} />
                </Box>
            </RigidBody>
        </Interactive>
    )
}

const Floor = () => {
    return (
        <RigidBody>
            <Plane
                args={[10, 10]}
                rotation={[-Math.PI / 2, 0, 0]}
                position={[0, 0, 0]}
                receiveShadow
            >
                <meshStandardMaterial color="pink" />
            </Plane>
        </RigidBody>
    )
}

const Hand = () => {
    const globalState = useGlobalState();

    const left = useRef() as React.RefObject<Mesh<BufferGeometry>>
    const right = useRef() as React.RefObject<Mesh<BufferGeometry>>

    const [test, setTest] = useState('test')

    useFrame(() => {
        if(!globalState['controller-left']?.controller?.position || !globalState['controller-right']?.controller?.position) return;
        
        left.current?.position.set(...v2a(globalState['controller-left'].controller.position))
        right.current?.position.set(...v2a(globalState['controller-right'].controller.position))
    });  

    useEffect(() => {
        if (left.current) {
          // Set the position here
          left.current.position.set(1, 2, 3); // Example position
        }
      }, []);

    return (
        <>
            <Sphere ref={left} args={[0.2]}>
                <meshStandardMaterial color="red" />
            </Sphere>
            <Sphere ref={right} args={[0.2]}>
                <meshStandardMaterial color="blue" />
            </Sphere>
            <Text color="green" fontSize={0.1}>
                Test:
            </Text>
        </>
    )
}

interface XRInitProps {
    children: React.ReactNode
}

const XR_Init: React.FC<XRInitProps> = ({ children }) => {
    const globalState = useGlobalState()

    const controllerLeft = useController('left')
    const controllerRight = useController('right')

    useFrame(() => {
        if (!controllerLeft || !controllerRight) return
        globalState.set('controller-left', controllerLeft)
        globalState.set('controller-right', controllerRight)
    })

    return <>{children}</>
}

const Scene: FC<SceneProps> = () => {
    return (
        <SceneWrapper>
            <VRButton />
            <Canvas>
                <XR>
                    <XR_Init>
                        <Controllers />
                        <Hand />
                        <Suspense>
                            <Physics debug gravity={[0, -9.81, 0]}>
                                <Hands />
                                <ambientLight intensity={Math.PI / 2} />
                                <spotLight
                                    position={[10, 10, 10]}
                                    angle={0.15}
                                    penumbra={1}
                                    decay={0}
                                    intensity={Math.PI}
                                />
                                <pointLight
                                    position={[-10, -10, -10]}
                                    decay={0}
                                    intensity={Math.PI}
                                />
                                <PhysicsBox />
                                <PhysicsBox />
                                <PhysicsBox />
                                <PhysicsBox />
                                <Interactive>
                                    <Box position={[1.2, 2, 0]} />
                                </Interactive>

                                <Turnable scale={0.3} position={new Vector3(0, 0.25, 0)}>
                                    <Box scale={[0.1, 1, 0.4]} position={new Vector3(0, 0, 0.2)}>
                                        <meshStandardMaterial color="red" />
                                    </Box>
                                </Turnable>

                                <Floor />
                            </Physics>
                        </Suspense>
                    </XR_Init>
                </XR>
            </Canvas>
        </SceneWrapper>
    )
}

export default Scene
