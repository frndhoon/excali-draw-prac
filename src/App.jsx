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
  const [isOverlayMode, setIsOverlayMode] = useState(false);

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

  const toggleOverlayMode = () => {
    setIsOverlayMode(!isOverlayMode);
  };

  const mainBoard = isLeftBoard ? (
    <div className="flex-1">
      <Excalidraw
        onChange={onChangeLeft}
        elements={leftElements}
        viewModeEnabled={!isLeftBoard}
        excalidrawAPI={(api) => setLeftExcalidrawAPI(api)}
      />
    </div>
  ) : (
    <div className="flex-1">
      <Excalidraw
        onChange={onChangeRight}
        elements={rightElements}
        viewModeEnabled={isLeftBoard}
        excalidrawAPI={(api) => setRightExcalidrawAPI(api)}
      />
    </div>
  );

  const overlayBoard = isLeftBoard ? (
    <Excalidraw
      onChange={onChangeRight}
      elements={rightElements}
      viewModeEnabled={true}
      excalidrawAPI={(api) => setRightExcalidrawAPI(api)}
    />
  ) : (
    <Excalidraw
      onChange={onChangeLeft}
      elements={leftElements}
      viewModeEnabled={true}
      excalidrawAPI={(api) => setLeftExcalidrawAPI(api)}
    />
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50">
      <div className="flex flex-1 p-4 gap-4">
        <div
          className={`${
            isOverlayMode ? 'w-full' : 'w-1/2'
          } flex flex-col rounded-lg shadow-lg bg-white overflow-hidden`}
        >
          <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600">
            <h2 className="text-white font-semibold text-lg mb-3">
              {isLeftBoard ? '내 보드' : '다른 사용자의 보드'}
            </h2>
            <button
              className="px-6 py-2 bg-white text-blue-600 rounded-full font-medium
                         transition-all duration-200 hover:bg-blue-50 hover:shadow-md
                         active:transform active:scale-95"
              onClick={toggleOverlayMode}
            >
              {isOverlayMode ? '겹치기 해제' : '겹치기'}
            </button>
          </div>
          <div className="flex-1">
            <Excalidraw
              onChange={onChangeLeft}
              elements={leftElements}
              viewModeEnabled={!isLeftBoard}
              excalidrawAPI={(api) => setLeftExcalidrawAPI(api)}
            />
          </div>
          {isOverlayMode && (
            <div className="absolute top-[69px] left-0 right-0 bottom-0 opacity-50 pointer-events-none z-[1000]">
              <div className="h-full">
                <Excalidraw
                  onChange={onChangeRight}
                  elements={rightElements}
                  viewModeEnabled={true}
                  excalidrawAPI={(api) => setRightExcalidrawAPI(api)}
                />
              </div>
            </div>
          )}
        </div>
        {!isOverlayMode && (
          <div className="w-1/2 flex flex-col rounded-lg shadow-lg bg-white overflow-hidden">
            <div className="text-center p-4 bg-gradient-to-r from-blue-500 to-blue-600">
              <h2 className="text-white font-semibold text-lg">
                {!isLeftBoard ? '내 보드' : '다른 사용자의 보드'}
              </h2>
            </div>
            <div className="flex-1">
              <Excalidraw
                onChange={onChangeRight}
                elements={rightElements}
                viewModeEnabled={isLeftBoard}
                excalidrawAPI={(api) => setRightExcalidrawAPI(api)}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
