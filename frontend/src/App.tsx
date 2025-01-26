import { useState, useRef } from 'react'
import { useDrag, useDrop } from 'react-aria'
import { GridList, GridListItem, Button, useDragAndDrop } from 'react-aria-components'
import { useListData } from 'react-stately'

import './App.css'

function App() {

  return (
    <>
      <h1>Kanban-sample</h1>
      {/* <Draggable />

      <DropTarget /> */}
      <MyGridList />
    </>
  )
}

export const MyGridList = () => {
  const list = useListData({
    initialItems: [
      { id: 1, name: "Appale" },
      { id: 2, name: "Google" },
      { id: 3, name: "Microsoft" },
    ]
  })

  const { dragAndDropHooks } = useDragAndDrop({
    getItems: (keys) =>
    [...keys].map((key) => ({"text/plain": list.getItem(key).name })),
    onReorder(e) {
      if (e.target.dropPosition === "before") {
        list.moveBefore(e.target.key, e.keys)
      } else if (e.target.dropPosition === "after") {
        list.moveAfter(e.target.key, e.keys)
      }
    }
  })

  return (
    <GridList
     aria-lael="Big tech companies"
     items={list.items}
     dragAndDropHooks={dragAndDropHooks}
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
  )
}

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
