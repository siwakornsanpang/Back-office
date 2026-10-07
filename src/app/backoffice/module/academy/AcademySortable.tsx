'use client';

import type { CSSProperties, ReactNode } from 'react';
import { DndContext, KeyboardSensor, PointerSensor, TouchSensor, pointerWithin, useSensor, useSensors, type CollisionDetection, type KeyboardCoordinateGetter, type UniqueIdentifier } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import styles from './academySortable.module.css';

// Touch input uses the delayed TouchSensor instead of activating PointerSensor.
class AcademyPointerSensor extends PointerSensor {
  static activators = PointerSensor.activators.map((activator) => ({
    ...activator,
    handler: (...args: Parameters<typeof activator.handler>) =>
      args[0].nativeEvent.pointerType !== 'touch' && activator.handler(...args),
  }));
}

export function AcademySortInstructions() {
  return <p className={styles.instructions}>ลากที่จับเพื่อจัดลำดับ หรือกด Space ที่ปุ่มจับ แล้วใช้ปุ่มลูกศรและกด Space เพื่อวาง</p>;
}

export function AcademySortableList({ ids, onReorder, children, disabled = false }: {
  ids: UniqueIdentifier[]; onReorder: (activeId: UniqueIdentifier, overId: UniqueIdentifier) => void; children: ReactNode; disabled?: boolean;
}) {
  // Match the pointer to the actual row, irrespective of the dragged row's height.
  // Keyboard moves align row tops so expanded and collapsed cards remain sortable.
  const collisionDetection: CollisionDetection = (args) => {
    const containers = args.droppableContainers.filter((entry) => ids.includes(entry.id));
    if (args.pointerCoordinates) return pointerWithin({ ...args, droppableContainers: containers });
    return containers.flatMap((entry) => {
      const rect = args.droppableRects.get(entry.id);
      return rect ? [{ id: entry.id, data: { droppableContainer: entry, value: Math.abs(args.collisionRect.top - rect.top) } }] : [];
    }).sort((a, b) => a.data.value - b.data.value);
  };
  const keyboardCoordinates: KeyboardCoordinateGetter = (event, args) => {
    if (event.code !== 'ArrowUp' && event.code !== 'ArrowDown') return sortableKeyboardCoordinates(event, args);
    event.preventDefault();
    const { active, over, droppableRects } = args.context;
    if (!active) return undefined;
    const currentIndex = ids.indexOf(over?.id ?? active.id);
    const nextIndex = currentIndex + (event.code === 'ArrowUp' ? -1 : 1);
    const nextRect = nextIndex >= 0 && nextIndex < ids.length ? droppableRects.get(ids[nextIndex]) : undefined;
    return nextRect ? { x: nextRect.left, y: nextRect.top } : undefined;
  };
  const sensors = useSensors(
    useSensor(AcademyPointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: keyboardCoordinates }),
  );
  return <DndContext sensors={sensors} collisionDetection={collisionDetection} accessibility={{ screenReaderInstructions: { draggable: 'กด Space เพื่อจับรายการ ใช้ปุ่มลูกศรเพื่อย้าย กด Space เพื่อวาง หรือ Escape เพื่อยกเลิก' } }} onDragEnd={({ active, over }) => {
    if (!disabled && over && active.id !== over.id && ids.includes(active.id) && ids.includes(over.id)) onReorder(active.id, over.id);
  }}>
    <SortableContext items={ids} strategy={verticalListSortingStrategy}>{children}</SortableContext>
  </DndContext>;
}

export function AcademySortableItem({ id, label, disabled = false, children }: {
  id: UniqueIdentifier; label: string; disabled?: boolean;
  children: (props: { setNodeRef: (node: HTMLElement | null) => void; style: CSSProperties; handle: ReactNode }) => ReactNode;
}) {
  const { attributes, listeners, setNodeRef, setActivatorNodeRef, transform, transition, isDragging } = useSortable({ id, disabled });
  const style: CSSProperties = { transform: CSS.Transform.toString(transform), transition, position: 'relative', zIndex: isDragging ? 2 : undefined, opacity: isDragging ? 0.65 : undefined };
  const handle = <button ref={setActivatorNodeRef} type="button" className={styles.handle} {...attributes} {...listeners} disabled={disabled} aria-label={`จัดลำดับ ${label}`} title={`ลากเพื่อจัดลำดับ ${label}`} onClick={(event) => event.stopPropagation()}><GripVertical size={18} aria-hidden="true" /></button>;
  return children({ setNodeRef, style, handle });
}
