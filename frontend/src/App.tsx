import { useState, useRef, useId } from 'react'
import { useDrag, useDrop } from 'react-aria'
import { GridList, GridListItem, Button, useDragAndDrop, isTextDropItem } from 'react-aria-components'
import { useListData } from 'react-stately'

import './App.css'

function App() {
  return (
    <div className="min-h-screen bg-white p-2">
      <h1 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 text-center">週間タスク管理</h1>
      <div className="max-w-[96vw] mx-auto">
        <MultiGridList />
      </div>
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
    <div className="flex gap-1.5 justify-between">
      <div className="w-[12vw] border border-gray-300 rounded shadow-sm p-1.5 transition-shadow hover:shadow">
        <MyGridList
          title="Mon"
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
      <div className="w-[12vw] border border-gray-300 rounded shadow-sm p-1.5 transition-shadow hover:shadow">
        <MyGridList
          title="Tue"
          initialItems={[
            {
              id: 4,
              name: "learn opentelemetry",
            },
          ]}
        />
      </div>
      <div className="w-[12vw] border border-gray-300 rounded shadow-sm p-1.5 transition-shadow hover:shadow">
        <MyGridList title="Wed" initialItems={[]} />
      </div>
      <div className="w-[12vw] border border-gray-300 rounded shadow-sm p-1.5 transition-shadow hover:shadow">
        <MyGridList title="Thu" initialItems={[]} />
      </div>
      <div className="w-[12vw] border border-gray-300 rounded shadow-sm p-1.5 transition-shadow hover:shadow">
        <MyGridList title="Fri" initialItems={[]} />
      </div>
      <div className="w-[12vw] border border-gray-300 rounded shadow-sm p-1.5 transition-shadow hover:shadow">
        <MyGridList title="Sat" initialItems={[]} />
      </div>
      <div className="w-[12vw] border border-gray-300 rounded shadow-sm p-1.5 transition-shadow hover:shadow">
        <MyGridList title="Sun" initialItems={[]} />
      </div>
    </div>
  );
};

export const MyGridList = ({ initialItems, title }: GridListProps) => {
  const [newTaskName, setNewTaskName] = useState("");
  const list = useListData({
    initialItems,
  });

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName.trim()) {
      const newTask = {
        id: Date.now(),
        name: newTaskName.trim()
      };
      list.append(newTask);
      setNewTaskName("");
    }
  };

  const { dragAndDropHooks } = useDragAndDrop({
    getItems(keys) {
      return [...keys].map((key) => {
        const item = list.getItem(key);
        if (!item) {
          throw new Error(`Item with key ${key} not found`);
        }
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
      <h2 id={titleId} className="text-sm font-semibold mb-1.5 text-gray-700 border-b border-gray-100 pb-1">{title}</h2>
      <form onSubmit={handleAddTask} className="mb-1.5 flex gap-1">
        <input
          type="text"
          value={newTaskName}
          onChange={(e) => setNewTaskName(e.target.value)}
          placeholder="新しいタスク"
          className="flex-1 px-1.5 py-0.5 text-xs border border-gray-200 rounded shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
        />
        {/* <button
          type="submit"
          className="px-1.5 py-0.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:ring-offset-1"
        >
          追加
        </button> */}
      </form>
      <GridList
        aria-labelledby={titleId}
        selectionMode="multiple"
        items={list.items}
        dragAndDropHooks={dragAndDropHooks}
        className="space-y-1 min-h-[120px] border border-dashed border-gray-100 rounded p-1 bg-gray-50/30 text-xs"
        renderEmptyState={() => (
          <div className="h-full w-full flex items-center justify-center text-gray-400 text-xs">
            タスクを追加
          </div>
        )}
      >
        {(item) => (
          <GridListItem textValue={item.name} className="bg-white rounded border border-gray-200 p-1.5 flex items-center gap-1 hover:shadow-sm transition-shadow">
            <Button slot="drag" className="text-gray-400 hover:text-gray-600 cursor-move text-xs">
              ☰
            </Button>
            <span className="text-gray-700 text-xs truncate">{item.name}</span>
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
