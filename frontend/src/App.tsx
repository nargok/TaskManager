import { useState, useRef, useId } from 'react'
import { useDrag, useDrop } from 'react-aria'
import { GridList, GridListItem, Button, useDragAndDrop, isTextDropItem } from 'react-aria-components'
import { useListData } from 'react-stately'

import './App.css'

function App() {

  return (
    <>
      <h1>Kanban-sample</h1>
      <MultiGridList />
    </>
  )
}

type Item = {
  id: number;
  name: string;
};

type GridListProps = {
  initialItems: Item[];
  title: string;
};

// 列移動
export const MultiGridList = () => {
  return (
    <div className="multi-grid-list">
      <div>
        <MyGridList
          title="Todo"
          initialItems={[
            {
              id: 1,
              name: "buy milk",
            },
            {
              id: 2,
              name: "learn react",
            },
            {
              id: 3,
              name: "learn react-dnd",
            },
          ]}
        />
      </div>
      <div>
        <MyGridList
          title="In Progress"
          initialItems={[
            {
              id: 4,
              name: "learn opentelemetry",
            },
          ]}
        />
      </div>
      <div>
        <MyGridList title="Done" initialItems={[]} />
      </div>
    </div>
  );
};

export const MyGridList = ({ initialItems, title }: GridListProps) => {
  const list = useListData({
    initialItems,
  });

  const { dragAndDropHooks } = useDragAndDrop({
    getItems(keys) {
      return [...keys].map((key) => {
        const item = list.getItem(key);
        return {
          "custom-app-type": JSON.stringify(item),
          "text/plain": item.name,
        }
      });
    },
    // カスタム要素がドロップされるのを許可する
    acceptedDragTypes: ["custom-app-type"],
    // アイテムがコピーされるのではなく、常に移動されるようにする
    getDropOperation: () => "move",

    // 項目が他のリストからドロップされたときの処理
    async onInsert(e) {
      const processedItems = await Promise.all(
        e.items
          .filter(isTextDropItem)
          .map(async (item) =>
            JSON.parse(await item.getText("custom-app-type"))
          )
      );
      if (e.target.dropPosition === "before") {
        list.insertBefore(e.target.key, ...processedItems);
      } else if (e.target.dropPosition === "after") {
        list.insertAfter(e.target.key, ...processedItems);
      }
    },

    // グリッドの項目が空のリストにドロップされたときの処理
    async onRootDrop(e) {
      const processedItems = await Promise.all(
        e.items
        .filter(isTextDropItem)
        .map(async (item) =>
          JSON.parse(await item.getText("custom-app-type"))
        )
      );
      list.append(...processedItems);
    },

    // 同じリスト内での項目移動
    onReorder(e) {
      if (e.target.dropPosition === "before") {
        list.moveBefore(e.target.key, e.keys)
      } else if (e.target.dropPosition === "after") {
        list.moveAfter(e.target.key, e.keys)
      }
    },

    // 他のリスト二項目がドロップされたとき、本のリストから削除する
    onDragEnd(e) {
      if (e.dropOperation === "move" && !e.isInternal) {
        list.remove(...e.keys)
      }
    }
  })

  const titleId = useId();

  return (
    <div>
      <h2 id={titleId}>{title}</h2>
      <GridList
        aria-aria-labelledby={titleId}
        selectionMode="multiple"
        items={list.items}
        dragAndDropHooks={dragAndDropHooks}
        className="grid-list"
      >
        {(item) => (
          <GridListItem textValue={item.name} >
            <Button slot="drag" className="drag">
              ☰
            </Button>
            {item.name}
          </GridListItem>
        )}
      </GridList>
    </div>
  );
};

export const Draggable = () => {
  const { isDragging, dragProps} = useDrag({
    getItems: () => [{"text/plain": "Hello, world!"}]
  })

  return (
    <button {...dragProps} type="button">
      {isDragging ? "Dragging" : "Drag me"}
    </button>
  )
}

export const DropTarget = () => {
  const [dropped, setDropped] = useState<string | null>(null)
  const ref = useRef<HTMLButtonElement | null>(null)
  const { dropProps, isDropTarget } = useDrop({
    ref,
    async onDrop(e) {
      const items = await Promise.all(
        e.items
        .filter((item) => item.kind === "text")
        .map((item) => item.getText("text/plain"))
      )
      setDropped(items.join("\n"))
    }
  })

  return (
    <button
      {...dropProps}
      type="button"
      ref={ref}
      className={`drop-zone ${
        isDropTarget ? "target" : dropped ? "dropped" : ""
      }`}
    >
      {dropped || "Drop here"}
    </button>
  )
}

export default App
