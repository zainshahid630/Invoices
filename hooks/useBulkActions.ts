import { useState, useCallback } from 'react';

/**
 * Bulk Actions Hook
 * 
 * Manages selection and bulk operations on lists
 * 
 * Usage:
 * const { selected, toggleSelect, selectAll, clearSelection, isSelected } = useBulkActions();
 */

export function useBulkActions<T extends { id: string }>(items: T[] = []) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggleSelect = useCallback((id: string) => {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }, []);

  const selectAll = useCallback(() => {
    setSelected(new Set(items.map(item => item.id)));
  }, [items]);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isSelected = useCallback((id: string) => {
    return selected.has(id);
  }, [selected]);

  const isAllSelected = items.length > 0 && selected.size === items.length;
  const isSomeSelected = selected.size > 0 && selected.size < items.length;

  return {
    selected,
    selectedCount: selected.size,
    toggleSelect,
    selectAll,
    clearSelection,
    isSelected,
    isAllSelected,
    isSomeSelected,
    selectedItems: items.filter(item => selected.has(item.id)),
  };
}
