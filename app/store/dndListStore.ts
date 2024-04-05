import {create} from "zustand";
import { getReorderDestinationIndex } from "@atlaskit/pragmatic-drag-and-drop-hitbox/util/get-reorder-destination-index"
import {Edge} from "@atlaskit/pragmatic-drag-and-drop-hitbox/types";
import {reorder} from "@atlaskit/pragmatic-drag-and-drop/reorder";


export interface Item {
    id: string;
    label: string;
}

interface DndListStore {
    items: Item[];
    setList: (listState: Item[]) => void;
    reorderItem: (args: {
        startIndex: number;
        indexOfTarget: number;
        closestEdgeOfTarget: Edge | null;
    }) => void;
}

const defaultItems = [
    {
        id: 'task-1',
        label: 'Organize a team-building event',
    },
    {
        id: 'task-2',
        label: 'Create and maintain office inventory',
    },
    {
        id: 'task-3',
        label: 'Update company website content',
    },
    {
        id: 'task-4',
        label: 'Plan and execute marketing campaigns',
    },
    {
        id: 'task-5',
        label: 'Coordinate employee training sessions',
    },
    {
        id: 'task-6',
        label: 'Manage facility maintenance',
    },
    {
        id: 'task-7',
        label: 'Organize customer feedback surveys',
    },
    {
        id: 'task-8',
        label: 'Coordinate travel arrangements',
    },
];
export const useDndListStore = create<DndListStore>((set) => ({
    items:defaultItems,
    setList: (listState ) => set({items:listState}),
    reorderItem:({
                     startIndex,
                     indexOfTarget,
                     closestEdgeOfTarget,
                 }: {
        startIndex: number;
        indexOfTarget: number;
        closestEdgeOfTarget: Edge | null;
    }) => {
        const finishIndex = getReorderDestinationIndex({
            startIndex,
            closestEdgeOfTarget,
            indexOfTarget,
            axis: "vertical",
        });

        if (finishIndex === startIndex) {
            // If there would be no change, we skip the update
            return;
        }
        set((listState) => {
            return {
                items: reorder({
                    list: listState.items,
                    startIndex,
                    finishIndex,
                }),
            };
        });
    }
}))
