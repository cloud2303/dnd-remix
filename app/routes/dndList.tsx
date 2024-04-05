import {memo, useEffect, useMemo, useRef, useState} from "react";
import invariant from "tiny-invariant";
import {draggable, dropTargetForElements, monitorForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import {combine} from "@atlaskit/pragmatic-drag-and-drop/combine";
import clsx from "clsx";
import {attachClosestEdge, extractClosestEdge} from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import {Edge} from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";
import {DropIndicator} from "@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box";
import {motion} from "framer-motion";
import {useDndListStore} from "~/store/dndListStore";




function DndList() {
    const list = useDndListStore((state) => state.items);

    const reorderItem = useDndListStore((state) => state.reorderItem);
    useEffect(() => {
        return monitorForElements({
            canMonitor:({source})=>{
                return source.data.id !== undefined
            },
            onDrop:({location,source})=>{
                const target = location.current.dropTargets[0];
                if(!target){
                    return;
                }
                const sourceData = source.data;
                const targetData = target.data
                console.log("source",sourceData)
                console.log("target",targetData)
                if(!sourceData || !targetData){
                    return;
                }
                const startIndex = sourceData.index
                const targetIndex = targetData.index
                invariant(typeof startIndex === "number")
                invariant(typeof targetIndex === "number")
                const indexOfTarget = list.findIndex((item)=>item.id === targetData.id)
                if(indexOfTarget <0){
                    return;
                }
                const closetEdgeOfTarget = extractClosestEdge(targetData)
                reorderItem({
                    startIndex:startIndex,
                    indexOfTarget,
                    closestEdgeOfTarget:closetEdgeOfTarget
                })
            }

        })
    }, [list, reorderItem]);

    return (
        <div>
            <div className="flex justify-center">
                <div className="w-1/2">
                    <div
                        className="flex justify-between px-4 py-2 bg-white border border-gray-200 rounded-md shadow-sm">
                        <span>Tasks</span>
                    </div>
                    <div className="flex flex-col border  mt-8">
                        {list.map((item, index) => <ListItem key={item.id} index={index} item={item}/>)}
                    </div>
                </div>
            </div>
        </div>
    );
}

const ListItem = memo(function ListItem({item, index}: { item: { id: string, label: string }, index: number }){
    const ref = useRef<HTMLDivElement>(null)
    const data = useMemo(() => ({...item, index}), [index, item])

    const [isDragging, setIsDragging] = useState(false)
    const [closestEdge, setClosestEdge] = useState<Edge | null>(null);


    useEffect(() => {
        const el = ref.current;
        invariant(el)
        return combine(
            draggable({
                element: el,
                getInitialData: () => data,
                onDragStart: () => {
                    console.log("drag start")
                    setIsDragging(true)
                },
                onDrop: () => {
                    console.log("drop")
                    setIsDragging(false)
                }
            }),
            dropTargetForElements({
                element: el,
                canDrop:({source})=>{
                    return source.data.id !== data.id
                    // return true
                 },
                getData: ({input}) => {
                    return attachClosestEdge(data, {
                        element: el,
                        input,
                        allowedEdges: ["top", "bottom"]
                    })
                },
                onDrag: ({self, source}) => {
                    const isSource = source.element === el
                    console.log("drag is source", isSource)
                    if (isSource) {
                        setClosestEdge(null)
                        return
                    }
                    const closestEdge = extractClosestEdge(self.data)
                    const sourceIndex = source.data.index
                    console.log(source.data)
                    invariant(typeof sourceIndex === "number")
                    const isItemBeforeSource = index === sourceIndex - 1
                    const isItemAfterSource = index === sourceIndex + 1
                    const isDropIndicationHidden = (
                        (closestEdge === "bottom" && isItemBeforeSource) ||
                        (closestEdge === "top" && isItemAfterSource)
                    )
                    if (isDropIndicationHidden) {
                        setClosestEdge(null)
                        return
                    }
                    setClosestEdge(closestEdge)
                },
                onDragEnter: () => {
                    console.log("drag enter")
                },
                onDragLeave: () => {
                    console.log("drag leave")
                    setClosestEdge(null)
                },
                onDrop: () => {
                    console.log("drop")
                    setClosestEdge(null)
                }
            })
        )
    }, [data, index]);
    return (
        <motion.div layout  ref={ref}
             className={clsx("relative flex flex-col  px-4 py-2  border-0 border-b last:border-b-0 ",
                 isDragging && "opacity-45"
             )
             }>
            <span>{item.label}</span>
            {closestEdge && <DropIndicator edge={closestEdge} gap="1px"/>}
        </motion.div>
    );
})
export default DndList;
