import React, { FC } from 'react';
import { GrabbableWrapper } from './Grabbable.styled';

interface GrabbableProps {}

const Grabbable: FC<GrabbableProps> = () => (
 <GrabbableWrapper>
    Grabbable Component
 </GrabbableWrapper>
);

export default Grabbable;
