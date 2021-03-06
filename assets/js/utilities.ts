export function limitText(text: string, limit: number) {
  if (text.length > limit) {
    return text.substring(0, limit - 3) + '...';
  }

  return text;
}

export function scrollToTop() {
  window.scrollTo(0, 0);
}
