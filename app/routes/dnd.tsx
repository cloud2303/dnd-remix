import {ReactNode, useEffect, useRef, useState} from 'react';
import {draggable, dropTargetForElements, monitorForElements} from "@atlaskit/pragmatic-drag-and-drop/element/adapter";
import invariant from "tiny-invariant";
import clsx from "clsx";

function Page() {
    const [isInDropZone, setIsInDropZone] = useState(false);
    useEffect(() => {
        return monitorForElements({
            onDrop({source,location}){
                const destination = location.current.dropTargets[0];
                if(!destination){
                    setIsInDropZone(false)
                    return;
                }
                const destinationLocation = destination.data.location
                if(destinationLocation === "droppable-area"){
                    setIsInDropZone(true)
                }
            }
        })
    }, []);
    return (
        <div>
            <DroppableArea>
                {isInDropZone && <DraggableItem/>}
            </DroppableArea>
            {!isInDropZone && <DraggableItem/>}
        </div>
    );
}

function getColor(isDraggedOver:boolean){
    return isDraggedOver ? "bg-blue-400" : "bg-blue-200"
}
function DroppableArea({children}:{children:ReactNode}){
    const ref = useRef(null)
    const [isDraggedOver,setIsDraggedOver] = useState(false)

    useEffect(() => {
        const el = ref.current;
        invariant(el)
        return dropTargetForElements({
            element: el,
            getData:()=>({
                location:"droppable-area",
            }),
            onDragEnter:()=>{
                setIsDraggedOver(true)
            },
            onDragLeave:()=>{
                setIsDraggedOver(false)
            },
            onDrop:()=>{
                setIsDraggedOver(false)
            }
        })
    }, []);
    return <div ref={ref} className={clsx("w-[400px] h-[400px] bg-pink-500",getColor(isDraggedOver)) }>
        {children}
    </div>
}
function DraggableItem(){
    const ref = useRef<HTMLDivElement|null>(null)
    const [dragging, setDragging] = useState<boolean>(false);
    useEffect(()=>{
        const el = ref.current;
        invariant(el)

       return draggable({
           element:el,
           onDragStart:()=>{
               setDragging(true)
           },
           onDrop:()=>{
                setDragging(false)
           }
       })
    },[])
    return <div ref={ref} className={clsx(`w-20 h-20 bg-blue-400`,dragging && "opacity-40")}>

    </div>
}
export default Page;
