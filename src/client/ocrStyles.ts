import type { CSSProperties } from 'react'

/** Shared layout tokens for OCR UI — DSH alias variables only, no CSS modules. */
export const ocr = {
  hidden: { display: 'none' } satisfies CSSProperties,

  buttonRoot: {
    display: 'inline-flex',
    alignItems: 'center',
    minWidth: 0,
  } satisfies CSSProperties,

  error: {
    overflow: 'hidden',
    maxWidth: 220,
    marginLeft: 6,
    color: 'var(--dsw-static-red-600)',
    fontSize: 12,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  composerRail: {
    minWidth: 0,
    marginBottom: 0,
    padding: '6px 10px 10px',
  } satisfies CSSProperties,

  rail: {
    display: 'flex',
    flexWrap: 'nowrap',
    alignItems: 'stretch',
    gap: 10,
    minWidth: 0,
    overflow: 'auto hidden',
    scrollbarWidth: 'none',
  } satisfies CSSProperties,

  fileCard(variant: 'ready' | 'pending' | 'error'): CSSProperties {
    return {
      display: 'inline-flex',
      position: 'relative',
      boxSizing: 'border-box',
      flex: 'none',
      alignItems: 'center',
      gap: 10,
      width: 240,
      height: 64,
      padding: '0 12px',
      border: '0.5px solid var(--dsw-alias-border-l2, rgb(0 0 0 / 12%))',
      borderStyle: variant === 'pending' ? 'dashed' : 'solid',
      borderColor: variant === 'error'
        ? 'var(--dsw-alias-state-error-primary, #d54941)'
        : undefined,
      borderRadius: 16,
      color: 'var(--dsw-alias-label-primary)',
      background: 'var(--dsw-alias-bg-layer-1, var(--dsw-specific-input-major, transparent))',
      textAlign: 'left',
    }
  },

  fileIcon: {
    display: 'inline-flex',
    flex: '0 0 auto',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
  } satisfies CSSProperties,

  fileDetails: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    minWidth: 0,
    padding: '8px 0',
  } satisfies CSSProperties,

  fileName: {
    overflow: 'hidden',
    fontSize: 14,
    fontWeight: 500,
    lineHeight: '22px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  fileMeta: {
    overflow: 'hidden',
    color: 'var(--dsw-alias-label-tertiary, rgb(0 0 0 / 45%))',
    fontSize: 12,
    lineHeight: '18px',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } satisfies CSSProperties,

  fileMetaError: {
    color: 'var(--dsw-alias-state-error-primary, #d54941)',
  } satisfies CSSProperties,

  removeButton: {
    display: 'inline-flex',
    flex: '0 0 auto',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    border: 0,
    borderRadius: 6,
    color: 'var(--dsw-alias-label-secondary)',
    background: 'transparent',
    cursor: 'pointer',
  } satisfies CSSProperties,

  dropMask: {
    pointerEvents: 'none',
    position: 'fixed',
    inset: 0,
    zIndex: 10000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'color-mix(in srgb, var(--dsw-alias-bg-layer-1, #fff) 72%, transparent)',
  } satisfies CSSProperties,

  dropWrap: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
    minWidth: 'min(360px, 80vw)',
    padding: '24px 28px',
    border: '1px dashed var(--dsw-alias-brand-primary, #4d6bfe)',
    borderRadius: 16,
    background: 'var(--dsw-alias-bg-layer-1, #fff)',
    boxShadow: '0 8px 28px rgb(0 0 0 / 8%)',
    textAlign: 'center',
  } satisfies CSSProperties,

  dropTitle: {
    color: 'var(--dsw-alias-label-primary)',
    fontSize: 16,
    fontWeight: 500,
    lineHeight: '24px',
  } satisfies CSSProperties,

  dropDesc: {
    color: 'var(--dsw-alias-label-tertiary)',
    fontSize: 13,
    lineHeight: '20px',
  } satisfies CSSProperties,

  choiceList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  } satisfies CSSProperties,

  choiceCard(active: boolean): CSSProperties {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      width: '100%',
      padding: '14px 14px 14px 12px',
      border: `0.5px solid ${active ? 'var(--dsw-alias-brand-primary)' : 'var(--dsw-alias-border-l3)'}`,
      borderRadius: 16,
      color: 'var(--dsw-alias-label-primary)',
      background: active ? 'var(--dsw-alias-interactive-bg-hover)' : 'var(--dsw-alias-bg-layer-1)',
      textAlign: 'left',
      cursor: 'pointer',
    }
  },

  choiceIcon(tone: 'vision' | 'ocr'): CSSProperties {
    return {
      display: 'inline-flex',
      flex: 'none',
      alignItems: 'center',
      justifyContent: 'center',
      width: 36,
      height: 36,
      borderRadius: 12,
      color: tone === 'vision' ? 'var(--dsw-static-deepseek-500)' : '#6941c6',
      background: tone === 'vision' ? 'var(--dsw-static-deepseek-50)' : '#f4ebff',
    }
  },

  choiceCopy: {
    display: 'flex',
    flex: '1 1 auto',
    flexDirection: 'column',
    gap: 2,
    minWidth: 0,
  } satisfies CSSProperties,

  choiceLabel: {
    fontSize: 14,
    lineHeight: '22px',
    fontWeight: 500,
    color: 'var(--dsw-alias-label-primary)',
  } satisfies CSSProperties,

  choiceHint: {
    fontSize: 12,
    lineHeight: '18px',
    fontWeight: 400,
    color: 'var(--dsw-alias-label-tertiary)',
  } satisfies CSSProperties,

  sentWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 0,
  } satisfies CSSProperties,

  sentRow: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 6,
  } satisfies CSSProperties,

  sentStack: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: 8,
    minWidth: 0,
    maxWidth: 'min(525px, 82%)',
  } satisfies CSSProperties,

  sentFiles: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: 8,
  } satisfies CSSProperties,

  sentCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 9,
    width: 'min(280px, 100%)',
    padding: '9px 12px 9px 10px',
    border: '1px solid var(--dsw-alias-border-l2)',
    borderRadius: 12,
    color: 'var(--dsw-alias-label-primary)',
    background: 'var(--dsw-alias-bg-layer-1)',
  } satisfies CSSProperties,

  sentBubble: {
    maxWidth: '100%',
    padding: '10px 16px',
    borderRadius: 22,
    color: 'var(--dsw-alias-label-primary)',
    background: 'var(--dsw-specific-bubble)',
    fontSize: 16,
    lineHeight: '24px',
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
  } satisfies CSSProperties,
} as const
