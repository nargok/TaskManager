import { useState, useRef, useId } from 'react'
import { useDrag, useDrop } from 'react-aria'
import { GridList, GridListItem, Button, useDragAndDrop, isTextDropItem } from 'react-aria-components'
import { useListData } from 'react-stately'

import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-2xl font-bold mb-8 text-gray-800">Kanban-sample</h1>
      <MultiGridList />
    </div>
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

export const MultiGridList = () => {
  return (
    <div className="flex gap-6">
      <div className="w-80 bg-gray-50 rounded-lg shadow-sm p-4">
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
      <div className="w-80 bg-gray-50 rounded-lg shadow-sm p-4">
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
      <div className="w-80 bg-gray-50 rounded-lg shadow-sm p-4">
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
    acceptedDragTypes: ["custom-app-type"],
    getDropOperation: () => "move",

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

    onReorder(e) {
      if (e.target.dropPosition === "before") {
        list.moveBefore(e.target.key, e.keys)
      } else if (e.target.dropPosition === "after") {
        list.moveAfter(e.target.key, e.keys)
      }
    },

    onDragEnd(e) {
      if (e.dropOperation === "move" && !e.isInternal) {
        list.remove(...e.keys)
      }
    }
  })

  const titleId = useId();

  return (
    <div>
      <h2 id={titleId} className="text-lg font-semibold mb-4 text-gray-700">{title}</h2>
      <GridList
        aria-labelledby={titleId}
        selectionMode="multiple"
        items={list.items}
        dragAndDropHooks={dragAndDropHooks}
        className="space-y-2 min-h-[100px] border-2 border-dashed border-gray-200 rounded p-2"
        renderEmptyState={() => (
          <div className="h-full w-full flex items-center justify-center text-gray-400">
            ドロップしてアイテムを追加
          </div>
        )}
      >
        {(item) => (
          <GridListItem textValue={item.name} className="bg-white rounded shadow p-3 flex items-center gap-2">
            <Button slot="drag" className="text-gray-400 hover:text-gray-600 cursor-move">
              ☰
            </Button>
            <span className="text-gray-700">{item.name}</span>
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
