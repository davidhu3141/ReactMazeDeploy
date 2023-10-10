import React, { useState } from 'react';

import MazeGenDemoWithUI from './demo1/MazeGenDemoWithUI';
import Game from './demo2/Game';
import GameAnim from './demo3/GameAnim';
import MinimalGame from './demo4/MinimalGame';
import MinimalHexagon from './demo5/MinimalHexagon';

function App() {

  // 在外面就會壞掉，但還不太懂為甚麼
  const buttons = [
    { description: 'Demo1 - 迷宮生成器', component: MazeGenDemoWithUI },
    { description: 'Demo2 - 拖曳操控', component: Game },
    { description: 'Demo3 - 點擊操控', component: GameAnim },
    { description: 'Demo4 - 可遊玩的最小範例', component: MinimalGame },
    { description: 'Demo5 - 六邊形實驗', component: MinimalHexagon },
  ];

  const [buttonIndex, setButtonIndex] = useState(1);

  const Displaying = buttons[buttonIndex].component;

  return (
    <div style={{ maxWidth: 1440, marginLeft: 'auto', marginRight: 'auto' }}>

      <div style={{ margin: 12 }}>
        {buttons.map((button, index) => (
          <button
            key={index}
            onClick={() => setButtonIndex(index)}
          >
            {button.description}
          </button>
        ))}
      </div>

      <div style={{ margin: 12 }}>
        <Displaying />
      </div>

      {/* <Joystick /> */}

    </div>
  );
}

export default App;
