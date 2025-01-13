import { useEffect, useState, useCallback } from 'react';
import { Excalidraw } from '@excalidraw/excalidraw';
import io from 'socket.io-client';

const socket = io('http://localhost:3001');

function App() {
  const [leftElements, setLeftElements] = useState([]);
  const [rightElements, setRightElements] = useState([]);
  const [isLeftBoard, setIsLeftBoard] = useState(true);
  const [leftExcalidrawAPI, setLeftExcalidrawAPI] = useState(null);
  const [rightExcalidrawAPI, setRightExcalidrawAPI] = useState(null);

  const updateLeftScene = useCallback(() => {
    if (leftExcalidrawAPI) {
      const leftSceneData = {
        elements: leftElements,
      };
      leftExcalidrawAPI.updateScene(leftSceneData);
    }
  }, [leftExcalidrawAPI, leftElements]);

  const updateRightScene = useCallback(() => {
    if (rightExcalidrawAPI) {
      const rightSceneData = {
        elements: rightElements,
      };
      rightExcalidrawAPI.updateScene(rightSceneData);
    }
  }, [rightExcalidrawAPI, rightElements]);

  useEffect(() => {
    socket.on('assignBoard', (board) => {
      setIsLeftBoard(board === 'left');
    });

    socket.on('updateLeftBoard', (elements) => {
      if (!isLeftBoard) {
        console.log('Received left board update:', elements);
        setLeftElements(elements);
        setTimeout(() => updateLeftScene(), 0);
      }
    });

    socket.on('updateRightBoard', (elements) => {
      if (isLeftBoard) {
        console.log('Received right board update:', elements);
        setRightElements(elements);
        setTimeout(() => updateRightScene(), 0);
      }
    });

    return () => {
      socket.off('assignBoard');
      socket.off('updateLeftBoard');
      socket.off('updateRightBoard');
    };
  }, [isLeftBoard, updateLeftScene, updateRightScene]);

  const onChangeLeft = useCallback(
    (elements) => {
      if (isLeftBoard) {
        setLeftElements(elements);
        socket.emit('updateLeftBoard', elements);
      }
    },
    [isLeftBoard]
  );

  const onChangeRight = useCallback(
    (elements) => {
      if (!isLeftBoard) {
        setRightElements(elements);
        socket.emit('updateRightBoard', elements);
      }
    },
    [isLeftBoard]
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', flex: 1 }}>
        <div style={{ width: '50%', height: '100%' }}>
          <div className="text-center p-2 bg-blue-100">
            <h2>{isLeftBoard ? '내 보드' : '다른 사용자의 보드'}</h2>
          </div>
          <Excalidraw
            onChange={onChangeLeft}
            elements={leftElements}
            viewModeEnabled={!isLeftBoard}
            excalidrawAPI={(api) => setLeftExcalidrawAPI(api)}
          />
        </div>
        <div style={{ width: '50%', height: '100%' }}>
          <div className="text-center p-2 bg-blue-100">
            <h2>{!isLeftBoard ? '내 보드' : '다른 사용자의 보드'}</h2>
          </div>
          <Excalidraw
            onChange={onChangeRight}
            elements={rightElements}
            viewModeEnabled={isLeftBoard}
            excalidrawAPI={(api) => setRightExcalidrawAPI(api)}
          />
        </div>
      </div>
      <div className="flex justify-center p-4 gap-4 mt-10">
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={updateLeftScene}
        >
          왼쪽 보드 업데이트
        </button>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={updateRightScene}
        >
          오른쪽 보드 업데이트
        </button>
      </div>
    </div>
  );
}

export default App;
