import type { Action } from 'svelte/action';

let holder: HTMLDivElement | null = null;

function element(): HTMLDivElement {
  if (holder) return holder;
  holder = document.createElement('div');
  holder.className = 'app-tooltip';
  holder.setAttribute('role', 'tooltip');
  document.body.append(holder);
  return holder;
}

/** Fixed to the viewport so a panel with its own scrollbar can't clip it. */
export const tooltip: Action<Element, string | undefined> = (node, text) => {
  let current = text;

  const hide = () => {
    if (holder) holder.classList.remove('is-open');
  };

  const show = () => {
    if (!current) return;
    const tip = element();
    tip.textContent = current;
    tip.classList.add('is-open');

    const anchor = node.getBoundingClientRect();
    const box = tip.getBoundingClientRect();
    const left = Math.min(
      Math.max(8, anchor.left + anchor.width / 2 - box.width / 2),
      window.innerWidth - box.width - 8
    );
    const above = anchor.top > box.height + 12;
    tip.style.left = `${left}px`;
    tip.style.top = `${above ? anchor.top - box.height - 8 : anchor.bottom + 8}px`;
  };

  node.addEventListener('pointerenter', show);
  node.addEventListener('focusin', show);
  node.addEventListener('pointerleave', hide);
  node.addEventListener('focusout', hide);
  window.addEventListener('scroll', hide, true);

  return {
    update: (next) => {
      current = next;
      if (next) node.setAttribute('aria-label', node.getAttribute('aria-label') ?? next);
    },
    destroy: () => {
      hide();
      node.removeEventListener('pointerenter', show);
      node.removeEventListener('focusin', show);
      node.removeEventListener('pointerleave', hide);
      node.removeEventListener('focusout', hide);
      window.removeEventListener('scroll', hide, true);
    }
  };
};
