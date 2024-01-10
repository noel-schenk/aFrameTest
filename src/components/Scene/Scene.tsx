import {
    FC,
    ForwardRefExoticComponent,
    MemoExoticComponent,
    MutableRefObject,
    RefAttributes,
    Suspense,
    useEffect,
    useRef,
    useState,
} from 'react'
import { SceneWrapper } from './Scene.styled'
import { Canvas, useFrame } from '@react-three/fiber'
import { Box, Plane, Sphere, Text } from '@react-three/drei'
import {
    Controllers,
    Hands,
    Interactive,
    VRButton,
    XR,
    useController,
} from '@react-three/xr'
import {
    CollisionPayload,
    Physics,
    RapierRigidBody,
    RigidBody,
    RigidBodyProps,
} from '@react-three/rapier'
import { BufferGeometry, Mesh, NormalBufferAttributes, Vector3 } from 'three'
import useGlobalState from '../../GlobalState'
import { v2a } from '../../Helper'
import { TestMessage } from 'rxjs/internal/testing/TestMessage'
import { Turnable } from './interactables/Turnable'

interface SceneProps {}

const PhysicsBox = () => {
    // const globalState = useGlobalState()

    // const boxRigidBody = useRef<RapierRigidBody>(null)
    // const [boxColor, setBoxColor] = useState('blue')
    // const [position] = useState(new Vector3(0, 0.3, 0))
    // const [isDragging, setIsDragging] = useState(false)
    // const [test, setTest] = useState(false)

    useFrame(() => {
        // const controllerRight = globalState['controller-right']
        // console.log(
        //     'pressed',
        //     controllerRight.inputSource?.gamepad?.buttons[0].pressed
        // )

        // if (!isDragging) {
        //     setTest(false)
        //     boxRigidBody.current?.setEnabled(true)
        //     return
        // }

        // if (!controllerRight.inputSource?.gamepad?.buttons[0].pressed) {
        //     setIsDragging(false)
        //     return
        // }

        // setBoxColor('red')
        // boxRigidBody.current?.setEnabled(false)
        // boxRigidBody.current?.setTranslation(
        //     controllerRight.controller.position,
        //     true
        // )
    })

    return (
        <Interactive
            // onHover={() => {
            //     setTest(true)
            //     setIsDragging(true)
            // }}
        >
            <RigidBody>
                <Box args={[0.2, 0.2, 0.2]} position={[0, 0.3, 0]}>
                    <meshStandardMaterial color={'blue'} />
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
    const globalState = useGlobalState()

    const left = useRef<RapierRigidBody>(null)
    const right = useRef<RapierRigidBody>(null)

    const [isIntersecting, setIsIntersecting] = useState(false)
    const [lastIntersection, setLastIntersection] = useState<CollisionPayload>()
    const [resetIntersection, setResetIntersection] = useState(false)

    const test = useRef() as React.RefObject<Mesh<BufferGeometry>>

    const [testText, setTestText] = useState('NE')

    useFrame(() => {
        if (
            !globalState['controller-left']?.controller?.position ||
            !globalState['controller-right']?.controller?.position
        )
            return

        left.current?.setTranslation(
            globalState['controller-left'].controller.position,
            false
        )
        right.current?.setTranslation(
            globalState['controller-right'].controller.position,
            false
        )

        const x = v2a(globalState['controller-right'].controller.position)
        x[1] = x[1] + 0.5
        test.current?.position.set(...x)

        if (globalState['controller-right'].inputSource?.gamepad?.buttons[0].pressed && isIntersecting) {
            setResetIntersection(false)
        }

        if (globalState['controller-right'].inputSource?.gamepad?.buttons[0].pressed && !resetIntersection) {
            lastIntersection?.other.rigidBody?.setEnabled(false)
            lastIntersection?.other.rigidBody?.setTranslation(
                globalState['controller-right'].controller.position,
                false
            )
        } else {
            if (!resetIntersection) {
                setResetIntersection(true)
                lastIntersection?.other.rigidBody?.setEnabled(true)
                lastIntersection?.other.rigidBody?.setTranslation(
                    globalState['controller-right'].controller.position,
                    true
                )
            }
        }
    })

    return (
        <>
            <RigidBody ref={left} sensor type={'kinematicPosition'}>
                <Sphere args={[0.2]}>
                    <meshStandardMaterial color="red" />
                </Sphere>
            </RigidBody>
            <RigidBody
                ref={right}
                sensor
                type={'kinematicPosition'}
                onIntersectionEnter={(event) => {
                    setIsIntersecting(true)
                    setLastIntersection(event)
                }}
                onIntersectionExit={() => {
                    setIsIntersecting(false)
                }}
            >
                <Sphere args={[0.2]}>
                    <meshStandardMaterial color="blue" />
                </Sphere>
            </RigidBody>
            <Text ref={test} color="green" fontSize={0.1}>
                Test:{testText}
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
                        <Suspense>
                            <Physics debug gravity={[0, -9.81, 0]}>
                                <Hand />
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
