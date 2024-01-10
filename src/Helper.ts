import { Vector3 } from 'three'

export const v2a = (vector: Vector3): [number, number, number] => {
    return [vector.x, vector.y, vector.z]
}
