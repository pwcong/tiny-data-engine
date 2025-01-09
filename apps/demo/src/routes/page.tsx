import { useEffect, useRef, useState } from "react";

import { DataEngine, ENodeType } from "@tiny-data-engine/sdk";

import "./index.css";

const Index = () => {
  const dataEngine = useRef<DataEngine>();

  const [diff, setDiff] = useState("");
  const [draft, setDraft] = useState("");

  const handleAddNode = (type: ENodeType) => {
    if (!dataEngine.current) {
      return;
    }
    const id = Math.random().toString(16).slice(2);
    dataEngine.current.api.node.insert({
      index: 0,
      id,
      name: `Node-${id}`,
      type: ENodeType.TypeA,
    });
  };

  const handleBatchAddNode = (type: ENodeType) => {
    if (!dataEngine.current) {
      return;
    }

    const taskId = dataEngine.current.api.batch.batchStart();

    for (let i = 0; i < 10; i++) {
      handleAddNode(type);
    }

    dataEngine.current.api.batch.batchEnd(taskId);
  };

  useEffect(() => {
    const _dataEngine = (dataEngine.current = new DataEngine());
    _dataEngine.onChangeDiff((diff) => {
      setDiff(
        JSON.stringify({
          node: diff.node,
          actionOperateType: diff.actionOperateType,
          commit: diff.commit,
          isInBatchMode: diff.isInBatchMode,
        })
      );
      setDraft(_dataEngine.getDocumentStr());
    });
  }, []);

  return (
    <div className="container-box">
      <div className="toolbar">
        <button onClick={() => handleAddNode(ENodeType.TypeA)}>
          Add Node A
        </button>
        <button onClick={() => handleBatchAddNode(ENodeType.TypeA)}>
          Batch Add Node A
        </button>
        <button onClick={() => handleAddNode(ENodeType.TypeB)}>
          Add Node B
        </button>
        <button onClick={() => handleBatchAddNode(ENodeType.TypeB)}>
          Batch Add Node B
        </button>
        <button
          onClick={() => {
            if (dataEngine.current?.api.undoRedo.canUndo()) {
              dataEngine.current?.api.undoRedo.undo();
            } else {
              window.alert("can not undo");
            }
          }}
        >
          Undo
        </button>
        <button
          onClick={() => {
            if (dataEngine.current?.api.undoRedo.canRedo()) {
              dataEngine.current?.api.undoRedo.redo();
            } else {
              window.alert("can not redo");
            }
          }}
        >
          Redo
        </button>
      </div>
      <fieldset>
        <legend>Diff</legend>
        <div className="diff">{diff}</div>
      </fieldset>
      <fieldset>
        <legend>Draft</legend>
        <div className="draft">{draft}</div>
      </fieldset>
    </div>
  );
};

export default Index;
