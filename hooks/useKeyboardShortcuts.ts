import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Keyboard Shortcuts Hook
 * 
 * Provides keyboard shortcuts for common actions
 * 
 * Shortcuts:
 * - Ctrl/Cmd + N: New Invoice
 * - Ctrl/Cmd + P: Print
 * - Ctrl/Cmd + F: Focus Search
 * - Ctrl/Cmd + S: Save (prevent default)
 * - Ctrl/Cmd + K: Command Palette (future)
 * - Escape: Close Modal/Cancel
 */

interface ShortcutConfig {
  onNewInvoice?: () => void;
  onPrint?: () => void;
  onSave?: () => void;
  onSearch?: () => void;
  onEscape?: () => void;
}

export function useKeyboardShortcuts(config: ShortcutConfig = {}) {
  const router = useRouter();

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      // Ignore if user is typing in input/textarea
      const target = e.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      const isContentEditable = target.isContentEditable;

      if (isInput || isContentEditable) {
        // Allow Ctrl+S in inputs
        if (modKey && e.key === 's' && config.onSave) {
          e.preventDefault();
          config.onSave();
        }
        return;
      }

      // Handle shortcuts
      if (modKey) {
        switch (e.key.toLowerCase()) {
          case 'n':
            // Ctrl/Cmd + N: New Invoice
            e.preventDefault();
            if (config.onNewInvoice) {
              config.onNewInvoice();
            } else {
              router.push('/seller/invoices/new');
            }
            break;

          case 'p':
            // Ctrl/Cmd + P: Print
            e.preventDefault();
            if (config.onPrint) {
              config.onPrint();
            } else {
              window.print();
            }
            break;

          case 's':
            // Ctrl/Cmd + S: Save
            e.preventDefault();
            if (config.onSave) {
              config.onSave();
            }
            break;

          case 'f':
            // Ctrl/Cmd + F: Focus Search
            e.preventDefault();
            if (config.onSearch) {
              config.onSearch();
            } else {
              const searchInput = document.querySelector<HTMLInputElement>(
                'input[type="search"], input[placeholder*="Search" i]'
              );
              searchInput?.focus();
            }
            break;

          case 'k':
            // Ctrl/Cmd + K: Command Palette (future feature)
            e.preventDefault();
            console.log('Command palette - coming soon!');
            break;
        }
      } else if (e.key === 'Escape') {
        // Escape: Close modal/cancel
        if (config.onEscape) {
          config.onEscape();
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [config, router]);
}
