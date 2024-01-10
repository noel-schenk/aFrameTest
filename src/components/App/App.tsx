import { FC } from 'react';
import { AppWrapper } from './App.styled';
import Scene from '../Scene/Scene';

interface AppProps {}

const App: FC<AppProps> = () => (
 <AppWrapper>
      <Scene />
 </AppWrapper>
);

export default App;
